"use server"

import prisma from "@/lib/prisma"
import { getSessionUserId } from "@/app/actions/auth"
import { getShippingFeeAction } from "@/app/actions/settings"
import {
  SUBSCRIPTION_DESCRIPTION_FA,
  SUBSCRIPTION_PRICE_RIAL,
  nextSubscriptionExpiry,
} from "@/lib/subscription"
import { getSubscriptionExpiresAtForUser } from "@/lib/subscription-status"
import {
  getSiteUrl,
  requestZarinpalPayment,
  verifyZarinpalPayment,
  zarinpalErrorMessageFa,
  zarinpalStartPayUrl,
} from "@/lib/zarinpal"

export type CreateSubscriptionPaymentResult =
  | { ok: true; paymentUrl: string }
  | { ok: false; error: string }

export async function createSubscriptionPaymentAction(): Promise<CreateSubscriptionPaymentResult> {
  const userId = await getSessionUserId()
  if (!userId) {
    return { ok: false, error: "برای خرید اشتراک ابتدا وارد شوید." }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isActive) {
    return { ok: false, error: "حساب کاربری معتبر نیست." }
  }

  const callbackUrl = `${getSiteUrl()}/payments/callback`

  let zarinpal
  try {
    zarinpal = await requestZarinpalPayment({
      amountRial: SUBSCRIPTION_PRICE_RIAL,
      description: SUBSCRIPTION_DESCRIPTION_FA,
      callbackUrl,
      email: user.email,
      mobile: user.phone,
    })
  } catch (err) {
    console.error("ZarinPal request error:", err)
    return { ok: false, error: "ارتباط با درگاه پرداخت برقرار نشد. دوباره تلاش کنید." }
  }

  if (!zarinpal.ok) {
    console.error("ZarinPal request rejected:", zarinpal, "callback:", callbackUrl)
    return {
      ok: false,
      error: zarinpalErrorMessageFa(
        zarinpal.code,
        zarinpal.message || "درگاه پرداخت درخواست را رد کرد. دوباره تلاش کنید.",
      ),
    }
  }

  try {
    await prisma.payment.create({
      data: {
        userId,
        authority: zarinpal.authority,
        amount: SUBSCRIPTION_PRICE_RIAL,
        status: "pending",
        description: SUBSCRIPTION_DESCRIPTION_FA,
      },
    })
  } catch (err) {
    console.error("Payment create error:", err)
    return {
      ok: false,
      error: "جدول پرداخت هنوز روی دیتابیس آماده نیست. بعد از مایگریشن دوباره تلاش کنید.",
    }
  }

  return { ok: true, paymentUrl: zarinpalStartPayUrl(zarinpal.authority) }
}

export type VerifySubscriptionPaymentResult =
  | { ok: true; alreadyPaid?: boolean; expiresAt: string }
  | { ok: false; error: string; cancelled?: boolean }

/**
 * Confirm a returning ZarinPal payment and activate/extend the subscription.
 * Safe to call more than once for the same authority (idempotent).
 */
export async function verifySubscriptionPayment(
  authority: string,
  status: string | null,
): Promise<VerifySubscriptionPaymentResult> {
  if (!authority) {
    return { ok: false, error: "کد پیگیری پرداخت یافت نشد." }
  }

  const payment = await prisma.payment.findUnique({
    where: { authority },
  })

  if (!payment) {
    return { ok: false, error: "پرداخت متناظر پیدا نشد." }
  }

  if (payment.status === "paid") {
    return {
      ok: true,
      alreadyPaid: true,
      expiresAt:
        payment.expiresAt?.toISOString() ||
        (await getSubscriptionExpiresAtForUser(payment.userId))?.toISOString() ||
        new Date().toISOString(),
    }
  }

  if (status !== "OK") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "cancelled" },
    })
    return { ok: false, cancelled: true, error: "پرداخت لغو شد یا ناموفق بود." }
  }

  let verify
  try {
    verify = await verifyZarinpalPayment({
      amountRial: payment.amount,
      authority,
    })
  } catch (err) {
    console.error("ZarinPal verify error:", err)
    return { ok: false, error: "تأیید پرداخت از درگاه ممکن نشد." }
  }

  if (!verify.ok) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    })
    return { ok: false, error: "پرداخت تأیید نشد." }
  }

  const currentExpiresAt = await getSubscriptionExpiresAtForUser(payment.userId)
  const expiresAt = nextSubscriptionExpiry(currentExpiresAt)

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "paid",
      refId: String(verify.refId),
      paidAt: new Date(),
      expiresAt,
    },
  })

  return { ok: true, expiresAt: expiresAt.toISOString() }
}

export interface CreateMarketplacePaymentInput {
  listingId: string
  buyerPhone?: string
  buyerAddress?: string
  buyerNotes?: string
}

export type CreateMarketplacePaymentResult =
  | { ok: true; paymentUrl: string }
  | { ok: false; error: string }

export async function createMarketplacePaymentAction(
  input: CreateMarketplacePaymentInput,
): Promise<CreateMarketplacePaymentResult> {
  const userId = await getSessionUserId()
  if (!userId) {
    return { ok: false, error: "برای خرید آنلاین ابتدا وارد حساب کاربری خود شوید." }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isActive) {
    return { ok: false, error: "حساب کاربری معتبر نیست." }
  }

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: input.listingId },
  })

  if (!listing) {
    return { ok: false, error: "آگهی مورد نظر یافت نشد." }
  }

  if (listing.status !== "active") {
    return { ok: false, error: "این آگهی دیگر فعال نیست یا قبلاً تکمیل/فروخته شده است." }
  }

  if (listing.mode !== "sell" || typeof listing.price !== "number" || listing.price <= 0) {
    return { ok: false, error: "این آگهی برای فروش نقدی نیست یا قیمت معتبری ندارد." }
  }

  if (listing.ownerId === userId) {
    return { ok: false, error: "شما نمی‌توانید آگهی ثبت‌شده توسط خودتان را خریداری کنید!" }
  }

  // Calculate items and shipping fee
  const shippingFeeToman = await getShippingFeeAction()
  const totalToman = listing.price + shippingFeeToman
  const amountRial = totalToman * 10
  const description = `خرید آنلاین ${listing.title} در جالیز`
  const callbackUrl = `${getSiteUrl()}/payments/callback`

  let zarinpal
  try {
    zarinpal = await requestZarinpalPayment({
      amountRial,
      description,
      callbackUrl,
      email: user.email,
      mobile: input.buyerPhone?.trim() || user.phone || null,
    })
  } catch (err) {
    console.error("ZarinPal marketplace request error:", err)
    return { ok: false, error: "ارتباط با درگاه پرداخت برقرار نشد. لطفاً دوباره تلاش کنید." }
  }

  if (!zarinpal.ok) {
    console.error("ZarinPal marketplace request rejected:", zarinpal, "callback:", callbackUrl)
    return {
      ok: false,
      error: zarinpalErrorMessageFa(
        zarinpal.code,
        zarinpal.message || "درگاه پرداخت درخواست را رد کرد. لطفاً دوباره تلاش کنید.",
      ),
    }
  }

  try {
    const orderMetadata = JSON.stringify({
      items: [{ listingId: listing.id, title: listing.title, price: listing.price, quantity: 1 }],
      shippingFee: shippingFeeToman,
      notes: input.buyerNotes?.trim() || "",
    })

    await prisma.payment.create({
      data: {
        userId,
        listingId: listing.id,
        type: "marketplace",
        authority: zarinpal.authority,
        amount: amountRial,
        status: "pending",
        description,
        buyerPhone: input.buyerPhone?.trim() || user.phone || null,
        buyerAddress: input.buyerAddress?.trim() || null,
        buyerNotes: orderMetadata,
      },
    })
  } catch (err) {
    console.error("Marketplace payment record create error:", err)
    return {
      ok: false,
      error: "خطا در ثبت رکورد پرداخت روی پایگاه داده. لطفاً دوباره تلاش کنید.",
    }
  }

  return { ok: true, paymentUrl: zarinpalStartPayUrl(zarinpal.authority) }
}

export interface CartItemCheckoutInput {
  listingId: string
  quantity: number
}

export interface CreateMarketplaceCartPaymentInput {
  items: CartItemCheckoutInput[]
  buyerPhone?: string
  buyerAddress?: string
  buyerNotes?: string
}

/**
 * Server action to checkout an entire cart of items belonging to a single seller.
 * Applies the configured store shipping fee and initiates ZarinPal payment.
 */
export async function createMarketplaceCartPaymentAction(
  input: CreateMarketplaceCartPaymentInput,
): Promise<CreateMarketplacePaymentResult> {
  const userId = await getSessionUserId()
  if (!userId) {
    return { ok: false, error: "برای خرید آنلاین ابتدا وارد حساب کاربری خود شوید." }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isActive) {
    return { ok: false, error: "حساب کاربری معتبر نیست." }
  }

  if (!input.items || input.items.length === 0) {
    return { ok: false, error: "سبد خرید شما خالی است." }
  }

  // Fetch all listings in the cart
  const listingIds = input.items.map((i) => i.listingId)
  const listings = await prisma.marketplaceListing.findMany({
    where: { id: { in: listingIds } },
    include: { owner: true },
  })

  if (listings.length !== listingIds.length) {
    return { ok: false, error: "برخی از کالاهای موجود در سبد خرید یافت نشدند." }
  }

  // Check all are active and for sale
  for (const l of listings) {
    if (l.status !== "active") {
      return { ok: false, error: `کالای «${l.title}» دیگر فعال نیست یا قبلاً فروخته شده است.` }
    }
    if (l.mode !== "sell" || typeof l.price !== "number" || l.price <= 0) {
      return { ok: false, error: `کالای «${l.title}» برای فروش نقدی معتبر نیست.` }
    }
  }

  // SINGLE SELLER CONSTRAINT VALIDATION
  const firstSellerId = listings[0].ownerId
  const isSingleSeller = listings.every((l) => l.ownerId === firstSellerId)
  if (!isSingleSeller) {
    return {
      ok: false,
      error: "سبد خرید فقط می‌تواند شامل محصولات متعلق به یک فروشگاه/فروشنده باشد.",
    }
  }

  if (firstSellerId === userId) {
    return { ok: false, error: "شما نمی‌توانید محصولات متعلق به خودتان را خریداری کنید!" }
  }

  const listingMap = new Map(listings.map((l) => [l.id, l]))
  let itemsSubtotalToman = 0
  const orderItemsSummary: { listingId: string; title: string; price: number; quantity: number }[] = []

  for (const item of input.items) {
    const l = listingMap.get(item.listingId)!
    const qty = Math.max(1, item.quantity || 1)
    itemsSubtotalToman += l.price! * qty
    orderItemsSummary.push({
      listingId: l.id,
      title: l.title,
      price: l.price!,
      quantity: qty,
    })
  }

  const shippingFeeToman = await getShippingFeeAction()
  const totalToman = itemsSubtotalToman + shippingFeeToman
  const amountRial = totalToman * 10

  const sellerName = listings[0].owner.fullName || "فروشنده جالیز"
  const description = `خرید آنلاین ${input.items.length} کالا از ${sellerName} در جالیز`
  const callbackUrl = `${getSiteUrl()}/payments/callback`

  let zarinpal
  try {
    zarinpal = await requestZarinpalPayment({
      amountRial,
      description,
      callbackUrl,
      email: user.email,
      mobile: input.buyerPhone?.trim() || user.phone || null,
    })
  } catch (err) {
    console.error("ZarinPal cart payment request error:", err)
    return { ok: false, error: "ارتباط با درگاه پرداخت برقرار نشد. لطفاً دوباره تلاش کنید." }
  }

  if (!zarinpal.ok) {
    console.error("ZarinPal cart request rejected:", zarinpal)
    return {
      ok: false,
      error: zarinpalErrorMessageFa(
        zarinpal.code,
        zarinpal.message || "درگاه پرداخت درخواست را رد کرد. لطفاً دوباره تلاش کنید.",
      ),
    }
  }

  try {
    const orderMetadata = JSON.stringify({
      isCart: true,
      items: orderItemsSummary,
      itemsSubtotal: itemsSubtotalToman,
      shippingFee: shippingFeeToman,
      totalToman,
      notes: input.buyerNotes?.trim() || "",
    })

    await prisma.payment.create({
      data: {
        userId,
        listingId: listings[0].id,
        type: "marketplace",
        authority: zarinpal.authority,
        amount: amountRial,
        status: "pending",
        description,
        buyerPhone: input.buyerPhone?.trim() || user.phone || null,
        buyerAddress: input.buyerAddress?.trim() || null,
        buyerNotes: orderMetadata,
      },
    })
  } catch (err) {
    console.error("Marketplace cart payment record create error:", err)
    return {
      ok: false,
      error: "خطا در ثبت رکورد پرداخت روی پایگاه داده. لطفاً دوباره تلاش کنید.",
    }
  }

  return { ok: true, paymentUrl: zarinpalStartPayUrl(zarinpal.authority) }
}

export type VerifyMarketplacePaymentResult =
  | { ok: true; alreadyPaid?: boolean; refId: string; listingId: string }
  | { ok: false; error: string; cancelled?: boolean; listingId?: string }

/**
 * Confirm a returning ZarinPal marketplace payment, mark listings as completed,
 * and send an automated confirmation message with full order breakdown in the chat with the seller.
 */
export async function verifyMarketplacePayment(
  authority: string,
  status: string | null,
): Promise<VerifyMarketplacePaymentResult> {
  if (!authority) {
    return { ok: false, error: "کد پیگیری پرداخت یافت نشد." }
  }

  const payment = await prisma.payment.findUnique({
    where: { authority },
    include: { listing: true, user: true },
  })

  if (!payment) {
    return { ok: false, error: "اطلاعات پرداخت پیدا نشد." }
  }

  const listingId = payment.listingId || ""

  if (payment.status === "paid") {
    return {
      ok: true,
      alreadyPaid: true,
      refId: payment.refId || "",
      listingId,
    }
  }

  if (status !== "OK") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "cancelled" },
    })
    return { ok: false, cancelled: true, error: "پرداخت لغو شد یا ناموفق بود.", listingId }
  }

  let verify
  try {
    verify = await verifyZarinpalPayment({
      amountRial: payment.amount,
      authority,
    })
  } catch (err) {
    console.error("ZarinPal marketplace verify error:", err)
    return { ok: false, error: "تأیید پرداخت از درگاه ممکن نشد.", listingId }
  }

  if (!verify.ok) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    })
    return { ok: false, error: "پرداخت توسط بانک تأیید نشد.", listingId }
  }

  const refId = String(verify.refId)

  // Mark payment as paid
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "paid",
      refId,
      paidAt: new Date(),
    },
  })

  // Parse order metadata if stored
  let parsedMeta: any = null
  if (payment.buyerNotes) {
    try {
      parsedMeta = JSON.parse(payment.buyerNotes)
    } catch {
      /* regular text notes */
    }
  }

  // Mark all involved listings as completed
  const targetListingIds: string[] = []
  if (parsedMeta?.items && Array.isArray(parsedMeta.items)) {
    for (const it of parsedMeta.items) {
      if (it.listingId) targetListingIds.push(it.listingId)
    }
  } else if (payment.listingId) {
    targetListingIds.push(payment.listingId)
  }

  if (targetListingIds.length > 0) {
    try {
      await prisma.marketplaceListing.updateMany({
        where: { id: { in: targetListingIds } },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      })
    } catch (e) {
      console.error("Failed to update listings status to completed:", e)
    }
  }

  // Send automated confirmation message in chat between buyer and seller
  if (payment.listing && payment.listing.ownerId !== payment.userId) {
    try {
      let conversation = await prisma.marketplaceConversation.findFirst({
        where: {
          listingId: payment.listing.id,
          AND: [
            { participants: { some: { userId: payment.userId } } },
            { participants: { some: { userId: payment.listing.ownerId } } },
          ],
        },
      })

      if (!conversation) {
        conversation = await prisma.marketplaceConversation.create({
          data: {
            listingId: payment.listing.id,
            participants: {
              create: [
                { userId: payment.userId },
                { userId: payment.listing.ownerId },
              ],
            },
          },
        })
      }

      const totalToman = Math.round(payment.amount / 10).toLocaleString("fa-IR")
      const userNotes = parsedMeta?.notes || (!parsedMeta ? payment.buyerNotes : "")

      let itemsText = ""
      if (parsedMeta?.items && Array.isArray(parsedMeta.items)) {
        itemsText = parsedMeta.items
          .map((i: any) => `• ${i.quantity} × ${i.title} (${(i.price * i.quantity).toLocaleString("fa-IR")} تومان)`)
          .join("\n")
      } else {
        itemsText = `• ۱ × ${payment.listing.title}`
      }

      const shippingFeeText = parsedMeta?.shippingFee
        ? `🚚 هزینه ارسال: ${parsedMeta.shippingFee.toLocaleString("fa-IR")} تومان`
        : null

      const messageBody = [
        `🎉 خرید آنلاین و پرداخت امن با موفقیت انجام شد!`,
        `🛍️ اقلام سفارش:`,
        itemsText,
        shippingFeeText,
        `💳 مبلغ کل پرداخت‌شده: ${totalToman} تومان`,
        `🧾 کد پیگیری بانکی: ${refId}`,
        payment.buyerPhone ? `📞 شماره تماس خریدار: ${payment.buyerPhone}` : null,
        payment.buyerAddress ? `📍 آدرس تحویل / ارسال: ${payment.buyerAddress}` : null,
        userNotes ? `📝 یادداشت خریدار: ${userNotes}` : null,
      ]
        .filter(Boolean)
        .join("\n")

      const msg = await prisma.marketplaceMessage.create({
        data: {
          conversationId: conversation.id,
          listingId: payment.listing.id,
          senderId: payment.userId,
          recipientId: payment.listing.ownerId,
          body: messageBody,
        },
      })

      await prisma.marketplaceConversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: msg.createdAt },
      })
    } catch (e) {
      console.error("Failed to post chat receipt message:", e)
    }
  }

  return { ok: true, refId, listingId }
}


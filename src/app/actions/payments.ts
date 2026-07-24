"use server"

import prisma from "@/lib/prisma"
import { getSessionUserId } from "@/app/actions/auth"
import {
  SUBSCRIPTION_DESCRIPTION_FA,
  SUBSCRIPTION_PRICE_RIAL,
  nextSubscriptionExpiry,
} from "@/lib/subscription"
import {
  getSiteUrl,
  requestZarinpalPayment,
  verifyZarinpalPayment,
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
    console.error("ZarinPal request rejected:", zarinpal)
    return { ok: false, error: "درگاه پرداخت درخواست را رد کرد. دوباره تلاش کنید." }
  }

  await prisma.payment.create({
    data: {
      userId,
      authority: zarinpal.authority,
      amount: SUBSCRIPTION_PRICE_RIAL,
      status: "pending",
      description: SUBSCRIPTION_DESCRIPTION_FA,
    },
  })

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
    include: { user: true },
  })

  if (!payment) {
    return { ok: false, error: "پرداخت متناظر پیدا نشد." }
  }

  if (payment.status === "paid") {
    return {
      ok: true,
      alreadyPaid: true,
      expiresAt: payment.user.subscriptionExpiresAt?.toISOString() || new Date().toISOString(),
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

  const expiresAt = nextSubscriptionExpiry(payment.user.subscriptionExpiresAt)

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "paid",
        refId: String(verify.refId),
        paidAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { subscriptionExpiresAt: expiresAt },
    }),
  ])

  return { ok: true, expiresAt: expiresAt.toISOString() }
}

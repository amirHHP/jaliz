import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import {
  verifySubscriptionPayment,
  verifyMarketplacePayment,
} from "@/app/actions/payments"
import { getSiteUrl } from "@/lib/zarinpal"

export async function GET(req: NextRequest) {
  const authority = req.nextUrl.searchParams.get("Authority") || ""
  const status = req.nextUrl.searchParams.get("Status")
  const site = getSiteUrl()

  if (!authority) {
    return NextResponse.redirect(
      `${site}/marketplace?payment=failed&reason=${encodeURIComponent("کد پیگیری درگاه پرداخت یافت نشد.")}`,
    )
  }

  // Look up payment to determine its type and related listing
  let paymentType: string | null = null
  let listingId: string | null = null

  try {
    const payment = await prisma.payment.findUnique({
      where: { authority },
      select: { type: true, listingId: true },
    })
    if (payment) {
      paymentType = payment.type
      listingId = payment.listingId
    }
  } catch (err) {
    console.error("Callback payment lookup error:", err)
  }

  // Handle marketplace listing purchases
  if (paymentType === "marketplace") {
    const result = await verifyMarketplacePayment(authority, status)
    const targetListing = result.listingId || listingId
    const targetUrl = targetListing
      ? `${site}/marketplace/${targetListing}`
      : `${site}/marketplace`

    if (result.ok) {
      return NextResponse.redirect(
        `${targetUrl}?payment=success&refId=${encodeURIComponent(result.refId)}`,
      )
    }

    if (result.cancelled) {
      return NextResponse.redirect(`${targetUrl}?payment=cancelled`)
    }

    return NextResponse.redirect(
      `${targetUrl}?payment=failed&reason=${encodeURIComponent(result.error)}`,
    )
  }

  // Default: subscription payments
  const result = await verifySubscriptionPayment(authority, status)

  if (result.ok) {
    return NextResponse.redirect(`${site}/schedule?subscribed=1`)
  }

  if (result.cancelled) {
    return NextResponse.redirect(`${site}/schedule?payment=cancelled`)
  }

  return NextResponse.redirect(
    `${site}/schedule?payment=failed&reason=${encodeURIComponent(result.error)}`,
  )
}

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import {
  verifySubscriptionPayment,
  verifyMarketplacePayment,
} from "@/app/actions/payments"
import { getSiteUrl } from "@/lib/zarinpal"
import { SESSION_KEY, signSessionValue, useSecureSessionCookie } from "@/lib/auth/session-cookie"

function extractReturnOrigin(buyerNotes: string | null | undefined): string | null {
  if (!buyerNotes) return null
  try {
    const parsed = JSON.parse(buyerNotes)
    if (parsed && typeof parsed.returnOrigin === "string" && parsed.returnOrigin.startsWith("http")) {
      return parsed.returnOrigin.replace(/\/$/, "")
    }
  } catch {
    /* plain text notes */
  }
  return null
}

export async function GET(req: NextRequest) {
  const authority = req.nextUrl.searchParams.get("Authority") || ""
  const status = req.nextUrl.searchParams.get("Status")
  const defaultSite = getSiteUrl()

  if (!authority) {
    return NextResponse.redirect(
      `${defaultSite}/marketplace?payment=failed&reason=${encodeURIComponent("کد پیگیری درگاه پرداخت یافت نشد.")}`,
    )
  }

  // Look up payment to determine its type, related listing, userId, and return origin
  let paymentType: string | null = null
  let listingId: string | null = null
  let paymentUserId: string | null = null
  let savedReturnOrigin: string | null = null

  try {
    const payment = await prisma.payment.findUnique({
      where: { authority },
      select: { type: true, listingId: true, buyerNotes: true, userId: true },
    })
    if (payment) {
      paymentType = payment.type
      listingId = payment.listingId
      paymentUserId = payment.userId
      savedReturnOrigin = extractReturnOrigin(payment.buyerNotes)
    }
  } catch (err) {
    console.error("Callback payment lookup error:", err)
  }

  const queryReturnTo = req.nextUrl.searchParams.get("return_to")
  const targetSite =
    queryReturnTo?.replace(/\/$/, "") ||
    savedReturnOrigin ||
    defaultSite

  const createRedirectWithSession = (url: string) => {
    const res = NextResponse.redirect(url)
    if (paymentUserId) {
      try {
        res.cookies.set(SESSION_KEY, signSessionValue(paymentUserId), {
          httpOnly: true,
          secure: useSecureSessionCookie(),
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
      } catch (err) {
        console.warn("Could not set session cookie on callback response:", err)
      }
    }
    return res
  }

  // Handle marketplace listing purchases
  if (paymentType === "marketplace") {
    const result = await verifyMarketplacePayment(authority, status)
    const targetListing = result.listingId || listingId
    const targetUrl = targetListing
      ? `${targetSite}/marketplace/${targetListing}`
      : `${targetSite}/marketplace`

    if (result.ok) {
      return createRedirectWithSession(
        `${targetUrl}?payment=success&refId=${encodeURIComponent(result.refId)}`,
      )
    }

    if (result.cancelled) {
      return createRedirectWithSession(`${targetUrl}?payment=cancelled`)
    }

    return createRedirectWithSession(
      `${targetUrl}?payment=failed&reason=${encodeURIComponent(result.error)}`,
    )
  }

  // Default: subscription payments
  const result = await verifySubscriptionPayment(authority, status)

  if (result.ok) {
    return createRedirectWithSession(`${targetSite}/schedule?subscribed=1`)
  }

  if (result.cancelled) {
    return createRedirectWithSession(`${targetSite}/schedule?payment=cancelled`)
  }

  return createRedirectWithSession(
    `${targetSite}/schedule?payment=failed&reason=${encodeURIComponent(result.error)}`,
  )
}

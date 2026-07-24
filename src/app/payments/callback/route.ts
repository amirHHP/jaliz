import { NextRequest, NextResponse } from "next/server"
import { verifySubscriptionPayment } from "@/app/actions/payments"
import { getSiteUrl } from "@/lib/zarinpal"

export async function GET(req: NextRequest) {
  const authority = req.nextUrl.searchParams.get("Authority") || ""
  const status = req.nextUrl.searchParams.get("Status")
  const site = getSiteUrl()

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

import prisma from "@/lib/prisma"
import { isSubscriptionActive } from "@/lib/subscription"

/**
 * Latest subscription end time from paid payments.
 * Returns null if none, or if the Payment table is missing (pre-migration).
 */
export async function getSubscriptionExpiresAtForUser(
  userId: string,
): Promise<Date | null> {
  try {
    const result = await prisma.payment.aggregate({
      where: {
        userId,
        status: "paid",
        expiresAt: { not: null },
      },
      _max: { expiresAt: true },
    })
    return result._max.expiresAt ?? null
  } catch (err) {
    console.error("[subscription] lookup failed:", err)
    return null
  }
}

export async function userHasActiveSubscription(userId: string): Promise<boolean> {
  const expiresAt = await getSubscriptionExpiresAtForUser(userId)
  return isSubscriptionActive(expiresAt)
}

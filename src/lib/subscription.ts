/** Monthly watering-reminder subscription price in Tomans. */
export const SUBSCRIPTION_PRICE_TOMAN = 99_000

/** ZarinPal expects Rials by default (1 Toman = 10 Rials). */
export const SUBSCRIPTION_PRICE_RIAL = SUBSCRIPTION_PRICE_TOMAN * 10

/** Days granted per successful payment. */
export const SUBSCRIPTION_DURATION_DAYS = 30

export const SUBSCRIPTION_DESCRIPTION_FA = "اشتراک ماهانه یادآور آبیاری جالیز"

export function isSubscriptionActive(
  expiresAt: string | Date | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() > now.getTime()
}

/**
 * Extend an existing subscription from the later of "now" or the current
 * expiry, so renewing early stacks the remaining days.
 */
export function nextSubscriptionExpiry(
  currentExpiresAt: string | Date | null | undefined,
  now: Date = new Date(),
  durationDays: number = SUBSCRIPTION_DURATION_DAYS,
): Date {
  const current = currentExpiresAt ? new Date(currentExpiresAt) : null
  const base =
    current && current.getTime() > now.getTime() ? current : now
  const next = new Date(base)
  next.setUTCDate(next.getUTCDate() + durationDays)
  return next
}

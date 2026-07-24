import { describe, expect, it } from "vitest"
import {
  SUBSCRIPTION_DURATION_DAYS,
  SUBSCRIPTION_PRICE_RIAL,
  SUBSCRIPTION_PRICE_TOMAN,
  isSubscriptionActive,
  nextSubscriptionExpiry,
} from "@/lib/subscription"

describe("subscription helpers", () => {
  it("prices monthly plan at 99k toman / 990k rial", () => {
    expect(SUBSCRIPTION_PRICE_TOMAN).toBe(99_000)
    expect(SUBSCRIPTION_PRICE_RIAL).toBe(990_000)
  })

  it("treats missing expiry as inactive", () => {
    expect(isSubscriptionActive(null)).toBe(false)
    expect(isSubscriptionActive(undefined)).toBe(false)
  })

  it("is active only while expiresAt is in the future", () => {
    const now = new Date("2026-07-24T12:00:00.000Z")
    expect(isSubscriptionActive("2026-07-24T11:59:59.000Z", now)).toBe(false)
    expect(isSubscriptionActive("2026-07-24T12:00:01.000Z", now)).toBe(true)
  })

  it("stacks remaining days when renewing early", () => {
    const now = new Date("2026-07-24T00:00:00.000Z")
    const current = new Date("2026-08-01T00:00:00.000Z")
    const next = nextSubscriptionExpiry(current, now, SUBSCRIPTION_DURATION_DAYS)
    expect(next.toISOString()).toBe("2026-08-31T00:00:00.000Z")
  })

  it("starts from now when subscription already expired", () => {
    const now = new Date("2026-07-24T00:00:00.000Z")
    const expired = new Date("2026-07-01T00:00:00.000Z")
    const next = nextSubscriptionExpiry(expired, now, 30)
    expect(next.toISOString()).toBe("2026-08-23T00:00:00.000Z")
  })
})

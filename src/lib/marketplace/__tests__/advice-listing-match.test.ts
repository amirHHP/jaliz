import { describe, expect, it } from "vitest"

import { matchListingsToAdvice } from "../advice-listing-match"
import type { Listing } from "../types"

function listing(partial: Partial<Listing> & Pick<Listing, "id" | "title">): Listing {
  return {
    ownerId: "u1",
    type: "tool",
    mode: "sell",
    description: "",
    price: 1000,
    status: "active",
    createdAt: "2025-01-01T00:00:00.000Z",
    ...partial,
  }
}

describe("matchListingsToAdvice", () => {
  it("returns empty when advice has no product-related terms", () => {
    const listings = [
      listing({ id: "1", title: "کود NPK", description: "برای درخت" }),
    ]
    expect(matchListingsToAdvice("فقط آب بدهید", undefined, listings)).toEqual([])
  })

  it("matches Persian fertilizer keyword to listing title", () => {
    const listings = [
      listing({ id: "a", title: "کود کامل میوه‌داران", description: "کیسه یک کیلویی" }),
      listing({ id: "b", title: "گلدان سفالی", description: "سایز متوسط" }),
    ]
    const out = matchListingsToAdvice(
      "برگ‌ها زرد شده؛ کود کامل بدهید.",
      "برگ زرد",
      listings,
    )
    expect(out.map((l) => l.id)).toEqual(["a"])
  })

  it("matches English fungicide in advice to description", () => {
    const listings = [
      listing({ id: "x", title: "Organic spray", description: "fungicide for fruit trees" }),
      listing({ id: "y", title: "Tomato seeds", description: "heirloom" }),
    ]
    const out = matchListingsToAdvice(
      "Consider a suitable fungicide if spots spread.",
      undefined,
      listings,
    )
    expect(out.map((l) => l.id)).toEqual(["x"])
  })

  it("excludes completed listings", () => {
    const listings = [
      listing({
        id: "done",
        title: "کود",
        description: "تمام شد",
        status: "completed",
      }),
      listing({ id: "act", title: "کود مایع", description: "موجود" }),
    ]
    const out = matchListingsToAdvice("نیاز به کود دارد", "", listings)
    expect(out.map((l) => l.id)).toEqual(["act"])
  })

  it("respects limit and prefers higher scores", () => {
    const listings = Array.from({ length: 8 }, (_, i) =>
      listing({
        id: `L${i}`,
        title: i < 4 ? `کود ویژه ${i}` : `چیز دیگر ${i}`,
        description: i >= 4 ? "کود در توضیحات" : "بدون کود در توضیح",
        createdAt: `2025-01-0${(i % 9) + 1}T00:00:00.000Z`,
      }),
    )
    const out = matchListingsToAdvice("کود بدهید", "", listings, { limit: 3 })
    expect(out).toHaveLength(3)
    expect(out.every((l) => l.title.includes("کود"))).toBe(true)
  })

  it("uses contextText when advice omits product words", () => {
    const listings = [
      listing({ id: "f", title: "NPK 20-20-20", description: "کود" }),
    ]
    const out = matchListingsToAdvice("", "می‌خواهم کود بخرم", listings)
    expect(out.map((l) => l.id)).toEqual(["f"])
  })
})

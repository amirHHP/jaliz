import { describe, expect, it } from "vitest"
import { plantNeedsWater } from "../watering"

const NOW = new Date("2026-08-24T12:00:00Z")

describe("plantNeedsWater", () => {
  it("returns true when nextWateringDate is due", () => {
    expect(
      plantNeedsWater(
        { lastWatered: "2026-08-20T00:00:00Z", nextWateringDate: "2026-08-24T00:00:00Z" },
        NOW
      )
    ).toBe(true)
  })

  it("returns false when nextWateringDate is in the future", () => {
    expect(
      plantNeedsWater(
        { lastWatered: "2026-08-23T00:00:00Z", nextWateringDate: "2026-08-26T00:00:00Z" },
        NOW
      )
    ).toBe(false)
  })

  it("falls back to a 7 day baseline without nextWateringDate", () => {
    const eightDaysAgo = "2026-08-16T00:00:00Z"
    const sixDaysAgo = "2026-08-18T00:00:00Z"
    expect(plantNeedsWater({ lastWatered: eightDaysAgo }, NOW)).toBe(true)
    expect(plantNeedsWater({ lastWatered: sixDaysAgo }, NOW)).toBe(false)
  })

  it("adjusts threshold for outdoor terracotta full sun", () => {
    const fourDaysAgo = "2026-08-20T00:00:00Z"
    const plant = {
      lastWatered: fourDaysAgo,
      locationType: "Outdoor",
      potType: "Terracotta",
      lightExposure: "Full Sun",
    }
    // 7 - 2 - 1 - 2 = 2 days minimum
    expect(plantNeedsWater(plant, NOW)).toBe(true)
    expect(plantNeedsWater(plant, new Date("2026-08-21T23:00:00Z"))).toBe(false)
  })

  it("adjusts threshold for indoor plastic low light", () => {
    const nineDaysAgo = "2026-08-15T00:00:00Z"
    expect(
      plantNeedsWater(
        { lastWatered: nineDaysAgo, locationType: "Indoor", potType: "Plastic", lightExposure: "Low Light" },
        new Date("2026-08-24T00:00:00Z")
      )
    ).toBe(false)
  })

  it("never drops below a 1 day threshold", () => {
    const yesterday = "2026-08-23T10:00:00Z"
    expect(
      plantNeedsWater(
        { lastWatered: yesterday, locationType: "Outdoor", potType: "Terracotta", lightExposure: "Full Sun" },
        NOW
      )
    ).toBe(false)
  })

  it("returns false when lastWatered is missing or invalid", () => {
    expect(plantNeedsWater({ lastWatered: "" }, NOW)).toBe(false)
    expect(plantNeedsWater({ lastWatered: undefined }, NOW)).toBe(false)
    expect(plantNeedsWater({ lastWatered: "not-a-date" }, NOW)).toBe(false)
  })
})

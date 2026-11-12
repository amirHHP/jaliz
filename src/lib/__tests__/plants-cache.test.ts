import { describe, expect, it } from "vitest"
import { dbRowToPlant } from "@/components/PlantsProvider"

describe("Plants Cache & Data Mapping", () => {
  it("maps Prisma userPlant row to client Plant model safely", () => {
    const row = {
      id: "plant-123",
      name: "Pothos",
      type: "Epipremnum aureum",
      locationType: "Indoor",
      lightExposure: "Bright Indirect",
      potType: "Plastic",
      growingMedium: "Soil",
      hasDrainage: true,
      lastWatered: new Date("2026-11-01T08:00:00Z"),
      nextWateringDate: new Date("2026-11-08T08:00:00Z"),
      wateringInterval: 7,
      recentlyReplanted: false,
      lastSoilChange: null,
      health: "Excellent",
      image: "data:image/webp;base64,...",
      careTips: "Water when soil is dry",
      wateringTips: "Every 7 days",
      statusLogs: [
        {
          id: "log-1",
          status: "Growing nicely",
          health: "Good",
          aiAdvice: "Keep in indirect light",
          image: null,
          createdAt: new Date("2026-11-05T10:00:00Z"),
        },
      ],
    }

    const mapped = dbRowToPlant(row)

    expect(mapped.id).toBe("plant-123")
    expect(mapped.name).toBe("Pothos")
    expect(mapped.lastWatered).toBe("2026-11-01")
    expect(mapped.nextWateringDate).toBe("2026-11-08")
    expect(mapped.statusLogs?.length).toBe(1)
    expect(mapped.statusLogs?.[0].status).toBe("Growing nicely")
  })

  it("handles missing optional values with sensible fallbacks", () => {
    const minimalRow = {
      id: "plant-min",
      name: "Minimal Plant",
      type: null,
      locationType: null,
      lightExposure: null,
      potType: null,
      growingMedium: null,
      hasDrainage: null,
      lastWatered: null,
      nextWateringDate: null,
      wateringInterval: null,
      recentlyReplanted: null,
      lastSoilChange: null,
      health: null,
      image: null,
      careTips: null,
      wateringTips: null,
    }

    const mapped = dbRowToPlant(minimalRow)

    expect(mapped.id).toBe("plant-min")
    expect(mapped.name).toBe("Minimal Plant")
    expect(mapped.locationType).toBe("Indoor")
    expect(mapped.lightExposure).toBe("Bright Indirect")
    expect(mapped.potType).toBe("Plastic")
    expect(mapped.growingMedium).toBe("Soil")
    expect(mapped.hasDrainage).toBe(true)
    expect(mapped.wateringInterval).toBe(7)
    expect(mapped.health).toBe("Excellent")
    expect(mapped.statusLogs).toBeUndefined()
  })

  it("handles invalid date strings gracefully without throwing", () => {
    const rowWithBadDate = {
      id: "plant-bad-date",
      name: "Bad Date",
      lastWatered: "not-a-real-date",
      nextWateringDate: "invalid",
    }

    const mapped = dbRowToPlant(rowWithBadDate)

    expect(mapped.id).toBe("plant-bad-date")
    // Fallback for lastWatered is today's ISO date string (YYYY-MM-DD)
    expect(mapped.lastWatered).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(mapped.nextWateringDate).toBeUndefined()
  })
})

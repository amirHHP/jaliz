import { describe, expect, it } from "vitest"
import {
  calculateGardenerLevel,
  calculateWateringStreak,
  getXpForAction,
} from "../gamification"

const NOW = new Date("2026-08-24T12:00:00Z") // Monday Aug 24, 2026

describe("gamification", () => {
  describe("Tier 1: Streak Calculation — Consecutive Days", () => {
    it("returns 1 for a single log date matching today", () => {
      expect(calculateWateringStreak(["2026-08-24"], NOW)).toBe(1)
    })

    it("returns 3 for 3 consecutive days ending today", () => {
      const dates = ["2026-08-24", "2026-08-23", "2026-08-22"]
      expect(calculateWateringStreak(dates, NOW)).toBe(3)
    })

    it("handles Date objects and ISO strings interchangeably", () => {
      const dates = [
        new Date("2026-08-24T08:00:00Z"),
        "2026-08-23T20:30:00.000Z",
        new Date("2026-08-22T10:00:00Z"),
      ]
      expect(calculateWateringStreak(dates, NOW)).toBe(3)
    })

    it("is order-independent (handles unsorted log arrays)", () => {
      const unsorted = ["2026-08-22", "2026-08-24", "2026-08-23"]
      expect(calculateWateringStreak(unsorted, NOW)).toBe(3)
    })

    it("deduplicates multiple logs occurring on the same calendar day", () => {
      const duplicates = [
        "2026-08-24T09:00:00Z",
        "2026-08-24T14:00:00Z",
        "2026-08-23T11:00:00Z",
        "2026-08-23T18:00:00Z",
      ]
      expect(calculateWateringStreak(duplicates, NOW)).toBe(2)
    })
  })

  describe("Tier 2: Streak Continuity — Pending Today", () => {
    it("preserves active streak when today is not yet logged but yesterday is logged", () => {
      // User has not watered yet today (2026-08-24), but did yesterday and 2 days ago
      const dates = ["2026-08-23", "2026-08-22", "2026-08-21"]
      expect(calculateWateringStreak(dates, NOW)).toBe(3)
    })

    it("returns 1 when only yesterday was logged", () => {
      expect(calculateWateringStreak(["2026-08-23"], NOW)).toBe(1)
    })
  })

  describe("Tier 3: Streak Break — Gaps Reset Streak", () => {
    it("returns 0 when log dates array is empty", () => {
      expect(calculateWateringStreak([], NOW)).toBe(0)
    })

    it("returns 0 when gap is 2 or more days (yesterday and today missing)", () => {
      // Last logged 2 days ago (2026-08-22)
      const dates = ["2026-08-22", "2026-08-21", "2026-08-20"]
      expect(calculateWateringStreak(dates, NOW)).toBe(0)
    })

    it("resets count at the point of gap and returns only current consecutive streak", () => {
      // Logged today (24) and yesterday (23), missed 22, logged 21 and 20
      const dates = ["2026-08-24", "2026-08-23", "2026-08-21", "2026-08-20"]
      expect(calculateWateringStreak(dates, NOW)).toBe(2)
    })

    it("ignores invalid date strings gracefully without throwing", () => {
      const dates = ["2026-08-24", "invalid-date-string", "", "2026-08-23"]
      expect(calculateWateringStreak(dates, NOW)).toBe(2)
    })
  })

  describe("Tier 4: Gardener Level Calculations", () => {
    it("assigns Level 1 (Sprout / جوانه) for XP < 100", () => {
      const l0 = calculateGardenerLevel(0)
      expect(l0.level).toBe(1)
      expect(l0.titleEn).toBe("Sprout")
      expect(l0.titleFa).toBe("جوانه")
      expect(l0.minXp).toBe(0)
      expect(l0.maxXp).toBe(99)

      const l99 = calculateGardenerLevel(99)
      expect(l99.level).toBe(1)
    })

    it("assigns Level 2 (Seedling / نهال) for 100 <= XP < 250", () => {
      const l100 = calculateGardenerLevel(100)
      expect(l100.level).toBe(2)
      expect(l100.titleEn).toBe("Seedling")
      expect(l100.titleFa).toBe("نهال")
      expect(l100.minXp).toBe(100)
      expect(l100.maxXp).toBe(249)

      const l249 = calculateGardenerLevel(249)
      expect(l249.level).toBe(2)
    })

    it("assigns Level 3 (Green Bush / بوته سبز) for 250 <= XP < 500", () => {
      const l250 = calculateGardenerLevel(250)
      expect(l250.level).toBe(3)
      expect(l250.titleEn).toBe("Green Bush")
      expect(l250.titleFa).toBe("بوته سبز")
      expect(l250.minXp).toBe(250)
      expect(l250.maxXp).toBe(499)

      const l499 = calculateGardenerLevel(499)
      expect(l499.level).toBe(3)
    })

    it("assigns Level 4 (Specialist / متخصص) for 500 <= XP < 1000", () => {
      const l500 = calculateGardenerLevel(500)
      expect(l500.level).toBe(4)
      expect(l500.titleEn).toBe("Specialist")
      expect(l500.titleFa).toBe("متخصص")
      expect(l500.minXp).toBe(500)
      expect(l500.maxXp).toBe(999)

      const l999 = calculateGardenerLevel(999)
      expect(l999.level).toBe(4)
    })

    it("assigns Level 5 (Master / استاد باغبان) for XP >= 1000", () => {
      const l1000 = calculateGardenerLevel(1000)
      expect(l1000.level).toBe(5)
      expect(l1000.titleEn).toBe("Master")
      expect(l1000.titleFa).toBe("استاد باغبان")
      expect(l1000.minXp).toBe(1000)

      const l5000 = calculateGardenerLevel(5000)
      expect(l5000.level).toBe(5)
    })

    it("clamps negative XP to Level 1 without errors", () => {
      const neg = calculateGardenerLevel(-50)
      expect(neg.level).toBe(1)
      expect(neg.minXp).toBe(0)
    })
  })

  describe("Tier 5: XP Rewards for Actions", () => {
    it("awards 10 XP for watering a plant", () => {
      expect(getXpForAction("water_plant")).toBe(10)
    })

    it("awards 25 XP for completing daily watering routine", () => {
      expect(getXpForAction("daily_complete")).toBe(25)
    })

    it("awards 50 XP for reaching a streak milestone", () => {
      expect(getXpForAction("streak_milestone")).toBe(50)
    })
  })
})

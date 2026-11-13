import { describe, expect, it } from "vitest"
import type { Plant } from "@/components/PlantsProvider"
import { partitionCareTasks } from "../care-tasks"
import {
  calculateGardenerLevel,
  calculateWateringStreak,
  getXpForAction,
  GARDENER_LEVELS,
} from "../gamification"
import { isSubscriptionActive } from "../subscription"

const BASE_NOW = new Date("2026-08-24T12:00:00Z") // Monday, Aug 24, 2026

function createPlant(id: string, overrides: Partial<Plant> = {}): Plant {
  return {
    id,
    name: `Test Plant ${id}`,
    type: "Monstera deliciosa",
    locationType: "Indoor",
    lightExposure: "Bright Indirect",
    potType: "Terracotta",
    growingMedium: "Soil",
    hasDrainage: true,
    lastWatered: "2026-08-17",
    wateringInterval: 7,
    recentlyReplanted: false,
    health: "Good",
    ...overrides,
  }
}

describe("Adversarial Challenger M4-2 Test Suite", () => {
  describe("1. Care Tasks Partitioning Robustness (`care-tasks.ts`)", () => {
    describe("Missing nextWateringDate & fallback heuristics", () => {
      it("falls back to lastWatered + wateringInterval when nextWateringDate is undefined", () => {
        // lastWatered 2026-08-17 + 7 days = 2026-08-24 (due today)
        const plant = createPlant("p-fallback-today", {
          nextWateringDate: undefined,
          lastWatered: "2026-08-17",
          wateringInterval: 7,
        })
        const res = partitionCareTasks([plant], false, BASE_NOW)
        expect(res.today.length).toBe(1)
        expect(res.today[0].dueDays).toBe(0)
        expect(res.today[0].formattedDueText).toBe("امروز")
      })

      it("falls back to default interval 7 when wateringInterval is 0, negative, or undefined", () => {
        // lastWatered 2026-08-17 + fallback 7 days = 2026-08-24 (due today)
        const plantZeroInterval = createPlant("p-zero-int", {
          nextWateringDate: undefined,
          lastWatered: "2026-08-17",
          wateringInterval: 0,
        })
        const plantNegativeInterval = createPlant("p-neg-int", {
          nextWateringDate: undefined,
          lastWatered: "2026-08-17",
          wateringInterval: -5,
        })
        const plantUndefInterval = createPlant("p-undef-int", {
          nextWateringDate: undefined,
          lastWatered: "2026-08-17",
          wateringInterval: undefined,
        })

        const resZero = partitionCareTasks([plantZeroInterval], false, BASE_NOW)
        expect(resZero.today.length).toBe(1)
        expect(resZero.today[0].dueDays).toBe(0)

        const resNeg = partitionCareTasks([plantNegativeInterval], false, BASE_NOW)
        expect(resNeg.today.length).toBe(1)
        expect(resNeg.today[0].dueDays).toBe(0)

        const resUndef = partitionCareTasks([plantUndefInterval], false, BASE_NOW)
        expect(resUndef.today.length).toBe(1)
        expect(resUndef.today[0].dueDays).toBe(0)
      })

      it("falls back to nowMidnightUtc when both nextWateringDate and lastWatered are missing or invalid", () => {
        const plantBothMissing = createPlant("p-missing-both", {
          nextWateringDate: undefined,
          lastWatered: null as any,
        })
        const plantInvalidDates = createPlant("p-invalid-dates", {
          nextWateringDate: "invalid-date-string" as any,
          lastWatered: "not-a-valid-date" as any,
        })

        const resMissing = partitionCareTasks([plantBothMissing], false, BASE_NOW)
        expect(resMissing.today.length).toBe(1)
        expect(resMissing.today[0].dueDays).toBe(0)

        const resInvalid = partitionCareTasks([plantInvalidDates], false, BASE_NOW)
        expect(resInvalid.today.length).toBe(1)
        expect(resInvalid.today[0].dueDays).toBe(0)
      })

      it("handles ISO strings with timezone offsets and full ISO format in nextWateringDate and lastWatered", () => {
        const pIso = createPlant("p-iso", {
          nextWateringDate: "2026-08-25T18:30:00.000Z",
        })
        const res = partitionCareTasks([pIso], false, BASE_NOW)
        expect(res.upcoming.length).toBe(1)
        expect(res.upcoming[0].dueDays).toBe(1)
      })
    })

    describe("Extreme day offsets (overdue by -30, -365 days and upcoming by +60, +365 days)", () => {
      it("correctly handles plant overdue by -30 days", () => {
        const p30DaysOverdue = createPlant("p-overdue-30", {
          nextWateringDate: "2026-07-25", // 30 days before Aug 24
        })
        const res = partitionCareTasks([p30DaysOverdue], false, BASE_NOW)
        expect(res.overdue.length).toBe(1)
        expect(res.overdue[0].dueDays).toBe(-30)
        expect(res.overdue[0].category).toBe("overdue")
        expect(res.overdue[0].formattedDueText).toBe("۳۰ روز تاخیر")
      })

      it("correctly handles plant overdue by -365 days (1 year)", () => {
        const p365DaysOverdue = createPlant("p-overdue-365", {
          nextWateringDate: "2025-08-24", // 365 days before Aug 24, 2026
        })
        const res = partitionCareTasks([p365DaysOverdue], false, BASE_NOW)
        expect(res.overdue.length).toBe(1)
        expect(res.overdue[0].dueDays).toBe(-365)
        expect(res.overdue[0].formattedDueText).toBe("۳۶۵ روز تاخیر")
      })

      it("correctly handles plant upcoming by +60 days", () => {
        const p60DaysUpcoming = createPlant("p-upcoming-60", {
          nextWateringDate: "2026-10-23", // 60 days after Aug 24
        })
        const res = partitionCareTasks([p60DaysUpcoming], false, BASE_NOW)
        expect(res.upcoming.length).toBe(1)
        expect(res.upcoming[0].dueDays).toBe(60)
        expect(res.upcoming[0].category).toBe("upcoming")
        expect(res.upcoming[0].formattedDueText).toBe("۶۰ روز دیگر")
      })

      it("correctly handles plant upcoming by +365 days (1 year in future)", () => {
        const p365DaysUpcoming = createPlant("p-upcoming-365", {
          nextWateringDate: "2027-08-24", // 365 days after Aug 24, 2026
        })
        const res = partitionCareTasks([p365DaysUpcoming], false, BASE_NOW)
        expect(res.upcoming.length).toBe(1)
        expect(res.upcoming[0].dueDays).toBe(365)
        expect(res.upcoming[0].formattedDueText).toBe("۳۶۵ روز دیگر")
      })
    })

    describe("Array scaling: empty, 1 plant, and 100 plants", () => {
      it("handles empty plant array with 100% completion", () => {
        const res = partitionCareTasks([], false, BASE_NOW)
        expect(res.overdue).toEqual([])
        expect(res.today).toEqual([])
        expect(res.upcoming).toEqual([])
        expect(res.totalDueToday).toBe(0)
        expect(res.completedCount).toBe(0)
        expect(res.completionPercentage).toBe(100)
      })

      it("handles single plant across all categories", () => {
        const overduePlant = createPlant("p1", { nextWateringDate: "2026-08-20" })
        const resOverdue = partitionCareTasks([overduePlant], false, BASE_NOW)
        expect(resOverdue.overdue.length).toBe(1)
        expect(resOverdue.totalDueToday).toBe(1)
        expect(resOverdue.completedCount).toBe(0)
        expect(resOverdue.completionPercentage).toBe(0)

        const todayPlant = createPlant("p2", { nextWateringDate: "2026-08-24" })
        const resToday = partitionCareTasks([todayPlant], false, BASE_NOW)
        expect(resToday.today.length).toBe(1)
        expect(resToday.totalDueToday).toBe(1)

        const upcomingPlant = createPlant("p3", { nextWateringDate: "2026-08-26" })
        const resUpcoming = partitionCareTasks([upcomingPlant], false, BASE_NOW)
        expect(resUpcoming.upcoming.length).toBe(1)
        expect(resUpcoming.totalDueToday).toBe(0)
        expect(resUpcoming.completionPercentage).toBe(100)
      })

      it("handles 100 plants with mixed statuses, verifying sorting and completion math", () => {
        const plants: Plant[] = []
        // 30 overdue plants (-30 down to -1)
        for (let i = 1; i <= 30; i++) {
          const d = new Date(BASE_NOW)
          d.setUTCDate(d.getUTCDate() - i)
          plants.push(
            createPlant(`overdue-${i}`, {
              nextWateringDate: d.toISOString().slice(0, 10),
              lastWatered: "2026-07-01",
            })
          )
        }
        // 20 today plants (10 completed, 10 pending)
        for (let i = 1; i <= 20; i++) {
          plants.push(
            createPlant(`today-${i}`, {
              nextWateringDate: "2026-08-24",
              lastWatered: i <= 10 ? "2026-08-24" : "2026-08-17",
            })
          )
        }
        // 50 upcoming plants (+1 up to +50)
        for (let i = 1; i <= 50; i++) {
          const d = new Date(BASE_NOW)
          d.setUTCDate(d.getUTCDate() + i)
          plants.push(
            createPlant(`upcoming-${i}`, {
              nextWateringDate: d.toISOString().slice(0, 10),
              lastWatered: "2026-08-20",
            })
          )
        }

        // Shuffle plants array to test sorting robustness
        const shuffled = [...plants].sort(() => Math.random() - 0.5)

        const res = partitionCareTasks(shuffled, false, BASE_NOW)
        expect(res.overdue.length).toBe(30)
        expect(res.today.length).toBe(20)
        expect(res.upcoming.length).toBe(50)
        expect(res.totalDueToday).toBe(50) // 30 overdue + 20 today
        expect(res.completedCount).toBe(10)
        expect(res.completionPercentage).toBe(20) // 10 / 50 = 20%

        // Verify overdue sorting: most overdue first (ascending dueDays: -30, -29, ..., -1)
        for (let i = 0; i < res.overdue.length - 1; i++) {
          expect(res.overdue[i].dueDays).toBeLessThanOrEqual(res.overdue[i + 1].dueDays)
        }
        expect(res.overdue[0].dueDays).toBe(-30)
        expect(res.overdue[res.overdue.length - 1].dueDays).toBe(-1)

        // Verify upcoming sorting: soonest first (ascending dueDays: +1, +2, ..., +50)
        for (let i = 0; i < res.upcoming.length - 1; i++) {
          expect(res.upcoming[i].dueDays).toBeLessThanOrEqual(res.upcoming[i + 1].dueDays)
        }
        expect(res.upcoming[0].dueDays).toBe(1)
        expect(res.upcoming[res.upcoming.length - 1].dueDays).toBe(50)
      })
    })

    describe("Progress percentage calculation nuances", () => {
      it("reports 100% completion when all plants are upcoming (zero due today)", () => {
        const p1 = createPlant("p1", { nextWateringDate: "2026-08-26" })
        const p2 = createPlant("p2", { nextWateringDate: "2026-08-30" })
        const res = partitionCareTasks([p1, p2], false, BASE_NOW)

        expect(res.totalDueToday).toBe(0)
        expect(res.completedCount).toBe(0)
        expect(res.completionPercentage).toBe(100)
      })

      it("calculates exact fractional percentages rounded correctly", () => {
        // 1 of 6 = 16.666% -> 17%
        const plants6: Plant[] = [
          createPlant("p1", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-24" }),
          ...Array.from({ length: 5 }, (_, i) =>
            createPlant(`p-due-${i + 2}`, { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" })
          ),
        ]
        const res6 = partitionCareTasks(plants6, false, BASE_NOW)
        expect(res6.completedCount).toBe(1)
        expect(res6.totalDueToday).toBe(6)
        expect(res6.completionPercentage).toBe(17)

        // 2 of 3 = 66.666% -> 67%
        const plants3: Plant[] = [
          createPlant("p1", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-24" }),
          createPlant("p2", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-24" }),
          createPlant("p3", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" }),
        ]
        const res3 = partitionCareTasks(plants3, false, BASE_NOW)
        expect(res3.completedCount).toBe(2)
        expect(res3.totalDueToday).toBe(3)
        expect(res3.completionPercentage).toBe(67)
      })

      it("forces 100% and completedCount = totalDueToday when isDoneToday is true", () => {
        const overduePlant = createPlant("p-overdue", { nextWateringDate: "2026-08-20", lastWatered: "2026-08-10" })
        const todayPlant = createPlant("p-today", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" })

        const res = partitionCareTasks([overduePlant, todayPlant], true, BASE_NOW)
        expect(res.totalDueToday).toBe(2)
        expect(res.completedCount).toBe(2)
        expect(res.completionPercentage).toBe(100)
      })
    })
  })

  describe("2. Gamification & Streak Mechanics (`gamification.ts`)", () => {
    describe("Out-of-order date logs and duplicate logs", () => {
      it("calculates 100-day streak accurately regardless of array shuffle order", () => {
        const dates: string[] = []
        for (let i = 0; i < 100; i++) {
          const d = new Date(BASE_NOW)
          d.setUTCDate(d.getUTCDate() - i)
          dates.push(d.toISOString().slice(0, 10))
        }

        // Shuffle
        const shuffled = [...dates].sort(() => Math.random() - 0.5)
        expect(calculateWateringStreak(shuffled, BASE_NOW)).toBe(100)
      })

      it("deduplicates dozens of logs on the same date", () => {
        const dates: string[] = [
          "2026-08-24T01:00:00Z",
          "2026-08-24T06:00:00Z",
          "2026-08-24T12:00:00Z",
          "2026-08-24T18:00:00Z",
          "2026-08-24T23:59:59Z",
          "2026-08-23T08:00:00Z",
          "2026-08-23T20:00:00Z",
          "2026-08-22T10:00:00Z",
        ]
        expect(calculateWateringStreak(dates, BASE_NOW)).toBe(3)
      })
    })

    describe("Leap Day Boundaries (Feb 28 / Feb 29 / Mar 1)", () => {
      it("bridges leap day Feb 29 in a leap year (2024)", () => {
        const leapNow = new Date("2024-03-01T12:00:00Z")
        const dates = [
          "2024-03-01", // Friday Mar 1
          "2024-02-29", // Leap day Thursday Feb 29
          "2024-02-28", // Wednesday Feb 28
          "2024-02-27", // Tuesday Feb 27
        ]
        expect(calculateWateringStreak(dates, leapNow)).toBe(4)
      })

      it("breaks streak if leap day Feb 29 is skipped in a leap year (2024)", () => {
        const leapNow = new Date("2024-03-01T12:00:00Z")
        // Logged Mar 1, but Feb 29 is missing, then Feb 28 is logged
        const dates = ["2024-03-01", "2024-02-28"]
        // In 2024, yesterday relative to Mar 1 is Feb 29. Feb 29 is missing, so streak stops at Mar 1 (1 day)
        expect(calculateWateringStreak(dates, leapNow)).toBe(1)
      })

      it("bridges Feb 28 to Mar 1 in a non-leap year (2026)", () => {
        const nonLeapNow = new Date("2026-03-01T12:00:00Z")
        const dates = [
          "2026-03-01", // Sunday Mar 1
          "2026-02-28", // Saturday Feb 28 (yesterday in 2026!)
          "2026-02-27", // Friday Feb 27
        ]
        expect(calculateWateringStreak(dates, nonLeapNow)).toBe(3)
      })

      it("handles streak ending on leap day itself (2024-02-29)", () => {
        const leapDayNow = new Date("2024-02-29T12:00:00Z")
        const dates = ["2024-02-29", "2024-02-28", "2024-02-27"]
        expect(calculateWateringStreak(dates, leapDayNow)).toBe(3)
      })
    })

    describe("Year Turnover Boundaries (Dec 31 / Jan 1)", () => {
      it("bridges streak seamlessly across year boundaries (2025 -> 2026)", () => {
        const newYearNow = new Date("2026-01-02T12:00:00Z")
        const dates = [
          "2026-01-02",
          "2026-01-01",
          "2025-12-31",
          "2025-12-30",
          "2025-12-29",
        ]
        expect(calculateWateringStreak(dates, newYearNow)).toBe(5)
      })

      it("breaks streak if Dec 31 is missed across year turnover", () => {
        const newYearNow = new Date("2026-01-02T12:00:00Z")
        const dates = [
          "2026-01-02",
          "2026-01-01",
          // 2025-12-31 is missing!
          "2025-12-30",
        ]
        expect(calculateWateringStreak(dates, newYearNow)).toBe(2)
      })
    })

    describe("Streak Continuity & Breaks", () => {
      it("preserves streak when today is unlogged but yesterday is logged", () => {
        // Today is 2026-08-24. Logged 2026-08-23, 2026-08-22, 2026-08-21
        const dates = ["2026-08-23", "2026-08-22", "2026-08-21"]
        expect(calculateWateringStreak(dates, BASE_NOW)).toBe(3)
      })

      it("resets streak to 0 when gap is 2 days (yesterday and today unlogged)", () => {
        // Today is 2026-08-24. Last log was 2026-08-22
        const dates = ["2026-08-22", "2026-08-21", "2026-08-20"]
        expect(calculateWateringStreak(dates, BASE_NOW)).toBe(0)
      })

      it("resets streak to 0 when empty array or only future dates are logged", () => {
        expect(calculateWateringStreak([], BASE_NOW)).toBe(0)
        expect(calculateWateringStreak(["2026-08-25", "2026-08-26"], BASE_NOW)).toBe(0)
      })
    })

    describe("Gardener Level & XP Clamping", () => {
      it("clamps negative XP to Level 1", () => {
        const lNeg100 = calculateGardenerLevel(-100)
        expect(lNeg100.level).toBe(1)
        expect(lNeg100.minXp).toBe(0)
        expect(lNeg100.maxXp).toBe(99)
        expect(lNeg100.titleEn).toBe("Sprout")

        const lNegInf = calculateGardenerLevel(-Infinity)
        expect(lNegInf.level).toBe(1)

        const lNegZero = calculateGardenerLevel(-0)
        expect(lNegZero.level).toBe(1)
      })

      it("verifies all tier level boundaries (99, 100, 249, 250, 499, 500, 999, 1000)", () => {
        expect(calculateGardenerLevel(0).level).toBe(1)
        expect(calculateGardenerLevel(99).level).toBe(1)
        expect(calculateGardenerLevel(100).level).toBe(2)
        expect(calculateGardenerLevel(249).level).toBe(2)
        expect(calculateGardenerLevel(250).level).toBe(3)
        expect(calculateGardenerLevel(499).level).toBe(3)
        expect(calculateGardenerLevel(500).level).toBe(4)
        expect(calculateGardenerLevel(999).level).toBe(4)
        expect(calculateGardenerLevel(1000).level).toBe(5)
        expect(calculateGardenerLevel(999999).level).toBe(5)
      })

      it("verifies getXpForAction values and fallback for unknown actions", () => {
        expect(getXpForAction("water_plant")).toBe(10)
        expect(getXpForAction("daily_complete")).toBe(25)
        expect(getXpForAction("streak_milestone")).toBe(50)
        expect(getXpForAction("unknown_action" as any)).toBe(0)
      })

      it("handles extreme XP values including NaN, Infinity, and MAX_SAFE_INTEGER", () => {
        expect(calculateGardenerLevel(Infinity).level).toBe(5)
        expect(calculateGardenerLevel(Number.MAX_SAFE_INTEGER).level).toBe(5)
        // NaN defaults safely to Level 1
        const nanResult = calculateGardenerLevel(NaN)
        expect(nanResult.level).toBe(1)
      })
    })

    describe("DST transitions & Century Leap Year rules", () => {
      it("bridges DST transitions without streak loss", () => {
        // Fall back / Spring forward across 3 days
        const dstNow = new Date("2026-11-02T12:00:00Z")
        const dates = ["2026-11-02", "2026-11-01", "2026-10-31"]
        expect(calculateWateringStreak(dates, dstNow)).toBe(3)
      })

      it("handles future date logs gracefully without corrupting current streak", () => {
        // Today is 2026-08-24. User has logs for today, yesterday, and accidental future log tomorrow
        const dates = ["2026-08-25", "2026-08-24", "2026-08-23"]
        expect(calculateWateringStreak(dates, BASE_NOW)).toBe(2)
      })

      it("calculates 365-day streak accurately", () => {
        const yearDates: string[] = []
        for (let i = 0; i < 365; i++) {
          const d = new Date(BASE_NOW)
          d.setUTCDate(d.getUTCDate() - i)
          yearDates.push(d.toISOString().slice(0, 10))
        }
        expect(calculateWateringStreak(yearDates, BASE_NOW)).toBe(365)
      })
    })
  })

  describe("3. Subscription Gating Edge Cases (`subscription.ts`)", () => {
    it("returns false for null, undefined, empty string, or invalid date values", () => {
      expect(isSubscriptionActive(null)).toBe(false)
      expect(isSubscriptionActive(undefined)).toBe(false)
      expect(isSubscriptionActive("")).toBe(false)
      expect(isSubscriptionActive("not-a-date")).toBe(false)
    })

    it("returns false for expired subscriptions in the past", () => {
      expect(isSubscriptionActive("2020-01-01T00:00:00Z")).toBe(false)
      expect(isSubscriptionActive(new Date(Date.now() - 1000))).toBe(false)
    })

    it("returns true for active subscriptions in the future", () => {
      expect(isSubscriptionActive("2099-01-01T00:00:00Z")).toBe(true)
      expect(isSubscriptionActive(new Date(Date.now() + 1000000))).toBe(true)
    })
  })
})

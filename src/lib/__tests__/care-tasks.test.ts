import { describe, expect, it } from "vitest"
import type { Plant } from "@/components/PlantsProvider"
import { partitionCareTasks } from "../care-tasks"

const NOW = new Date("2026-08-24T12:00:00Z") // Monday Aug 24, 2026

function makePlant(id: string, overrides: Partial<Plant> = {}): Plant {
  return {
    id,
    name: `Plant ${id}`,
    type: "Ficus elastica",
    locationType: "Indoor",
    lightExposure: "Bright Indirect",
    potType: "Ceramic",
    growingMedium: "Soil",
    hasDrainage: true,
    lastWatered: "2026-08-17",
    wateringInterval: 7,
    recentlyReplanted: false,
    health: "Good",
    ...overrides,
  }
}

describe("care-tasks", () => {
  describe("Tier 1: Task Partitioning Structure", () => {
    it("handles empty plant list with complete 100% progress", () => {
      const result = partitionCareTasks([], false, NOW)
      expect(result.overdue).toEqual([])
      expect(result.today).toEqual([])
      expect(result.upcoming).toEqual([])
      expect(result.totalDueToday).toBe(0)
      expect(result.completedCount).toBe(0)
      expect(result.completionPercentage).toBe(100)
    })

    it("correctly partitions plants into overdue, today, and upcoming", () => {
      const pOverdue = makePlant("p-overdue", { nextWateringDate: "2026-08-22" }) // 2 days ago
      const pToday = makePlant("p-today", { nextWateringDate: "2026-08-24" }) // today
      const pUpcoming = makePlant("p-upcoming", { nextWateringDate: "2026-08-27" }) // 3 days ahead

      const result = partitionCareTasks([pOverdue, pToday, pUpcoming], false, NOW)

      expect(result.overdue.map((i) => i.plant.id)).toEqual(["p-overdue"])
      expect(result.today.map((i) => i.plant.id)).toEqual(["p-today"])
      expect(result.upcoming.map((i) => i.plant.id)).toEqual(["p-upcoming"])

      expect(result.overdue[0].category).toBe("overdue")
      expect(result.today[0].category).toBe("today")
      expect(result.upcoming[0].category).toBe("upcoming")

      expect(result.totalDueToday).toBe(2) // overdue + today
    })
  })

  describe("Tier 2: Boundary Date Calculations & Formatted Texts", () => {
    it("identifies plant due today with dueDays = 0", () => {
      const plant = makePlant("p1", { nextWateringDate: "2026-08-24" })
      const result = partitionCareTasks([plant], false, NOW)

      expect(result.today.length).toBe(1)
      const item = result.today[0]
      expect(item.dueDays).toBe(0)
      expect(item.category).toBe("today")
      expect(item.formattedDueText).toMatch(/امروز|today/i)
    })

    it("identifies plant overdue by 2 days with dueDays = -2", () => {
      const plant = makePlant("p2", { nextWateringDate: "2026-08-22" })
      const result = partitionCareTasks([plant], false, NOW)

      expect(result.overdue.length).toBe(1)
      const item = result.overdue[0]
      expect(item.dueDays).toBe(-2)
      expect(item.category).toBe("overdue")
      // Should mention 2 days in Persian or English
      expect(item.formattedDueText).toMatch(/[2۲]/)
      expect(item.formattedDueText).toMatch(/روز|day/i)
    })

    it("identifies plant overdue by 1 day (yesterday) with dueDays = -1", () => {
      const plant = makePlant("p-yesterday", { nextWateringDate: "2026-08-23" })
      const result = partitionCareTasks([plant], false, NOW)

      expect(result.overdue.length).toBe(1)
      const item = result.overdue[0]
      expect(item.dueDays).toBe(-1)
      expect(item.category).toBe("overdue")
    })

    it("identifies plant upcoming in 3 days with dueDays = 3", () => {
      const plant = makePlant("p3", { nextWateringDate: "2026-08-27" })
      const result = partitionCareTasks([plant], false, NOW)

      expect(result.upcoming.length).toBe(1)
      const item = result.upcoming[0]
      expect(item.dueDays).toBe(3)
      expect(item.category).toBe("upcoming")
      expect(item.formattedDueText).toMatch(/[3۳]/)
    })

    it("identifies plant upcoming tomorrow with dueDays = 1", () => {
      const plant = makePlant("p-tomorrow", { nextWateringDate: "2026-08-25" })
      const result = partitionCareTasks([plant], false, NOW)

      expect(result.upcoming.length).toBe(1)
      const item = result.upcoming[0]
      expect(item.dueDays).toBe(1)
      expect(item.category).toBe("upcoming")
      expect(item.formattedDueText).toMatch(/فردا|tomorrow|1|۱/i)
    })

    it("calculates due date from lastWatered + wateringInterval when nextWateringDate is missing", () => {
      // Last watered 7 days ago, interval 7 days -> due today (2026-08-24)
      const plantDueToday = makePlant("p-calc-today", {
        lastWatered: "2026-08-17",
        wateringInterval: 7,
        nextWateringDate: undefined,
      })
      const result = partitionCareTasks([plantDueToday], false, NOW)
      expect(result.today.length).toBe(1)
      expect(result.today[0].dueDays).toBe(0)
    })

    it("sorts overdue items with most overdue first", () => {
      const p1 = makePlant("p-1day", { nextWateringDate: "2026-08-23" }) // -1 day
      const p4 = makePlant("p-4day", { nextWateringDate: "2026-08-20" }) // -4 days
      const p2 = makePlant("p-2day", { nextWateringDate: "2026-08-22" }) // -2 days

      const result = partitionCareTasks([p1, p4, p2], false, NOW)
      expect(result.overdue.map((i) => i.plant.id)).toEqual(["p-4day", "p-2day", "p-1day"])
    })

    it("sorts upcoming items with soonest first", () => {
      const p5 = makePlant("p-5days", { nextWateringDate: "2026-08-29" }) // +5 days
      const p1 = makePlant("p-1day", { nextWateringDate: "2026-08-25" }) // +1 day
      const p3 = makePlant("p-3days", { nextWateringDate: "2026-08-27" }) // +3 days

      const result = partitionCareTasks([p5, p1, p3], false, NOW)
      expect(result.upcoming.map((i) => i.plant.id)).toEqual(["p-1day", "p-3days", "p-5days"])
    })
  })

  describe("Tier 3: Progress & Completion Calculations", () => {
    it("calculates 50% completion when 2 of 4 due tasks have been watered today", () => {
      const p1 = makePlant("p1", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-24" }) // watered today (done)
      const p2 = makePlant("p2", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-24" }) // watered today (done)
      const p3 = makePlant("p3", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" }) // pending
      const p4 = makePlant("p4", { nextWateringDate: "2026-08-22", lastWatered: "2026-08-15" }) // overdue pending

      const result = partitionCareTasks([p1, p2, p3, p4], false, NOW)
      expect(result.totalDueToday).toBe(4)
      expect(result.completedCount).toBe(2)
      expect(result.completionPercentage).toBe(50)
    })

    it("calculates 100% completion when all due tasks have been completed", () => {
      const p1 = makePlant("p1", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-24" })
      const p2 = makePlant("p2", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-24" })

      const result = partitionCareTasks([p1, p2], false, NOW)
      expect(result.completedCount).toBe(2)
      expect(result.completionPercentage).toBe(100)
    })

    it("calculates 0% completion when none of due tasks have been watered today", () => {
      const p1 = makePlant("p1", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" })
      const p2 = makePlant("p2", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" })

      const result = partitionCareTasks([p1, p2], false, NOW)
      expect(result.completedCount).toBe(0)
      expect(result.completionPercentage).toBe(0)
    })

    it("forces 100% completion when isDoneToday is true", () => {
      const p1 = makePlant("p1", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" })
      const p2 = makePlant("p2", { nextWateringDate: "2026-08-22", lastWatered: "2026-08-15" })

      const result = partitionCareTasks([p1, p2], true, NOW)
      expect(result.completedCount).toBe(2)
      expect(result.completionPercentage).toBe(100)
    })

    it("rounds completion percentage to nearest integer", () => {
      // 1 of 3 completed = 33.333% -> 33%
      const p1 = makePlant("p1", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-24" })
      const p2 = makePlant("p2", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" })
      const p3 = makePlant("p3", { nextWateringDate: "2026-08-24", lastWatered: "2026-08-17" })

      const result = partitionCareTasks([p1, p2, p3], false, NOW)
      expect(result.completionPercentage).toBe(33)
    })
  })
})

import type { Plant } from "@/components/PlantsProvider"
import { toLocalDateString } from "./relative-date"

export type TaskCategory = "overdue" | "today" | "upcoming"

export interface CareTaskItem {
  plant: Plant
  category: TaskCategory
  dueDays: number // negative = overdue, 0 = today, positive = upcoming
  formattedDueText: string
}

export interface CareTasksPartition {
  overdue: CareTaskItem[]
  today: CareTaskItem[]
  upcoming: CareTaskItem[]
  totalDueToday: number // overdue + today
  completedCount: number
  completionPercentage: number
}

function toPersianDigits(n: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return String(n).replace(/\d/g, (x) => farsiDigits[Number(x)])
}

function formatDueText(dueDays: number): string {
  if (dueDays === 0) return "امروز"
  if (dueDays === -1) return "۱ روز تاخیر"
  if (dueDays < 0) return `${toPersianDigits(Math.abs(dueDays))} روز تاخیر`
  if (dueDays === 1) return "فردا (۱ روز دیگر)"
  return `${toPersianDigits(dueDays)} روز دیگر`
}

function calculateTargetMidnightUtc(plant: Plant, nowMidnightUtc: number): number {
  if (plant.nextWateringDate && typeof plant.nextWateringDate === "string") {
    const m = plant.nextWateringDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) {
      return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    }
    const d = new Date(plant.nextWateringDate)
    if (!Number.isNaN(d.getTime())) {
      return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
    }
  }

  if (plant.lastWatered && typeof plant.lastWatered === "string") {
    let lastWateredUtc: number | null = null
    const m = plant.lastWatered.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) {
      lastWateredUtc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    } else {
      const d = new Date(plant.lastWatered)
      if (!Number.isNaN(d.getTime())) {
        lastWateredUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
      }
    }
    if (lastWateredUtc !== null) {
      const intervalDays =
        typeof plant.wateringInterval === "number" && plant.wateringInterval > 0
          ? plant.wateringInterval
          : 7
      return lastWateredUtc + intervalDays * 86400000
    }
  }

  return nowMidnightUtc
}

export function partitionCareTasks(
  plants: Plant[],
  isDoneToday?: boolean,
  now?: Date
): CareTasksPartition {
  const currentNow = now || new Date()
  const nowMidnightUtc = Date.UTC(
    currentNow.getFullYear(),
    currentNow.getMonth(),
    currentNow.getDate()
  )
  const todayStr = toLocalDateString(currentNow)

  const overdue: CareTaskItem[] = []
  const today: CareTaskItem[] = []
  const upcoming: CareTaskItem[] = []

  for (const plant of plants) {
    const targetUtc = calculateTargetMidnightUtc(plant, nowMidnightUtc)
    const dueDays = Math.round((targetUtc - nowMidnightUtc) / 86400000)
    const formattedDueText = formatDueText(dueDays)

    if (dueDays < 0) {
      overdue.push({
        plant,
        category: "overdue",
        dueDays,
        formattedDueText,
      })
    } else if (dueDays === 0) {
      today.push({
        plant,
        category: "today",
        dueDays,
        formattedDueText,
      })
    } else {
      upcoming.push({
        plant,
        category: "upcoming",
        dueDays,
        formattedDueText,
      })
    }
  }

  // Sort overdue with most overdue first (ascending dueDays: -4, -2, -1)
  overdue.sort((a, b) => a.dueDays - b.dueDays)

  // Sort upcoming with soonest first (ascending dueDays: +1, +3, +5)
  upcoming.sort((a, b) => a.dueDays - b.dueDays)

  const totalDueToday = overdue.length + today.length

  if (plants.length === 0 || totalDueToday === 0) {
    return {
      overdue,
      today,
      upcoming,
      totalDueToday,
      completedCount: isDoneToday ? totalDueToday : 0,
      completionPercentage: 100,
    }
  }

  if (isDoneToday) {
    return {
      overdue,
      today,
      upcoming,
      totalDueToday,
      completedCount: totalDueToday,
      completionPercentage: 100,
    }
  }

  const dueItems = [...overdue, ...today]
  const completedCount = dueItems.filter((item) => {
    const lw = item.plant.lastWatered
    if (!lw) return false
    if (typeof lw === "string") {
      if (lw.startsWith(todayStr)) return true
      try {
        return toLocalDateString(new Date(lw)) === todayStr
      } catch {
        return false
      }
    }
    return false
  }).length

  const completionPercentage = Math.round((completedCount / totalDueToday) * 100)

  return {
    overdue,
    today,
    upcoming,
    totalDueToday,
    completedCount,
    completionPercentage,
  }
}

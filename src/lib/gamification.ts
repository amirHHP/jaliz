import { toLocalDateString } from "./relative-date"

export interface GardenerLevel {
  level: number
  titleFa: string
  titleEn: string
  minXp: number
  maxXp: number
}

export const GARDENER_LEVELS: GardenerLevel[] = [
  {
    level: 1,
    titleEn: "Sprout",
    titleFa: "جوانه",
    minXp: 0,
    maxXp: 99,
  },
  {
    level: 2,
    titleEn: "Seedling",
    titleFa: "نهال",
    minXp: 100,
    maxXp: 249,
  },
  {
    level: 3,
    titleEn: "Green Bush",
    titleFa: "بوته سبز",
    minXp: 250,
    maxXp: 499,
  },
  {
    level: 4,
    titleEn: "Specialist",
    titleFa: "متخصص",
    minXp: 500,
    maxXp: 999,
  },
  {
    level: 5,
    titleEn: "Master",
    titleFa: "استاد باغبان",
    minXp: 1000,
    maxXp: Infinity,
  },
]

function addDateToSet(item: string | Date, set: Set<string>): void {
  if (!item) return
  if (typeof item === "string") {
    const trimmed = item.trim()
    if (!trimmed) return
    const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) {
      const d = new Date(trimmed)
      if (Number.isNaN(d.getTime())) return
      set.add(`${m[1]}-${m[2]}-${m[3]}`)
      set.add(toLocalDateString(d))
      return
    }
    const d = new Date(trimmed)
    if (!Number.isNaN(d.getTime())) {
      set.add(toLocalDateString(d))
      try {
        set.add(d.toISOString().slice(0, 10))
      } catch {
        // ignore
      }
    }
    return
  }
  if (item instanceof Date && !Number.isNaN(item.getTime())) {
    set.add(toLocalDateString(item))
    try {
      set.add(item.toISOString().slice(0, 10))
    } catch {
      // ignore
    }
  }
}

function getDateStringDaysAgo(days: number, from: Date): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() - days)
  return toLocalDateString(d)
}

export function calculateWateringStreak(
  logDates: (string | Date)[],
  now?: Date
): number {
  if (!logDates || logDates.length === 0) return 0

  const referenceDate = now || new Date()
  const datesSet = new Set<string>()

  for (const item of logDates) {
    addDateToSet(item, datesSet)
  }

  if (datesSet.size === 0) return 0

  const todayStr = getDateStringDaysAgo(0, referenceDate)
  const yesterdayStr = getDateStringDaysAgo(1, referenceDate)

  let streak = 0

  if (datesSet.has(todayStr)) {
    streak = 1
    let daysBack = 1
    while (datesSet.has(getDateStringDaysAgo(daysBack, referenceDate))) {
      streak++
      daysBack++
    }
  } else if (datesSet.has(yesterdayStr)) {
    streak = 1
    let daysBack = 2
    while (datesSet.has(getDateStringDaysAgo(daysBack, referenceDate))) {
      streak++
      daysBack++
    }
  } else {
    return 0
  }

  return streak
}

export function calculateGardenerLevel(xp: number): GardenerLevel {
  const safeXp = Math.max(0, xp)
  for (let i = GARDENER_LEVELS.length - 1; i >= 0; i--) {
    if (safeXp >= GARDENER_LEVELS[i].minXp) {
      return GARDENER_LEVELS[i]
    }
  }
  return GARDENER_LEVELS[0]
}

export function getXpForAction(
  action: "water_plant" | "daily_complete" | "streak_milestone"
): number {
  switch (action) {
    case "water_plant":
      return 10
    case "daily_complete":
      return 25
    case "streak_milestone":
      return 50
    default:
      return 0
  }
}

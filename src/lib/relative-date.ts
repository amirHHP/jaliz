export type RelativeDateOption = "today" | "3days" | "week"

export const RELATIVE_DATE_OPTIONS: RelativeDateOption[] = ["3days", "today", "week"]

const OFFSET_DAYS: Record<RelativeDateOption, number> = {
  today: 0,
  "3days": 3,
  week: 7,
}

/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export function toLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function dateStringDaysAgo(days: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  d.setDate(d.getDate() - days)
  return toLocalDateString(d)
}

export function relativeDateOptionToString(
  option: RelativeDateOption,
  from: Date = new Date()
): string {
  return dateStringDaysAgo(OFFSET_DAYS[option], from)
}

export function matchRelativeDateOption(
  dateStr: string,
  from: Date = new Date()
): RelativeDateOption | null {
  if (!dateStr) return null
  for (const option of RELATIVE_DATE_OPTIONS) {
    if (dateStr === relativeDateOptionToString(option, from)) return option
  }
  return null
}

export type RelativeSoilDateOption = "recent" | "few_months" | "year_ago"

export const RELATIVE_SOIL_DATE_OPTIONS: RelativeSoilDateOption[] = [
  "recent",
  "few_months",
  "year_ago",
]

const SOIL_OFFSET_DAYS: Record<RelativeSoilDateOption, number> = {
  recent: 0,
  few_months: 90,
  year_ago: 365,
}

export function relativeSoilDateOptionToString(
  option: RelativeSoilDateOption,
  from: Date = new Date()
): string {
  return dateStringDaysAgo(SOIL_OFFSET_DAYS[option], from)
}

export function matchRelativeSoilDateOption(
  dateStr: string,
  from: Date = new Date()
): RelativeSoilDateOption | null {
  if (!dateStr) return null
  for (const option of RELATIVE_SOIL_DATE_OPTIONS) {
    if (dateStr === relativeSoilDateOptionToString(option, from)) return option
  }
  const target = new Date(dateStr)
  if (isNaN(target.getTime())) return null
  const fromLocal = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const diffDays = Math.round((fromLocal.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 30) return "recent"
  if (diffDays <= 240) return "few_months"
  return "year_ago"
}


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

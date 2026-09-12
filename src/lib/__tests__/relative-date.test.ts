import { describe, expect, it } from "vitest"
import {
  dateStringDaysAgo,
  matchRelativeDateOption,
  matchRelativeSoilDateOption,
  relativeDateOptionToString,
  relativeSoilDateOptionToString,
  toLocalDateString,
} from "../relative-date"

describe("relative-date", () => {
  const fixed = new Date(2026, 6, 19) // Jul 19, 2026 local

  it("formats local YYYY-MM-DD without UTC shift", () => {
    expect(toLocalDateString(fixed)).toBe("2026-07-19")
  })

  it("computes days ago from a fixed date", () => {
    expect(dateStringDaysAgo(0, fixed)).toBe("2026-07-19")
    expect(dateStringDaysAgo(3, fixed)).toBe("2026-07-16")
    expect(dateStringDaysAgo(7, fixed)).toBe("2026-07-12")
  })

  it("maps relative options to date strings", () => {
    expect(relativeDateOptionToString("today", fixed)).toBe("2026-07-19")
    expect(relativeDateOptionToString("3days", fixed)).toBe("2026-07-16")
    expect(relativeDateOptionToString("week", fixed)).toBe("2026-07-12")
  })

  it("matches a date string back to a relative option", () => {
    expect(matchRelativeDateOption("2026-07-19", fixed)).toBe("today")
    expect(matchRelativeDateOption("2026-07-16", fixed)).toBe("3days")
    expect(matchRelativeDateOption("2026-07-12", fixed)).toBe("week")
    expect(matchRelativeDateOption("2026-01-01", fixed)).toBeNull()
    expect(matchRelativeDateOption("", fixed)).toBeNull()
  })

  it("maps relative soil options to date strings", () => {
    expect(relativeSoilDateOptionToString("recent", fixed)).toBe("2026-07-19")
    expect(relativeSoilDateOptionToString("few_months", fixed)).toBe("2026-04-20")
    expect(relativeSoilDateOptionToString("year_ago", fixed)).toBe("2025-07-19")
  })

  it("matches a date string back to a relative soil option", () => {
    expect(matchRelativeSoilDateOption("2026-07-19", fixed)).toBe("recent")
    expect(matchRelativeSoilDateOption("2026-07-05", fixed)).toBe("recent")
    expect(matchRelativeSoilDateOption("2026-04-20", fixed)).toBe("few_months")
    expect(matchRelativeSoilDateOption("2025-07-19", fixed)).toBe("year_ago")
    expect(matchRelativeSoilDateOption("", fixed)).toBeNull()
  })
})

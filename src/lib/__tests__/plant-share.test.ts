import { describe, expect, it } from "vitest"
import {
  buildShareCaption,
  getHealthShareLabel,
  getNextCareText,
  pickCaptionTemplateIndex,
} from "../plant-share"

const NOW = new Date("2026-06-30T12:00:00Z").getTime()

describe("getNextCareText", () => {
  it("handles overdue watering in Persian", () => {
    const text = getNextCareText("2026-06-28", "fa", NOW)
    expect(text).toContain("2")
    expect(text).toContain("عقب")
  })

  it("handles tomorrow in English", () => {
    expect(getNextCareText("2026-07-01", "en", NOW)).toBe("Watering tomorrow! 💧")
  })

  it("handles missing date with playful fallback", () => {
    expect(getNextCareText(null, "fa")).toContain("والدین")
    expect(getNextCareText(undefined, "en")).toContain("plant parent")
  })
})

describe("buildShareCaption", () => {
  const base = {
    name: "مانسترا",
    health: "Good" as const,
    latestStatus: "برگ‌های جدید زده",
    nextWateringDate: "2026-07-02",
    language: "fa" as const,
  }

  it("includes plant name, status and care", () => {
    const caption = buildShareCaption(base, { templateIndex: 0, now: NOW })
    expect(caption).toContain("مانسترا")
    expect(caption).toContain("برگ‌های جدید زده")
    expect(caption).toContain("#جالیز")
  })

  it("uses default status when log is empty", () => {
    const caption = buildShareCaption(
      { ...base, latestStatus: "", language: "en" },
      { templateIndex: 0, now: NOW }
    )
    expect(caption).toContain("Still thriving")
  })

  it("picks stable template index", () => {
    expect(pickCaptionTemplateIndex("Excellent", "fa", 5)).toBe(2)
    expect(pickCaptionTemplateIndex("Excellent", "fa", 6)).toBe(0)
  })
})

describe("getHealthShareLabel", () => {
  it("returns localized health labels", () => {
    expect(getHealthShareLabel("Excellent", "fa")).toBe("عالی")
    expect(getHealthShareLabel("Needs Attention", "en")).toBe("Needs Attention")
  })
})

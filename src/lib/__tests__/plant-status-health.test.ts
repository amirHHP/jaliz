import { describe, expect, it } from "vitest"
import { normalizePlantHealth, PLANT_HEALTH_VALUES } from "../plant-status-health"

describe("normalizePlantHealth", () => {
  it("passes through canonical values", () => {
    for (const v of PLANT_HEALTH_VALUES) {
      expect(normalizePlantHealth(v)).toBe(v)
    }
  })

  it("maps fuzzy English", () => {
    expect(normalizePlantHealth("excellent condition")).toBe("Excellent")
    expect(normalizePlantHealth("needs attention ASAP")).toBe("Needs Attention")
    expect(normalizePlantHealth("pretty good")).toBe("Good")
  })

  it("maps Persian fragments", () => {
    expect(normalizePlantHealth("عالی")).toBe("Excellent")
    expect(normalizePlantHealth("نیاز به توجه دارد")).toBe("Needs Attention")
    expect(normalizePlantHealth("خوب است")).toBe("Good")
  })

  it("defaults sensibly for empty", () => {
    expect(normalizePlantHealth("")).toBe("Good")
    expect(normalizePlantHealth(null)).toBe("Good")
  })
})

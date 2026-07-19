import { describe, expect, it } from "vitest"
import {
  DEFAULT_THEME,
  resolveThemeForAuth,
  isTheme,
} from "@/lib/theme"

describe("theme", () => {
  it("defaults to light theme", () => {
    expect(DEFAULT_THEME).toBe("light")
  })

  it("validates theme values", () => {
    expect(isTheme("light")).toBe(true)
    expect(isTheme("dark")).toBe(true)
    expect(isTheme("system")).toBe(false)
    expect(isTheme(null)).toBe(false)
  })

  it("forces light theme when user is not authenticated", () => {
    expect(resolveThemeForAuth(false, "dark")).toBe("light")
    expect(resolveThemeForAuth(false, "light")).toBe("light")
    expect(resolveThemeForAuth(false, null)).toBe("light")
  })

  it("uses stored theme for authenticated users", () => {
    expect(resolveThemeForAuth(true, "dark")).toBe("dark")
    expect(resolveThemeForAuth(true, "light")).toBe("light")
    expect(resolveThemeForAuth(true, null)).toBe("light")
  })
})

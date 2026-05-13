import { afterEach, describe, expect, it } from "vitest"
import { useSecureSessionCookie } from "../session-cookie"

const original = { ...process.env }

afterEach(() => {
  process.env = { ...original }
})

describe("useSecureSessionCookie", () => {
  it("returns false when COOKIE_SECURE is false even in production", () => {
    process.env.NODE_ENV = "production"
    process.env.COOKIE_SECURE = "false"
    expect(useSecureSessionCookie()).toBe(false)
  })

  it("returns true when COOKIE_SECURE is true even in development", () => {
    process.env.NODE_ENV = "development"
    process.env.COOKIE_SECURE = "true"
    expect(useSecureSessionCookie()).toBe(true)
  })

  it("defaults to true in production when COOKIE_SECURE is unset", () => {
    process.env.NODE_ENV = "production"
    delete process.env.COOKIE_SECURE
    expect(useSecureSessionCookie()).toBe(true)
  })

  it("defaults to false in development when COOKIE_SECURE is unset", () => {
    process.env.NODE_ENV = "development"
    delete process.env.COOKIE_SECURE
    expect(useSecureSessionCookie()).toBe(false)
  })
})

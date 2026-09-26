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

describe("HMAC-SHA256 Session Cookie Signing & Verification", () => {
  it("correctly signs and verifies a valid user ID", async () => {
    const { signSessionValue, verifyAndExtractSessionUserId } = await import("../session-cookie")
    const userId = "user-12345-abcde"
    const signed = signSessionValue(userId)

    expect(signed).toContain(`${userId}.`)
    const verified = verifyAndExtractSessionUserId(signed)
    expect(verified).toBe(userId)
  })

  it("rejects an unsigned user ID unconditionally (raw cookie spoofing)", async () => {
    delete process.env.STRICT_SESSION_VERIFY
    const { verifyAndExtractSessionUserId } = await import("../session-cookie")
    expect(verifyAndExtractSessionUserId("admin-id-spoofed")).toBeNull()
  })

  it("rejects malformed signatures and non-hex characters", async () => {
    const { verifyAndExtractSessionUserId } = await import("../session-cookie")
    expect(verifyAndExtractSessionUserId("user.short")).toBeNull()
    expect(verifyAndExtractSessionUserId("user." + "z".repeat(64))).toBeNull()
  })

  it("rejects a tampered user ID with original signature", async () => {
    const { signSessionValue, verifyAndExtractSessionUserId } = await import("../session-cookie")
    const signed = signSessionValue("normal-user")
    const signature = signed.split(".")[1]
    const tampered = `admin-user.${signature}`

    expect(verifyAndExtractSessionUserId(tampered)).toBeNull()
  })

  it("rejects a tampered signature", async () => {
    const { signSessionValue, verifyAndExtractSessionUserId } = await import("../session-cookie")
    const signed = signSessionValue("user-123")
    const tampered = `${signed.slice(0, -4)}dead`

    expect(verifyAndExtractSessionUserId(tampered)).toBeNull()
  })

  it("rejects cookies signed with a different secret", async () => {
    const { signSessionValue, verifyAndExtractSessionUserId } = await import("../session-cookie")
    const signed = signSessionValue("user-123", "secret-key-A")
    const verified = verifyAndExtractSessionUserId(signed, "secret-key-B")

    expect(verified).toBeNull()
  })

  it("handles null, undefined, and empty string safely", async () => {
    const { verifyAndExtractSessionUserId } = await import("../session-cookie")
    expect(verifyAndExtractSessionUserId(null)).toBeNull()
    expect(verifyAndExtractSessionUserId(undefined)).toBeNull()
    expect(verifyAndExtractSessionUserId("")).toBeNull()
    expect(verifyAndExtractSessionUserId(".")).toBeNull()
  })
})


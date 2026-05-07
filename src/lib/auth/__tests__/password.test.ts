import { describe, expect, it } from "vitest"

import {
  constantTimeEqual,
  generateSalt,
  hashPassword,
  verifyPassword,
} from "../password"

describe("generateSalt", () => {
  it("returns a hex-encoded string of the requested byte length", () => {
    const salt = generateSalt(16)
    expect(salt).toMatch(/^[0-9a-f]{32}$/)
  })

  it("returns unique salts on successive calls", () => {
    const a = generateSalt()
    const b = generateSalt()
    expect(a).not.toEqual(b)
  })
})

describe("hashPassword", () => {
  it("is deterministic for the same password and salt", async () => {
    const salt = "deadbeef"
    const a = await hashPassword("hunter2", salt)
    const b = await hashPassword("hunter2", salt)
    expect(a).toEqual(b)
  })

  it("changes with the salt", async () => {
    const a = await hashPassword("hunter2", "a")
    const b = await hashPassword("hunter2", "b")
    expect(a).not.toEqual(b)
  })

  it("changes with the password", async () => {
    const salt = "deadbeef"
    const a = await hashPassword("hunter2", salt)
    const b = await hashPassword("hunter3", salt)
    expect(a).not.toEqual(b)
  })

  it("rejects empty inputs", async () => {
    await expect(hashPassword("", "salt")).rejects.toThrow()
    await expect(hashPassword("pw", "")).rejects.toThrow()
  })
})

describe("constantTimeEqual", () => {
  it("returns true for equal strings", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true)
  })

  it("returns false for unequal strings", () => {
    expect(constantTimeEqual("abc", "abd")).toBe(false)
  })

  it("returns false for strings of different lengths", () => {
    expect(constantTimeEqual("abc", "abcd")).toBe(false)
  })
})

describe("verifyPassword", () => {
  it("verifies a correct password", async () => {
    const salt = generateSalt()
    const hash = await hashPassword("s3cret!", salt)
    expect(await verifyPassword("s3cret!", salt, hash)).toBe(true)
  })

  it("rejects an incorrect password", async () => {
    const salt = generateSalt()
    const hash = await hashPassword("s3cret!", salt)
    expect(await verifyPassword("wrong", salt, hash)).toBe(false)
  })
})

import { describe, expect, it } from "vitest"

import { AuthError } from "../types"
import { isAuthActionError, runAuthAction, unwrapAuthResult } from "../server-action"

describe("runAuthAction", () => {
  it("returns data on success", async () => {
    const result = await runAuthAction(async () => ({ id: "1" }))
    expect(result).toEqual({ id: "1" })
  })

  it("returns serializable auth errors instead of throwing", async () => {
    const result = await runAuthAction(async () => {
      throw new AuthError("EMAIL_EXISTS")
    })
    expect(isAuthActionError(result)).toBe(true)
    if (isAuthActionError(result)) {
      expect(result.__authError).toBe("EMAIL_EXISTS")
    }
  })

  it("maps readonly sqlite errors to GENERIC", async () => {
    const result = await runAuthAction(async () => {
      throw new Error("attempt to write a readonly database")
    })
    expect(isAuthActionError(result)).toBe(true)
    if (isAuthActionError(result)) {
      expect(result.__authError).toBe("GENERIC")
    }
  })

  it("maps Prisma client errors to GENERIC", async () => {
    const prismaError = Object.assign(new Error("column otpCode does not exist"), {
      name: "PrismaClientKnownRequestError",
    })
    const result = await runAuthAction(async () => {
      throw prismaError
    })
    expect(isAuthActionError(result)).toBe(true)
    if (isAuthActionError(result)) {
      expect(result.__authError).toBe("GENERIC")
    }
  })

  it("maps Prisma initialization errors to GENERIC instead of throwing", async () => {
    const prismaError = Object.assign(new Error("Can't reach database server"), {
      name: "PrismaClientInitializationError",
    })
    const result = await runAuthAction(async () => {
      throw prismaError
    })
    expect(isAuthActionError(result)).toBe(true)
    if (isAuthActionError(result)) {
      expect(result.__authError).toBe("GENERIC")
    }
  })

  it("never rethrows unexpected errors", async () => {
    const result = await runAuthAction(async () => {
      throw new Error("db down")
    })
    expect(isAuthActionError(result)).toBe(true)
    if (isAuthActionError(result)) {
      expect(result.__authError).toBe("GENERIC")
    }
  })
})

describe("unwrapAuthResult", () => {
  it("throws AuthError for auth action errors", () => {
    expect(() => unwrapAuthResult({ __authError: "FORBIDDEN" })).toThrow(AuthError)
    try {
      unwrapAuthResult({ __authError: "FORBIDDEN" })
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError)
      expect((err as AuthError).code).toBe("FORBIDDEN")
    }
  })

  it("returns successful results unchanged", () => {
    expect(unwrapAuthResult({ ok: true })).toEqual({ ok: true })
  })
})

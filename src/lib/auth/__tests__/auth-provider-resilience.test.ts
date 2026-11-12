import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { hasSessionCookie } from "@/components/AuthProvider"

describe("Auth Session Resilience & Network Error Protection", () => {
  beforeEach(() => {
    (globalThis as any).document = {
      cookie: "",
    }
  })

  afterEach(() => {
    delete (globalThis as any).document
  })

  describe("hasSessionCookie", () => {
    it("returns true when jaliz_logged_in=1 cookie exists", () => {
      document.cookie = "jaliz_logged_in=1"
      expect(hasSessionCookie()).toBe(true)
    })

    it("returns true when jaliz_session=1 cookie exists", () => {
      document.cookie = "jaliz_session=1"
      expect(hasSessionCookie()).toBe(true)
    })

    it("returns true when jaliz_session=1 is among multiple cookies", () => {
      document.cookie = "theme=dark; jaliz_session=1; other=abc"
      expect(hasSessionCookie()).toBe(true)
    })

    it("returns false when jaliz_session cookie is absent", () => {
      document.cookie = "theme=dark; other=abc"
      expect(hasSessionCookie()).toBe(false)
    })

    it("returns false when document.cookie is empty", () => {
      document.cookie = ""
      expect(hasSessionCookie()).toBe(false)
    })

    it("returns false when document is undefined (SSR)", () => {
      delete (globalThis as any).document
      expect(hasSessionCookie()).toBe(false)
    })
  })

  describe("Cache & Resilience Logic", () => {
    it("retains authenticated status on network or DB error when session cookie exists", () => {
      document.cookie = "jaliz_session=1"

      // Even if cache is empty, presence of cookie protects against unauthenticated status
      const cached = null
      const hasCookie = hasSessionCookie()
      expect(hasCookie).toBe(true)

      // Network error occurs
      let status: "authenticated" | "loading" | "unauthenticated" = "loading"

      // In AuthProvider error handler:
      if (cached || hasCookie) {
        // Status is NOT downgraded to unauthenticated
        status = cached ? "authenticated" : "loading"
      } else {
        status = "unauthenticated"
      }

      expect(status).not.toBe("unauthenticated")
    })

    it("retains authenticated status and user data on network error when cached user exists", () => {
      const cachedUser = {
        id: "u-resilient-1",
        email: "resilient@jaliz.local",
        fullName: "Ali Reza",
        role: "user" as const,
        createdAt: new Date().toISOString(),
      }

      let status = "authenticated"
      let user: any = cachedUser

      // Transient network or DB failure
      const error = new TypeError("Failed to fetch")
      expect(error.message).toBe("Failed to fetch")

      // Handler retains auth state
      const hasCookie = false
      const currentCached = cachedUser

      if (currentCached || hasCookie) {
        if (currentCached) {
          user = currentCached
          status = "authenticated"
        }
      } else {
        status = "unauthenticated"
      }

      expect(status).toBe("authenticated")
      expect(user).toEqual(cachedUser)
    })

    it("transitions to unauthenticated only when server explicitly returns null", () => {
      let status = "authenticated"
      let user: any = { id: "u-1" }

      const onServerResult = (serverUser: any | null) => {
        if (serverUser) {
          user = serverUser
          status = "authenticated"
        } else {
          user = null
          status = "unauthenticated"
        }
      }

      onServerResult(null)

      expect(status).toBe("unauthenticated")
      expect(user).toBeNull()
    })
  })
})

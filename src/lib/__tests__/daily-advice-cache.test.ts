import { describe, expect, it } from "vitest"
import {
  clearDailyAdviceCache,
  getCachedDailyAdvice,
  getDailyAdviceCacheKey,
  setCachedDailyAdvice,
} from "../daily-advice-cache"
import { toLocalDateString } from "../relative-date"

interface MockStorage extends Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  store: Map<string, string>
}

function createMockStorage(initial: Record<string, string> = {}): MockStorage {
  const store = new Map<string, string>(Object.entries(initial))
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
}

describe("daily-advice-cache", () => {
  const USER_ID = "user_42"
  const TODAY = "2026-11-13"
  const SAMPLE_ADVICE = "امروز به دلیل افزایش دما، گیاهان بالکن به آبیاری مضاعف نیاز دارند."

  describe("Tier 1: Key Naming & Basic Get/Set", () => {
    it("generates cache key adhering to jaliz_daily_advice_${userId}", () => {
      expect(getDailyAdviceCacheKey("user_42")).toBe("jaliz_daily_advice_user_42")
      expect(getDailyAdviceCacheKey("alice-123")).toBe("jaliz_daily_advice_alice-123")
      expect(getDailyAdviceCacheKey("")).toBe("jaliz_daily_advice_")
      expect(getDailyAdviceCacheKey("user@domain.com")).toBe("jaliz_daily_advice_user@domain.com")
    })

    it("stores advice in storage under the correct key with structured metadata", () => {
      const storage = createMockStorage()
      const beforeTime = Date.now()

      setCachedDailyAdvice(USER_ID, SAMPLE_ADVICE, TODAY, storage)

      const raw = storage.getItem(`jaliz_daily_advice_${USER_ID}`)
      expect(raw).toBeTruthy()

      const parsed = JSON.parse(raw!)
      expect(parsed.userId).toBe(USER_ID)
      expect(parsed.date).toBe(TODAY)
      expect(parsed.advice).toBe(SAMPLE_ADVICE)
      expect(typeof parsed.fetchedAt).toBe("number")
      expect(parsed.fetchedAt).toBeGreaterThanOrEqual(beforeTime)
    })

    it("retrieves cached advice when requested on the same day", () => {
      const storage = createMockStorage()
      setCachedDailyAdvice(USER_ID, SAMPLE_ADVICE, TODAY, storage)

      const result = getCachedDailyAdvice(USER_ID, TODAY, storage)
      expect(result).toBe(SAMPLE_ADVICE)
    })
  })

  describe("Tier 2: Date Boundary & Invalidation", () => {
    it("returns null when cache is empty", () => {
      const storage = createMockStorage()
      expect(getCachedDailyAdvice(USER_ID, TODAY, storage)).toBeNull()
    })

    it("returns null when cached date is yesterday (day turnover invalidation)", () => {
      const storage = createMockStorage()
      const yesterday = "2026-11-12"
      setCachedDailyAdvice(USER_ID, "Yesterday advice", yesterday, storage)

      // Querying with today's date should miss the cache
      const result = getCachedDailyAdvice(USER_ID, TODAY, storage)
      expect(result).toBeNull()
    })

    it("returns null when cached date is in the future", () => {
      const storage = createMockStorage()
      setCachedDailyAdvice(USER_ID, "Future advice", "2026-11-14", storage)

      const result = getCachedDailyAdvice(USER_ID, TODAY, storage)
      expect(result).toBeNull()
    })

    it("defaults to today's local date when todayDate parameter is omitted", () => {
      const storage = createMockStorage()
      const currentLocalDate = toLocalDateString()

      setCachedDailyAdvice(USER_ID, "Current advice", currentLocalDate, storage)
      const result = getCachedDailyAdvice(USER_ID, undefined, storage)
      expect(result).toBe("Current advice")
    })

    it("overwrites previous day cache with new advice on date change", () => {
      const storage = createMockStorage()
      setCachedDailyAdvice(USER_ID, "Old advice", "2026-11-12", storage)

      const newAdvice = "Fresh advice for the new day"
      setCachedDailyAdvice(USER_ID, newAdvice, TODAY, storage)

      expect(getCachedDailyAdvice(USER_ID, TODAY, storage)).toBe(newAdvice)
    })
  })

  describe("Tier 3: User Isolation", () => {
    it("isolates cached advice between different users", () => {
      const storage = createMockStorage()
      const userA = "user_A"
      const userB = "user_B"
      const adviceA = "مشاوره کاربر الف"
      const adviceB = "مشاوره کاربر ب"

      setCachedDailyAdvice(userA, adviceA, TODAY, storage)
      setCachedDailyAdvice(userB, adviceB, TODAY, storage)

      expect(getCachedDailyAdvice(userA, TODAY, storage)).toBe(adviceA)
      expect(getCachedDailyAdvice(userB, TODAY, storage)).toBe(adviceB)
      expect(getCachedDailyAdvice("user_C", TODAY, storage)).toBeNull()
    })

    it("clearing cache for one user does not affect other users", () => {
      const storage = createMockStorage()
      setCachedDailyAdvice("user_A", "Advice A", TODAY, storage)
      setCachedDailyAdvice("user_B", "Advice B", TODAY, storage)

      clearDailyAdviceCache("user_A", storage)

      expect(getCachedDailyAdvice("user_A", TODAY, storage)).toBeNull()
      expect(getCachedDailyAdvice("user_B", TODAY, storage)).toBe("Advice B")
    })
  })

  describe("Tier 4: Error Resilience & SSR Safety", () => {
    it("handles null or undefined storage gracefully in SSR environments", () => {
      expect(() => setCachedDailyAdvice(USER_ID, SAMPLE_ADVICE, TODAY, null)).not.toThrow()
      expect(getCachedDailyAdvice(USER_ID, TODAY, null)).toBeNull()
      expect(() => clearDailyAdviceCache(USER_ID, null)).not.toThrow()
    })

    it("handles corrupted non-JSON storage content without throwing", () => {
      const storage = createMockStorage({
        [`jaliz_daily_advice_${USER_ID}`]: "{corrupted:json;invalid",
      })

      expect(getCachedDailyAdvice(USER_ID, TODAY, storage)).toBeNull()
    })

    it("handles non-object JSON values (primitives) gracefully", () => {
      const storage = createMockStorage({
        [`jaliz_daily_advice_${USER_ID}`]: "12345",
      })

      expect(getCachedDailyAdvice(USER_ID, TODAY, storage)).toBeNull()
    })

    it("handles missing required properties in cached payload", () => {
      const storage = createMockStorage({
        [`jaliz_daily_advice_${USER_ID}`]: JSON.stringify({ userId: USER_ID }), // missing date and advice
      })

      expect(getCachedDailyAdvice(USER_ID, TODAY, storage)).toBeNull()
    })

    it("handles mismatched userId in cached payload", () => {
      const storage = createMockStorage({
        [`jaliz_daily_advice_${USER_ID}`]: JSON.stringify({
          userId: "different_user",
          date: TODAY,
          advice: SAMPLE_ADVICE,
          fetchedAt: Date.now(),
        }),
      })

      expect(getCachedDailyAdvice(USER_ID, TODAY, storage)).toBeNull()
    })

    it("safely catches storage exceptions (e.g. QuotaExceededError)", () => {
      const faultyStorage = {
        getItem: () => {
          throw new Error("QuotaExceededError: Storage is full")
        },
        setItem: () => {
          throw new Error("QuotaExceededError: Storage is full")
        },
        removeItem: () => {
          throw new Error("SecurityError: Access denied")
        },
      }

      expect(() => setCachedDailyAdvice(USER_ID, SAMPLE_ADVICE, TODAY, faultyStorage)).not.toThrow()
      expect(getCachedDailyAdvice(USER_ID, TODAY, faultyStorage)).toBeNull()
      expect(() => clearDailyAdviceCache(USER_ID, faultyStorage)).not.toThrow()
    })

    it("preserves complex Persian Unicode, emojis, and newlines accurately", () => {
      const storage = createMockStorage()
      const richAdvice = "🌿 نکته روز:\nدمای هوا امروز به ۳۵ درجه می‌رسد! 💧 گیاه «برگ انجیری» را اسپری کنید."

      setCachedDailyAdvice(USER_ID, richAdvice, TODAY, storage)
      const retrieved = getCachedDailyAdvice(USER_ID, TODAY, storage)
      expect(retrieved).toBe(richAdvice)
    })
  })
})

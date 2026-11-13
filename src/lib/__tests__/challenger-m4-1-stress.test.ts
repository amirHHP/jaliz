import { describe, expect, it } from "vitest"
import {
  clearDailyAdviceCache,
  getCachedDailyAdvice,
  getDailyAdviceCacheKey,
  setCachedDailyAdvice,
} from "../daily-advice-cache"
import {
  getMascotDialogue,
  resolveMascotState,
  type MascotContext,
  type MascotState,
} from "../mascot-dialogue"
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

describe("Empirical Challenger Stress Harness: Daily Advice Cache", () => {
  const USER_ID = "adversarial_user_99"
  const TODAY = "2026-11-13"

  describe("1. Corrupted Data & Payload Fuzzing", () => {
    const corruptPayloads = [
      "",
      "   ",
      "\0\0\0",
      "undefined",
      "null",
      "NaN",
      "true",
      "false",
      "12345",
      "-999.5",
      "[]",
      "[1, 2, 3]",
      '["advice string in array"]',
      "{}",
      '{"randomKey": "value"}',
      '{"userId": 123, "date": "2026-11-13", "advice": "valid"}',
      '{"userId": "adversarial_user_99", "date": 12345, "advice": "valid"}',
      '{"userId": "adversarial_user_99", "date": "2026-11-13", "advice": 999}',
      '{"userId": "adversarial_user_99", "date": "2026-11-13", "advice": null}',
      '{"userId": "adversarial_user_99", "date": "2026-11-13", "advice": ["nested"]}',
      '{"userId": "adversarial_user_99", "date": "2026-11-13", "advice": {"sub": "obj"}}',
      '{"userId": "different_user", "date": "2026-11-13", "advice": "valid"}',
      '{"userId": "adversarial_user_99", "date": "2026-11-12", "advice": "yesterday"}',
      '{"userId": "adversarial_user_99", "date": "2026-11-14", "advice": "tomorrow"}',
      '{"__proto__": {"polluted": true}, "userId": "adversarial_user_99", "date": "2026-11-13", "advice": "legit"}',
      '{"constructor": {"prototype": {"polluted": true}}}',
    ]

    for (const [idx, payload] of corruptPayloads.entries()) {
      it(`survives and returns null on corrupted payload #${idx}: ${payload.slice(0, 35)}`, () => {
        const storage = createMockStorage({
          [`jaliz_daily_advice_${USER_ID}`]: payload,
        })

        let result: string | null = null
        expect(() => {
          result = getCachedDailyAdvice(USER_ID, TODAY, storage)
        }).not.toThrow()

        // If the payload had legit advice with matching userId and date, it returns the advice, otherwise null
        if (payload.includes('"legit"')) {
          expect(result).toBe("legit")
          // Ensure prototype was NOT polluted
          expect((Object.prototype as any).polluted).toBeUndefined()
        } else {
          expect(result).toBeNull()
        }
      })
    }

    it("survives progressive truncation fuzzing across JSON boundaries", () => {
      const validJson = JSON.stringify({
        userId: USER_ID,
        date: TODAY,
        advice: "این یک توصیه معتبر برای روز جاری است که نباید دچار خطا شود.",
        fetchedAt: Date.now(),
      })

      for (let len = 1; len < validJson.length; len++) {
        const truncated = validJson.slice(0, len)
        const storage = createMockStorage({
          [`jaliz_daily_advice_${USER_ID}`]: truncated,
        })

        expect(() => {
          const res = getCachedDailyAdvice(USER_ID, TODAY, storage)
          expect(res).toBeNull()
        }).not.toThrow()
      }
    })

    it("safely handles huge 2MB payload without blowing call stack", () => {
      const bigAdvice = "توصیه روزانه ".repeat(100_000) // ~1.5MB
      const storage = createMockStorage()

      expect(() => {
        setCachedDailyAdvice(USER_ID, bigAdvice, TODAY, storage)
      }).not.toThrow()

      const retrieved = getCachedDailyAdvice(USER_ID, TODAY, storage)
      expect(retrieved).toBe(bigAdvice)
    })
  })

  describe("2. Storage Exception Resilience & SSR Safety", () => {
    it("safely handles storage when getItem throws DOMException / QuotaExceededError", () => {
      const explodingStorage = {
        getItem: () => {
          throw new Error("DOMException: The operation is insecure.")
        },
      }
      expect(getCachedDailyAdvice(USER_ID, TODAY, explodingStorage)).toBeNull()
    })

    it("safely handles storage when setItem throws QuotaExceededError", () => {
      const quotaExceededStorage = {
        setItem: () => {
          const err = new Error("QuotaExceededError: storage is full")
          err.name = "QuotaExceededError"
          throw err
        },
      }
      expect(() => {
        setCachedDailyAdvice(USER_ID, "Sample advice", TODAY, quotaExceededStorage)
      }).not.toThrow()
    })

    it("safely handles storage when removeItem throws SecurityError", () => {
      const securityStorage = {
        removeItem: () => {
          throw new Error("SecurityError: Access denied")
        },
      }
      expect(() => {
        clearDailyAdviceCache(USER_ID, securityStorage)
      }).not.toThrow()
    })

    it("safely handles storage === null in SSR without throwing", () => {
      expect(getCachedDailyAdvice(USER_ID, TODAY, null)).toBeNull()
      expect(() => setCachedDailyAdvice(USER_ID, "Advice", TODAY, null)).not.toThrow()
      expect(() => clearDailyAdviceCache(USER_ID, null)).not.toThrow()
    })

    it("investigates global window.localStorage SecurityError behavior when storage arg is omitted", () => {
      // Emulate browser environment where accessing window.localStorage throws SecurityError
      const originalWindow = global.window
      try {
        const mockWindow = {} as any
        Object.defineProperty(mockWindow, "localStorage", {
          get: () => {
            throw new Error("DOMException: Failed to read 'localStorage': Access is denied.")
          },
          configurable: true,
        })
        global.window = mockWindow

        // When storage arg is omitted in such an environment:
        let threw = false
        let adviceResult: string | null = null
        try {
          adviceResult = getCachedDailyAdvice(USER_ID, TODAY)
        } catch {
          threw = true
        }

        // We record whether this throws (must be false after remediation)
        console.log("=== EMPIRICAL OBSERVATION: Did getCachedDailyAdvice throw? ===", threw)
        expect(threw).toBe(false)
        expect(adviceResult).toBeNull()
        expect(() => setCachedDailyAdvice(USER_ID, "Advice", TODAY)).not.toThrow()
        expect(() => clearDailyAdviceCache(USER_ID)).not.toThrow()
      } finally {
        global.window = originalWindow
      }
    })
  })

  describe("3. Calendar Rollover & Timezone Boundaries", () => {
    it("invalidates cache on new calendar day rollover", () => {
      const storage = createMockStorage()
      const d1 = "2026-11-13"
      const d2 = "2026-11-14"

      setCachedDailyAdvice(USER_ID, "Advice Day 1", d1, storage)
      expect(getCachedDailyAdvice(USER_ID, d1, storage)).toBe("Advice Day 1")

      // Next calendar day query misses cache
      expect(getCachedDailyAdvice(USER_ID, d2, storage)).toBeNull()

      // Updating cache on Day 2 updates the entry
      setCachedDailyAdvice(USER_ID, "Advice Day 2", d2, storage)
      expect(getCachedDailyAdvice(USER_ID, d2, storage)).toBe("Advice Day 2")

      // Checking Day 1 now misses because it was overwritten
      expect(getCachedDailyAdvice(USER_ID, d1, storage)).toBeNull()
    })

    it("invalidates on leap day turnover (2028-02-28 -> 2028-02-29)", () => {
      const storage = createMockStorage()
      setCachedDailyAdvice(USER_ID, "Leap Eve Advice", "2028-02-28", storage)
      expect(getCachedDailyAdvice(USER_ID, "2028-02-29", storage)).toBeNull()
    })

    it("invalidates on year-end turnover (2026-12-31 -> 2027-01-01)", () => {
      const storage = createMockStorage()
      setCachedDailyAdvice(USER_ID, "New Year Eve Advice", "2026-12-31", storage)
      expect(getCachedDailyAdvice(USER_ID, "2027-01-01", storage)).toBeNull()
    })

    it("falls back to toLocalDateString() when todayDate is undefined or empty string", () => {
      const storage = createMockStorage()
      const localToday = toLocalDateString()

      setCachedDailyAdvice(USER_ID, "Auto Date Advice", localToday, storage)

      // Undefined defaults to today
      expect(getCachedDailyAdvice(USER_ID, undefined, storage)).toBe("Auto Date Advice")
      // Empty string falls back to today
      expect(getCachedDailyAdvice(USER_ID, "", storage)).toBe("Auto Date Advice")
    })
  })

  describe("4. Multi-User Isolation & Key Collisions", () => {
    it("ensures strict isolation between multiple users with prefix collisions", () => {
      const storage = createMockStorage()
      const user1 = "user_1"
      const user10 = "user_10"
      const user100 = "user_100"

      setCachedDailyAdvice(user1, "Advice for user 1", TODAY, storage)
      setCachedDailyAdvice(user10, "Advice for user 10", TODAY, storage)
      setCachedDailyAdvice(user100, "Advice for user 100", TODAY, storage)

      expect(getCachedDailyAdvice(user1, TODAY, storage)).toBe("Advice for user 1")
      expect(getCachedDailyAdvice(user10, TODAY, storage)).toBe("Advice for user 10")
      expect(getCachedDailyAdvice(user100, TODAY, storage)).toBe("Advice for user 100")

      // Clearing user10 leaves user1 and user100 intact
      clearDailyAdviceCache(user10, storage)
      expect(getCachedDailyAdvice(user10, TODAY, storage)).toBeNull()
      expect(getCachedDailyAdvice(user1, TODAY, storage)).toBe("Advice for user 1")
      expect(getCachedDailyAdvice(user100, TODAY, storage)).toBe("Advice for user 100")
    })

    it("rejects cached payload if payload.userId does not match requested userId", () => {
      const storage = createMockStorage()
      // Manually tamper: insert payload with userId "attacker" under key for "victim"
      const victimKey = getDailyAdviceCacheKey("victim_user")
      storage.setItem(
        victimKey,
        JSON.stringify({
          userId: "attacker_user",
          date: TODAY,
          advice: "Tampered malicious advice",
          fetchedAt: Date.now(),
        })
      )

      expect(getCachedDailyAdvice("victim_user", TODAY, storage)).toBeNull()
    })

    it("handles unusual userIds with spaces, special symbols, and non-ASCII characters", () => {
      const storage = createMockStorage()
      const specialUserIds = [
        "user@domain.com",
        "user/with/slashes",
        "user:with:colons",
        "user with spaces",
        "کاربر_فارسی_۱۲۳",
        "user#hash?query=1",
      ]

      for (const id of specialUserIds) {
        setCachedDailyAdvice(id, `Advice for ${id}`, TODAY, storage)
        expect(getCachedDailyAdvice(id, TODAY, storage)).toBe(`Advice for ${id}`)
        clearDailyAdviceCache(id, storage)
        expect(getCachedDailyAdvice(id, TODAY, storage)).toBeNull()
      }
    })
  })
})

describe("Empirical Challenger Stress Harness: Mascot State Machine & Dialogue", () => {
  describe("1. Hour Boundaries Matrix", () => {
    // Exact specification:
    // Resting: hour >= 20 || hour < 5
    // Daytime: hour >= 5 && hour < 20
    const testCases: { hour: number; expectedState: MascotState; description: string }[] = [
      { hour: 0, expectedState: "resting", description: "Midnight (00:00)" },
      { hour: 1, expectedState: "resting", description: "1 AM" },
      { hour: 2, expectedState: "resting", description: "2 AM" },
      { hour: 3, expectedState: "resting", description: "3 AM" },
      { hour: 4, expectedState: "resting", description: "4 AM (last resting hour before wake-up)" },
      { hour: 5, expectedState: "thirsty", description: "5 AM wake-up boundary" },
      { hour: 6, expectedState: "thirsty", description: "6 AM morning" },
      { hour: 11, expectedState: "thirsty", description: "11 AM midday" },
      { hour: 14, expectedState: "thirsty", description: "2 PM afternoon" },
      { hour: 19, expectedState: "thirsty", description: "7 PM (19:00) last active daytime hour" },
      { hour: 20, expectedState: "resting", description: "8 PM (20:00) night sleep cutoff" },
      { hour: 21, expectedState: "resting", description: "9 PM (21:00)" },
      { hour: 22, expectedState: "resting", description: "10 PM (22:00)" },
      { hour: 23, expectedState: "resting", description: "11 PM (23:00)" },
    ]

    for (const tc of testCases) {
      it(`resolves ${tc.description} (hour: ${tc.hour}) -> ${tc.expectedState}`, () => {
        const state = resolveMascotState({
          totalPlants: 3,
          plantsToWaterCount: 1, // thirsty condition if awake
          isDoneToday: false,
          streakDays: 2,
          currentHour: tc.hour,
        })
        expect(state).toBe(tc.expectedState)
      })
    }
  })

  describe("2. Garden State Matrix (Empty, Hydrated, Thirsty, Celebrating)", () => {
    it("empty garden (totalPlants === 0) ALWAYS resolves 'resting' regardless of hour or flags", () => {
      const hoursToTest = [0, 4, 5, 8, 12, 16, 19, 20, 23]
      for (const hour of hoursToTest) {
        expect(
          resolveMascotState({
            totalPlants: 0,
            plantsToWaterCount: 0,
            isDoneToday: false,
            streakDays: 0,
            currentHour: hour,
          })
        ).toBe("resting")

        // Even if corrupt flags are passed
        expect(
          resolveMascotState({
            totalPlants: 0,
            plantsToWaterCount: 5,
            isDoneToday: true,
            streakDays: 10,
            currentHour: hour,
          })
        ).toBe("resting")
      }
    })

    it("celebrating takes precedence over thirsty during daytime hours", () => {
      expect(
        resolveMascotState({
          totalPlants: 4,
          plantsToWaterCount: 2, // e.g. stale count
          isDoneToday: true,
          streakDays: 5,
          currentHour: 12,
        })
      ).toBe("celebrating")
    })

    it("night resting takes precedence over celebrating", () => {
      expect(
        resolveMascotState({
          totalPlants: 4,
          plantsToWaterCount: 0,
          isDoneToday: true,
          streakDays: 5,
          currentHour: 22, // 10 PM
        })
      ).toBe("resting")
    })

    it("resolves thriving when garden has plants, daytime, none to water, not marked done", () => {
      expect(
        resolveMascotState({
          totalPlants: 5,
          plantsToWaterCount: 0,
          isDoneToday: false,
          streakDays: 3,
          currentHour: 10,
        })
      ).toBe("thriving")
    })
  })

  describe("3. Dialogue Generation Extreme Inputs & Micro-Copy Fuzzing", () => {
    const extremeNames = [
      "",
      "   ",
      "\t\n",
      "سارا",
      "محمد رضا",
      "Alice",
      "Bob 123",
      "🪴 گل‌دوست 🌿",
      "<script>alert(1)</script>",
      '"><img src=x onerror=alert(1)>',
      "\u202E\u0041\u0042\u0043", // RTL override
      "A".repeat(500), // Very long name
    ]

    for (const name of extremeNames) {
      it(`handles userName cleanly without crashing: "${name.slice(0, 20)}"`, () => {
        const ctx: MascotContext = {
          totalPlants: 2,
          plantsToWaterCount: 1,
          isDoneToday: false,
          streakDays: 1,
          currentHour: 12,
          userName: name,
        }

        const fa = getMascotDialogue(ctx, "fa")
        const en = getMascotDialogue(ctx, "en")

        expect(typeof fa).toBe("string")
        expect(fa.length).toBeGreaterThan(0)
        expect(typeof en).toBe("string")
        expect(en.length).toBeGreaterThan(0)

        // Strict 0% undefined/null leakage
        expect(fa).not.toContain("undefined")
        expect(fa).not.toContain("null")
        expect(fa).not.toContain("NaN")
        expect(en).not.toContain("undefined")
        expect(en).not.toContain("null")
        expect(en).not.toContain("NaN")
      })
    }

    it("handles extreme firstThirstyPlantName (empty, spaces, quotes)", () => {
      const inputs = ["", "   ", '"""', "سانسوریا", "گیاه «پوتوس»"]
      for (const plantName of inputs) {
        const ctx: MascotContext = {
          totalPlants: 3,
          plantsToWaterCount: 1,
          isDoneToday: false,
          streakDays: 0,
          currentHour: 12,
          firstThirstyPlantName: plantName,
        }

        const dialogue = getMascotDialogue(ctx, "fa")
        expect(dialogue.length).toBeGreaterThan(0)
        expect(dialogue).not.toContain("undefined")
        expect(dialogue).not.toContain("null")

        // If plant name was empty or whitespace, it should fall back to general count dialogue
        if (!plantName.trim()) {
          expect(dialogue).toContain("1 گیاه")
        } else {
          expect(dialogue).toContain(plantName.trim())
        }
      }
    })

    it("generates welcoming message when totalPlants === 0 in both languages", () => {
      const ctx: MascotContext = {
        totalPlants: 0,
        plantsToWaterCount: 0,
        isDoneToday: false,
        streakDays: 0,
        currentHour: 14,
        userName: "رضا",
      }

      const fa = getMascotDialogue(ctx, "fa")
      expect(fa).toContain("رضا جان")
      expect(fa).toContain("باغچه تو هنوز خالیه")

      const en = getMascotDialogue(ctx, "en")
      expect(en).toContain("رضا")
      expect(en).toContain("first plant")
    })

    it("generates night resting dialogue when state is resting and garden not empty", () => {
      const ctx: MascotContext = {
        totalPlants: 3,
        plantsToWaterCount: 0,
        isDoneToday: false,
        streakDays: 2,
        currentHour: 22,
        userName: "علی",
      }

      const fa = getMascotDialogue(ctx, "fa")
      expect(fa).toContain("خوابیدند")
      expect(fa).toContain("شب خوش")

      const en = getMascotDialogue(ctx, "en")
      expect(en).toContain("resting for the night")
    })

    it("handles extreme numbers in plantsToWaterCount gracefully", () => {
      const ctx: MascotContext = {
        totalPlants: 1000000,
        plantsToWaterCount: 999999,
        isDoneToday: false,
        streakDays: 0,
        currentHour: 12,
      }

      const fa = getMascotDialogue(ctx, "fa")
      expect(fa).toContain("999999 گیاه")

      const en = getMascotDialogue(ctx, "en")
      expect(en).toContain("999999 plants")
    })
  })
})

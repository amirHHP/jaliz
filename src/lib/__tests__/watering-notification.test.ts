import { describe, expect, it, vi, beforeEach } from "vitest"
import {
  formatWateringNotification,
  shouldTriggerDailyWateringNotification,
  checkAndDispatchWateringNotification,
  WATERING_NOTIF_STORAGE_KEY,
} from "../watering-notification"

describe("formatWateringNotification", () => {
  it("formats notification for empty plants list in Persian and English", () => {
    const fa = formatWateringNotification([], "fa")
    expect(fa.title).toContain("جالیز")
    expect(fa.body).toContain("تمامی گیاهان شما شاداب هستند")
    expect(fa.url).toBe("/schedule")
    expect(fa.tag).toBe("jaliz-watering-reminder")

    const en = formatWateringNotification([], "en")
    expect(en.title).toContain("Jaliz")
    expect(en.body).toContain("do not need water")
  })

  it("formats notification for single plant", () => {
    const fa = formatWateringNotification(["پتوس"], "fa")
    expect(fa.title).toContain("یادآور آبیاری")
    expect(fa.body).toBe("گیاه «پتوس» امروز نیاز به آبیاری دارد.")

    const en = formatWateringNotification(["Pothos"], "en")
    expect(en.title).toContain("Watering Reminder")
    expect(en.body).toBe('Plant "Pothos" needs watering today.')
  })

  it("formats notification for 2-3 plants", () => {
    const fa = formatWateringNotification(["پتوس", "سانسوریا"], "fa")
    expect(fa.body).toBe("۲ گیاه شما (پتوس، سانسوریا) امروز نیاز به آبیاری دارند.")

    const en = formatWateringNotification(["Pothos", "Snake Plant"], "en")
    expect(en.body).toBe("2 of your plants (Pothos, Snake Plant) need watering today.")
  })

  it("formats notification for 4 or more plants", () => {
    const plants = ["پتوس", "فیکوس", "سانسوریا", "برگ انجیری"]
    const fa = formatWateringNotification(plants, "fa")
    expect(fa.body).toBe("۴ گیاه شما از جمله پتوس، فیکوس، سانسوریا امروز نیاز به آبیاری دارند.")

    const en = formatWateringNotification(["A", "B", "C", "D"], "en")
    expect(en.body).toBe("4 of your plants including A, B, C need watering today.")
  })
})

describe("shouldTriggerDailyWateringNotification", () => {
  it("returns true when not notified before", () => {
    expect(shouldTriggerDailyWateringNotification(null, "2026-11-12")).toBe(true)
    expect(shouldTriggerDailyWateringNotification(undefined, "2026-11-12")).toBe(true)
    expect(shouldTriggerDailyWateringNotification("", "2026-11-12")).toBe(true)
  })

  it("returns true when last notification was a previous day", () => {
    expect(shouldTriggerDailyWateringNotification("2026-11-11", "2026-11-12")).toBe(true)
  })

  it("returns false when already notified today", () => {
    expect(shouldTriggerDailyWateringNotification("2026-11-12", "2026-11-12")).toBe(false)
  })
})

describe("checkAndDispatchWateringNotification", () => {
  const mockStorage = () => {
    const store = new Map<string, string>()
    return {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value)
      }),
    }
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("skips if already notified today and force is false", async () => {
    const storage = mockStorage()
    storage.setItem(WATERING_NOTIF_STORAGE_KEY, "2026-11-12")

    const result = await checkAndDispatchWateringNotification({
      plants: [{ name: "پتوس", lastWatered: "2026-11-01" }],
      now: new Date("2026-11-12T10:00:00Z"),
      force: false,
      storage,
    })

    expect(result.dispatched).toBe(false)
    expect(result.reason).toBe("already_notified_today")
  })

  it("skips if no plants need water and force is false", async () => {
    const storage = mockStorage()
    const now = new Date("2026-11-12T10:00:00Z")

    const result = await checkAndDispatchWateringNotification({
      plants: [
        {
          name: "پتوس",
          lastWatered: "2026-11-12T00:00:00Z", // watered today
          nextWateringDate: "2026-11-19T00:00:00Z",
        },
      ],
      now,
      force: false,
      storage,
    })

    expect(result.dispatched).toBe(false)
    expect(result.reason).toBe("no_plants_need_water")
  })
})

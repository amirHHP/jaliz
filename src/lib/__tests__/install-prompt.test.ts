import { describe, expect, it } from "vitest"
import {
  DISMISS_DAYS,
  DISMISS_KEY,
  isInstallPromptDismissed,
  markInstallPromptDismissed,
} from "@/lib/install-prompt"

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value
    },
    _data: data,
  }
}

describe("install prompt dismiss", () => {
  it("is not dismissed when storage is empty", () => {
    expect(isInstallPromptDismissed(Date.now(), memoryStorage())).toBe(false)
  })

  it("is dismissed within the cooldown window", () => {
    const now = Date.now()
    const storage = memoryStorage({ [DISMISS_KEY]: String(now) })
    expect(isInstallPromptDismissed(now + 1000, storage)).toBe(true)
  })

  it("reappears after the cooldown expires", () => {
    const now = Date.now()
    const storage = memoryStorage({ [DISMISS_KEY]: String(now) })
    const afterCooldown = now + (DISMISS_DAYS + 1) * 24 * 60 * 60 * 1000
    expect(isInstallPromptDismissed(afterCooldown, storage)).toBe(false)
  })

  it("persists dismiss immediately", () => {
    const now = 1_700_000_000_000
    const storage = memoryStorage()
    markInstallPromptDismissed(now, storage)
    expect(storage._data[DISMISS_KEY]).toBe(String(now))
    expect(isInstallPromptDismissed(now + 60_000, storage)).toBe(true)
  })
})

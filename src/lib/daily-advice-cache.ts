import { toLocalDateString } from "./relative-date"

export interface DailyAdviceCacheEntry {
  userId: string
  date: string // YYYY-MM-DD from toLocalDateString()
  advice: string
  fetchedAt: number
}

function resolveStorage<T>(storage?: T | null): T | null {
  if (storage !== undefined) return storage
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage as unknown as T
    }
  } catch {
    return null
  }
  return null
}

export function getDailyAdviceCacheKey(userId: string): string {
  return `jaliz_daily_advice_${userId}`
}

export function getCachedDailyAdvice(
  userId: string,
  todayDate?: string,
  storage?: Pick<Storage, "getItem"> | null
): string | null {
  const store = resolveStorage(storage)
  if (!store) return null

  const targetDate = todayDate || toLocalDateString()
  const key = getDailyAdviceCacheKey(userId)

  try {
    const raw = store.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null
    }

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.date !== "string" ||
      typeof parsed.advice !== "string"
    ) {
      return null
    }

    if (parsed.userId !== userId) {
      return null
    }

    if (parsed.date !== targetDate) {
      return null
    }

    return parsed.advice
  } catch {
    return null
  }
}

export function setCachedDailyAdvice(
  userId: string,
  advice: string,
  todayDate?: string,
  storage?: Pick<Storage, "setItem"> | null
): void {
  const store = resolveStorage(storage)
  if (!store) return

  const targetDate = todayDate || toLocalDateString()
  const key = getDailyAdviceCacheKey(userId)

  const payload: DailyAdviceCacheEntry = {
    userId,
    date: targetDate,
    advice,
    fetchedAt: Date.now(),
  }

  try {
    store.setItem(key, JSON.stringify(payload))
  } catch {
    // Gracefully ignore storage quota or access errors
  }
}

export function clearDailyAdviceCache(
  userId: string,
  storage?: Pick<Storage, "removeItem"> | null
): void {
  const store = resolveStorage(storage)
  if (!store) return

  const key = getDailyAdviceCacheKey(userId)

  try {
    store.removeItem(key)
  } catch {
    // Gracefully ignore storage errors
  }
}

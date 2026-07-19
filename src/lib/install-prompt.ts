export const DISMISS_KEY = "jaliz-install-dismissed"
export const DISMISS_DAYS = 7

export function isInstallPromptDismissed(
  now: number = Date.now(),
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined" ? localStorage : null
): boolean {
  if (!storage) return true
  const val = storage.getItem(DISMISS_KEY)
  if (!val) return false
  const dismissedAt = parseInt(val, 10)
  if (Number.isNaN(dismissedAt)) return false
  const daysPassed = (now - dismissedAt) / (1000 * 60 * 60 * 24)
  return daysPassed < DISMISS_DAYS
}

export function markInstallPromptDismissed(
  now: number = Date.now(),
  storage: Pick<Storage, "setItem"> | null = typeof window !== "undefined" ? localStorage : null
): void {
  storage?.setItem(DISMISS_KEY, String(now))
}

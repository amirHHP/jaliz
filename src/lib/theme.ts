export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "jaliz-theme"
export const DEFAULT_THEME: Theme = "light"

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark"
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return isTheme(stored) ? stored : null
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function applyThemeToDocument(theme: Theme): void {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

export function resolveThemeForAuth(
  isAuthenticated: boolean,
  storedTheme: Theme | null = getStoredTheme()
): Theme {
  if (!isAuthenticated) return DEFAULT_THEME
  return storedTheme ?? DEFAULT_THEME
}

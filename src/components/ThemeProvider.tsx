"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useAuth } from "./AuthProvider"
import {
  DEFAULT_THEME,
  Theme,
  applyThemeToDocument,
  getStoredTheme,
  resolveThemeForAuth,
  setStoredTheme,
} from "@/lib/theme"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  canChangeTheme: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

  const isAuthenticated = status === "authenticated"
  const canChangeTheme = isAuthenticated

  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (!canChangeTheme) return
      setThemeState(newTheme)
      setStoredTheme(newTheme)
      applyThemeToDocument(newTheme)
    },
    [canChangeTheme]
  )

  useEffect(() => {
    if (status === "loading") return

    const resolved = resolveThemeForAuth(isAuthenticated, getStoredTheme())
    setThemeState(resolved)
    applyThemeToDocument(resolved)
  }, [status, isAuthenticated])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, canChangeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

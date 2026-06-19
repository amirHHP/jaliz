"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Globe,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  User,
  UserPlus,
  X,
} from "lucide-react"

import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { SettingsModal } from "@/components/SettingsModal"
import { Settings as SettingsIcon } from "lucide-react"


interface NavLink {
  href: string
  key: "schedule" | "marketplace" | "my_plants" | "admin_panel"
  adminOnly?: boolean
  authRequired?: boolean
}

const NAV_LINKS: NavLink[] = [
  { href: "/", key: "my_plants", authRequired: true },
  { href: "/schedule", key: "schedule", authRequired: true },
  { href: "/marketplace", key: "marketplace" },
  { href: "/admin", key: "admin_panel", adminOnly: true },
]


export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { status, user, isAdmin, logout } = useAuth()
  const pathname = usePathname() ?? "/"


  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close the account dropdown on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [menuOpen])

  // Close mobile menu on route change.
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en")
  }

  const isAuthenticated = status === "authenticated"
  const visibleLinks = NAV_LINKS.filter((l) => {
    if (l.adminOnly && !isAdmin) return false
    if (l.authRequired && !isAuthenticated) return false
    return true
  })

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-emerald-700">
          <div className="p-2 bg-emerald-100 rounded-xl shadow-sm">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {t("app_title")}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {visibleLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href !== "#" && pathname.startsWith(link.href)
            return (
              <Link
                key={link.key}
                href={link.href}
                className={
                  isActive
                    ? "text-emerald-700 font-semibold transition-colors"
                    : "text-slate-600 hover:text-emerald-700 transition-colors"
                }
              >
                {t(link.key)}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Smart Detect CTA */}
        {isAuthenticated && (
          <Link
            href="/plants/new"
            id="smart-detect-desktop"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            <Sparkles className="h-4 w-4" />
            {t("smart_detect")}
          </Link>
        )}

        <div className="flex items-center gap-3">


          {/* Auth area. Render a stable placeholder while loading to avoid
              hydration mismatches between server and client. */}
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
          ) : status === "authenticated" && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 shadow-sm flex items-center justify-center flex-shrink-0 hover:bg-emerald-200 transition"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={t("account")}
              >
                <User className="h-5 w-5 text-emerald-700" />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute end-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl py-2 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                        <Shield className="h-3 w-3" />
                        {t("admin_role_admin")}
                      </span>
                    )}
                  </div>
                  <button
                    role="menuitem"
                    onClick={toggleLanguage}
                    className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Globe className="h-4 w-4 text-slate-500" />
                    {language === "en" ? "فارسی" : "English"}
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      setSettingsOpen(true)
                    }}
                    className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <SettingsIcon className="h-4 w-4 text-slate-500" />
                    {t("settings")}
                  </button>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Shield className="h-4 w-4 text-emerald-600" />
                      {t("admin_panel")}
                    </Link>
                  )}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4 text-slate-500" />
                    {t("sign_out")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center justify-center h-8 w-8 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                aria-label={language === "en" ? "تغییر زبان به فارسی" : "Switch to English"}
                title={language === "en" ? "فارسی" : "English"}
              >
                <Globe className="h-4 w-4" />
              </button>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                {t("sign_in")}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-full shadow-sm transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                {t("sign_up")}
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 space-y-1">
          {visibleLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href !== "#" && pathname.startsWith(link.href)
            return (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                }`}
              >
                {t(link.key)}
              </Link>
            )
          })}

          {/* Mobile Smart Detect CTA */}
          {isAuthenticated && (
            <div className="border-t border-slate-100 pt-2 mt-2">
              <Link
                href="/plants/new"
                id="smart-detect-mobile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md transition-all hover:shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                {t("smart_detect")}
              </Link>
            </div>
          )}

          {/* Mobile auth actions */}
          {status !== "loading" && status !== "authenticated" && (
            <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                {t("sign_in")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                {t("sign_up")}
              </Link>
            </div>
          )}

          {status === "authenticated" && user && (
            <div className="border-t border-slate-100 pt-2 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t("sign_out")}
              </button>
            </div>
          )}

          {/* Mobile language toggle */}
          <div className="border-t border-slate-100 pt-2 mt-2">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "فارسی" : "English"}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setSettingsOpen(true)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
            >
              <SettingsIcon className="h-4 w-4" />
              {t("settings")}
            </button>
          </div>
        </nav>
      </div>

      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}

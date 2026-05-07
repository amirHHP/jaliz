"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Globe,
  Leaf,
  LogIn,
  LogOut,
  Settings,
  Shield,
  UserPlus,
} from "lucide-react"

import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { SettingsModal } from "@/components/SettingsModal"

interface NavLink {
  href: string
  key: "dashboard" | "marketplace" | "my_plants" | "admin_panel"
  adminOnly?: boolean
}

const NAV_LINKS: NavLink[] = [
  { href: "/", key: "dashboard" },
  { href: "#", key: "marketplace" },
  { href: "/plants", key: "my_plants" },
  { href: "/admin", key: "admin_panel", adminOnly: true },
]

function avatarSeed(input: string): string {
  // Stable, fun-but-deterministic seed for the dicebear avatar.
  return encodeURIComponent(input || "guest")
}

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { status, user, isAdmin, logout } = useAuth()
  const pathname = usePathname() ?? "/"

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en")
  }

  const visibleLinks = NAV_LINKS.filter((l) => !l.adminOnly || isAdmin)

  return (
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

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200"
          >
            <Globe className="h-4 w-4" />
            {language === "en" ? "فارسی" : "English"}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center h-9 w-9 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors bg-slate-100 rounded-full border border-slate-200"
            aria-label={t("settings")}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Auth area. Render a stable placeholder while loading to avoid
              hydration mismatches between server and client. */}
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
          ) : status === "authenticated" && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="h-9 w-9 rounded-full bg-emerald-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-emerald-300 transition"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={t("account")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed(user.email)}`}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
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
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  )
}

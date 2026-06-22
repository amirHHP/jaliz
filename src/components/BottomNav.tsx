"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Leaf, Sparkles, Store } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { status } = useAuth()

  const isAuthenticated = status === "authenticated"

  // Don't show bottom nav if not authenticated, or on auth/admin/new-plant pages
  if (
    status !== "authenticated" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/admin") ||
    pathname === "/plants/new"
  ) {
    return null
  }

  // Build tabs: always include marketplace, add plant-specific tabs only for authenticated users
  const tabs = [
    ...(isAuthenticated
      ? [
          {
            name: t("my_plants"),
            href: "/",
            icon: Leaf,
            active: pathname === "/",
          },
          {
            name: (t as any)("schedule"),
            href: "/schedule",
            icon: CalendarDays,
            active: pathname?.startsWith("/schedule"),
          },
        ]
      : []),
    {
      name: t("marketplace"),
      href: isAuthenticated ? "/marketplace" : "/",
      icon: Store,
      active: isAuthenticated
        ? pathname?.startsWith("/marketplace")
        : pathname === "/" || pathname?.startsWith("/marketplace"),
    },
  ]

  // Smart detect tab (separate for special styling)
  const smartDetectTab = isAuthenticated
    ? {
        name: (t as any)("smart_detect"),
        href: "/plants/new",
        icon: Sparkles,
      }
    : null

  // For unauthenticated: show full-width marketplace tab
  const gridCols = isAuthenticated ? "grid-cols-4" : "grid-cols-1"

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 md:hidden pb-safe">
      <div className={`grid h-full max-w-lg ${gridCols} mx-auto font-medium`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.active
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-slate-50 group ${
                isActive ? "text-emerald-600" : "text-slate-500 hover:text-emerald-600"
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
                }`}
              />
              <span className="text-[10px] sm:text-xs text-center">{tab.name}</span>
            </Link>
          )
        })}
        {smartDetectTab && (
          <Link
            key="smart-detect"
            href={smartDetectTab.href}
            id="smart-detect-bottom"
            className="inline-flex flex-col items-center justify-center px-2 group"
          >
            <div className="w-9 h-9 -mt-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg ring-2 ring-white group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[9px] mt-0.5 text-emerald-600 font-bold">{smartDetectTab.name}</span>
          </Link>
        )}
      </div>
    </div>
  )
}


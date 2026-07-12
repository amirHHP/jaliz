"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Leaf, MessageCircle, Sparkles, Store } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { useMarketplace } from "@/components/MarketplaceProvider"

export function BottomNav() {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const { status, user } = useAuth()
  const { getUnreadCount, revision } = useMarketplace()

  const isAuthenticated = status === "authenticated"
  const unreadCount = user ? getUnreadCount(user.id) : 0

  // Don't show bottom nav if not authenticated, or on auth/admin/new-plant/store-scan pages
  if (
    status !== "authenticated" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/admin") ||
    pathname === "/plants/new" ||
    pathname === "/plants/diagnose" ||
    pathname?.startsWith("/store-scan")
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
          {
            name: t("marketplace"),
            href: "/marketplace",
            icon: Store,
            active: pathname?.startsWith("/marketplace") && !pathname?.startsWith("/marketplace/chats"),
          },
          {
            name: (t as any)("chats"),
            href: "/marketplace/chats",
            icon: MessageCircle,
            active: pathname?.startsWith("/marketplace/chats"),
          },
        ]
      : [
          {
            name: t("marketplace"),
            href: "/",
            icon: Store,
            active: pathname === "/" || (pathname?.startsWith("/marketplace") && !pathname?.startsWith("/marketplace/chats")),
          },
        ]),
  ]

  // Smart detect tab (separate for special styling)
  const smartDetectTab = isAuthenticated
    ? {
        name: (t as any)("smart_detect"),
        href: "/plants/diagnose",
        icon: Sparkles,
      }
    : null

  // For unauthenticated: show full-width marketplace tab
  const gridCols = isAuthenticated ? "grid-cols-5" : "grid-cols-1"

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border md:hidden pb-safe">
      <div className={`grid h-full max-w-lg ${gridCols} mx-auto font-medium`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.active
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              className={`relative inline-flex flex-col items-center justify-center px-5 hover:bg-slate-50 dark:hover:bg-slate-800 group ${
                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 mb-1 ${
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted group-hover:text-emerald-500 dark:group-hover:text-emerald-400"
                  }`}
                />
                {tab.href === "/marketplace/chats" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-center">{tab.name}</span>
            </Link>
          )
        })}
        {smartDetectTab && (
          <Link
            key="smart-detect"
            href={smartDetectTab.href}
            prefetch={false}
            id="smart-detect-bottom"
            className="inline-flex flex-col items-center justify-center px-2 group"
          >
            <div className="w-9 h-9 -mt-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg ring-2 ring-card group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[9px] mt-0.5 text-emerald-600 font-bold">{smartDetectTab.name}</span>
          </Link>
        )}
      </div>
    </div>
  )
}


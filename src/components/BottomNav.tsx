"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Leaf, MessageCircle, Sparkles, Store } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { useMarketplaceInbox } from "@/components/MarketplaceProvider"

type NavTab = {
  name: string
  href: string
  icon: typeof Leaf
  active: boolean
  badge?: number
  featured?: boolean
}

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { status, user } = useAuth()
  const { getUnreadCount } = useMarketplaceInbox()

  const unreadCount = user ? getUnreadCount(user.id) : 0

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

  const tabs: NavTab[] = [
    {
      name: t("nav_my_plants"),
      href: "/",
      icon: Leaf,
      active: pathname === "/",
    },
    {
      name: t("nav_schedule"),
      href: "/schedule",
      icon: CalendarDays,
      active: Boolean(pathname?.startsWith("/schedule")),
    },
    {
      name: t("nav_smart_detect"),
      href: "/plants/diagnose",
      icon: Sparkles,
      active: false,
      featured: true,
    },
    {
      name: t("nav_marketplace"),
      href: "/marketplace",
      icon: Store,
      active: Boolean(
        pathname?.startsWith("/marketplace") && !pathname?.startsWith("/marketplace/chats")
      ),
    },
    {
      name: t("nav_chats"),
      href: "/marketplace/chats",
      icon: MessageCircle,
      active: Boolean(pathname?.startsWith("/marketplace/chats")),
      badge: unreadCount,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border md:hidden pb-safe">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.active

          if (tab.featured) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={false}
                id="smart-detect-bottom"
                className="relative flex flex-col items-center justify-center gap-0.5 px-1"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md ring-2 ring-card -mt-3">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="w-full truncate text-center text-[10px] leading-none font-semibold text-emerald-600 dark:text-emerald-400">
                  {tab.name}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-1 ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <span className="relative flex h-7 w-7 items-center justify-center">
                <Icon className="h-5 w-5" />
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span className="w-full truncate text-center text-[10px] leading-none">
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Leaf, Store } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { status } = useAuth()

  // Don't show bottom nav on auth pages, admin pages, the new plant wizard page, or the unauthenticated landing page
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/admin") ||
    pathname === "/plants/new" ||
    (pathname === "/" && status !== "authenticated")
  ) {
    return null
  }

  const tabs = [
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
      active: pathname?.startsWith("/marketplace"),
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 md:hidden pb-safe">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
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
      </div>
    </div>
  )
}

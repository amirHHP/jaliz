"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Bell,
  BookOpen,
  Globe,
  History,
  LogIn,
  LogOut,
  PlusCircle,
  Shield,
  ShoppingBag,
  Sparkles,
  Store,
  User,
  UserPlus,
  Settings as SettingsIcon,
} from "lucide-react"

import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { useMarketplaceInbox } from "@/components/MarketplaceProvider"
import { useCart } from "@/components/marketplace/CartProvider"
import { SettingsModal } from "@/components/SettingsModal"
import { ShopMessagesModal } from "@/components/ShopMessagesModal"
import { PromoBanner } from "@/components/PromoBanner"


interface NavLink {
  href: string
  key: "schedule" | "marketplace" | "my_plants" | "admin_panel" | "chats" | "blog"
  adminOnly?: boolean
  authRequired?: boolean
}

/** Dynamic/auth pages: disable Link prefetch to avoid multi-route Origin hits on every viewport. */
const NAV_LINKS: NavLink[] = [
  { href: "/", key: "my_plants", authRequired: true },
  { href: "/schedule", key: "schedule", authRequired: true },
  { href: "/marketplace", key: "marketplace" },
  { href: "/marketplace/chats", key: "chats", authRequired: true },
  { href: "/blog", key: "blog" },
  { href: "/admin", key: "admin_panel", adminOnly: true },
]

const PREFETCH_DISABLED_HREFS = new Set([
  "/",
  "/schedule",
  "/marketplace",
  "/marketplace/chats",
  "/admin",
  "/plants/diagnose",
])

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { status, user, isAdmin, logout } = useAuth()
  const { getUnreadCount, revision } = useMarketplaceInbox()
  const { itemCount, setIsCartOpen } = useCart()
  const pathname = usePathname() ?? "/"

  const unreadCount = user ? getUnreadCount(user.id) : 0

  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shopMessagesOpen, setShopMessagesOpen] = useState(false)
  const [unreadShopMessagesCount, setUnreadShopMessagesCount] = useState(0)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Poll or check unread shop messages when user has a connected shop
  useEffect(() => {
    if (status === "authenticated" && user?.shop) {
      import("@/app/actions/shop-messages").then(({ getUnreadShopMessagesCountAction }) => {
        getUnreadShopMessagesCountAction()
          .then((count) => setUnreadShopMessagesCount(count || 0))
          .catch(() => {})
      })
    }
  }, [status, user?.shop?.id])

  // Close the account dropdown on outside click / Escape / mobile touch outside.
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("touchstart", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("touchstart", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [menuOpen])

  // Close menu on route change.
  useEffect(() => {
    setMenuOpen(false)
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

      <header className="app-header">
        <PromoBanner />
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-emerald-700">
            <Image
              src="/logo-icon.jpg"
              alt="جالیز"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl shadow-sm object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">
              {t("app_title")}
            </span>
          </Link>
          {user?.shop?.name && (
            <button
              type="button"
              onClick={() => setShopMessagesOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
              title={language === "fa" ? `پیام‌های فروشگاه ${user.shop.name}` : `Messages from ${user.shop.name}`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>{user.shop.name}</span>
              {unreadShopMessagesCount > 0 ? (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white px-1 animate-pulse">
                  {unreadShopMessagesCount}
                </span>
              ) : (
                <Bell className="h-3 w-3 opacity-60" />
              )}
            </button>
          )}
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {visibleLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href === "/marketplace"
                  ? pathname === "/marketplace" || (pathname.startsWith("/marketplace/") && !pathname.startsWith("/marketplace/chats"))
                  : link.href !== "#" && pathname.startsWith(link.href)
            return (
              <Link
                key={link.key}
                href={link.href}
                prefetch={PREFETCH_DISABLED_HREFS.has(link.href) ? false : undefined}
                className={
                  isActive
                    ? "inline-flex items-center gap-1.5 text-emerald-700 font-semibold transition-colors"
                    : "inline-flex items-center gap-1.5 text-muted hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                }
              >
                <span>{t(link.key)}</span>
                {link.key === "chats" && unreadCount > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Smart Detect CTA */}
        {isAuthenticated && (
          <Link
            href="/plants/diagnose"
            prefetch={false}
            id="smart-detect-desktop"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            <Sparkles className="h-4 w-4" />
            {t("smart_detect")}
          </Link>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label={t("cart_title" as never)}
            title={t("cart_title" as never)}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white px-1 shadow-sm animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth area. Render a stable placeholder while loading to avoid
              hydration mismatches between server and client. */}
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ) : status === "authenticated" && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 shadow-sm flex items-center justify-center flex-shrink-0 hover:bg-emerald-200 transition overflow-hidden"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={t("account")}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-emerald-700" />
                )}
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute end-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                        <Shield className="h-3 w-3" />
                        {t("admin_role_admin")}
                      </span>
                    )}
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/marketplace?action=new"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        if (pathname === "/marketplace") {
                          window.dispatchEvent(new CustomEvent("jaliz:open-create-listing"))
                        }
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors"
                    >
                      <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === "fa" ? "ثبت آگهی" : "Post Listing"}</span>
                    </Link>
                    <Link
                      href="/blog"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      <span>{t("blog")}</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        prefetch={false}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span>{t("admin_panel")}</span>
                      </Link>
                    )}
                    {(user.ownedShop || isAdmin) && (
                      <Link
                        href="/shop"
                        prefetch={false}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <Store className="h-4 w-4 text-emerald-600" />
                        <span>{language === "fa" ? "پنل فروشگاه" : "Shop Panel"}</span>
                      </Link>
                    )}
                    {user.shop && (
                      <button
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false)
                          setShopMessagesOpen(true)
                        }}
                        className="w-full text-start flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Bell className="h-4 w-4 text-emerald-600" />
                          <span>{language === "fa" ? `پیام‌های ${user.shop.name}` : `Messages from ${user.shop.name}`}</span>
                        </span>
                        {unreadShopMessagesCount > 0 && (
                          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1">
                            {unreadShopMessagesCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="my-1 border-t border-border" />
                  <div className="p-1.5">
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setSettingsOpen(true)
                      }}
                      className="w-full text-start flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                    >
                      <SettingsIcon className="h-4 w-4 text-slate-500" />
                      <span>{t("settings")}</span>
                    </button>
                    <Link
                      href="/changelog"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                    >
                      <History className="h-4 w-4 text-slate-500" />
                      <span>{t("changelog")}</span>
                    </Link>
                    <button
                      role="menuitem"
                      onClick={toggleLanguage}
                      className="w-full text-start flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                    >
                      <Globe className="h-4 w-4 text-slate-500" />
                      <span>{language === "en" ? "فارسی" : "English"}</span>
                    </button>
                  </div>
                  <div className="my-1 border-t border-border" />
                  <div className="p-1.5">
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                      }}
                      className="w-full text-start flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      <span>{t("sign_out")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center justify-center h-8 w-8 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                aria-label={language === "en" ? "تغییر زبان به فارسی" : "Switch to English"}
                title={language === "en" ? "فارسی" : "English"}
              >
                <Globe className="h-4 w-4" />
              </button>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-emerald-700 dark:hover:text-emerald-400 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>{t("sign_in")}</span>
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-full shadow-sm transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>{t("sign_up")}</span>
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="h-9 w-9 rounded-full text-slate-600 hover:text-emerald-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 flex items-center justify-center transition"
                  aria-label={t("account")}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <User className="h-5 w-5" />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute end-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 z-50"
                  >
                    <div className="p-1.5">
                      <Link
                        href="/register"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors sm:hidden"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>{t("sign_up")}</span>
                      </Link>
                      <Link
                        href="/blog"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <BookOpen className="h-4 w-4 text-slate-500" />
                        <span>{t("blog")}</span>
                      </Link>
                    </div>
                    <div className="my-1 border-t border-border" />
                    <div className="p-1.5">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false)
                          setSettingsOpen(true)
                        }}
                        className="w-full text-start flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <SettingsIcon className="h-4 w-4 text-slate-500" />
                        <span>{t("settings")}</span>
                      </button>
                      <Link
                        href="/changelog"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <History className="h-4 w-4 text-slate-500" />
                        <span>{t("changelog")}</span>
                      </Link>
                      <button
                        role="menuitem"
                        onClick={toggleLanguage}
                        className="w-full text-start flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <Globe className="h-4 w-4 text-slate-500" />
                        <span>{language === "en" ? "فارسی" : "English"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Shop Messages Modal */}
      <ShopMessagesModal
        isOpen={shopMessagesOpen}
        onClose={() => setShopMessagesOpen(false)}
        onRead={() => setUnreadShopMessagesCount(0)}
      />
    </>
  )
}

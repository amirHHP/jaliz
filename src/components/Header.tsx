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
  Menu,
  PlusCircle,
  Shield,
  ShoppingBag,
  Sparkles,
  Store,
  User,
  UserPlus,
  X,
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

const BOTTOM_NAV_KEYS = new Set<NavLink["key"]>([
  "my_plants",
  "schedule",
  "marketplace",
  "chats",
])

function getMobileLinkIcon(key: NavLink["key"]) {
  switch (key) {
    case "blog":
      return <BookOpen className="h-4 w-4" />
    case "admin_panel":
      return <Shield className="h-4 w-4 text-emerald-600" />
    case "marketplace":
      return <Store className="h-4 w-4" />
    default:
      return null
  }
}


export function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { status, user, isAdmin, logout } = useAuth()
  const { getUnreadCount, revision } = useMarketplaceInbox()
  const { itemCount, setIsCartOpen } = useCart()
  const pathname = usePathname() ?? "/"

  const unreadCount = user ? getUnreadCount(user.id) : 0

  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shopMessagesOpen, setShopMessagesOpen] = useState(false)
  const [unreadShopMessagesCount, setUnreadShopMessagesCount] = useState(0)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const mobileNavRef = useRef<HTMLDivElement | null>(null)
  const hamburgerBtnRef = useRef<HTMLButtonElement | null>(null)

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

  // Close the account dropdown and mobile menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen && !mobileMenuOpen) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
      if (
        mobileMenuOpen &&
        mobileNavRef.current &&
        !mobileNavRef.current.contains(target) &&
        hamburgerBtnRef.current &&
        !hamburgerBtnRef.current.contains(target)
      ) {
        setMobileMenuOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [menuOpen, mobileMenuOpen])

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

  // On mobile when authenticated, items already in BottomNav do not need to be duplicated in the top menu
  const mobileNavLinks = visibleLinks.filter((l) => {
    if (isAuthenticated && BOTTOM_NAV_KEYS.has(l.key)) {
      return false
    }
    return true
  })

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

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
                onClick={() => {
                  setMobileMenuOpen(false)
                  setMenuOpen((v) => !v)
                }}
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
                  className="absolute end-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl py-2 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                        <Shield className="h-3 w-3" />
                        {t("admin_role_admin")}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/marketplace?action=new"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      if (pathname === "/marketplace") {
                        window.dispatchEvent(new CustomEvent("jaliz:open-create-listing"))
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === "fa" ? "ثبت آگهی" : "Post Listing"}</span>
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    role="menuitem"
                    onClick={toggleLanguage}
                    className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
                    className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <SettingsIcon className="h-4 w-4 text-slate-500" />
                    {t("settings")}
                  </button>
                  <Link
                    href="/changelog"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <History className="h-4 w-4 text-slate-500" />
                    {t("changelog")}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      prefetch={false}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Shield className="h-4 w-4 text-emerald-600" />
                      {t("admin_panel")}
                    </Link>
                  )}
                  {(user.ownedShop || isAdmin) && (
                    <Link
                      href="/shop"
                      prefetch={false}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Store className="h-4 w-4 text-emerald-600" />
                      {language === "fa" ? "پنل فروشگاه" : "Shop Panel"}
                    </Link>
                  )}
                  {user.shop && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setShopMessagesOpen(true)
                      }}
                      className="w-full text-start flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <span className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-600" />
                        {language === "fa" ? `پیام‌های ${user.shop.name}` : `Messages from ${user.shop.name}`}
                      </span>
                      {unreadShopMessagesCount > 0 && (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1">
                          {unreadShopMessagesCount}
                        </span>
                      )}
                    </button>
                  )}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
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
            ref={hamburgerBtnRef}
            onClick={() => {
              setMenuOpen(false)
              setMobileMenuOpen((v) => !v)
            }}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        ref={mobileNavRef}
        className={`md:hidden border-t border-border bg-card/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? `${
                isAuthenticated
                  ? "max-h-[calc(100dvh-8.5rem)]"
                  : "max-h-[calc(100dvh-5rem)]"
              } opacity-100 overflow-y-auto overscroll-contain shadow-lg`
            : "max-h-0 opacity-0 overflow-hidden pointer-events-none border-t-0"
        }`}
      >
        <nav className="px-4 py-3 pb-6 space-y-1">
          {/* User profile card in mobile menu */}
          {status === "authenticated" && user && (
            <div className="space-y-2 mb-2">
              <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded shrink-0">
                    <Shield className="h-3 w-3" />
                    {t("admin_role_admin")}
                  </span>
                )}
              </div>

              {/* Post listing button in mobile user menu */}
              <Link
                href="/marketplace?action=new"
                onClick={() => {
                  setMobileMenuOpen(false)
                  if (pathname === "/marketplace") {
                    window.dispatchEvent(new CustomEvent("jaliz:open-create-listing"))
                  }
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
              >
                <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === "fa" ? "ثبت آگهی" : "Post Listing"}</span>
              </Link>
            </div>
          )}

          {/* Mobile navigation links (excluding items that already exist in bottom nav) */}
          {mobileNavLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href === "/marketplace"
                  ? pathname === "/marketplace" ||
                    (pathname.startsWith("/marketplace/") && !pathname.startsWith("/marketplace/chats"))
                  : link.href !== "#" && pathname.startsWith(link.href)
            return (
              <Link
                key={link.key}
                href={link.href}
                prefetch={PREFETCH_DISABLED_HREFS.has(link.href) ? false : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400"
                }`}
              >
                <span className="flex items-center gap-3">
                  {getMobileLinkIcon(link.key)}
                  <span>{t(link.key)}</span>
                </span>
                {link.key === "chats" && unreadCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Shop management links */}
          {status === "authenticated" && user && (user.ownedShop || isAdmin) && (
            <Link
              href="/shop"
              prefetch={false}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/shop")
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>{language === "fa" ? "پنل فروشگاه" : "Shop Panel"}</span>
            </Link>
          )}

          {status === "authenticated" && user?.shop && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                setShopMessagesOpen(true)
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-emerald-600" />
                <span>
                  {language === "fa"
                    ? `پیام‌های ${user.shop.name}`
                    : `Messages from ${user.shop.name}`}
                </span>
              </span>
              {unreadShopMessagesCount > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1">
                  {unreadShopMessagesCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile auth actions (for guests) */}
          {status !== "loading" && status !== "authenticated" && (
            <div className="border-t border-border pt-2 mt-2 space-y-1">
              <Link
                href="/marketplace?action=new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{language === "fa" ? "ثبت آگهی" : "Post Listing"}</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>{t("sign_in")}</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>{t("sign_up")}</span>
              </Link>
            </div>
          )}

          {/* Mobile utilities (settings, changelog, language) */}
          <div className="border-t border-border pt-2 mt-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                setSettingsOpen(true)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <SettingsIcon className="h-4 w-4" />
              <span>{t("settings")}</span>
            </button>
            <Link
              href="/changelog"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/changelog"
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`}
            >
              <History className="h-4 w-4" />
              <span>{t("changelog")}</span>
            </Link>
            <button
              type="button"
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              <span>{language === "en" ? "فارسی" : "English"}</span>
            </button>
          </div>

          {/* Mobile logout */}
          {status === "authenticated" && user && (
            <div className="border-t border-border pt-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("sign_out")}</span>
              </button>
            </div>
          )}
        </nav>
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

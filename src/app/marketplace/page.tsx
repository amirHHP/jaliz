"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { track } from "@vercel/analytics"
import {
  ArrowLeftRight,
  Apple,
  MessageSquare,
  Plus,
  Scissors,
  Search,
  ShoppingBag,
  Sprout,
  UserCircle2,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { useMarketplace } from "@/components/MarketplaceProvider"
import { ListingCard } from "@/components/marketplace/ListingCard"
import { ListingDetailsModal } from "@/components/marketplace/ListingDetailsModal"
import { ListingFormModal } from "@/components/marketplace/ListingFormModal"
import { Listing, ListingType } from "@/lib/marketplace"
import { MarketplacePromoCard } from "@/components/marketplace/MarketplacePromoCard"

type Tab = "all" | ListingType | "mine"

const TAB_DEFS: { id: Tab; key: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", key: "mp_tab_all", icon: ArrowLeftRight },
  { id: "seed", key: "mp_tab_seed", icon: Sprout },
  { id: "cutting", key: "mp_tab_cutting", icon: Scissors },
  { id: "tool", key: "mp_tab_tool", icon: Wrench },
  { id: "produce", key: "mp_tab_produce", icon: Apple },
]

function MarketplaceOpenFromQuery({
  setSelectedId,
}: {
  setSelectedId: (id: string) => void
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { get, ready } = useMarketplace()

  useEffect(() => {
    const raw = searchParams.get("open")
    if (!raw || !ready) return
    const openId = decodeURIComponent(raw)
    if (get(openId)) setSelectedId(openId)
    const sp = new URLSearchParams(searchParams.toString())
    sp.delete("open")
    const q = sp.toString()
    router.replace(`${pathname}${q ? `?${q}` : ""}`, { scroll: false })
  }, [searchParams, ready, get, router, pathname, setSelectedId])

  return null
}

export default function MarketplacePage() {
  const { t, language } = useLanguage()
  const { user, status, getUser } = useAuth()
  const { ready, revision, list, get } = useMarketplace()

  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [search, setSearch] = useState("")
  // We track the *id* of the focused listing instead of a snapshot. The
  // actual listing is re-derived from the store on every render, which keeps
  // the details modal in sync with mutations (mark-as-done, edits, etc.).
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Recompute the visible listings whenever the filters change *or* the
  // marketplace store mutates.
  const listings = useMemo<Listing[]>(() => {
    if (activeTab === "mine") {
      if (!user) return []
      return list({ ownerId: user.id, query: search })
    }
    if (activeTab === "all") {
      return list({ query: search })
    }
    return list({ type: activeTab, query: search })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, search, list, user?.id, revision])

  // Derive the live versions of selected / editing listings.
  const selected = useMemo<Listing | null>(
    () => (selectedId ? (get(selectedId) ?? null) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedId, get, revision],
  )
  const editing = useMemo<Listing | null>(
    () => (editingId ? (get(editingId) ?? null) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingId, get, revision],
  )

  const handlePostClick = () => {
    track("Marketplace Clicked Post Button")
    if (status !== "authenticated") {
      // Push them to login with a return URL so they bounce back.
      window.location.href = "/login?redirect=/marketplace"
      return
    }
    setEditingId(null)
    setShowCreate(true)
  }

  const tabsToRender: { id: Tab; key: string; icon: React.ComponentType<{ className?: string }> }[] = [
    ...TAB_DEFS,
  ]
  if (user) {
    tabsToRender.push({ id: "mine", key: "mp_tab_mine", icon: UserCircle2 })
  }

  return (
    <div className="page-shell">
      <Suspense fallback={null}>
        <MarketplaceOpenFromQuery setSelectedId={setSelectedId} />
      </Suspense>
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t("mp_title" as never)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {t("mp_title" as never)}
            </h1>
            <p className="text-muted mt-1 max-w-xl">
              {t("mp_subtitle" as never)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Link
                href="/marketplace/chats"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-700 text-foreground px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                {language === "fa" ? "گفتگوها" : "Chats"}
              </Link>
            )}
            <Button
              onClick={handlePostClick}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {t("mp_post_btn" as never)}
            </Button>
          </div>
        </div>

        {/* Contextual first-purchase promo card */}
        <div className="mb-6">
          <MarketplacePromoCard />
        </div>

        {/* Tabs + search */}
        <div className="surface-card p-3 mb-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tabsToRender.map(({ id, key, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(key as never)}
                </button>
              )
            })}
          </div>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("mp_search_ph" as never)}
              className="surface-input w-full h-10 ps-9 pe-3 text-sm"
            />
          </div>
        </div>

        {/* Grid */}
        {!ready ? (
          <MarketplaceGridSkeleton />
        ) : listings.length === 0 ? (
          <EmptyState
            isFiltered={activeTab !== "all" || !!search.trim()}
            onPostClick={handlePostClick}
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                ownerName={listing.ownerId === user?.id ? (user?.fullName || undefined) : getUser(listing.ownerId)?.fullName}
                onClick={() => {
                  setSelectedId(listing.id)
                  track("Marketplace Clicked Listing Card", { id: listing.id, type: listing.type })
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals. We mount conditionally and use stable `key`s so React
          remounts (and our lazy state initializers re-run) for each
          fresh listing or "new listing" session. */}
      {selected && (
        <ListingDetailsModal
          key={selected.id}
          listing={selected}
          onClose={() => setSelectedId(null)}
          onEdit={(l) => {
            setSelectedId(null)
            setEditingId(l.id)
            setShowCreate(true)
          }}
        />
      )}

      {showCreate && (
        <ListingFormModal
          key={editingId ?? "new"}
          editingListing={editing}
          onClose={() => {
            setShowCreate(false)
            setEditingId(null)
          }}
          onSaved={(saved) => {
            // Reopen the details modal on the freshly saved listing so the
            // user sees their changes applied.
            setSelectedId(saved.id)
          }}
        />
      )}
    </div>
  )
}

function MarketplaceGridSkeleton() {
  const { language } = useLanguage()
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted text-center">
        {language === "fa" ? "در حال بارگذاری بازارچه..." : "Loading marketplace..."}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="aspect-[4/5] animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({
  isFiltered,
  onPostClick,
}: {
  isFiltered: boolean
  onPostClick: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className="surface-card border-dashed py-16 px-6 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <Sprout className="h-6 w-6 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {isFiltered
          ? t("mp_no_results" as never)
          : t("mp_empty_title" as never)}
      </h3>
      {!isFiltered && (
        <p className="text-muted mt-1 max-w-sm mx-auto text-sm">
          {t("mp_empty_desc" as never)}
        </p>
      )}
      <div className="mt-5">
        <Button
          onClick={onPostClick}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4" />
          {t("mp_post_btn" as never)}
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted">
        <Link href="/" prefetch={false} className="underline-offset-2 hover:underline">
          {t("go_home" as never)}
        </Link>
      </p>
    </div>
  )
}

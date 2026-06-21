"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Plus, Sprout } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { useMarketplace } from "@/components/MarketplaceProvider"
import { ListingCard } from "@/components/marketplace/ListingCard"
import { ListingDetailsModal } from "@/components/marketplace/ListingDetailsModal"
import { ListingFormModal } from "@/components/marketplace/ListingFormModal"
import { Listing } from "@/lib/marketplace"

const DASHBOARD_PREVIEW_LIMIT = 4

/**
 * Compact marketplace preview shown on the dashboard. Surfaces the few most
 * recent active listings and links out to the full /marketplace page for the
 * complete browsing experience.
 */
interface MarketplaceGridProps {
  hideHeader?: boolean
}

export function MarketplaceGrid({ hideHeader = false }: MarketplaceGridProps) {
  const { language, t } = useLanguage()
  const { status, getUser } = useAuth()
  const { revision, list, get } = useMarketplace()

  // Track ids and re-derive snapshots so the modal stays in sync with the
  // store after mutations (mark-as-done, edits, etc.).
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const previewListings = useMemo<Listing[]>(() => {
    return list({ status: "active" }).slice(0, DASHBOARD_PREVIEW_LIMIT)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, revision])

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

  const handlePost = () => {
    if (status !== "authenticated") {
      window.location.href = "/login?redirect=/marketplace"
      return
    }
    setEditingId(null)
    setShowCreate(true)
  }

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t("market_title")}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full font-medium">
              {t("market_within")}
            </span>
            <Link
              href="/marketplace"
              className="text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
            >
              {t("mp_view_all" as never)}
              <ArrowRight
                className={`h-3.5 w-3.5 ${language === "fa" ? "rotate-180" : ""}`}
              />
            </Link>
          </div>
        </div>
      )}

      {previewListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-10 px-6 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-3">
            <Sprout className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {t("mp_dashboard_empty_title" as never)}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("mp_dashboard_empty_desc" as never)}
          </p>
          <Button
            onClick={handlePost}
            className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            {t("mp_post_btn" as never)}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {previewListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              ownerName={getUser(listing.ownerId)?.fullName}
              onClick={() => setSelectedId(listing.id)}
            />
          ))}
        </div>
      )}

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
          onSaved={(saved) => setSelectedId(saved.id)}
        />
      )}
    </div>
  )
}

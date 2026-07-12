"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ImageIcon, ShoppingBag } from "lucide-react"

import { useLanguage } from "@/components/LanguageProvider"
import { useMarketplace } from "@/components/MarketplaceProvider"
import { matchListingsToAdvice } from "@/lib/marketplace/advice-listing-match"
import { formatToman, MODE_TRANSLATION_KEY } from "@/components/marketplace/listing-helpers"

export interface AdviceMarketplaceStripProps {
  adviceText?: string | null
  contextText?: string | null
}

/**
 * Horizontal strip of marketplace listings inferred from AI / user text.
 * Hidden when no active listings match product-related keywords.
 */
export function AdviceMarketplaceStrip({
  adviceText,
  contextText,
}: AdviceMarketplaceStripProps) {
  const { language, t } = useLanguage()
  // Don't force the heavy listings fetch — only show if already loaded elsewhere.
  const { ready, list, revision } = useMarketplace({ loadListings: false })

  const recommendations = useMemo(() => {
    if (!ready) return []
    const all = list({ status: "active" })
    return matchListingsToAdvice(adviceText, contextText, all, { limit: 6 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adviceText, contextText, list, revision, ready])

  if (recommendations.length === 0) return null

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-[11px] uppercase mb-2">
        <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
        {t("mp_advice_recs_title")}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-0.5 px-0.5 snap-x snap-mandatory">
        {recommendations.map((listing) => {
          const priceLine =
            listing.mode === "sell" && typeof listing.price === "number"
              ? `${formatToman(listing.price, language)} ${language === "fa" ? "تومان" : "Toman"}`
              : listing.mode === "exchange"
                ? listing.exchangeFor
                  ? `↔ ${listing.exchangeFor}`
                  : t(MODE_TRANSLATION_KEY[listing.mode] as never)
                : t(MODE_TRANSLATION_KEY[listing.mode] as never)

          return (
            <div
              key={listing.id}
              className="snap-start shrink-0 w-[140px] rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
            >
              <div className="relative h-20 bg-slate-100">
                {listing.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon className="h-6 w-6 opacity-50" />
                  </div>
                )}
              </div>
              <div className="p-2 flex flex-col gap-1 grow min-h-0">
                <p className="text-[11px] font-semibold text-slate-800 line-clamp-2 leading-snug" dir="auto">
                  {listing.title}
                </p>
                <p className="text-[10px] text-slate-600 truncate" title={priceLine}>
                  {priceLine}
                </p>
                <Link
                  href={`/marketplace?open=${encodeURIComponent(listing.id)}`}
                  className="mt-auto text-center text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 py-1 rounded bg-emerald-50/80 border border-emerald-100"
                >
                  {t("mp_advice_recs_view")}
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

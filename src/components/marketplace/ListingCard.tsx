"use client"

import { CheckCircle2, ImageIcon, MapPin } from "lucide-react"

import { Listing } from "@/lib/marketplace"
import { useLanguage } from "@/components/LanguageProvider"

import {
  MODE_BADGE_CLASS,
  MODE_ICON,
  MODE_TRANSLATION_KEY,
  TYPE_ICON,
  TYPE_TRANSLATION_KEY,
  formatToman,
} from "./listing-helpers"

interface ListingCardProps {
  listing: Listing
  ownerName?: string
  onClick?: () => void
}

/** Compact card used both on the dashboard and on the marketplace page. */
export function ListingCard({ listing, ownerName, onClick }: ListingCardProps) {
  // The translation key cast keeps the existing `t` signature happy. All
  // referenced keys are defined in LanguageProvider.tsx for both locales.
  const { t, language } = useLanguage()
  const TypeIcon = TYPE_ICON[listing.type]
  const ModeIcon = MODE_ICON[listing.mode]
  const isCompleted = listing.status === "completed"

  const priceLine =
    listing.mode === "sell" && typeof listing.price === "number"
      ? `${formatToman(listing.price, language)} ${language === "fa" ? "تومان" : "Toman"}`
      : listing.mode === "exchange"
        ? listing.exchangeFor
          ? `↔ ${listing.exchangeFor}`
          : t("mp_mode_exchange" as never)
        : t("mp_mode_free" as never)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-start relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col ${
        isCompleted ? "opacity-75" : ""
      }`}
    >
      <div className="relative w-full aspect-[4/5] bg-slate-100 dark:bg-slate-850 overflow-hidden">
        {listing.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
            <ImageIcon className="h-10 w-10 mb-1 opacity-50" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              No photo
            </span>
          </div>
        )}

        <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/95 dark:bg-slate-950/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md shadow-sm border border-slate-200/10">
            <TypeIcon className="h-3 w-3" />
            {t(TYPE_TRANSLATION_KEY[listing.type] as never)}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${MODE_BADGE_CLASS[listing.mode]} dark:bg-opacity-20`}
          >
            <ModeIcon className="h-3 w-3" />
            {t(MODE_TRANSLATION_KEY[listing.mode] as never)}
          </span>
        </div>

        {isCompleted && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("mp_completed_badge" as never)}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 grow flex flex-col">
        <h3 className="font-semibold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white line-clamp-1">
          {listing.title}
        </h3>
        <p className="mt-1 text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {listing.description}
        </p>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 truncate">
            {listing.location && (
              <>
                <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{listing.location}</span>
              </>
            )}
          </div>
          <span
            className={`font-semibold ${
              listing.mode === "sell" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
            } shrink-0 sm:ms-2`}
          >
            {priceLine}
          </span>
        </div>

        {ownerName && (
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            {t("by" as never)} {ownerName}
          </p>
        )}
      </div>
    </button>
  )
}

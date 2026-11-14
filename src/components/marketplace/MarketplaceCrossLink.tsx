"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Store, ArrowLeft, Sparkles, PlusCircle, ImageIcon } from "lucide-react"
import { useMarketplace } from "@/components/MarketplaceProvider"
import { resolveMarketplaceTopic, normalizePersianText } from "@/lib/marketplace/topic-matcher"
import { formatToman } from "@/components/marketplace/listing-helpers"
import { Button } from "@/components/ui/button"

export interface MarketplaceCrossLinkProps {
  topicQuery?: string
  speciesName?: string
  className?: string
}

export function MarketplaceCrossLink({
  topicQuery,
  speciesName,
  className = "",
}: MarketplaceCrossLinkProps) {
  const { ready, list } = useMarketplace({ loadListings: true })

  const topicMatch = useMemo(() => {
    return resolveMarketplaceTopic({
      title: speciesName,
      keywords: topicQuery ? [topicQuery] : undefined,
      content: topicQuery,
    })
  }, [topicQuery, speciesName])

  const targetTopicName =
    topicMatch.speciesMatch ||
    topicMatch.careTopicMatch ||
    speciesName ||
    topicMatch.query

  const matchingListings = useMemo(() => {
    if (!ready) return []
    const all = list({ status: "active" })
    const terms = [
      topicMatch.query,
      speciesName,
      topicQuery,
      topicMatch.speciesMatch,
      topicMatch.careTopicMatch,
    ]
      .filter((t): t is string => Boolean(t))
      .map((t) => normalizePersianText(t))

    if (terms.length === 0) return []

    return all
      .filter((item) => {
        const text = normalizePersianText(`${item.title} ${item.description}`)
        return terms.some((term) => term.length >= 2 && text.includes(term))
      })
      .slice(0, 4)
  }, [ready, list, topicMatch, speciesName, topicQuery])

  const bannerTitle =
    topicMatch.titleFa ||
    `خرید، فروش و تبادل قلمه و گیاه ${targetTopicName} در بازارچه جالیز`

  const bannerDescription =
    topicMatch.descriptionFa ||
    `انواع قلمه ریشه‌دار، گیاه بالغ و ملزومات نگهداری ${targetTopicName} با قیمت مناسب و بدون واسطه از دوستداران گل و گیاه در سراسر کشور.`

  return (
    <section
      aria-label="بازارچه گل و گیاه جالیز"
      dir="rtl"
      className={`rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-slate-50 p-6 sm:p-8 shadow-sm overflow-hidden relative ${className}`}
    >
      {/* Decorative gradient blur */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-teal-200/30 blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Tier 1: Matching live listings (if any exist) */}
        {matchingListings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Store className="h-4 w-4 text-emerald-600" />
                <span>آگهی‌های فعال {targetTopicName} در بازارچه</span>
              </div>
              <Link
                href={`/marketplace?query=${encodeURIComponent(topicMatch.query)}`}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>مشاهده همه</span>
                <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {matchingListings.map((listing) => {
                const priceLabel =
                  listing.mode === "sell" && typeof listing.price === "number"
                    ? `${formatToman(listing.price, "fa")} تومان`
                    : listing.mode === "exchange"
                    ? listing.exchangeFor
                      ? `تبادل با ${listing.exchangeFor}`
                      : "تبادل گیاه"
                    : "رایگان"

                return (
                  <Link
                    key={listing.id}
                    href={`/marketplace?open=${encodeURIComponent(listing.id)}`}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col"
                  >
                    <div className="relative h-28 w-full rounded-xl bg-slate-100 overflow-hidden mb-2">
                      {listing.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <ImageIcon className="h-7 w-7 opacity-60" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {listing.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-emerald-600 mt-1 truncate">
                      {priceLabel}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Tier 2: High-converting commercial banner (ALWAYS displayed) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
          <div className="space-y-2 grow">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>بازارچه گیاهی جالیز</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {bannerTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {bannerDescription}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
            <Button
              asChild
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 grow sm:grow-0"
            >
              <Link
                href={`/marketplace?query=${encodeURIComponent(topicMatch.query)}`}
                className="flex items-center justify-center gap-1.5"
              >
                <Store className="h-4 w-4" />
                <span>مشاهده آگهی‌های {targetTopicName}</span>
                <ArrowLeft className="h-3.5 w-3.5 mr-0.5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-2xl border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm grow sm:grow-0"
            >
              <Link
                href="/marketplace?action=new"
                className="flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                <span>ثبت رایگان آگهی در بازارچه</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

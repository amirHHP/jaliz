"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  LogIn,
  MapPin,
  MessageCircle,
  PhoneCall,
  Share2,
  ShoppingBag,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { Listing } from "@/lib/marketplace"
import {
  MODE_BADGE_CLASS,
  MODE_ICON,
  MODE_TRANSLATION_KEY,
  TYPE_ICON,
  TYPE_TRANSLATION_KEY,
  formatToman,
  telLink,
  whatsappLink,
} from "@/components/marketplace/listing-helpers"

interface ListingPageClientProps {
  listing: Listing
  ownerName: string
  ownerPhone?: string
}

export function ListingPageClient({
  listing,
  ownerName,
  ownerPhone,
}: ListingPageClientProps) {
  const { t, language } = useLanguage()
  const { status, user } = useAuth()
  const router = useRouter()

  const isAuthenticated = status === "authenticated" && !!user
  const isOwner = user?.id === listing.ownerId
  const TypeIcon = TYPE_ICON[listing.type]
  const ModeIcon = MODE_ICON[listing.mode]
  const phone = listing.contactPhone || ownerPhone

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url })
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const priceLine =
    listing.mode === "sell" && typeof listing.price === "number"
      ? `${formatToman(listing.price, language)} ${language === "fa" ? "تومان" : "Toman"}`
      : listing.mode === "exchange"
        ? listing.exchangeFor
          ? `↔ ${listing.exchangeFor}`
          : t("mp_mode_exchange" as never)
        : t("mp_mode_free" as never)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className={`h-3.5 w-3.5 ${language === "fa" ? "rotate-180" : ""}`} />
            <ShoppingBag className="h-3.5 w-3.5" />
            {t("mp_title" as never)}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium truncate">{listing.title}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Hero image */}
          <div className="relative w-full h-72 sm:h-96 md:h-[420px] bg-slate-100">
            {listing.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <ImageIcon className="h-16 w-16 mb-2 opacity-40" />
                <span className="text-xs uppercase tracking-wider font-semibold">
                  {language === "fa" ? "بدون عکس" : "No photo"}
                </span>
              </div>
            )}

            {listing.status === "completed" && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-md">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("mp_completed_badge" as never)}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Badges + price */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  <TypeIcon className="h-3.5 w-3.5" />
                  {t(TYPE_TRANSLATION_KEY[listing.type] as never)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${MODE_BADGE_CLASS[listing.mode]}`}
                >
                  <ModeIcon className="h-3.5 w-3.5" />
                  {t(MODE_TRANSLATION_KEY[listing.mode] as never)}
                </span>

                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="ms-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {language === "fa" ? "اشتراک‌گذاری" : "Share"}
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {listing.title}
              </h1>

              {/* Price line */}
              <p
                className={`text-lg font-bold ${
                  listing.mode === "sell"
                    ? "text-emerald-700"
                    : "text-slate-700"
                }`}
              >
                {priceLine}
              </p>
            </div>

            {/* Description */}
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">
                {listing.description}
              </p>
            </div>

            {listing.mode === "exchange" && listing.exchangeFor && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                ↔ {listing.exchangeFor}
              </p>
            )}

            {listing.location && (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-slate-400" />
                {listing.location}
              </p>
            )}

            {/* Owner row */}
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="h-5 w-5 text-emerald-800" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-emerald-600/70 font-medium">
                    {t("mp_details_owner" as never)}
                  </p>
                  <p className="text-sm font-bold text-emerald-950 truncate">
                    {ownerName}
                  </p>
                </div>
              </div>
              <div className="text-end text-xs text-emerald-700/60">
                <p className="font-medium">{t("mp_details_posted_at" as never)}</p>
                <p className="font-bold text-emerald-800">
                  {new Date(listing.createdAt).toLocaleDateString(
                    language === "fa" ? "fa-IR" : undefined,
                    { year: "numeric", month: "short", day: "numeric" },
                  )}
                </p>
              </div>
            </div>

            {/* Actions — different for authenticated vs unauthenticated */}
            {isAuthenticated && !isOwner ? (
              <div className="flex flex-wrap gap-3">
                {phone ? (
                  <>
                    <a
                      href={telLink(phone)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-semibold shadow-sm transition-colors"
                    >
                      <PhoneCall className="h-4 w-4" />
                      {t("mp_action_call" as never)}
                    </a>
                    <a
                      href={whatsappLink(phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-5 py-3 text-sm font-semibold shadow-sm transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      {t("mp_action_whatsapp" as never)}
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">
                    {t("mp_details_no_phone" as never)}
                  </span>
                )}
              </div>
            ) : isOwner ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 font-medium">
                {language === "fa"
                  ? "این آگهی شماست. برای ویرایش به صفحه فروشگاه بروید."
                  : "This is your listing. Visit the marketplace to edit it."}
              </div>
            ) : (
              /* Unauthenticated CTA */
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-slate-700">
                    {t("mp_action_sign_in_to_contact" as never)}
                  </p>
                </div>
                <Link
                  href={`/login?redirect=/marketplace/${listing.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 shadow-sm transition-colors hover:scale-[1.02]"
                >
                  <LogIn className="h-4 w-4" />
                  {t("sign_in" as never)}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

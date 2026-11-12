"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
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
import { useCart } from "@/components/marketplace/CartProvider"
import { Listing } from "@/lib/marketplace"
import { BuyListingModal } from "@/components/marketplace/BuyListingModal"
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
  const searchParams = useSearchParams()

  const [showBuyModal, setShowBuyModal] = useState(false)
  const { addItem } = useCart()
  const [justAddedToCart, setJustAddedToCart] = useState(false)

  const paymentStatus = searchParams.get("payment")
  const refId = searchParams.get("refId")
  const failReason = searchParams.get("reason")

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className={`h-3.5 w-3.5 ${language === "fa" ? "rotate-180" : ""}`} />
            <ShoppingBag className="h-3.5 w-3.5" />
            {t("mp_title" as never)}
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{listing.title}</span>
        </nav>

        {/* Payment Status Notifications */}
        {paymentStatus === "success" && (
          <div className="mb-6 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                  {t("mp_payment_success_title" as never)}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                  {t("mp_payment_success_desc" as never)}
                </p>
                {refId && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 py-1.5 px-3.5 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <span>{t("mp_payment_tracking_code" as never)}:</span>
                    <span className="font-mono tracking-wider text-emerald-700 dark:text-emerald-400">{refId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-center gap-3 text-amber-800 dark:text-amber-300 animate-in fade-in">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <span className="text-xs sm:text-sm font-medium">{t("mp_payment_cancelled" as never)}</span>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 flex items-center gap-3 text-red-800 dark:text-red-300 animate-in fade-in">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <div className="text-xs sm:text-sm font-medium">
              <span>{t("mp_payment_failed" as never)}</span>
              {failReason && <span className="block mt-0.5 opacity-90 font-normal">({decodeURIComponent(failReason)})</span>}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Hero image */}
          <div className="relative w-full h-80 sm:h-[420px] md:h-[480px] bg-slate-950 overflow-hidden flex items-center justify-center">
            {listing.image ? (
              <>
                {/* Blurred background image */}
                <img
                  src={listing.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                />
                {/* Main crisp image, fully contained */}
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="relative max-w-full max-h-full object-contain z-10"
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100 dark:bg-slate-800">
                <ImageIcon className="h-16 w-16 mb-2 opacity-40" />
                <span className="text-xs uppercase tracking-wider font-semibold">
                  {language === "fa" ? "بدون عکس" : "No photo"}
                </span>
              </div>
            )}

            {listing.status === "completed" && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-20">
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
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">
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
                  className="ms-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {language === "fa" ? "اشتراک‌گذاری" : "Share"}
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {listing.title}
              </h1>

              {/* Price line */}
              <p
                className={`text-lg font-bold ${
                  listing.mode === "sell"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {priceLine}
              </p>
            </div>

            {/* Description */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base">
                {listing.description}
              </p>
            </div>

            {listing.mode === "exchange" && listing.exchangeFor && (
              <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-4 py-3">
                ↔ {listing.exchangeFor}
              </p>
            )}

            {listing.location && (
              <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-slate-400" />
                {listing.location}
              </p>
            )}

            {/* Actions — different for authenticated vs unauthenticated */}
            {isAuthenticated && !isOwner ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {listing.mode === "sell" && listing.status === "active" && typeof listing.price === "number" && listing.price > 0 && (
                    <Button
                      type="button"
                      onClick={() => {
                        const res = addItem(listing, ownerName || "فروشگاه")
                        if (res.success) {
                          setJustAddedToCart(true)
                          setTimeout(() => setJustAddedToCart(false), 2500)
                        }
                      }}
                      className={`flex-1 font-extrabold h-12 px-6 rounded-2xl text-sm transition-all gap-2 shadow-sm ${
                        justAddedToCart
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {justAddedToCart ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>{t("cart_added_toast" as never)}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-5 w-5" />
                          <span>{t("cart_add_btn" as never)}</span>
                        </>
                      )}
                    </Button>
                  )}

                  {phone && (
                    <>
                      <a
                        href={telLink(phone)}
                        title={t("mp_action_call" as never)}
                        aria-label={t("mp_action_call" as never)}
                        className="h-12 w-12 inline-flex items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 shrink-0"
                      >
                        <PhoneCall className="h-5 w-5" />
                      </a>
                      <a
                        href={whatsappLink(phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t("mp_action_whatsapp" as never)}
                        aria-label={t("mp_action_whatsapp" as never)}
                        className="h-12 w-12 inline-flex items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-sm transition-all hover:scale-105 shrink-0"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            ) : isOwner ? (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                {language === "fa"
                  ? "این آگهی شماست. برای ویرایش به صفحه فروشگاه بروید."
                  : "This is your listing. Visit the marketplace to edit it."}
              </div>
            ) : (
              /* Unauthenticated CTA */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {listing.mode === "sell" && listing.status === "active" && typeof listing.price === "number" && listing.price > 0 && (
                    <Button
                      type="button"
                      onClick={() => {
                        const res = addItem(listing, ownerName || "فروشگاه")
                        if (res.success) {
                          setJustAddedToCart(true)
                          setTimeout(() => setJustAddedToCart(false), 2500)
                        }
                      }}
                      className={`flex-1 font-extrabold h-12 px-6 rounded-2xl text-sm transition-all gap-2 shadow-sm ${
                        justAddedToCart
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {justAddedToCart ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>{t("cart_added_toast" as never)}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-5 w-5" />
                          <span>{t("cart_add_btn" as never)}</span>
                        </>
                      )}
                    </Button>
                  )}

                  {phone && (
                    <>
                      <a
                        href={telLink(phone)}
                        title={t("mp_action_call" as never)}
                        aria-label={t("mp_action_call" as never)}
                        className="h-12 w-12 inline-flex items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 shrink-0"
                      >
                        <PhoneCall className="h-5 w-5" />
                      </a>
                      <a
                        href={whatsappLink(phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t("mp_action_whatsapp" as never)}
                        aria-label={t("mp_action_whatsapp" as never)}
                        className="h-12 w-12 inline-flex items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-sm transition-all hover:scale-105 shrink-0"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    </>
                  )}
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                      <LogIn className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
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
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Buy Online Modal */}
      {showBuyModal && (
        <BuyListingModal
          listing={listing}
          ownerName={ownerName}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  )
}

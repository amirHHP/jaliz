"use client"

import { useState, useEffect } from "react"
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MapPin,
  FileText,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { Listing } from "@/lib/marketplace"
import { createMarketplacePaymentAction } from "@/app/actions/payments"
import { getShippingFeeAction } from "@/app/actions/settings"
import { formatToman } from "./listing-helpers"

interface BuyListingModalProps {
  listing: Listing
  ownerName: string
  onClose: () => void
}

export function BuyListingModal({
  listing,
  ownerName,
  onClose,
}: BuyListingModalProps) {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const isRtl = language === "fa"

  const [buyerPhone, setBuyerPhone] = useState(user?.phone || "")
  const [buyerAddress, setBuyerAddress] = useState("")
  const [buyerNotes, setBuyerNotes] = useState("")
  const [shippingFee, setShippingFee] = useState(150000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getShippingFeeAction().then((fee) => {
      if (typeof fee === "number" && fee >= 0) {
        setShippingFee(fee)
      }
    })
  }, [])

  const priceToman = listing.price || 0
  const totalToman = priceToman + shippingFee
  const priceRial = totalToman * 10

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await createMarketplacePaymentAction({
        listingId: listing.id,
        buyerPhone: buyerPhone.trim(),
        buyerAddress: buyerAddress.trim(),
        buyerNotes: buyerNotes.trim(),
      })

      if (!result.ok) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Redirect directly to Zarinpal banking portal
      window.location.href = result.paymentUrl
    } catch (err: any) {
      console.error("Payment initiation failed:", err)
      setError(
        language === "fa"
          ? "خطا در برقراری ارتباط با درگاه پرداخت. لطفاً دوباره تلاش کنید."
          : "Could not connect to payment gateway. Please try again.",
      )
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative my-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white p-6 sm:p-7 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 end-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label={t("cancel" as never)}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              <CreditCard className="h-5 w-5 text-emerald-100" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              {language === "fa" ? "درگاه پرداخت امن" : "Secure Checkout"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t("mp_buy_modal_title" as never)}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
            {t("mp_buy_modal_subtitle" as never)}
          </p>
        </div>

        {/* Form & details */}
        <form onSubmit={handlePay} className="p-6 sm:p-7 space-y-5">
          {/* Item summary card */}
          <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            {listing.image ? (
              <img
                src={listing.image}
                alt={listing.title}
                className="h-16 w-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300">
                <ShoppingBag className="h-7 w-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {listing.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t("by" as never)} <span className="font-semibold text-slate-700 dark:text-slate-300">{ownerName}</span>
              </p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatToman(priceToman, language)} {language === "fa" ? "تومان" : "Toman"}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 flex items-start gap-3 text-red-800 dark:text-red-300 animate-in fade-in">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div className="text-xs leading-relaxed font-medium">
                {error}
              </div>
            </div>
          )}

          {/* Buyer info fields */}
          <div className="space-y-4">
            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("mp_buyer_phone_label" as never)}</span>
              </label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder={t("mp_buyer_phone_ph" as never)}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                dir="ltr"
              />
            </div>

            {/* Shipping Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("mp_buyer_address_label" as never)}</span>
              </label>
              <textarea
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                rows={2}
                placeholder={t("mp_buyer_address_ph" as never)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            {/* Buyer Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("mp_buyer_notes_label" as never)}</span>
              </label>
              <input
                type="text"
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder={t("mp_buyer_notes_ph" as never)}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Pricing Invoice Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>{t("mp_checkout_price" as never)}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatToman(priceToman, language)} {language === "fa" ? "تومان" : "Toman"}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("cart_shipping_fee" as never)}</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatToman(shippingFee, language)} {language === "fa" ? "تومان" : "Toman"}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>{t("mp_checkout_fee" as never)}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {t("mp_checkout_free_fee" as never)}
              </span>
            </div>
            <hr className="border-slate-200 dark:border-slate-700/60 my-1" />
            <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white pt-1">
              <span>{t("mp_checkout_total" as never)}</span>
              <div className="text-end">
                <span className="text-emerald-700 dark:text-emerald-400 text-base font-black">
                  {formatToman(totalToman, language)} {language === "fa" ? "تومان" : "Toman"}
                </span>
                <span className="block text-[10px] font-normal text-slate-400">
                  ({priceRial.toLocaleString("fa-IR")} ریال)
                </span>
              </div>
            </div>
          </div>

          {/* Trust guarantee banner */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="leading-relaxed">
              {t("mp_checkout_guarantee" as never)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-lg shadow-emerald-600/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("mp_paying_button" as never)}</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>{t("mp_pay_button" as never)}</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onClose}
              className="py-6 rounded-2xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              {t("cancel" as never)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  CreditCard,
  ImageIcon,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  X,
} from "lucide-react"

import { useCart } from "./CartProvider"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { Button } from "@/components/ui/button"
import { getShippingFeeAction } from "@/app/actions/settings"
import { createMarketplaceCartPaymentAction } from "@/app/actions/payments"
import { formatToman } from "./listing-helpers"

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    sellerName,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart()

  const { status, user } = useAuth()
  const { t, language } = useLanguage()

  const [shippingFee, setShippingFee] = useState(150000)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current shipping fee when drawer opens
  useEffect(() => {
    if (isCartOpen) {
      getShippingFeeAction().then((fee) => {
        if (typeof fee === "number" && fee >= 0) {
          setShippingFee(fee)
        }
      })
    }
  }, [isCartOpen])

  // Pre-fill phone from authenticated user if available
  useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone)
    }
  }, [user, phone])

  if (!isCartOpen) return null

  const isAuthenticated = status === "authenticated" && !!user
  const totalPayable = subtotal + (items.length > 0 ? shippingFee : 0)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setError(language === "fa" ? "لطفاً ابتدا وارد حساب کاربری خود شوید." : "Please sign in to proceed with checkout.")
      return
    }

    if (items.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const res = await createMarketplaceCartPaymentAction({
        items: items.map((i) => ({ listingId: i.id, quantity: i.quantity })),
        buyerPhone: phone.trim() || undefined,
        buyerAddress: address.trim() || undefined,
        buyerNotes: notes.trim() || undefined,
      })

      if (res.ok && res.paymentUrl) {
        window.location.href = res.paymentUrl
      } else if (!res.ok) {
        setError(res.error)
        setLoading(false)
      }
    } catch (err: any) {
      console.error("Cart checkout error:", err)
      setError(err?.message || "خطا در برقراری ارتباط با درگاه پرداخت")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={() => !loading && setIsCartOpen(false)} />

      <div
        className={`absolute top-0 bottom-0 ${
          language === "fa" ? "left-0" : "right-0"
        } w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 animate-in slide-in-from-end duration-300`}
        dir={language === "fa" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("cart_title" as never)}
                </h2>
                {itemCount > 0 && (
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black px-2 py-0.5 rounded-full">
                    {itemCount} {language === "fa" ? "عدد" : "items"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === "fa" ? "پرداخت امن درگاه بانکی شاپرک" : "Secure payment via official gateway"}
              </p>
            </div>
          </div>

          <button
            onClick={() => !loading && setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {items.length === 0 ? (
            /* Empty Cart View */
            <div className="py-16 text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <ShoppingBag className="h-10 w-10 opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {t("cart_empty" as never)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {t("cart_empty_desc" as never)}
                </p>
              </div>
              <Link
                href="/marketplace"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition hover:scale-[1.02]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{language === "fa" ? "مشاهده و گشت‌وگذار در فروشگاه" : "Explore Marketplace"}</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Store / Seller Banner */}
              {sellerName && (
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-200/70 dark:border-emerald-800/60 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Store className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 font-medium block">
                        {t("cart_seller_label" as never)}
                      </span>
                      <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 truncate block">
                        {sellerName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{t("cart_clear_btn" as never)}</span>
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex gap-3 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900 transition"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Details & Controls */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition p-1"
                          title={t("cart_item_remove" as never)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                          {formatToman(item.price * item.quantity, language)}{" "}
                          <span className="text-[10px] font-normal">{language === "fa" ? "تومان" : "Toman"}</span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition shadow-xs"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-black text-slate-900 dark:text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition shadow-xs"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details Form */}
              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  <span>{language === "fa" ? "اطلاعات تحویل و ارسال سفارش" : "Delivery Details"}</span>
                </h4>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {t("mp_buyer_phone_label" as never)}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("mp_buyer_phone_ph" as never)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {t("mp_buyer_address_label" as never)}
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("mp_buyer_address_ph" as never)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {t("mp_buyer_notes_label" as never)}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("mp_buyer_notes_ph" as never)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Price Breakdown Invoice */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{t("cart_items_subtotal" as never)}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatToman(subtotal, language)} {language === "fa" ? "تومان" : "Toman"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t("cart_shipping_fee" as never)}:</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatToman(shippingFee, language)} {language === "fa" ? "تومان" : "Toman"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{t("mp_checkout_fee" as never)}:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {t("mp_checkout_free_fee" as never)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
                  <span className="font-black text-slate-900 dark:text-white">
                    {t("cart_total_price" as never)}:
                  </span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-base">
                    {formatToman(totalPayable, language)} {language === "fa" ? "تومان" : "Toman"}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-2.5 rounded-xl">
                <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="leading-tight">{t("mp_checkout_guarantee" as never)}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            {!isAuthenticated ? (
              <Link
                href="/login?redirect=/marketplace"
                className="w-full h-12 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 transition gap-2 text-sm"
              >
                <CreditCard className="h-5 w-5" />
                <span>{language === "fa" ? "ورود به حساب کاربری و پرداخت" : "Sign In & Checkout"}</span>
              </Link>
            ) : (
              <Button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 transition gap-2 text-sm hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t("cart_checkout_processing" as never)}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>{t("cart_checkout_btn" as never)}</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

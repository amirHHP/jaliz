"use client"

import { AlertTriangle, ArrowRightLeft, Store, Trash2, X } from "lucide-react"
import { useCart } from "./CartProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { Button } from "@/components/ui/button"

export function CartConflictModal() {
  const { pendingConflict, resolveConflict, sellerName } = useCart()
  const { t, language } = useLanguage()

  if (!pendingConflict) return null

  const newSeller = pendingConflict.ownerName || (language === "fa" ? "فروشنده جدید" : "New Seller")
  const currentSeller = sellerName || (language === "fa" ? "فروشنده قبلی" : "Current Seller")

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("cart_conflict_title" as never)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === "fa" ? "محدودیت خرید از یک فروشگاه" : "Single-store order restriction"}
              </p>
            </div>
          </div>
          <button
            onClick={() => resolveConflict(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Store switch comparison card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/5 to-emerald-500/10 border border-amber-200/70 dark:border-amber-900/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Store className="h-4 w-4 text-amber-600" />
              <span>{currentSeller}</span>
            </div>
            <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <Store className="h-4 w-4 text-emerald-600" />
              <span>{newSeller}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === "fa"
              ? `سبد خرید شما در حال حاضر حاوی محصولات فروشنده «${currentSeller}» است. در جالیز هر سفارش مختص یک فروشگاه ثبت و ارسال می‌شود.`
              : `Your cart currently contains items from "${currentSeller}". Jaliz orders are shipped per individual seller.`}
          </p>

          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            {language === "fa"
              ? `آیا مایلید سبد قبلی خالی شده و محصول «${pendingConflict.listing.title}» از «${newSeller}» جایگزین شود؟`
              : `Would you like to clear your current cart and add "${pendingConflict.listing.title}" from "${newSeller}" instead?`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => resolveConflict(false)}
            className="flex-1 rounded-xl h-11 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
          >
            {t("cart_conflict_cancel_btn" as never)}
          </Button>

          <Button
            type="button"
            onClick={() => resolveConflict(true)}
            className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Trash2 className="h-4 w-4" />
            {t("cart_conflict_replace_btn" as never)}
          </Button>
        </div>
      </div>
    </div>
  )
}

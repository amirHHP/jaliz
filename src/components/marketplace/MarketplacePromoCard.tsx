"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Gift, ArrowLeft, ArrowRight } from "lucide-react"

import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"

export function MarketplacePromoCard() {
  const { t, language } = useLanguage()
  const { status } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || status !== "unauthenticated") return null

  return (
    <div
      dir={language === "fa" ? "rtl" : "ltr"}
      className="relative overflow-hidden rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 via-emerald-100/30 to-teal-50/50 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-teal-950/30 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      {/* Decorative background blobs */}
      <div className="absolute -top-12 -end-12 w-32 h-32 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -start-16 w-36 h-36 bg-emerald-300/20 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Gift className="h-6 w-6 text-emerald-950" />
          </div>
          <div className="space-y-1 text-start">
            <h3 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              {t("promo_card_title")}
            </h3>
            <p className="text-xs md:text-sm text-muted leading-relaxed max-w-2xl">
              {t("promo_card_desc")}
            </p>
          </div>
        </div>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 select-none group-hover:scale-[1.02]"
        >
          <span>{t("promo_card_cta")}</span>
          {language === "fa" ? (
            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
          ) : (
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          )}
        </Link>
      </div>
    </div>
  )
}

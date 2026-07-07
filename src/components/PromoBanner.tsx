"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Gift, X } from "lucide-react"

import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"

export function PromoBanner() {
  const { t, language } = useLanguage()
  const { status } = useAuth()
  
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Prevent SSR hydration mismatch by checking localStorage only after mount
    if (status === "unauthenticated") {
      const dismissed = localStorage.getItem("jaliz_first_purchase_promo_dismissed")
      if (!dismissed) {
        setIsVisible(true)
      }
    }
  }, [status])

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsClosing(true)
    // Wait for slide-up/fade-out animation before unmounting
    setTimeout(() => {
      localStorage.setItem("jaliz_first_purchase_promo_dismissed", "true")
      setIsVisible(false)
    }, 200)
  }

  if (!isVisible) return null

  return (
    <div
      dir={language === "fa" ? "rtl" : "ltr"}
      className={`w-full bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 border-b border-emerald-950 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-md relative z-[60] select-none transition-all duration-200 ease-in-out ${
        isClosing ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0"
      }`}
    >
      <Link
        href="/register"
        className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center hover:opacity-95 transition-opacity py-0.5 cursor-pointer"
      >
        <span className="inline-flex items-center gap-1.5">
          <Gift className="h-4 w-4 text-amber-300 animate-bounce shrink-0" />
          <span className="font-semibold tracking-wide">
            {t("promo_top_text")}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 font-bold bg-amber-400 hover:bg-amber-300 text-emerald-950 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs shadow-sm active:scale-95 transition-all duration-150 animate-pulse">
          {t("promo_top_cta")}
        </span>
      </Link>

      <button
        onClick={handleDismiss}
        className="p-1 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 active:scale-90 transition-all shrink-0 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Camera,
  CloudSun,
  Sprout,
  Sparkles,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Globe,
} from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"

const SWIPE_THRESHOLD = 48

export function LandingPage() {
  const { t, language, setLanguage } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en")
  }

  const slides = [
    {
      id: "welcome",
      content: (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-md mx-auto">
          <Image
            src="/hero-character.jpg"
            alt=""
            width={288}
            height={288}
            priority
            sizes="(max-width: 640px) 256px, 288px"
            className="w-64 h-64 sm:w-72 sm:h-72 object-contain mb-6 drop-shadow-xl animate-in fade-in zoom-in-95 duration-500"
          />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            {t("app_title")}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-3">
            {t("landing_hero_title")}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {t("landing_hero_subtitle")}
          </p>
        </div>
      ),
    },
    {
      id: "reminders",
      content: (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-md mx-auto">
          <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mb-8 shadow-inner">
            <CloudSun className="w-16 h-16 text-sky-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
            {t("landing_feature_1_title")}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t("landing_feature_1_desc")}
          </p>
        </div>
      ),
    },
    {
      id: "diagnose",
      content: (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-md mx-auto">
          <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-amber-100 to-emerald-100 flex items-center justify-center mb-8 shadow-inner relative">
            <Camera className="w-14 h-14 text-emerald-700" />
            <span className="absolute -top-1 -end-1 h-9 w-9 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
            {t("landing_slide_diag_title")}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t("landing_slide_diag_desc")}
          </p>
        </div>
      ),
    },
    {
      id: "cta",
      content: (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-md mx-auto">
          <div className="w-full rounded-[2rem] border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(16,185,129,0.18)] p-7 sm:p-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 mx-auto flex items-center justify-center mb-5 border border-emerald-100">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
              {t("landing_final_cta_title")}
            </h2>
            <p className="text-sm text-slate-600 mb-7 leading-relaxed">
              {t("landing_final_cta_subtitle")}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/plants/diagnose"
                prefetch={false}
                className="inline-flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-4 text-sm font-bold shadow-lg shadow-emerald-600/25 transition-transform w-full hover:scale-[1.02] active:scale-[0.99]"
              >
                <Camera className="h-5 w-5" />
                {t("landing_cta_diagnose")}
              </Link>
              <Link
                href="/register"
                className="inline-flex justify-center items-center gap-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-5 py-3.5 text-sm font-semibold transition-all w-full"
              >
                <UserPlus className="h-4 w-4 text-emerald-600" />
                {t("landing_cta_register_plant")}
              </Link>
              <Link
                href="/login"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
              >
                {t("landing_cta_login_hint")}
              </Link>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const totalSlides = slides.length
  const isLastSlide = currentSlide === totalSlides - 1
  const isRtl = language === "fa"

  const goTo = useCallback(
    (index: number) => {
      setCurrentSlide(Math.max(0, Math.min(totalSlides - 1, index)))
    },
    [totalSlides],
  )

  const handleNext = () => {
    if (!isLastSlide) goTo(currentSlide + 1)
  }

  const handlePrev = () => {
    if (currentSlide > 0) goTo(currentSlide - 1)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
    touchDeltaX.current = 0
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    touchDeltaX.current = (e.touches[0]?.clientX ?? touchStartX.current) - touchStartX.current
  }

  const onTouchEnd = () => {
    const dx = touchDeltaX.current
    touchStartX.current = null
    touchDeltaX.current = 0
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    // In RTL, swipe direction feels mirrored for "next"
    const goingNext = isRtl ? dx > 0 : dx < 0
    if (goingNext) handleNext()
    else handlePrev()
  }

  const arrowRightIcon = isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
  const arrowLeftIcon = isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />

  return (
    <div
      className="h-[100dvh] w-full -mb-16 md:mb-0 bg-gradient-to-b from-emerald-50 via-white to-teal-50/40 overflow-hidden flex flex-col relative selection:bg-emerald-200 selection:text-emerald-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="pointer-events-none absolute -top-32 -end-32 h-96 w-96 rounded-full bg-lime-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -start-32 h-96 w-96 rounded-full bg-teal-200/25 blur-3xl" />

      <div className="flex-none p-5 sm:p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">{t("app_title")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center justify-center h-8 w-8 rounded-full text-slate-500 hover:text-emerald-700 bg-white/40 hover:bg-white/70 backdrop-blur-sm transition-colors"
            title={language === "en" ? "فارسی" : "English"}
            aria-label={language === "en" ? "فارسی" : "English"}
          >
            <Globe className="h-4 w-4" />
          </button>
          {!isLastSlide && (
            <button
              type="button"
              onClick={() => goTo(totalSlides - 1)}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1 bg-white/40 hover:bg-white/70 backdrop-blur-sm rounded-full"
            >
              {t("landing_skip")}
            </button>
          )}
          {isLastSlide && (
            <Link
              href="/login"
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors px-2 py-1"
            >
              {t("landing_cta_secondary")}
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 w-full min-h-0">
        <div className="w-full relative h-full min-h-[320px] flex items-center">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out w-full
                ${idx === currentSlide ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none"}
                ${idx < currentSlide ? (isRtl ? "translate-x-10" : "-translate-x-10") : ""}
                ${idx > currentSlide ? (isRtl ? "-translate-x-10" : "translate-x-10") : ""}
              `}
              aria-hidden={idx !== currentSlide}
            >
              {slide.content}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-none p-6 pb-10 sm:pb-12 flex flex-col gap-8 relative z-10">
        <div className="flex justify-center gap-2.5" role="tablist" aria-label="Onboarding slides">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === currentSlide}
              onClick={() => goTo(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-8 bg-emerald-600" : "w-2.5 bg-emerald-200 hover:bg-emerald-300"
              }`}
              aria-label={`${idx + 1}`}
            />
          ))}
        </div>

        {!isLastSlide ? (
          <div className="flex justify-between items-center min-h-[56px] px-1 max-w-md w-full mx-auto">
            {currentSlide > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:scale-105 transition-all"
                aria-label={t("landing_prev")}
              >
                {arrowLeftIcon}
              </button>
            ) : (
              <div className="w-14 h-14" />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-emerald-600 text-white font-bold text-lg shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all shadow-emerald-600/20"
            >
              {t("landing_next")}
              {arrowRightIcon}
            </button>
          </div>
        ) : (
          <p className="text-center text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
            {t("landing_cta_footer_note")}
          </p>
        )}
      </div>
    </div>
  )
}

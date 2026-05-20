"use client"

import { useState } from "react"
import Link from "next/link"
import { CloudSun, Sprout, UserPlus, LogIn, ChevronRight, ChevronLeft, Globe } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"

export function LandingPage() {
  const { t, language, setLanguage } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en")
  }

  const slides = [
    {
      id: "welcome",
      content: (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-md mx-auto">
          <img src="/hero-character.png" alt="Happy plant character" className="w-72 h-72 object-contain mb-8 drop-shadow-xl" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-4">{t("landing_hero_title")}</h1>
          <p className="text-base text-slate-600 leading-relaxed">{t("landing_hero_subtitle")}</p>
        </div>
      )
    },
    {
      id: "reminders",
      content: (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-md mx-auto">
          <div className="w-40 h-40 rounded-full bg-emerald-100 flex items-center justify-center mb-8 shadow-inner">
            <CloudSun className="w-20 h-20 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">{t("landing_feature_1_title")}</h2>
          <p className="text-base text-slate-600 leading-relaxed">{t("landing_feature_1_desc")}</p>
        </div>
      )
    },
    {
      id: "progress",
      content: (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-md mx-auto">
          <div className="w-40 h-40 rounded-full bg-amber-100 flex items-center justify-center mb-8 shadow-inner">
            <Sprout className="w-20 h-20 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">{t("landing_feature_2_title")}</h2>
          <p className="text-base text-slate-600 leading-relaxed">{t("landing_feature_2_desc")}</p>
        </div>
      )
    },
    {
      id: "cta",
      content: (
        <div className="flex flex-col items-center text-center px-6 w-full max-w-md mx-auto">
          <div className="w-full bg-white rounded-[2.5rem] border border-emerald-100 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] p-8 mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-6">
              <Sprout className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-3">{t("landing_final_cta_title")}</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">{t("landing_final_cta_subtitle")}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                className="inline-flex justify-center items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-4 text-sm font-bold shadow-md transition-all w-full hover:scale-[1.02]"
              >
                <UserPlus className="h-5 w-5" />
                {t("landing_cta_primary")}
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center items-center gap-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-5 py-4 text-sm font-bold transition-all w-full hover:scale-[1.02]"
              >
                <LogIn className="h-5 w-5" />
                {t("landing_cta_secondary")}
              </Link>
            </div>
          </div>
        </div>
      )
    }
  ]

  const totalSlides = slides.length
  const isLastSlide = currentSlide === totalSlides - 1

  const handleNext = () => {
    if (!isLastSlide) setCurrentSlide(s => s + 1)
  }

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(s => s - 1)
  }

  const arrowRightIcon = language === "fa" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
  const arrowLeftIcon = language === "fa" ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />

  return (
    <div className="h-[100dvh] w-full bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 overflow-hidden flex flex-col relative selection:bg-emerald-200 selection:text-emerald-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -end-32 h-96 w-96 rounded-full bg-lime-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -start-32 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />

      {/* Top Header / Skip Button */}
      <div className="flex-none p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
             <Sprout className="w-4 h-4" />
           </div>
           <span className="font-bold text-slate-800 tracking-tight">{t("app_title")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center h-8 w-8 rounded-full text-slate-500 hover:text-emerald-700 bg-white/30 hover:bg-white/60 backdrop-blur-sm transition-colors"
            title={language === "en" ? "فارسی" : "English"}
          >
            <Globe className="h-4 w-4" />
          </button>
          {!isLastSlide && (
            <button 
              onClick={() => setCurrentSlide(totalSlides - 1)}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1 bg-white/30 hover:bg-white/60 backdrop-blur-sm rounded-full"
            >
              {language === "fa" ? "رد شدن" : "Skip"}
            </button>
          )}
        </div>
      </div>

      {/* Slide Content Area */}
      <div className="flex-1 flex items-center justify-center relative z-10 w-full h-full">
         <div className="w-full relative h-full flex items-center">
            {slides.map((slide, idx) => (
              <div 
                key={slide.id} 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out w-full
                  ${idx === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none'}
                  ${idx < currentSlide ? (language === 'fa' ? 'translate-x-12' : '-translate-x-12') : ''}
                  ${idx > currentSlide ? (language === 'fa' ? '-translate-x-12' : 'translate-x-12') : ''}
                `}
              >
                {slide.content}
              </div>
            ))}
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex-none p-8 pb-12 flex flex-col gap-10 relative z-10">
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-emerald-600' : 'w-2.5 bg-emerald-200 hover:bg-emerald-300'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center min-h-[56px] px-2 max-w-md w-full mx-auto">
          {currentSlide > 0 && !isLastSlide ? (
            <button 
              onClick={handlePrev}
              className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:scale-105 transition-all"
            >
              {arrowLeftIcon}
            </button>
          ) : (
            <div className="w-14 h-14" /> // Spacer
          )}

          {!isLastSlide ? (
            <button 
              onClick={handleNext}
              className="flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-emerald-600 text-white font-bold text-lg shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all shadow-emerald-600/20"
            >
              {language === "fa" ? "بعدی" : "Next"}
              {arrowRightIcon}
            </button>
          ) : (
            <div className="w-14 h-14" /> // Spacer
          )}
        </div>
      </div>
    </div>
  )
}

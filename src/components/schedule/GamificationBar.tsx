"use client"

import React, { useState } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { calculateGardenerLevel, GARDENER_LEVELS } from "@/lib/gamification"
import { Flame, Zap, CheckCircle2, X, Sparkles, Trophy, HelpCircle, Award, Droplets } from "lucide-react"

export interface GamificationBarProps {
  streak: number
  xp: number
  completedCount: number
  totalDueToday: number
  completionPercentage: number
  className?: string
}

function toPersianDigits(n: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return String(n).replace(/\d/g, (x) => farsiDigits[Number(x)])
}

/**
 * Compact Duolingo-style gamification status bar for `/schedule`.
 * Renders all 3 indicators (Streak 🔥, Total XP ⚡, Daily Progress 🎯) side-by-side
 * in a sleek, space-efficient horizontal row on both mobile and desktop.
 * Tapping any card opens a detailed breakdown modal (e.g. XP progress & level tiering).
 */
export function GamificationBar({
  streak,
  xp,
  completedCount,
  totalDueToday,
  completionPercentage,
  className = "",
}: GamificationBarProps) {
  const { language } = useLanguage()
  const isFa = language === "fa"

  const [activeModal, setActiveModal] = useState<"streak" | "xp" | "progress" | null>(null)

  const levelInfo = calculateGardenerLevel(xp)
  const isAllComplete = completionPercentage === 100 && totalDueToday > 0

  // Calculate next level metrics
  const currentIdx = GARDENER_LEVELS.findIndex((l) => l.level === levelInfo.level)
  const nextLevel =
    currentIdx >= 0 && currentIdx < GARDENER_LEVELS.length - 1
      ? GARDENER_LEVELS[currentIdx + 1]
      : null

  const xpSpan = nextLevel ? nextLevel.minXp - levelInfo.minXp : 100
  const xpInCurrentLevel = Math.max(0, xp - levelInfo.minXp)
  const xpNeededForNext = nextLevel ? Math.max(0, nextLevel.minXp - xp) : 0
  const levelProgressPct = nextLevel
    ? Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpSpan) * 100)))
    : 100

  // Progress ring dimensions (compact)
  const ringRadius = 13
  const ringCircumference = 2 * Math.PI * ringRadius
  const validPct = Math.min(100, Math.max(0, completionPercentage))
  const strokeDashoffset = ringCircumference - (validPct / 100) * ringCircumference

  return (
    <>
      <div
        className={`rounded-2xl border border-emerald-100/90 bg-white/95 p-2 sm:p-3 shadow-xs backdrop-blur-sm transition-all duration-300 ${className}`}
      >
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 items-stretch">
          {/* 1. Streak Flame Card (Side-by-side Column 1) */}
          <button
            type="button"
            onClick={() => setActiveModal("streak")}
            className="group relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/80 hover:border-amber-300 hover:bg-amber-50/70 transition-all text-center focus:outline-none focus:ring-2 focus:ring-amber-400/40 active:scale-95 cursor-pointer"
            title={isFa ? "مشاهده جزئیات استمرار" : "View streak details"}
          >
            <div className="flex items-center gap-1 sm:gap-1.5 w-full justify-center">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                  streak > 0
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-pulse"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-amber-800/80 leading-none">
                {isFa ? "استمرار" : "Streak"}
              </span>
            </div>

            <div className="text-sm sm:text-base font-black text-amber-950 mt-1 flex items-baseline gap-1">
              <span>{isFa ? toPersianDigits(streak) : streak}</span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-800">
                {isFa ? "روز" : "days"}
              </span>
            </div>

            <div className="text-[9px] sm:text-[10px] font-bold text-amber-700/80 truncate max-w-full mt-0.5">
              {streak > 0
                ? isFa
                  ? "پشت‌سرهم 🔥"
                  : "Active 🔥"
                : isFa
                ? "شروع کن!"
                : "Start now"}
            </div>
          </button>

          {/* 2. Total XP & Gardener Level (Side-by-side Column 2 - PROMINENT XP!) */}
          <button
            type="button"
            onClick={() => setActiveModal("xp")}
            className="group relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/70 transition-all text-center focus:outline-none focus:ring-2 focus:ring-emerald-400/40 active:scale-95 cursor-pointer shadow-xs"
            title={isFa ? "مشاهده جزئیات امتیاز (XP) و سطح" : "View XP and level details"}
          >
            <div className="flex items-center gap-1 sm:gap-1.5 w-full justify-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-800/80 leading-none">
                {isFa ? "مجموع امتیاز" : "Total XP"}
              </span>
            </div>

            <div className="text-sm sm:text-base font-black text-emerald-950 mt-1 flex items-baseline gap-1">
              <span>{isFa ? toPersianDigits(xp) : xp}</span>
              <span className="text-[10px] sm:text-xs font-black text-emerald-600">XP</span>
            </div>

            <div className="text-[9px] sm:text-[10px] font-bold text-emerald-700/90 truncate max-w-full mt-0.5 flex items-center gap-1">
              <span className="bg-emerald-100/90 px-1.5 py-0.2 rounded-full text-emerald-800">
                {isFa ? `سطح ${toPersianDigits(levelInfo.level)}` : `Lvl ${levelInfo.level}`}
              </span>
              <span>{isFa ? levelInfo.titleFa : levelInfo.titleEn}</span>
            </div>
          </button>

          {/* 3. Daily Care Progress Ring (Side-by-side Column 3) */}
          <button
            type="button"
            onClick={() => setActiveModal("progress")}
            className="group relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-sky-500/10 via-teal-500/5 to-transparent border border-teal-200/80 hover:border-teal-300 hover:bg-teal-50/70 transition-all text-center focus:outline-none focus:ring-2 focus:ring-teal-400/40 active:scale-95 cursor-pointer"
            title={isFa ? "مشاهده پیشرفت آبیاری امروز" : "View daily progress"}
          >
            <div className="flex items-center gap-1 sm:gap-1.5 w-full justify-center">
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 shrink-0 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 transform -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r={ringRadius}
                    className="text-slate-200"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r={ringRadius}
                    className={isAllComplete ? "text-emerald-500" : "text-teal-600"}
                    strokeWidth="3.2"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isAllComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="text-[8px] font-black text-slate-700">
                      {isFa ? toPersianDigits(validPct) : validPct}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-teal-800/80 leading-none">
                {isFa ? "پیشرفت" : "Progress"}
              </span>
            </div>

            <div className="text-sm sm:text-base font-black text-teal-950 mt-1 flex items-baseline gap-0.5">
              <span>{isFa ? toPersianDigits(validPct) : validPct}</span>
              <span className="text-[10px] sm:text-xs font-bold text-teal-800">٪</span>
            </div>

            <div className="text-[9px] sm:text-[10px] font-bold text-teal-700/80 truncate max-w-full mt-0.5">
              {isAllComplete
                ? (isFa ? "تکمیل شد ✨" : "Done ✨")
                : totalDueToday === 0
                ? (isFa ? "بدون کار" : "No tasks")
                : isFa
                ? `${toPersianDigits(completedCount)} از ${toPersianDigits(totalDueToday)}`
                : `${completedCount}/${totalDueToday}`}
            </div>
          </button>
        </div>
      </div>

      {/* Gamification Modal / Info Dialog */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 end-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              aria-label={isFa ? "بستن" : "Close"}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content: XP Breakdown */}
            {activeModal === "xp" && (
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md mb-3">
                  <Zap className="w-6 h-6 fill-current" />
                </div>

                <div className="text-xs font-bold text-emerald-700">
                  {isFa ? "امتیاز تجربه باغبان" : "Gardener Experience Points"}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center justify-center gap-1.5">
                  <span>{isFa ? toPersianDigits(xp) : xp}</span>
                  <span className="text-emerald-600 text-lg">XP</span>
                </h3>

                {/* Level Progress Bar */}
                <div className="mt-4 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-start">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isFa
                          ? `سطح ${toPersianDigits(levelInfo.level)}: ${levelInfo.titleFa}`
                          : `Level ${levelInfo.level}: ${levelInfo.titleEn}`}
                      </span>
                    </span>
                    {nextLevel && (
                      <span className="text-[11px] text-emerald-700">
                        {isFa
                          ? `سطح بعدی: ${nextLevel.titleFa}`
                          : `Next: ${nextLevel.titleEn}`}
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${levelProgressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-emerald-800 font-medium mt-1.5">
                    <span>
                      {isFa
                        ? `${toPersianDigits(xpInCurrentLevel)} از ${toPersianDigits(xpSpan)} XP در این سطح`
                        : `${xpInCurrentLevel} / ${xpSpan} XP in level`}
                    </span>
                    {nextLevel && (
                      <span className="font-bold text-emerald-700">
                        {isFa
                          ? `${toPersianDigits(xpNeededForNext)} XP تا ارتقا`
                          : `${xpNeededForNext} XP to next level`}
                      </span>
                    )}
                  </div>
                </div>

                {/* How to Earn XP */}
                <div className="mt-4 text-start">
                  <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isFa ? "چطور XP کسب کنم؟" : "How to earn XP?"}</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        <span>{isFa ? "آبیاری هر گیاه نیازمند" : "Water a due plant"}</span>
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[11px]">
                        {isFa ? "+۱۰ XP" : "+10 XP"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{isFa ? "تکمیل کارهای آبیاری امروز" : "Complete daily watering"}</span>
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[11px]">
                        {isFa ? "+۲۵ XP" : "+25 XP"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{isFa ? "حفظ زنجیره استمرار روزانه" : "Maintain daily streak"}</span>
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[11px]">
                        {isFa ? "+۵۰ XP" : "+50 XP"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {isFa ? "متوجه شدم 🌱" : "Got it 🌱"}
                </button>
              </div>
            )}

            {/* Modal Content: Streak Breakdown */}
            {activeModal === "streak" && (
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md mb-3">
                  <Flame className="w-6 h-6 fill-current" />
                </div>

                <div className="text-xs font-bold text-amber-700">
                  {isFa ? "استمرار آبیاری روزانه" : "Daily Care Streak"}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center justify-center gap-1">
                  <span>{isFa ? toPersianDigits(streak) : streak}</span>
                  <span className="text-amber-700 text-base">{isFa ? "روز پشت‌سرهم" : "days"}</span>
                </h3>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {isFa
                    ? "با آبیاری به موقع گیاهان در هر روز، زنجیره استمرار شما روشن می‌ماند و سرعت رشد گل‌ها و امتیازهای شما چند برابر می‌شود!"
                    : "Water your plants on time each day to keep the flame alive and earn bonus XP multipliers!"}
                </p>

                <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 font-medium">
                  {streak > 0
                    ? isFa
                      ? `آفرین! شما ${toPersianDigits(streak)} روز است که زنجیره مراقبت را زنده نگه داشته‌اید.`
                      : `Great job! You have kept the care streak going for ${streak} days.`
                    : isFa
                    ? "امروز گیاهان را آبیاری کنید تا اولین روز زنجیره استمرار شما روشن شود."
                    : "Water plants today to start your streak flame."}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="mt-5 w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 text-xs shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  {isFa ? "ادامه استمرار 🔥" : "Keep going 🔥"}
                </button>
              </div>
            )}

            {/* Modal Content: Progress Breakdown */}
            {activeModal === "progress" && (
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="text-xs font-bold text-teal-700">
                  {isFa ? "پیشرفت کارهای امروز" : "Today's Care Progress"}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {isFa ? `${toPersianDigits(validPct)}٪ تکمیل` : `${validPct}% Completed`}
                </h3>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {isAllComplete
                    ? isFa
                      ? "تمام گیاهان نیازمندِ امروز سیراب شدند! گلدان‌ها شاداب و در امانند. ✨"
                      : "All scheduled plants for today have been watered! ✨"
                    : totalDueToday === 0
                    ? isFa
                      ? "امروز هیچ گیاهی نیاز به آبیاری ندارد. می‌توانید با خیال راحت استراحت کنید."
                      : "No plants require watering today. Rest easy!"
                    : isFa
                    ? `از بین ${toPersianDigits(totalDueToday)} گیاه نیازمند امروز، ${toPersianDigits(completedCount)} گیاه آبیاری شده‌اند.`
                    : `${completedCount} of ${totalDueToday} plants have been watered today.`}
                </p>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="mt-5 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                >
                  {isFa ? "بسیار عالی ✨" : "Awesome ✨"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

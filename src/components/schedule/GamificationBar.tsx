"use client"

import React from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { calculateGardenerLevel } from "@/lib/gamification"
import { Flame, Zap, Award, CheckCircle2 } from "lucide-react"

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
 * Duolingo-style gamification status bar for `/schedule`.
 * Displays active streak flame, XP counter, gardener level badge,
 * and a circular progress ring showing today's % care completed.
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

  const levelInfo = calculateGardenerLevel(xp)
  const isAllComplete = completionPercentage === 100 && totalDueToday > 0

  // Circular progress calculations
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const validPct = Math.min(100, Math.max(0, completionPercentage))
  const strokeDashoffset = circumference - (validPct / 100) * circumference

  return (
    <div
      className={`rounded-3xl border border-emerald-100 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur-sm transition-all duration-300 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
        {/* 1. Streak Flame Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/80">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform ${
              streak > 0
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-pulse"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-amber-800/80">
              {isFa ? "استمرار آبیاری" : "Care Streak"}
            </div>
            <div className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-1">
              <span>{isFa ? toPersianDigits(streak) : streak}</span>
              <span className="text-xs font-bold text-amber-800">
                {isFa ? "روز پشت‌سرهم" : "days"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. XP & Gardener Level Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-200/80">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-800/80">
                {isFa ? "سطح باغبان" : "Gardener Level"}
              </span>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                {isFa ? `سطح ${toPersianDigits(levelInfo.level)}` : `Lvl ${levelInfo.level}`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm sm:text-base font-black text-emerald-950 truncate">
                {isFa ? levelInfo.titleFa : levelInfo.titleEn}
              </span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                {isFa ? toPersianDigits(xp) : xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* 3. Circular Daily Care Progress Ring */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-emerald-500/5 border border-teal-200/80">
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 52 52">
              {/* Background Ring */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="text-slate-200"
                strokeWidth="4.5"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Ring */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                className={isAllComplete ? "text-emerald-500" : "text-teal-600"}
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {isAllComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <span className="text-[11px] font-black text-slate-800">
                  {isFa ? `${toPersianDigits(validPct)}%` : `${validPct}%`}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-600">
              {isFa ? "پیشرفت امروز" : "Daily Progress"}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {isAllComplete ? (
                <span className="text-emerald-700 font-black">
                  {isFa ? "همه سیراب شدند! ✨" : "All completed! ✨"}
                </span>
              ) : totalDueToday === 0 ? (
                <span className="text-slate-600">
                  {isFa ? "کاری برای امروز نیست" : "No tasks today"}
                </span>
              ) : (
                <span>
                  {isFa
                    ? `${toPersianDigits(completedCount)} از ${toPersianDigits(totalDueToday)} انجام شد`
                    : `${completedCount} of ${totalDueToday} done`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import type { CareTaskItem } from "@/lib/care-tasks"
import { useLanguage } from "@/components/LanguageProvider"
import { Button } from "@/components/ui/button"
import { Droplets, Check, AlertCircle, Calendar, Loader2 } from "lucide-react"

export interface CareTaskCardProps {
  task: CareTaskItem
  isDone?: boolean
  onWater?: (plantId: string) => Promise<void> | void
  disabled?: boolean
  className?: string
}

/**
 * Interactive Care Task Card for `/schedule`.
 * Displays plant thumbnail/icon, name, pot/location metadata,
 * color-coded relative due badge, and an animated watering check button.
 */
export function CareTaskCard({
  task,
  isDone = false,
  onWater,
  disabled = false,
  className = "",
}: CareTaskCardProps) {
  const { language } = useLanguage()
  const isFa = language === "fa"
  const { plant, category, formattedDueText } = task

  const [isPending, setIsPending] = useState(false)
  const [showXpFeedback, setShowXpFeedback] = useState(false)

  const handleWaterClick = async () => {
    if (disabled || isDone || isPending || !onWater) return
    setIsPending(true)
    try {
      await onWater(plant.id)
      setShowXpFeedback(true)
      setTimeout(() => setShowXpFeedback(false), 2500)
    } finally {
      setIsPending(false)
    }
  }

  // Localized metadata strings
  const locationLabel =
    plant.locationType === "Indoor"
      ? isFa
        ? "داخل خانه"
        : "Indoor"
      : isFa
      ? "خارج خانه"
      : "Outdoor"

  const potLabel =
    plant.potType === "Terracotta"
      ? isFa
        ? "سفالی"
        : "Terracotta"
      : plant.potType === "Plastic"
      ? isFa
        ? "پلاستیکی"
        : "Plastic"
      : plant.potType === "Ceramic"
      ? isFa
        ? "سرامیکی"
        : "Ceramic"
      : plant.potType === "Metal"
      ? isFa
        ? "فلزی"
        : "Metal"
      : isFa
      ? "سایر"
      : "Other"

  const mediumLabel =
    plant.growingMedium === "Water"
      ? isFa
        ? "هیدروپونیک"
        : "Water"
      : isFa
      ? "خاک"
      : "Soil"

  // Badge styling per category
  const badgeStyle =
    category === "overdue"
      ? "bg-rose-100/90 text-rose-800 border-rose-200"
      : category === "today"
      ? "bg-emerald-100/90 text-emerald-800 border-emerald-200"
      : "bg-slate-100 text-slate-700 border-slate-200"

  const CategoryIcon =
    category === "overdue"
      ? AlertCircle
      : category === "today"
      ? Droplets
      : Calendar

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
        isDone
          ? "border-emerald-200/60 bg-emerald-50/30 opacity-80"
          : category === "overdue"
          ? "border-rose-200/80 bg-rose-50/20 hover:border-rose-300 hover:shadow-md"
          : "border-slate-200/80 bg-white hover:border-emerald-200 hover:shadow-md"
      } ${className}`}
    >
      {/* Floating +10 XP Celebration Badge on successful water */}
      {showXpFeedback && (
        <div className="absolute top-2 end-3 z-20 flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-lg animate-bounce">
          <span>+10 XP</span>
          <span>⚡</span>
        </div>
      )}

      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        {/* Left: Thumbnail & Plant Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {plant.image ? (
            <img
              src={plant.image}
              alt={plant.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-100 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center text-base font-black uppercase shadow-inner shrink-0 ring-2 ring-emerald-50">
              {plant.name.slice(0, 2)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-base text-slate-900 truncate">
                {plant.name}
              </h4>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle}`}
              >
                <CategoryIcon className="w-3 h-3" />
                <span>{formattedDueText}</span>
              </span>
            </div>

            <div className="text-xs text-slate-500 truncate mt-1 font-medium flex items-center gap-1.5 flex-wrap">
              <span>{locationLabel}</span>
              <span>•</span>
              <span>{potLabel}</span>
              <span>•</span>
              <span>{mediumLabel}</span>
            </div>
          </div>
        </div>

        {/* Right: Water Check Action Button */}
        <div className="shrink-0 self-end sm:self-center w-full sm:w-auto flex justify-end">
          {isDone ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100/80 text-emerald-800 text-xs font-black border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{isFa ? "سیراب شد ✓" : "Watered ✓"}</span>
            </div>
          ) : (
            <Button
              size="sm"
              disabled={disabled || isPending}
              onClick={handleWaterClick}
              className={`w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-sm transition-transform active:scale-95 ${
                category === "overdue"
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isFa ? "در حال ثبت..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{isFa ? "آبیاری کن" : "Water"}</span>
                  <span className="text-[10px] opacity-80 ms-0.5 bg-white/20 px-1.5 py-0.2 rounded">
                    +10 XP
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

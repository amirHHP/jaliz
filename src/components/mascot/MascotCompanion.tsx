"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { usePlants } from "@/components/PlantsProvider"
import { PlantMascot } from "./PlantMascot"
import { MascotSpeechBubble } from "./MascotSpeechBubble"
import {
  resolveMascotState,
  getMascotDialogue,
  type MascotState,
  type MascotContext,
} from "@/lib/mascot-dialogue"
import { partitionCareTasks } from "@/lib/care-tasks"
import { getWateringStreakAction } from "@/app/actions/plants"
import { Flame, Sparkles } from "lucide-react"

export interface MascotCompanionProps {
  className?: string
  streak?: number
  isDoneToday?: boolean
  totalPlants?: number
  plantsToWaterCount?: number
  firstThirstyPlantName?: string
  onTap?: () => void
}

const PLAYFUL_TIPS_FA = [
  "قلقلکم نده رفیق! برو به گل‌هات سر بزن 😄🌱",
  "می‌دونستی صحبت کردن ملایم و موسیقی آرامش‌بخش به شادابی گیاهان کمک می‌کنه؟ 🎵🌿",
  "آبیاری با آب بیات‌شده و هم‌دمای محیط جلوی شوک حرارتی ریشه رو می‌گیره! 💧",
  "غبارپاشی و پاک کردن برگ‌ها با دستمال مرطوب تنفس گیاهانت رو دوبرابر می‌کنه! ✨",
  "زهکشی مناسب گلدان راز اصلی سلامت ریشه و طول عمر گیاهه! 🪴",
]

const PLAYFUL_TIPS_EN = [
  "No tickles, friend! Go check on your plants 😄🌱",
  "Did you know gentle music and kind words help plants thrive? 🎵🌿",
  "Room-temperature resting water prevents thermal shock to plant roots! 💧",
  "Wiping dusty leaves with a damp cloth lets your plants breathe better! ✨",
  "Good drainage is the #1 secret to root health and long plant life! 🪴",
]

/**
 * Hero companion card for `/schedule`.
 * Renders the vector Bargcheh mascot with contextual speech bubble,
 * streak flame pill, and interactive tap interactions.
 */
export function MascotCompanion({
  className = "",
  streak: propStreak,
  isDoneToday: propIsDoneToday,
  totalPlants: propTotalPlants,
  plantsToWaterCount: propPlantsToWaterCount,
  firstThirstyPlantName: propFirstThirstyPlantName,
  onTap,
}: MascotCompanionProps) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { plants } = usePlants()

  const [activeStreak, setActiveStreak] = useState<number>(propStreak ?? 0)
  const [tipIndex, setTipIndex] = useState<number | null>(null)
  const [currentHour, setCurrentHour] = useState<number>(12)

  // Avoid hydration mismatch by reading hour on client
  useEffect(() => {
    setCurrentHour(new Date().getHours())
  }, [])

  // Sync / fetch streak if not provided by prop
  useEffect(() => {
    if (propStreak !== undefined) {
      setActiveStreak(propStreak)
      return
    }
    let cancelled = false
    async function loadStreak() {
      try {
        const res = await getWateringStreakAction()
        if (!cancelled && res && typeof res.streak === "number") {
          setActiveStreak(res.streak)
        }
      } catch (err) {
        console.error("Failed to load streak in MascotCompanion:", err)
      }
    }
    loadStreak()
    return () => {
      cancelled = true
    }
  }, [propStreak, user?.id])

  // Derive care task status
  const carePartition = useMemo(() => {
    return partitionCareTasks(plants, propIsDoneToday)
  }, [plants, propIsDoneToday])

  const totalPlantsCount = propTotalPlants ?? plants.length
  const plantsToWaterCount =
    propPlantsToWaterCount ??
    Math.max(0, carePartition.totalDueToday - carePartition.completedCount)
  const isDoneToday = propIsDoneToday ?? carePartition.completionPercentage === 100
  const firstThirstyPlantName =
    propFirstThirstyPlantName ??
    carePartition.overdue[0]?.plant?.name ??
    carePartition.today[0]?.plant?.name

  const userName = user?.fullName?.trim().split(/\s+/)[0]

  const mascotContext: MascotContext = useMemo(() => {
    return {
      totalPlants: totalPlantsCount,
      plantsToWaterCount,
      isDoneToday,
      streakDays: activeStreak,
      userName,
      firstThirstyPlantName,
      currentHour,
    }
  }, [
    totalPlantsCount,
    plantsToWaterCount,
    isDoneToday,
    activeStreak,
    userName,
    firstThirstyPlantName,
    currentHour,
  ])

  const mascotState: MascotState = useMemo(() => {
    return resolveMascotState(mascotContext)
  }, [mascotContext])

  const defaultDialogue = useMemo(() => {
    return getMascotDialogue(mascotContext, language === "en" ? "en" : "fa")
  }, [mascotContext, language])

  const tipsList = language === "en" ? PLAYFUL_TIPS_EN : PLAYFUL_TIPS_FA

  // Handle tap on mascot or speech bubble
  const handleInteraction = useCallback(() => {
    if (onTap) {
      onTap()
    }
    setTipIndex((prev) => {
      if (prev === null) return 0
      if (prev >= tipsList.length - 1) return null // reset to contextual dialogue
      return prev + 1
    })
  }, [onTap, tipsList.length])

  const displayedMessage =
    tipIndex !== null ? tipsList[tipIndex] : defaultDialogue

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border-2 border-emerald-100/90 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ${className}`}
      aria-label="همراه سبز شما - برگچه"
    >
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-teal-200/30 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {/* Mascot Avatar Container */}
        <div
          onClick={handleInteraction}
          className="relative shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95"
          title={language === "fa" ? "برای صحبت با برگچه بزنید!" : "Click to chat with Bargcheh!"}
        >
          <PlantMascot state={mascotState} size={110} />
          {/* Subtle tap helper ring */}
          <div className="absolute -bottom-1 inset-x-0 mx-auto w-16 h-3 rounded-full bg-emerald-950/5 blur-sm -z-10" />
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 w-full">
          <MascotSpeechBubble
            message={displayedMessage}
            state={mascotState}
            onTap={handleInteraction}
            speakerName={language === "fa" ? "برگچه" : "Bargcheh"}
          />
        </div>

        {/* Quick Streak & Plant Summary Pill */}
        <div className="shrink-0 flex md:flex-col items-center gap-2 self-stretch md:self-center justify-between md:justify-center pt-2 md:pt-0 border-t md:border-t-0 md:border-s border-emerald-100/80 md:ps-4">
          {/* Streak Flame Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
              activeStreak > 0
                ? "bg-amber-50 border-amber-200 text-amber-900 shadow-sm"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <Flame
              className={`w-4 h-4 ${
                activeStreak > 0 ? "text-amber-500 fill-amber-500 animate-pulse" : "text-slate-400"
              }`}
            />
            <span>
              {language === "fa"
                ? `${activeStreak} روز استمرار`
                : `${activeStreak} day streak`}
            </span>
          </div>

          {/* Plant Status Pill */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-2xl text-[11px] font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200/60">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>
              {language === "fa"
                ? `${totalPlantsCount} گیاه در جالیز`
                : `${totalPlantsCount} plants in garden`}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

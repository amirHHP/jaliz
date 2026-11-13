"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { usePlants } from "@/components/PlantsProvider"
import { getUserPlantsAction, getWateringStreakAction } from "@/app/actions/plants"
import { getWeatherAdviceAction } from "@/app/actions/ai"
import { isSubscriptionActive } from "@/lib/subscription"
import { getCachedDailyAdvice, setCachedDailyAdvice } from "@/lib/daily-advice-cache"
import { partitionCareTasks } from "@/lib/care-tasks"
import {
  resolveMascotState,
  getMascotDialogue,
  type MascotContext,
} from "@/lib/mascot-dialogue"
import { PlantMascot } from "@/components/mascot/PlantMascot"

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
 * Top Hero Section:
 * Displays the free-standing ("ول") animated mascot Bargcheh speaking to the user,
 * immediately accompanied by the pure, unboxed daily AI care advice text for distraction-free reading.
 */
export function WeatherAdvice() {
  const { user } = useAuth()
  const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)
  const { language } = useLanguage()
  const isFa = language === "fa"
  const { plants } = usePlants()

  const [advice, setAdvice] = useState<string | null>(() => {
    if (typeof window === "undefined" || !user?.id || !subscribed) return null
    return getCachedDailyAdvice(user.id)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<string>("")
  const [activeStreak, setActiveStreak] = useState<number>(0)
  const [tipIndex, setTipIndex] = useState<number | null>(null)
  const [currentHour, setCurrentHour] = useState<number>(12)

  // Sync user location from localStorage
  useEffect(() => {
    const loc = typeof window !== "undefined" ? localStorage.getItem("jaliz-location") : null
    if (loc) {
      setUserLocation(loc)
    } else {
      setUserLocation(language === "en" ? "Tehran, IR" : "تهران، ایران")
    }
  }, [language])

  // Avoid hydration mismatch by reading hour on client
  useEffect(() => {
    setCurrentHour(new Date().getHours())
  }, [])

  // Sync streak
  useEffect(() => {
    let cancelled = false
    async function loadStreak() {
      try {
        const res = await getWateringStreakAction()
        if (!cancelled && res && typeof res.streak === "number") {
          setActiveStreak(res.streak)
        }
      } catch (err) {
        console.error("Failed to load streak in WeatherAdvice:", err)
      }
    }
    if (subscribed && user?.id) {
      void loadStreak()
    }
    return () => {
      cancelled = true
    }
  }, [subscribed, user?.id])

  // Derive care task status for mascot
  const carePartition = useMemo(() => {
    return partitionCareTasks(plants)
  }, [plants])

  const totalPlantsCount = plants.length
  const plantsToWaterCount = Math.max(
    0,
    carePartition.totalDueToday - carePartition.completedCount
  )
  const isDoneToday = carePartition.completionPercentage === 100
  const firstThirstyPlantName =
    carePartition.overdue[0]?.plant?.name ?? carePartition.today[0]?.plant?.name

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

  const mascotState = useMemo(() => {
    return resolveMascotState(mascotContext)
  }, [mascotContext])

  const defaultDialogue = useMemo(() => {
    return getMascotDialogue(mascotContext, isFa ? "fa" : "en")
  }, [mascotContext, isFa])

  const tipsList = isFa ? PLAYFUL_TIPS_FA : PLAYFUL_TIPS_EN

  const handleInteraction = useCallback(() => {
    setTipIndex((prev) => {
      if (prev === null) return 0
      if (prev >= tipsList.length - 1) return null
      return prev + 1
    })
  }, [tipsList.length])

  const displayedMessage =
    tipIndex !== null ? tipsList[tipIndex] : defaultDialogue

  // Fetch advice implementation
  const fetchAdvice = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id || !subscribed) return

      if (!forceRefresh) {
        const cached = getCachedDailyAdvice(user.id)
        if (cached) {
          setAdvice(cached)
          setLoading(false)
          return
        }
      }

      setLoading(true)
      setError(null)

      try {
        let userPlants: unknown[] = []
        const data = await getUserPlantsAction()
        if (data) {
          userPlants = data.map((p: any) => ({
            name: p.name,
            type: p.type,
            locationType: p.locationType,
            lightExposure: p.lightExposure,
            potType: p.potType,
            growingMedium: p.growingMedium,
            hasDrainage: p.hasDrainage,
            recentlyReplanted: p.recentlyReplanted,
            lastSoilChange: p.lastSoilChange
              ? new Date(p.lastSoilChange).toISOString().split("T")[0]
              : null,
          }))
        }

        const mockLocation = { latitude: 35.6892, longitude: 51.3890 }

        const responseData = await getWeatherAdviceAction({
          latitude: mockLocation.latitude,
          longitude: mockLocation.longitude,
          userLocation: userLocation || (isFa ? "تهران، ایران" : "Tehran, IR"),
          language,
          plants: userPlants,
        })

        if (responseData && responseData.error) {
          throw new Error(responseData.error)
        }

        const adviceText =
          typeof responseData.advice === "string"
            ? responseData.advice
            : JSON.stringify(responseData.advice)

        setAdvice(adviceText)
        if (user?.id) {
          setCachedDailyAdvice(user.id, adviceText)
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : isFa
            ? "دریافت مشاوره با خطا مواجه شد."
            : "An error occurred while fetching advice."
        )
      } finally {
        setLoading(false)
      }
    },
    [user?.id, subscribed, userLocation, language, isFa]
  )

  // Automated fetch on mount
  useEffect(() => {
    if (!subscribed || !user?.id) return

    const cached = getCachedDailyAdvice(user.id)
    if (cached) {
      setAdvice(cached)
      return
    }

    void fetchAdvice(false)
  }, [subscribed, user?.id, fetchAdvice])

  if (!subscribed) {
    return null
  }

  return (
    <section className="animate-in fade-in duration-500 space-y-4 pt-1">
      {/* Top area: Mascot hanging out freely ("ول در صفحه") + Speech Bubble ("یه چیزی بگه") */}
      <div className="flex items-start gap-3 sm:gap-5">
        {/* Mascot Avatar: NO CONTAINER BOX, free on page */}
        <div
          onClick={handleInteraction}
          className="shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95 select-none"
          title={isFa ? "برای گفتگو با برگچه بزنید!" : "Tap to chat with Bargcheh!"}
        >
          <PlantMascot state={mascotState} size={84} />
        </div>

        {/* Speech Bubble pointing to mascot */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div
            onClick={handleInteraction}
            className="relative cursor-pointer inline-block max-w-full rounded-2xl sm:rounded-3xl border border-emerald-200/90 bg-white/95 px-4 py-3 shadow-xs hover:shadow-md transition-all text-slate-800"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">
                {isFa ? "برگچه" : "Bargcheh"}
              </span>
              <span className="text-[11px] text-slate-400 font-normal ms-auto ps-2">
                {isFa ? "برای پیام بعدی بزنید ✨" : "Tap for tips ✨"}
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-900">
              {displayedMessage}
            </p>

            {/* Bubble Tail (RTL) */}
            <div
              className="absolute -right-2 top-5 w-2 h-3 overflow-hidden pointer-events-none rtl:block ltr:hidden"
              aria-hidden="true"
            >
              <div className="w-3 h-3 bg-white border-t border-r border-emerald-200/90 rotate-45 transform origin-top-left translate-x-[-1px] translate-y-[1px]" />
            </div>

            {/* Bubble Tail (LTR) */}
            <div
              className="absolute -left-2 top-5 w-2 h-3 overflow-hidden pointer-events-none ltr:block rtl:hidden"
              aria-hidden="true"
            >
              <div className="w-3 h-3 bg-white border-b border-l border-emerald-200/90 rotate-45 transform origin-bottom-right" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Daily Advice: Pure text, NO BOX, distraction-free */}
      <div className="pt-2 sm:pt-3">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>
              {isFa
                ? "برگچه در حال بررسی هوای امروز و احوال گیاهان شماست..."
                : "Checking today's weather and plant conditions..."}
            </span>
          </p>
        ) : advice ? (
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
            {advice}
          </p>
        ) : error ? (
          <div className="text-xs text-rose-600 flex items-center gap-2">
            <span>{error}</span>
            <button
              onClick={() => void fetchAdvice(true)}
              className="text-emerald-700 font-semibold underline hover:text-emerald-800"
            >
              {isFa ? "تلاش مجدد" : "Retry"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

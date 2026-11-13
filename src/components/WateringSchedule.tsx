"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import {
  Check,
  Droplets,
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PartyPopper,
  X,
} from "lucide-react"
import {
  getWateringLogAction,
  updatePlantsLastWateredAction,
  markWateringDoneAction,
  getWateringStreakAction,
} from "@/app/actions/plants"
import { Button } from "@/components/ui/button"
import { isSubscriptionActive } from "@/lib/subscription"
import { toLocalDateString } from "@/lib/relative-date"
import { partitionCareTasks } from "@/lib/care-tasks"
import { getXpForAction } from "@/lib/gamification"
import { usePlants, type Plant } from "@/components/PlantsProvider"
import { GamificationBar } from "@/components/schedule/GamificationBar"
import { CareTaskCard } from "@/components/schedule/CareTaskCard"
import { PlantMascot } from "@/components/mascot/PlantMascot"

export function WateringSchedule() {
  const { language } = useLanguage()
  const isFa = language === "fa"
  const { user, status } = useAuth()
  const { plants, refreshPlants } = usePlants()

  const [isDone, setIsDone] = useState(false)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(50)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [sessionWateredIds, setSessionWateredIds] = useState<Set<string>>(new Set())

  const today = toLocalDateString()
  const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)

  // Load XP from localStorage
  useEffect(() => {
    if (!user?.id) return
    try {
      const stored = localStorage.getItem(`jaliz_gardener_xp_${user.id}`)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed >= 0) {
          setXp(parsed)
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [user?.id])

  const saveXp = useCallback(
    (newXp: number) => {
      setXp(newXp)
      if (user?.id) {
        try {
          localStorage.setItem(`jaliz_gardener_xp_${user.id}`, String(newXp))
        } catch {
          // Ignore
        }
      }
    },
    [user?.id]
  )

  // Load data: check today's watering log and calculate streak
  const loadData = useCallback(async () => {
    if (!user || !subscribed) return
    try {
      const [logData, streakRes] = await Promise.all([
        getWateringLogAction(today),
        getWateringStreakAction(),
      ])
      setIsDone(!!logData)
      if (streakRes && typeof streakRes.streak === "number") {
        setStreak(streakRes.streak)
      }
    } catch (e) {
      console.error("Failed to load watering schedule data:", e)
    }
  }, [user, today, subscribed])

  useEffect(() => {
    if (status === "authenticated" && subscribed) {
      loadData()
    }
  }, [status, loadData, subscribed])

  if (!subscribed) {
    return null
  }

  // Partition plants into overdue, today, upcoming
  const partition = useMemo(() => {
    return partitionCareTasks(plants, isDone)
  }, [plants, isDone])

  // Merge overdue and today items as due tasks
  const dueItems = useMemo(() => {
    return [...partition.overdue, ...partition.today]
  }, [partition.overdue, partition.today])

  // Calculate actual completion with optimistic session items
  const actualCompletedCount = useMemo(() => {
    if (isDone) return dueItems.length
    return dueItems.filter(
      (item) => sessionWateredIds.has(item.plant.id) || item.plant.lastWatered?.startsWith(today)
    ).length
  }, [isDone, dueItems, sessionWateredIds, today])

  const completionPercentage = useMemo(() => {
    if (dueItems.length === 0) return 100
    if (isDone) return 100
    return Math.round((actualCompletedCount / dueItems.length) * 100)
  }, [dueItems.length, isDone, actualCompletedCount])

  // Check if a specific plant is considered watered today
  const isPlantWatered = (plantId: string) => {
    if (isDone) return true
    if (sessionWateredIds.has(plantId)) return true
    const p = plants.find((item) => item.id === plantId)
    if (p?.lastWatered && typeof p.lastWatered === "string") {
      return p.lastWatered.startsWith(today)
    }
    return false
  }

  // Single plant watering check
  const handleWaterSinglePlant = async (plantId: string) => {
    if (!user) return
    try {
      // Optimistic update
      setSessionWateredIds((prev) => new Set(prev).add(plantId))
      const addedXp = getXpForAction("water_plant")
      const nextXp = xp + addedXp
      saveXp(nextXp)

      await updatePlantsLastWateredAction([plantId], today)
      await refreshPlants()

      // Check if all due plants are now watered
      const nextCompleted = actualCompletedCount + 1
      if (nextCompleted >= dueItems.length && dueItems.length > 0) {
        await markWateringDoneAction(today)
        const bonusXp = getXpForAction("daily_complete")
        saveXp(nextXp + bonusXp)
        setIsDone(true)
        setStreak((prev) => prev + 1)
        setShowCelebration(true)
      }
    } catch (e) {
      console.error("Failed to water plant:", e)
      // Rollback on error
      setSessionWateredIds((prev) => {
        const copy = new Set(prev)
        copy.delete(plantId)
        return copy
      })
    }
  }

  // Batch "Water All" due plants
  const handleMarkAllDone = async () => {
    if (!user || batchLoading) return
    setBatchLoading(true)
    try {
      const unwateredIds = dueItems
        .filter((item) => !isPlantWatered(item.plant.id))
        .map((item) => item.plant.id)

      if (unwateredIds.length > 0) {
        await updatePlantsLastWateredAction(unwateredIds, today)
        setSessionWateredIds((prev) => {
          const next = new Set(prev)
          unwateredIds.forEach((id) => next.add(id))
          return next
        })
      }

      await markWateringDoneAction(today)

      const earnedXp =
        unwateredIds.length * getXpForAction("water_plant") + getXpForAction("daily_complete")
      saveXp(xp + earnedXp)

      await refreshPlants()
      await loadData()
      setIsDone(true)
      setStreak((prev) => prev + 1)
      setShowCelebration(true)
    } catch (e) {
      console.error("Failed to mark all done:", e)
    } finally {
      setBatchLoading(false)
    }
  }

  const unwateredCount = dueItems.filter((i) => !isPlantWatered(i.plant.id)).length

  const hasItemsAboveUpcoming =
    (partition.overdue.length > 0 && !isDone) ||
    (partition.today.length > 0 && !isDone) ||
    ((isDone || unwateredCount === 0) && dueItems.length > 0) ||
    plants.length === 0

  return (
    <div className="space-y-6">
      {/* 1. Gamification Bar */}
      <GamificationBar
        streak={streak}
        xp={xp}
        totalDueToday={dueItems.length}
        completedCount={actualCompletedCount}
        completionPercentage={completionPercentage}
      />

      {/* 2. Main Schedule Container */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Decorative background glows */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-200/30 blur-2xl" />

        {/* Task Segmentation Sections */}
        <div className="relative z-10 space-y-5">
          {/* SECTION A: OVERDUE TASKS (🚨 نیازمند رسیدگی فوری) */}
          {partition.overdue.length > 0 && !isDone && (
            <div className="space-y-3 rounded-2xl border border-rose-200/90 bg-rose-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>{isFa ? "نیازمند رسیدگی فوری (تاخیر خورده):" : "Urgent Care Needed (Overdue):"}</span>
                </div>
                <span className="text-xs font-black bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">
                  {partition.overdue.length} {isFa ? "گیاه" : "plants"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {partition.overdue.map((task) => (
                  <CareTaskCard
                    key={task.plant.id}
                    task={task}
                    isDone={isPlantWatered(task.plant.id)}
                    onWater={handleWaterSinglePlant}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: TODAY'S TASKS (💧 کارهای امروز) */}
          {partition.today.length > 0 && !isDone && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Droplets className="w-4 h-4 text-emerald-600" />
                  <span>{isFa ? "برنامه آبیاری امروز:" : "Scheduled for Today:"}</span>
                </div>
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  {partition.today.length} {isFa ? "گیاه" : "plants"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {partition.today.map((task) => (
                  <CareTaskCard
                    key={task.plant.id}
                    task={task}
                    isDone={isPlantWatered(task.plant.id)}
                    onWater={handleWaterSinglePlant}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Batch Action "Water All" button if multiple plants are due */}
          {!isDone && unwateredCount > 1 && (
            <div className="pt-2 flex justify-center">
              <Button
                onClick={handleMarkAllDone}
                disabled={batchLoading}
                className="group w-full sm:w-auto min-w-[240px] h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
              >
                <Check className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <span>
                  {batchLoading
                    ? isFa
                      ? "در حال ثبت همه..."
                      : "Marking all..."
                    : isFa
                    ? `آبیاری همه گیاهان امروز (${unwateredCount})`
                    : `Water All (${unwateredCount})`}
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ms-1">
                  +{unwateredCount * 10 + 25} XP
                </span>
              </Button>
            </div>
          )}

          {/* All Done for Today Celebration Card */}
          {(isDone || unwateredCount === 0) && dueItems.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm space-y-3">
              <div className="flex justify-center">
                <PlantMascot state="celebrating" size={88} />
              </div>
              <h4 className="text-base sm:text-lg font-black text-emerald-950">
                {isFa ? "تبریک! ماموریت مراقبت امروز تکمیل شد! 🎉" : "Congratulations! Today's care mission is complete! 🎉"}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800/80 max-w-md mx-auto">
                {isFa
                  ? "همه گیاهان باغچه شما سیراب شدند و در نهایت شادابی هستند. فردا با انرژی برگرد تا استمرار روزانه‌ات حفظ بشه!"
                  : "All your garden plants are hydrated and thriving. Check back tomorrow to keep your streak burning!"}
              </p>
            </div>
          )}

          {/* Empty Garden State */}
          {plants.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center space-y-3">
              <PlantMascot state="thriving" size={80} />
              <h4 className="font-bold text-slate-900 text-base">
                {isFa ? "هنوز گیاهی در جالیز ثبت نکرده‌اید" : "No plants registered yet"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {isFa
                  ? "از بخش «گیاهان من» اولین گلدانت رو ثبت کن تا برگچه برنامه آبیاری دقیق رو برات بچینه! 🌱"
                  : "Add your first plant in 'My Plants' so Bargcheh can build your smart irrigation schedule!"}
              </p>
            </div>
          )}

          {/* SECTION C: UPCOMING FORECAST (🌱 پیش‌بینی روزهای آینده) */}
          {partition.upcoming.length > 0 && (
            <div className={hasItemsAboveUpcoming ? "pt-4 border-t border-emerald-200/50" : ""}>
              <button
                type="button"
                onClick={() => setIsUpcomingExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between py-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isFa
                      ? `گیاهان بی‌نیاز امروز و روزهای آینده (${partition.upcoming.length})`
                      : `Upcoming Schedule (${partition.upcoming.length})`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <span>{isUpcomingExpanded ? (isFa ? "بستن" : "Hide") : (isFa ? "مشاهده" : "Show")}</span>
                  {isUpcomingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isUpcomingExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 animate-in fade-in duration-300">
                  {partition.upcoming.map((task) => (
                    <CareTaskCard
                      key={task.plant.id}
                      task={task}
                      isDone={isPlantWatered(task.plant.id)}
                      onWater={handleWaterSinglePlant}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Celebration Modal Dialog Overlay */}
      {showCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Close button */}
            <button
              onClick={() => setShowCelebration(false)}
              className="absolute top-4 end-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Mascot in full celebration mode */}
            <div className="flex justify-center mb-2">
              <PlantMascot state="celebrating" size={110} />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 mb-2">
              <PartyPopper className="w-3.5 h-3.5 text-amber-600" />
              <span>{isFa ? "ماموریت امروز انجام شد!" : "Daily Mission Complete!"}</span>
            </div>

            <h3 className="text-xl font-black text-slate-900">
              {isFa ? "ایول به استمرارت! 😎" : "Awesome Job! 😎"}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isFa
                ? "تمام گیاهان امروز سیراب شدند. امتیاز تجربه (XP) و استمرار روزانه‌ات با موفقیت ثبت شد!"
                : "All plants are hydrated. Your XP and streak have been successfully recorded!"}
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-center">
                <div className="text-[10px] text-amber-700 font-bold">{isFa ? "استمرار" : "Streak"}</div>
                <div className="text-base font-black text-amber-950">🔥 {streak} {isFa ? "روز" : "d"}</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-center">
                <div className="text-[10px] text-emerald-700 font-bold">{isFa ? "امتیاز کل" : "Total XP"}</div>
                <div className="text-base font-black text-emerald-950">⚡ {xp} XP</div>
              </div>
            </div>

            <Button
              onClick={() => setShowCelebration(false)}
              className="mt-5 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 shadow-md shadow-emerald-600/20"
            >
              <Sparkles className="w-4 h-4 me-1.5" />
              <span>{isFa ? "ادامه باغداری سبز 🌱" : "Continue Gardening 🌱"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

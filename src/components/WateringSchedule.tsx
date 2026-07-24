"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { Check, Droplets, Lock, Loader2 } from "lucide-react"
import { getUserPlantsAction, getWateringLogAction, updatePlantsLastWateredAction, markWateringDoneAction } from "@/app/actions/plants"
import { createSubscriptionPaymentAction } from "@/app/actions/payments"
import { Button } from "@/components/ui/button"
import {
  SUBSCRIPTION_PRICE_TOMAN,
  isSubscriptionActive,
} from "@/lib/subscription"

interface Plant {
  id: string
  name: string
  locationType: "Indoor" | "Outdoor"
  lightExposure: "Low Light" | "Partial Shade" | "Bright Indirect" | "Full Sun"
  potType: "Terracotta" | "Plastic" | "Ceramic" | "Metal" | "Other"
  hasDrainage: boolean
  lastWatered: string
  nextWateringDate?: string
  growingMedium: "Soil" | "Water"
  recentlyReplanted: boolean
  image?: string
}

function formatToman(amount: number, language: string): string {
  const formatted = new Intl.NumberFormat(language === "fa" ? "fa-IR" : "en-US").format(amount)
  return language === "fa" ? `${formatted} تومان` : `${formatted} Toman`
}

export function WateringSchedule() {
  const { language } = useLanguage()
  const { user, status, refreshUser } = useAuth()
  const [plants, setPlants] = useState<Plant[]>([])
  const [isDone, setIsDone] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const subscribedFlag = params.get("subscribed")
    const payment = params.get("payment")
    if (subscribedFlag === "1") {
      setBanner(language === "fa" ? "اشتراک شما با موفقیت فعال شد." : "Your subscription is now active.")
      void refreshUser()
    } else if (payment === "cancelled") {
      setBanner(language === "fa" ? "پرداخت لغو شد." : "Payment was cancelled.")
    } else if (payment === "failed") {
      setBanner(language === "fa" ? "تأیید پرداخت ناموفق بود. دوباره تلاش کنید." : "Payment verification failed. Please try again.")
    }
  }, [language, refreshUser])

  const loadData = useCallback(async () => {
    if (!user || !subscribed) return
    try {
      const plantData = await getUserPlantsAction()
      if (plantData) {
        setPlants(plantData.map((r) => ({
          id: r.id,
          name: r.name,
          locationType: (r.locationType as Plant["locationType"]) || "Indoor",
          lightExposure: (r.lightExposure as Plant["lightExposure"]) || "Bright Indirect",
          potType: (r.potType as Plant["potType"]) || "Plastic",
          hasDrainage: r.hasDrainage || true,
          lastWatered: r.lastWatered ? new Date(r.lastWatered).toISOString() : new Date().toISOString(),
          nextWateringDate: r.nextWateringDate ? new Date(r.nextWateringDate).toISOString() : undefined,
          growingMedium: (r.growingMedium as Plant["growingMedium"]) || "Soil",
          recentlyReplanted: r.recentlyReplanted || false,
          image: r.image ?? undefined,
        })))
      }

      const logData = await getWateringLogAction(today)
      setIsDone(!!logData)
    } catch (e) {
      console.error(e)
    }
  }, [user, today, subscribed])

  useEffect(() => {
    if (status === "authenticated" && subscribed) loadData()
  }, [status, loadData, subscribed])

  const needsWater = (plant: Plant) => {
    if (plant.nextWateringDate) {
      return new Date(plant.nextWateringDate) <= new Date()
    }
    const daysAgo = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 3600 * 24))
    let threshold = 7
    if (plant.locationType === "Outdoor") threshold -= 2
    if (plant.potType === "Terracotta") threshold -= 1
    if (plant.potType === "Plastic") threshold += 1
    if (plant.lightExposure === "Full Sun") threshold -= 2
    if (plant.lightExposure === "Low Light") threshold += 2
    return daysAgo >= Math.max(1, threshold)
  }

  const plantsToWater = plants.filter(needsWater)
  const plantsSkip = plants.filter((p) => !needsWater(p))

  const handleMarkAllDone = async () => {
    if (!user) return
    try {
      const ids = plantsToWater.map((p) => p.id)
      if (ids.length > 0) {
        await updatePlantsLastWateredAction(ids, today)
      }
      await markWateringDoneAction(today)
      await loadData()
      setIsDone(true)
    } catch (e) {
      console.error(e)
    }
  }

  const handleBuySubscription = async () => {
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const result = await createSubscriptionPaymentAction()
      if (!result.ok) {
        setCheckoutError(result.error)
        return
      }
      window.location.href = result.paymentUrl
    } catch (e) {
      console.error(e)
      setCheckoutError(
        language === "fa"
          ? "شروع پرداخت ممکن نشد. دوباره تلاش کنید."
          : "Could not start checkout. Please try again.",
      )
    } finally {
      setCheckoutLoading(false)
    }
  }

  const titleStr = language === "fa" ? "زمان آبیاری گیاهان 💧" : "Watering Schedule"
  const noPlantsStr = language === "fa" ? "تمامی گیاهان شما شاداب و بی‌نیاز از آبیاری هستند. 🌿" : "No plants to water today."
  const doneToday = language === "fa" ? "عالی بود! گیاهان شما امروز طراوت تازه‌ای گرفتند. ✨" : "Done for today!"
  const markDoneBtn = language === "fa" ? "آبیاری انجام شد" : "Mark as Done"

  if (!subscribed) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 text-emerald-950 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-teal-200/40 blur-3xl" />
        </div>

        {/* Blurred preview of locked schedule content */}
        <div className="select-none px-6 pb-8 pt-6 blur-[2.5px] opacity-50" aria-hidden>
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-2xl bg-emerald-100 p-2">
              <Droplets className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-emerald-800">{titleStr}</h3>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 rounded-2xl border border-emerald-100/50 bg-white/80 p-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-28 rounded bg-emerald-200/70" />
                  <div className="h-2 w-40 rounded bg-emerald-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-950/25 px-5 backdrop-blur-[1px]">
          <div className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/90 p-6 text-center shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950">
              {language === "fa" ? "یادآور آبیاری قفل است" : "Watering reminders are locked"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-emerald-800/80">
              {language === "fa"
                ? "با اشتراک ماهانه، برنامه آبیاری هوشمند گیاهانت را فعال کن."
                : "Unlock smart watering reminders for your plants with a monthly subscription."}
            </p>
            <p className="mt-4 text-2xl font-black tracking-tight text-emerald-900">
              {formatToman(SUBSCRIPTION_PRICE_TOMAN, language)}
              <span className="ms-1 text-sm font-semibold text-emerald-700/70">
                {language === "fa" ? "/ ماه" : "/ month"}
              </span>
            </p>
            {banner && (
              <p className="mt-3 text-xs font-medium text-amber-700">{banner}</p>
            )}
            {checkoutError && (
              <p className="mt-3 text-xs font-medium text-red-600">{checkoutError}</p>
            )}
            <Button
              onClick={handleBuySubscription}
              disabled={checkoutLoading}
              className="mt-5 w-full"
              size="lg"
            >
              {checkoutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>
                {language === "fa" ? "خرید اشتراک" : "Buy subscription"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-950 rounded-3xl p-6 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-100/50">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-200/40 blur-2xl" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-teal-200/30 blur-2xl" />
      {banner && (
        <div className="relative z-10 mb-4 rounded-2xl border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800">
          {banner}
        </div>
      )}
      <div className="mb-5 relative z-10">
        <h3 className="font-bold text-xl text-emerald-800 flex items-center gap-2">
          <div className="bg-emerald-100 p-2 rounded-2xl">
            <Droplets className="w-6 h-6 text-emerald-600" />
          </div>
          {titleStr}
        </h3>
        <p className="text-emerald-700/80 text-sm mt-2 font-medium">
          {isDone ? doneToday : plantsToWater.length > 0
            ? (language === "fa" ? `امروز ${plantsToWater.length} گیاه نیاز به توجه و آبیاری دارند.` : `${plantsToWater.length} plants need water today.`)
            : noPlantsStr}
        </p>
      </div>
      <div className="space-y-5 relative z-10">
        {!isDone && plantsToWater.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-700">{language === "fa" ? "نیازمند رسیدگی:" : "Needs Water:"}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plantsToWater.map((p) => (
                <div key={p.id} className="bg-white/80 backdrop-blur-sm border border-emerald-100/50 p-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-50" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-black uppercase shadow-inner">{p.name.substring(0, 2)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-emerald-900">{p.name}</div>
                    <div className="text-xs text-emerald-600/70 truncate mt-0.5 font-medium">
                      {p.locationType === "Indoor" ? (language === "fa" ? "داخل خانه" : "Indoor") : (language === "fa" ? "خارج خانه" : "Outdoor")} • {
                        p.potType === "Terracotta" ? (language === "fa" ? "سفالی" : "Terracotta") :
                        p.potType === "Plastic" ? (language === "fa" ? "پلاستیکی" : "Plastic") :
                        p.potType === "Ceramic" ? (language === "fa" ? "سرامیکی" : "Ceramic") :
                        p.potType === "Metal" ? (language === "fa" ? "فلزی" : "Metal") :
                        (language === "fa" ? "سایر" : "Other")
                      } • {
                        p.growingMedium === "Water" ? (language === "fa" ? "آب (هیدروپونیک)" : "Water (Hydroponic)") : (language === "fa" ? "خاک" : "Soil")
                      }
                  </div>
                </div>
              </div>
              ))}
            </div>
            <div className="pt-4 flex justify-center">
              <Button
                onClick={handleMarkAllDone}
                className="group w-full sm:w-auto min-w-[220px]"
              >
                <Check className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <span>{markDoneBtn}</span>
              </Button>
            </div>
          </div>
        )}
        {plantsSkip.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-emerald-200/50">
            <h4 className="text-sm font-bold text-emerald-600/70">{language === "fa" ? "شاداب و بی‌نیاز:" : "Skip:"}</h4>
            <div className="flex flex-wrap gap-2">
              {plantsSkip.map((p) => (
                <div key={p.id} className="bg-white/50 border border-emerald-100 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

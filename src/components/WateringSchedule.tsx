"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { Check, Droplets, Bell, BellRing } from "lucide-react"
import { getWateringLogAction, updatePlantsLastWateredAction, markWateringDoneAction } from "@/app/actions/plants"
import { Button } from "@/components/ui/button"
import { isSubscriptionActive } from "@/lib/subscription"
import { plantNeedsWater } from "@/lib/watering"
import { useWateringNotification } from "@/components/WateringNotificationProvider"
import { usePlants, type Plant } from "@/components/PlantsProvider"

export function WateringSchedule() {
  const { language } = useLanguage()
  const { user, status } = useAuth()
  const { plants, refreshPlants } = usePlants()
  const [isDone, setIsDone] = useState(false)
  const { permission, isSupported, requestPermissionAndNotify, sendTestNotification } = useWateringNotification()
  const [notifSending, setNotifSending] = useState(false)
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)

  const loadData = useCallback(async () => {
    if (!user || !subscribed) return
    try {
      const logData = await getWateringLogAction(today)
      setIsDone(!!logData)
    } catch (e) {
      console.error(e)
    }
  }, [user, today, subscribed])

  useEffect(() => {
    if (status === "authenticated" && subscribed) loadData()
  }, [status, loadData, subscribed])

  if (!subscribed) {
    return null
  }

  const needsWater = (plant: Plant) => plantNeedsWater(plant)

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
      await refreshPlants()
      await loadData()
      setIsDone(true)
    } catch (e) {
      console.error(e)
    }
  }

  const titleStr = language === "fa" ? "زمان آبیاری گیاهان 💧" : "Watering Schedule"
  const noPlantsStr = language === "fa" ? "تمامی گیاهان شما شاداب و بی‌نیاز از آبیاری هستند. 🌿" : "No plants to water today."
  const doneToday = language === "fa" ? "عالی بود! گیاهان شما امروز طراوت تازه‌ای گرفتند. ✨" : "Done for today!"
  const markDoneBtn = language === "fa" ? "آبیاری انجام شد" : "Mark as Done"

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-950 rounded-3xl p-6 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-100/50">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-200/40 blur-2xl" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-teal-200/30 blur-2xl" />
      <div className="mb-5 relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
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
        {isSupported && (
          <div className="flex items-center gap-2 shrink-0">
            {permission === "granted" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  setNotifSending(true)
                  await sendTestNotification(plantsToWater.length > 0 ? plantsToWater : plants)
                  setNotifSending(false)
                  setNotifFeedback(language === "fa" ? "اعلان ارسال شد!" : "Sent!")
                  setTimeout(() => setNotifFeedback(null), 3000)
                }}
                disabled={notifSending}
                className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border border-emerald-200/60 bg-white/70 hover:bg-emerald-100 text-emerald-800"
                title={language === "fa" ? "ارسال تست نوتیفیکیشن آبیاری" : "Test watering notification"}
              >
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                <span>{notifFeedback || (language === "fa" ? "تست اعلان" : "Test alert")}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setNotifSending(true)
                  const success = await requestPermissionAndNotify()
                  setNotifSending(false)
                  if (success) {
                    setNotifFeedback(language === "fa" ? "اعلان فعال شد!" : "Enabled!")
                  } else {
                    setNotifFeedback(language === "fa" ? "دسترسی داده نشد" : "Denied")
                  }
                  setTimeout(() => setNotifFeedback(null), 3000)
                }}
                disabled={notifSending}
                className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-emerald-200 bg-white/80 hover:bg-emerald-100 text-emerald-800 shadow-sm"
              >
                <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                <span>{notifFeedback || (language === "fa" ? "فعال‌سازی اعلان" : "Enable alert")}</span>
              </Button>
            )}
          </div>
        )}
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

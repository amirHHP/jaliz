"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CloudRain, Loader2, MapPin, Sparkles, RotateCw, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { getUserPlantsAction } from "@/app/actions/plants"
import { getWeatherAdviceAction } from "@/app/actions/ai"
import { isSubscriptionActive } from "@/lib/subscription"
import { getCachedDailyAdvice, setCachedDailyAdvice } from "@/lib/daily-advice-cache"
import { PlantMascot } from "@/components/mascot/PlantMascot"

export function WeatherAdvice() {
  const { user } = useAuth()
  const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)

  const [advice, setAdvice] = useState<string | null>(() => {
    if (typeof window === "undefined" || !user?.id || !subscribed) return null
    return getCachedDailyAdvice(user.id)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<string>("")
  const [isFromCache, setIsFromCache] = useState<boolean>(false)
  const { language, t } = useLanguage()
  const isFa = language === "fa"

  // Sync user location from localStorage
  useEffect(() => {
    const loc = typeof window !== "undefined" ? localStorage.getItem("jaliz-location") : null
    if (loc) {
      setUserLocation(loc)
    } else {
      setUserLocation(language === "en" ? "Tehran, IR" : "تهران، ایران")
    }
  }, [language])

  // Fetch advice implementation
  const fetchAdvice = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id || !subscribed) return

      // If not forced and already cached for today, use cache immediately
      if (!forceRefresh) {
        const cached = getCachedDailyAdvice(user.id)
        if (cached) {
          setAdvice(cached)
          setIsFromCache(true)
          setLoading(false)
          return
        }
      }

      setLoading(true)
      setError(null)
      setIsFromCache(false)

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
            ? "دریافت مشاوره با خطا مواجه شد. لطفاً دوباره تلاش کنید."
            : "An error occurred while fetching advice."
        )
      } finally {
        setLoading(false)
      }
    },
    [user?.id, subscribed, userLocation, language, isFa]
  )

  // Automated fetch on mount: check cache first, fetch if empty
  useEffect(() => {
    if (!subscribed || !user?.id) return

    const cached = getCachedDailyAdvice(user.id)
    if (cached) {
      setAdvice(cached)
      setIsFromCache(true)
      return
    }

    // Auto-fetch with 0 clicks required
    void fetchAdvice(false)
  }, [subscribed, user?.id, fetchAdvice])

  if (!subscribed) {
    return null
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-2 border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
      <CardHeader className="space-y-1 pb-4 border-b border-emerald-100/60 bg-emerald-50/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2.5 text-emerald-950 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>{isFa ? "توصیه روزانه هوشمند برگچه" : t("weather_title")}</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-emerald-800 bg-white/90 border border-emerald-200/80 px-2.5 py-1 rounded-full font-medium max-w-[160px] truncate shadow-2xs">
              <MapPin className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0 shrink-0 text-emerald-600" />
              <span className="truncate">{userLocation}</span>
            </div>

            {/* Subtle Force-Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void fetchAdvice(true)}
              disabled={loading}
              className="h-8 w-8 p-0 rounded-xl text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
              title={isFa ? "دریافت مجدد مشاوره امروز" : "Refresh today's advice"}
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-5 min-h-[120px] flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-emerald-700 space-y-3 py-6">
            <PlantMascot state="thriving" size={64} className="animate-pulse" />
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span>
                {isFa
                  ? "برگچه در حال تحلیل شرایط آب‌وهوا و نیازهای گیاهان شماست..."
                  : t("analyzing")}
              </span>
            </div>
          </div>
        ) : advice ? (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="relative rounded-2xl bg-white border border-emerald-100/80 p-4 sm:p-5 shadow-inner text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">🌱</span>
                <div className="flex-1 min-w-0">{advice}</div>
              </div>
            </div>

            {/* Cache & Status Subtitle */}
            <div className="flex items-center justify-between text-[11px] text-emerald-700/80 px-1 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isFa
                    ? "مشاوره اختصاصی برای تقویم امروز ثبت شد"
                    : "Tailored advice registered for today"}
                </span>
              </span>
              {isFromCache && (
                <span className="bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {isFa ? "حافظه روزانه (بدون هزینه)" : "Cached"}
                </span>
              )}
            </div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void fetchAdvice(true)}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              {isFa ? "تلاش دوباره" : "Retry"}
            </Button>
          </div>
        ) : (
          <div className="h-4"></div>
        )}
      </CardContent>

      {/* Footer if user wants manual refresh or error state */}
      {error && (
        <CardFooter className="bg-slate-50/50 pt-3 pb-3 border-t border-slate-100 flex justify-end">
          <Button
            size="sm"
            onClick={() => void fetchAdvice(true)}
            disabled={loading}
            className="rounded-xl text-xs"
          >
            {isFa ? "دریافت مجدد مشاوره" : "Fetch Advice"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

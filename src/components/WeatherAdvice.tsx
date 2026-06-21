"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CloudRain, Loader2, MapPin, Key } from "lucide-react"
import { AdviceMarketplaceStrip } from "@/components/marketplace/AdviceMarketplaceStrip"
import { useLanguage } from "@/components/LanguageProvider"
import { getUserPlantsAction } from "@/app/actions/plants"
import { getWeatherAdviceAction } from "@/app/actions/ai"

export function WeatherAdvice() {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<string>("")
  const { language, t } = useLanguage()

  useEffect(() => {
    // Read user location from localStorage or fallback
    const loc = localStorage.getItem("jaliz-location")
    if (loc) {
      setUserLocation(loc)
    } else {
      setUserLocation(language === "en" ? "Tehran, IR" : "تهران، ایران")
    }
  }, [language])

  const fetchAdvice = async () => {
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
          lastSoilChange: p.lastSoilChange ? new Date(p.lastSoilChange).toISOString().split("T")[0] : null,
        }))
      }

      const mockLocation = { latitude: 35.6892, longitude: 51.3890 }

      const responseData = await getWeatherAdviceAction({
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
        userLocation: userLocation,
        language: language,
        plants: userPlants
      })
      if (responseData && responseData.error) {
        throw new Error(responseData.error)
      }
      setAdvice(typeof responseData.advice === "string" ? responseData.advice : JSON.stringify(responseData.advice))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 text-slate-900 dark:text-white">
            <CloudRain className="h-5 w-5 text-emerald-500" />
            {t("weather_title")}
          </CardTitle>
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full font-medium max-w-[150px] truncate">
            <MapPin className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0 shrink-0" />
            <span className="truncate">{userLocation}</span>
          </div>
        </div>
        <CardDescription className="text-slate-500 dark:text-slate-400">{t("weather_desc")}</CardDescription>
      </CardHeader>

      <CardContent className="pb-4 min-h-[120px] flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-emerald-600 space-y-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-medium animate-pulse">{t("analyzing")}</span>
          </div>
        ) : advice ? (
          <div className="space-y-3">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 shadow-inner whitespace-pre-wrap text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              {advice}
            </div>
            <AdviceMarketplaceStrip adviceText={advice} />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-sm flex items-center gap-2">
            {error}
          </div>
        ) : (
          <div className="h-4"></div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50/50 dark:bg-slate-950/20 pt-4 border-t border-slate-100 dark:border-slate-850">
        <Button
          onClick={fetchAdvice}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
        >
          {loading ? t("generating_btn") : t("generate_btn")}
        </Button>
      </CardFooter>
    </Card>
  )
}

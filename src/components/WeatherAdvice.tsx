"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CloudRain, Loader2, MapPin } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"

export function WeatherAdvice() {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { language, t } = useLanguage()

  const fetchAdvice = async () => {
    setLoading(true)
    setError(null)
    try {
      const mockLocation = { latitude: 35.6892, longitude: 51.3890 }
      
      const response = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: mockLocation.latitude,
          longitude: mockLocation.longitude,
          language: language,
          plants: [
            { name: "Monstera Deliciosa", type: "Indoor Tropical" },
            { name: "Tomato", type: "Outdoor Vegetable" }
          ]
        })
      })

      if (!response.ok) {
        throw new Error("Failed to fetch advice")
      }

      const data = await response.json()
      setAdvice(data.advice)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 text-emerald-900">
            <CloudRain className="h-5 w-5 text-emerald-500" />
            {t("weather_title")}
          </CardTitle>
          <div className="flex items-center text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
            <MapPin className="h-3 w-3 mr-1" />
            {language === "en" ? "Tehran, IR" : "تهران، ایران"}
          </div>
        </div>
        <CardDescription>{t("weather_desc")}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4 min-h-[120px] flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-emerald-600 space-y-2 py-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-medium animate-pulse">{t("analyzing")}</span>
          </div>
        ) : advice ? (
          <div className="p-4 rounded-lg bg-white/80 border border-emerald-100 shadow-sm whitespace-pre-wrap text-emerald-900 text-sm leading-relaxed backdrop-blur-sm">
            {advice}
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        ) : (
          <div className="text-center text-emerald-600/70 py-6 text-sm">
            {t("advice_prompt")}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-emerald-50/50 pt-4">
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

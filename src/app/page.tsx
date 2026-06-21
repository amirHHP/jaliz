"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { Leaf, Plus, Droplets, Activity, X, MapPin, Sun, Box, Sprout, CheckCircle2, Image as ImageIcon, Sparkles, Info, Loader2, LogIn, UserPlus, Store, ArrowRight, Heart, Calendar, Camera, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { PlantModal } from "@/components/PlantModal"
import { MarketplaceGrid } from "@/components/MarketplaceGrid"
import { getUserPlantsAction, updateUserPlantAction, deleteUserPlantAction } from "@/app/actions/plants"
import { analyzePlantAction } from "@/app/actions/ai"

interface Plant {
  id: string
  name: string
  type: string
  locationType: "Indoor" | "Outdoor"
  lightExposure: "Low Light" | "Partial Shade" | "Bright Indirect" | "Full Sun"
  potType: "Terracotta" | "Plastic" | "Ceramic" | "Metal" | "Other"
  growingMedium: "Soil" | "Water"
  hasDrainage: boolean
  lastWatered: string
  nextWateringDate?: string
  wateringInterval: number
  recentlyReplanted: boolean
  lastSoilChange?: string
  health: "Excellent" | "Good" | "Needs Attention"
  image?: string
  careTips?: string
  wateringTips?: string
}

function safeDateString(val: any, fallback?: string): string | undefined {
  if (!val) return fallback
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return fallback
    return d.toISOString().split("T")[0]
  } catch {
    return fallback
  }
}

function dbRowToPlant(row: any): Plant {
  return {
    id: row.id,
    name: row.name,
    type: row.type ?? "",
    locationType: row.locationType ?? "Indoor",
    lightExposure: row.lightExposure ?? "Bright Indirect",
    potType: row.potType ?? "Plastic",
    growingMedium: row.growingMedium ?? "Soil",
    hasDrainage: row.hasDrainage ?? true,
    lastWatered: safeDateString(row.lastWatered, new Date().toISOString().split("T")[0])!,
    nextWateringDate: safeDateString(row.nextWateringDate),
    wateringInterval: row.wateringInterval ?? 7,
    recentlyReplanted: row.recentlyReplanted ?? false,
    lastSoilChange: safeDateString(row.lastSoilChange),
    health: row.health ?? "Excellent",
    image: row.image ?? undefined,
    careTips: row.careTips ?? undefined,
    wateringTips: row.wateringTips ?? undefined,
  }
}

export default function MyPlantsPage() {
  const { t, language } = useLanguage()
  const { user, status } = useAuth()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null)

  const fetchPlants = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await getUserPlantsAction()
      setPlants(data.map(dbRowToPlant))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (status === "authenticated") fetchPlants()
    else if (status === "unauthenticated") setLoading(false)
  }, [status, fetchPlants])

  const deletePlant = async (id: string) => {
    try {
      await deleteUserPlantAction(id)
      setPlants((prev) => prev.filter((p) => p.id !== id))
      setSelectedPlantId(null)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSavePlant = async (updated: Plant) => {
    try {
      const data = await updateUserPlantAction(updated.id, {
        name: updated.name,
        type: updated.type,
        locationType: updated.locationType,
        lightExposure: updated.lightExposure,
        potType: updated.potType,
        growingMedium: updated.growingMedium,
        hasDrainage: updated.hasDrainage,
        lastWatered: updated.lastWatered ? new Date(updated.lastWatered) : null,
        recentlyReplanted: updated.recentlyReplanted,
        lastSoilChange: updated.lastSoilChange ? new Date(updated.lastSoilChange) : null,
        health: updated.health,
        image: updated.image || null,
        careTips: updated.careTips || null,
        wateringTips: updated.wateringTips || null,
        wateringInterval: updated.wateringInterval,
      })
      if (data) {
        setPlants((prev) => prev.map((p) => p.id === updated.id ? dbRowToPlant(data) : p))
      }
      setSelectedPlantId(null)
    } catch (e) {
      console.error(e)
    }
  }

  const selectedPlant = plants.find((p) => p.id === selectedPlantId) ?? null

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return <PublicHomePage />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--background)] selection:bg-emerald-200 selection:text-emerald-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t("my_plants")}</h1>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">{plants.length}</span>
          </div>
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white">
            <Link href="/plants/new">
              <Plus className="h-4 w-4" />
              {t("add_plant")}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400">Loading...</div>
          ) : plants.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border-2 border-slate-200 dark:border-slate-800 border-dashed shadow-sm">
              <div className="w-24 h-24 bg-emerald-100/50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-6">
                <Leaf className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{t("no_plants_title" as any)}</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-lg">{t("no_plants_desc" as any)}</p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all px-6 py-6 text-base rounded-xl gap-2">
                <Link href="/plants/new">
                  <Plus className="h-5 w-5" />
                  {t("no_plants_cta" as any)}
                </Link>
              </Button>
            </div>
          ) : (
            plants.map((plant) => {
              const daysAgo = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 3600 * 24))
              const lastWateredText = daysAgo === 0 ? t("watered_today") : `${daysAgo} ${t("watered_days_ago")}`
              
              let nextWateringText = ""
              if (plant.nextWateringDate) {
                const diffTime = new Date(plant.nextWateringDate).getTime() - Date.now()
                const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24))
                if (language === "fa") {
                  if (diffDays < 0) {
                    nextWateringText = `آبیاری بعدی: ${Math.abs(diffDays)} روز تأخیر`
                  } else if (diffDays === 0) {
                    nextWateringText = "آبیاری بعدی: امروز"
                  } else if (diffDays === 1) {
                    nextWateringText = "آبیاری بعدی: فردا"
                  } else {
                    nextWateringText = `آبیاری بعدی: ${diffDays} روز دیگر`
                  }
                } else {
                  if (diffDays < 0) {
                    nextWateringText = `Next: ${Math.abs(diffDays)} days overdue`
                  } else if (diffDays === 0) {
                    nextWateringText = "Next: Today"
                  } else if (diffDays === 1) {
                    nextWateringText = "Next: Tomorrow"
                  } else {
                    nextWateringText = `Next: in ${diffDays} days`
                  }
                }
              }
              const wateringText = nextWateringText ? `${lastWateredText} (${nextWateringText})` : lastWateredText

              const healthText = plant.health === "Excellent" ? t("health_excellent") : plant.health === "Good" ? t("health_good") : t("health_needs_attention")
              const healthBadgeColor = plant.health === "Excellent" 
                ? "bg-emerald-50/90 text-emerald-700 border-emerald-200" 
                : plant.health === "Good"
                  ? "bg-amber-50/90 text-amber-700 border-amber-200"
                  : "bg-rose-50/90 text-rose-700 border-rose-200"

              return (
                <Card key={plant.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:-translate-y-1 flex flex-col cursor-pointer ring-0 hover:ring-2 hover:ring-emerald-300 dark:hover:ring-emerald-800" onClick={() => setSelectedPlantId(plant.id)}>
                  <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-b border-slate-100 dark:border-slate-800 shrink-0">
                    {plant.image ? (
                      <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                        <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Photo</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <div className={`inline-flex items-center text-[10px] font-bold border px-2 py-1 rounded-md shadow-sm uppercase tracking-wider ${healthBadgeColor} backdrop-blur-sm dark:bg-opacity-20`}>
                        {healthText}
                      </div>
                    </div>
                  </div>
                  <CardContent className="space-y-3 p-3 sm:p-5 grow flex flex-col">
                    <div>
                      <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {plant.name}
                      </CardTitle>
                    </div>
                    <div className="space-y-2 text-[10px] sm:text-xs pt-1">
                      <div className="flex items-start text-slate-600 dark:text-slate-300">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 me-1.5 sm:me-2 mt-0.5 text-indigo-400 dark:text-indigo-500" />
                        <span className="font-medium">
                          {plant.locationType === "Indoor" ? t("location_indoor") : t("location_outdoor")}
                        </span>
                      </div>
                      <div className="flex items-start text-slate-600 dark:text-slate-300">
                        <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 me-1.5 sm:me-2 mt-0.5 text-sky-500 dark:text-sky-600" />
                        <span className="font-medium">{wateringText}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
      {selectedPlant && <PlantModal plant={selectedPlant} onClose={() => setSelectedPlantId(null)} onSave={handleSavePlant} onDelete={deletePlant} />}
    </div>
  )
}

/** Public homepage for unauthenticated users: hero + marketplace */
function PublicHomePage() {
  const { t, language } = useLanguage()
  const isRtl = language === "fa"

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-emerald-200 selection:text-emerald-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      {/* ──── Hero Section ──── */}
      <section className="relative overflow-hidden">
        {/* Layered organic background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 dark:from-emerald-950/20 via-[var(--background)] to-[var(--background)]" />
        <div className="pointer-events-none absolute -top-20 end-[-10%] h-[420px] w-[420px] rounded-full bg-emerald-200/20 dark:bg-emerald-900/10 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 start-[-8%] h-[320px] w-[320px] rounded-full bg-teal-200/15 dark:bg-teal-900/10 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-0 start-1/3 h-[200px] w-[200px] rounded-full bg-lime-200/20 dark:bg-emerald-900/5 blur-[60px]" />

        <div className="container relative z-10 mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-24 max-w-5xl">
          {/* Emoji decoration strip */}
          <div className="flex justify-center gap-3 mb-8 text-2xl select-none" aria-hidden="true">
            <span className="animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }}>🌿</span>
            <span className="animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "3.5s" }}>🪴</span>
            <span className="animate-bounce" style={{ animationDelay: "0.6s", animationDuration: "2.8s" }}>💧</span>
            <span className="animate-bounce" style={{ animationDelay: "0.9s", animationDuration: "3.2s" }}>🌱</span>
            <span className="animate-bounce" style={{ animationDelay: "1.2s", animationDuration: "3s" }}>✨</span>
          </div>

          {/* Main heading */}
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-100/70 dark:bg-emerald-950/40 backdrop-blur-sm text-emerald-800 dark:text-emerald-300 text-xs font-bold px-4 py-2 rounded-full border border-emerald-200/50 dark:border-emerald-900/30 shadow-sm">
              <Sprout className="h-3.5 w-3.5" />
              {t("app_title")}
              <span className="text-emerald-600">—</span>
              <span className="font-medium text-emerald-700">{isRtl ? "دستیار مهربان گیاهان" : "Your Plant Companion"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              {t("landing_hero_title")}
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
              {t("landing_hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/register"
                className="inline-flex justify-center items-center gap-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white px-7 py-4 text-sm font-bold shadow-lg shadow-emerald-700/20 transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                {t("landing_cta_primary")}
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center items-center gap-2.5 rounded-full bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200 px-7 py-4 text-sm font-bold shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                {t("landing_cta_secondary")}
              </Link>
            </div>
          </div>

          {/* ──── Features Showcase ──── */}
          <div className="space-y-4">
            {/* Row 1: Two features side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Watering reminders */}
              <div className="group relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-emerald-100/60 dark:border-emerald-900/30 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] select-none">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100/60 dark:border-sky-900/40 flex items-center justify-center text-xl" aria-hidden="true">
                    💧
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                      {t("feature_watering_title" as any)}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("feature_watering_desc" as any)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plant tracking */}
              <div className="group relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-emerald-100/60 dark:border-emerald-900/30 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] select-none">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-center text-xl" aria-hidden="true">
                    🌱
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                      {t("feature_tracking_title" as any)}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("feature_tracking_desc" as any)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Two features side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* AI advice */}
              <div className="group relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-emerald-100/60 dark:border-emerald-900/30 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] select-none">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100/60 dark:border-amber-900/40 flex items-center justify-center text-xl" aria-hidden="true">
                    ✨
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                      {t("feature_ai_title" as any)}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("feature_ai_desc" as any)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketplace */}
              <div className="group relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-emerald-100/60 dark:border-emerald-900/30 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] select-none">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-900/40 flex items-center justify-center text-xl" aria-hidden="true">
                    🏘️
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                      {t("feature_marketplace_title" as any)}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t("feature_marketplace_desc" as any)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Marketplace section ──── */}
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <Store className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("mp_title" as never)}</h2>
            <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full font-medium">
              {t("market_within" as never)}
            </span>
          </div>
          <Link
            href="/marketplace"
            className="text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold inline-flex items-center gap-1.5 bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 px-3.5 py-2 rounded-full border border-emerald-100/60 dark:border-emerald-900/30 transition-colors"
          >
            {t("mp_view_all" as never)}
            <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? "rotate-180" : ""}`} />
          </Link>
        </div>
        <MarketplaceGrid hideHeader />
      </main>

      {/* ──── Bottom CTA ──── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700" />
        <div className="pointer-events-none absolute top-0 end-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-0 start-0 h-48 w-48 rounded-full bg-teal-400/15 blur-[60px]" />

        <div className="container relative z-10 mx-auto px-4 py-14 max-w-3xl text-center space-y-5">
          <div className="text-3xl select-none" aria-hidden="true">🌿</div>
          <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
            {isRtl
              ? "آماده‌ای مراقبت از گیاهانت رو شروع کنی؟"
              : "Ready to start caring for your plants?"}
          </h2>
          <p className="text-emerald-200/80 text-sm max-w-md mx-auto leading-relaxed">
            {isRtl
              ? "بازارچه رو آزادانه ببین، ولی برای یادآور آبیاری، مشاوره هوشمند و ثبت گیاهات ثبت‌نام کن."
              : "Browse the marketplace freely, but sign up to unlock watering reminders, AI advice, and plant tracking."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/register"
              className="inline-flex justify-center items-center gap-2.5 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 px-7 py-3.5 text-sm font-bold shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              {t("landing_cta_primary")}
            </Link>
            <Link
              href="/login"
              className="inline-flex justify-center items-center gap-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-3.5 text-sm font-bold backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              {t("landing_cta_secondary")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

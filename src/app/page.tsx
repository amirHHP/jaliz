"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { Leaf, Plus, Droplets, Activity, X, MapPin, Sun, Box, Sprout, CheckCircle2, Image as ImageIcon, Sparkles, Info, Loader2, LogIn, UserPlus, Store, ArrowRight } from "lucide-react"
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

function dbRowToPlant(row: any): Plant {
  return {
    id: row.id,
    name: row.name,
    type: row.type ?? "",
    locationType: row.locationType ?? "Indoor",
    lightExposure: row.lightExposure ?? "Bright Indirect",
    potType: row.potType ?? "Plastic",
    hasDrainage: row.hasDrainage ?? true,
    lastWatered: row.lastWatered ? new Date(row.lastWatered).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    nextWateringDate: row.nextWateringDate ? new Date(row.nextWateringDate).toISOString().split("T")[0] : undefined,
    wateringInterval: row.wateringInterval ?? 7,
    recentlyReplanted: row.recentlyReplanted ?? false,
    lastSoilChange: row.lastSoilChange ? new Date(row.lastSoilChange).toISOString().split("T")[0] : undefined,
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
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t("my_plants")}</h1>
            <span className="text-sm font-medium text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/60">{plants.length}</span>
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
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-200 border-dashed shadow-sm">
              <div className="w-24 h-24 bg-emerald-100/50 rounded-full flex items-center justify-center mb-6">
                <Leaf className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{t("no_plants_title" as any)}</h3>
              <p className="text-slate-500 max-w-md mb-8 text-lg">{t("no_plants_desc" as any)}</p>
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
                <Card key={plant.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 bg-white hover:-translate-y-1 flex flex-col cursor-pointer ring-0 hover:ring-2 hover:ring-emerald-300" onClick={() => setSelectedPlantId(plant.id)}>
                  <div className="w-full aspect-[4/5] bg-slate-100 relative overflow-hidden border-b border-slate-100 shrink-0">
                    {plant.image ? (
                      <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Photo</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <div className={`inline-flex items-center text-[10px] font-bold border px-2 py-1 rounded-md shadow-sm uppercase tracking-wider ${healthBadgeColor} backdrop-blur-sm`}>
                        {healthText}
                      </div>
                    </div>
                  </div>
                  <CardContent className="space-y-3 p-3 sm:p-5 grow flex flex-col">
                    <div>
                      <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-slate-900 leading-tight truncate">
                        {plant.name}
                      </CardTitle>
                    </div>
                    <div className="space-y-2 text-[10px] sm:text-xs pt-1">
                      <div className="flex items-center text-slate-600">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 me-1.5 sm:me-2 text-indigo-400" />
                        <span className="font-medium truncate">
                          {plant.locationType === "Indoor" ? t("location_indoor") : t("location_outdoor")}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 me-1.5 sm:me-2 text-sky-500" />
                        <span className="font-medium truncate">{wateringText}</span>
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

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900">
      <Header />

      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-emerald-100/50">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-lime-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -start-24 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Text */}
            <div className="flex-1 text-center md:text-start space-y-5">
              <div className="inline-flex items-center gap-2 bg-emerald-100/60 backdrop-blur-sm text-emerald-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-200/50">
                <Sprout className="h-3.5 w-3.5" />
                {t("app_title")}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                {t("landing_hero_title")}
              </h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-lg">
                {t("landing_hero_subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href="/register"
                  className="inline-flex justify-center items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  <UserPlus className="h-4 w-4" />
                  {t("landing_cta_primary")}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex justify-center items-center gap-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-6 py-3.5 text-sm font-bold shadow-sm transition-all hover:scale-[1.02]"
                >
                  <LogIn className="h-4 w-4" />
                  {t("landing_cta_secondary")}
                </Link>
              </div>
            </div>

            {/* Feature cards */}
            <div className="flex-1 grid grid-cols-2 gap-3 max-w-sm">
              {[
                { icon: Droplets, color: "text-sky-500 bg-sky-50", title: language === "fa" ? "یادآور آبیاری" : "Watering Reminders" },
                { icon: Sprout, color: "text-emerald-500 bg-emerald-50", title: language === "fa" ? "ثبت گیاهان" : "Plant Tracking" },
                { icon: Sparkles, color: "text-amber-500 bg-amber-50", title: language === "fa" ? "مشاوره هوشمند" : "AI Advice" },
                { icon: Store, color: "text-indigo-500 bg-indigo-50", title: language === "fa" ? "فروشگاه" : "Marketplace" },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${feat.color}`}>
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 text-center">{feat.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace section — public, SEO-friendly */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">{t("mp_title" as never)}</h2>
          </div>
          <Link
            href="/marketplace"
            className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
          >
            {t("mp_view_all" as never)}
            <ArrowRight className={`h-3.5 w-3.5 ${language === "fa" ? "rotate-180" : ""}`} />
          </Link>
        </div>
        <MarketplaceGrid />
      </main>

      {/* Login prompt footer */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-10">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-bold">
            {language === "fa"
              ? "برای ثبت گیاه، یادآور آبیاری و مشاوره هوشمند ثبت‌نام کنید"
              : "Sign up for plant tracking, watering reminders & AI advice"}
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto">
            {language === "fa"
              ? "فروشگاه رو بدون ثبت‌نام ببینید، ولی برای استفاده از امکانات حرفه‌ای وارد شوید."
              : "Browse the marketplace freely, but sign in to unlock all features."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex justify-center items-center gap-2 rounded-full bg-white text-emerald-700 hover:bg-emerald-50 px-6 py-3 text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              <UserPlus className="h-4 w-4" />
              {t("landing_cta_primary")}
            </Link>
            <Link
              href="/login"
              className="inline-flex justify-center items-center gap-2 rounded-full bg-emerald-700/50 hover:bg-emerald-700/70 text-white border border-emerald-400/30 px-6 py-3 text-sm font-bold transition-all hover:scale-[1.02]"
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

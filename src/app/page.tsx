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
import { getUserPlantsAction, updateUserPlantAction, deleteUserPlantAction, createUserPlantAction } from "@/app/actions/plants"
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
  
  const [draftPlant, setDraftPlant] = useState<any>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const isRtl = language === "fa"

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

  // Scan draft auto-detection
  useEffect(() => {
    if (status === "authenticated" && user) {
      const draft = localStorage.getItem("jaliz_scanned_plant_draft")
      if (draft) {
        try {
          setDraftPlant(JSON.parse(draft))
        } catch (e) {
          console.error("Failed to parse draft plant from local storage", e)
        }
      }
    }
  }, [status, user])

  const handleSaveDraftPlant = async () => {
    if (!draftPlant) return
    setIsSavingDraft(true)
    try {
      const data = await createUserPlantAction({
        name: draftPlant.name,
        type: draftPlant.type,
        locationType: draftPlant.locationType,
        lightExposure: draftPlant.lightExposure,
        potType: draftPlant.potType,
        growingMedium: draftPlant.growingMedium,
        hasDrainage: draftPlant.hasDrainage,
        lastWatered: draftPlant.lastWatered,
        recentlyReplanted: draftPlant.recentlyReplanted,
        health: draftPlant.health,
        image: draftPlant.image,
        careTips: draftPlant.careTips,
        wateringTips: draftPlant.wateringTips,
        wateringInterval: draftPlant.wateringInterval,
      })
      if (data) {
        localStorage.removeItem("jaliz_scanned_plant_draft")
        setDraftPlant(null)
        fetchPlants()
      }
    } catch (e) {
      console.error("Failed to save draft plant:", e)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleDismissDraft = () => {
    localStorage.removeItem("jaliz_scanned_plant_draft")
    setDraftPlant(null)
  }

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return <PublicHomePage />
  }

  return (
    <div className="page-shell">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("my_plants")}</h1>
            <span className="text-sm font-medium text-muted bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-border">{plants.length}</span>
          </div>
          <Button asChild className="gap-2">
            <Link href="/plants/new">
              <Plus className="h-4 w-4" />
              {t("add_plant")}
            </Link>
          </Button>
        </div>

        {/* Scanned Plant Draft Banner */}
        {draftPlant && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-teal-950/40 p-4 md:p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-md animate-slide-up flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 text-center sm:text-start flex-col sm:flex-row">
              {draftPlant.image ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-900">
                  <img src={draftPlant.image} alt="Scanned plant" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                  <Leaf className="w-8 h-8 text-emerald-600" />
                </div>
              )}
              <div className="space-y-1 text-right sm:text-right">
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  {t("store_scan_save_draft_modal_title")} ({draftPlant.name})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  {t("store_scan_save_draft_modal_desc").replace("{store}", draftPlant.store || (isRtl ? "فروشگاه" : "the store"))}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Button 
                onClick={handleSaveDraftPlant} 
                disabled={isSavingDraft}
                size="sm"
                className="grow sm:grow-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{isRtl ? "اضافه کردن به باغچه" : "Add to Garden"}</span>
              </Button>
              <Button 
                onClick={handleDismissDraft} 
                variant="ghost" 
                size="sm"
                className="grow sm:grow-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>{t("cancel")}</span>
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-muted">Loading...</div>
          ) : plants.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-card/50 backdrop-blur-sm rounded-2xl border-2 border-border border-dashed shadow-sm">
              <div className="w-24 h-24 bg-emerald-100/50 rounded-full flex items-center justify-center mb-6">
                <Leaf className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{t("no_plants_title" as any)}</h3>
              <p className="text-muted max-w-md mb-8 text-lg">{t("no_plants_desc" as any)}</p>
              <Button asChild size="lg" className="gap-2">
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
                <Card key={plant.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border bg-card hover:-translate-y-1 flex flex-col cursor-pointer ring-0 hover:ring-2 hover:ring-emerald-300 dark:hover:ring-emerald-700" onClick={() => setSelectedPlantId(plant.id)}>
                  <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-700 relative overflow-hidden border-b border-border shrink-0">
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
                      <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-card-foreground leading-tight truncate">
                        {plant.name}
                      </CardTitle>
                    </div>
                    <div className="space-y-2 text-[10px] sm:text-xs pt-1">
                      <div className="flex items-start text-muted">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 me-1.5 sm:me-2 mt-0.5 text-indigo-400" />
                        <span className="font-medium">
                          {plant.locationType === "Indoor" ? t("location_indoor") : t("location_outdoor")}
                        </span>
                      </div>
                      <div className="flex items-start text-muted">
                        <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 me-1.5 sm:me-2 mt-0.5 text-sky-500" />
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
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Droplets,
      color: "text-sky-500 bg-sky-50",
      activeColor: "text-sky-600 bg-sky-100/80 border-sky-300 ring-sky-100/50",
      title: language === "fa" ? "یادآور آبیاری" : "Watering Reminders",
      description: language === "fa"
        ? "تنظیم زمان‌بندی هوشمند، دریافت هشدارهای منظم و ثبت گزارش‌های آبیاری برای حفظ شادابی گیاهان."
        : "Set smart schedules, receive timely watering alerts, and log events to keep your plants thriving."
    },
    {
      icon: Sprout,
      color: "text-emerald-500 bg-emerald-50",
      activeColor: "text-emerald-600 bg-emerald-100/80 border-emerald-300 ring-emerald-100/50",
      title: language === "fa" ? "ثبت گیاهان" : "Plant Tracking",
      description: language === "fa"
        ? "ثبت مشخصات گیاه، نوع خاک، نیاز نوری، دفعات تعویض گلدان و تصویر رشد در شناسنامه گیاه."
        : "Log light needs, soil details, repotting history, and upload photos to follow growth over time."
    },
    {
      icon: Sparkles,
      color: "text-amber-500 bg-amber-50",
      activeColor: "text-amber-600 bg-amber-100/80 border-amber-300 ring-amber-100/50",
      title: language === "fa" ? "مشاوره هوشمند" : "AI Advice",
      description: language === "fa"
        ? "تشخیص دقیق بیماری‌ها از روی تصویر برگ، راه‌حل‌های علمی درمان و راهنمای گام‌به‌گام نگهداری."
        : "Identify pests and diseases from photos, receive expert care instructions, and get custom guidance."
    },
    {
      icon: Store,
      color: "text-indigo-500 bg-indigo-50",
      activeColor: "text-indigo-600 bg-indigo-100/80 border-indigo-300 ring-indigo-100/50",
      title: language === "fa" ? "فروشگاه" : "Marketplace",
      description: language === "fa"
        ? "خرید و فروش آسان و بدون واسطه گیاهان خانگی، قلمه‌های تازه و ملزومات باغبانی با اهالی محله."
        : "Buy, sell, or trade plants, fresh cuttings, and garden accessories directly in your neighborhood."
    }
  ]

  return (
    <div className="page-shell">
      <Header />

      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 border-b border-emerald-100/50 dark:border-emerald-900/50">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-lime-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -start-24 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Text */}
            <div className="flex-1 text-center md:text-start space-y-5">
              <div className="inline-flex items-center gap-2 bg-emerald-100/60 dark:bg-emerald-900/40 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                <Sprout className="h-3.5 w-3.5" />
                {t("app_title")}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                {t("landing_hero_title")}
              </h1>
              <p className="text-base md:text-lg text-muted leading-relaxed max-w-lg">
                {t("landing_hero_subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    {t("landing_cta_primary")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    {t("landing_cta_secondary")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Feature cards */}
            <div className="flex-1 grid grid-cols-2 gap-3 max-w-sm w-full">
              {features.map((feat, i) => {
                const isOpen = activeFeature === i
                return (
                  <div
                    key={i}
                    onClick={() => setActiveFeature(isOpen ? null : i)}
                    className={`cursor-pointer bg-card/80 backdrop-blur-sm rounded-2xl border p-4 flex flex-col items-center justify-start transition-all duration-300 select-none shadow-sm hover:shadow-md ${
                      isOpen
                        ? "border-emerald-300 dark:border-emerald-700 ring-4 ring-emerald-100/50 dark:ring-emerald-900/50 scale-[1.02] shadow-emerald-100/20"
                        : "border-border hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen ? feat.activeColor.split(" ").slice(0, 2).join(" ") : feat.color}`}>
                        <feat.icon className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "scale-110 rotate-6" : ""}`} />
                      </div>
                      <span className="text-xs font-semibold text-foreground text-center">{feat.title}</span>
                    </div>
                    {/* Collapsible description */}
                    <div className={`w-full transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-32 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                      <p className="text-[11px] text-muted leading-relaxed text-center border-t border-border pt-2 w-full">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace section — public, SEO-friendly */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
            <Button asChild variant="secondary" size="lg" className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50">
              <Link href="/register">
                <UserPlus className="h-4 w-4" />
                {t("landing_cta_primary")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 border-white/40 text-white hover:bg-white/10 hover:text-white bg-transparent">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                {t("landing_cta_secondary")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

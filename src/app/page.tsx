"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { Leaf, Plus, Droplets, Activity, X, MapPin, Sun, Box, Sprout, CheckCircle2, Image as ImageIcon, Sparkles, Info, Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { PlantModal } from "@/components/PlantModal"
import { getUserPlantsAction, updateUserPlantAction, deleteUserPlantAction } from "@/app/actions/plants"
import { analyzePlantAction } from "@/app/actions/ai"
import { LandingPage } from "@/components/LandingPage"

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
    return <LandingPage />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              return (
                <Card key={plant.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 bg-white hover:-translate-y-1 flex flex-col cursor-pointer ring-0 hover:ring-2 hover:ring-emerald-300" onClick={() => setSelectedPlantId(plant.id)}>
                  <div className="w-full h-36 bg-slate-100 relative overflow-hidden border-b border-slate-100 shrink-0">
                    {plant.image ? (
                      <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Photo</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3"><div className="inline-flex items-center text-[10px] font-bold bg-white/90 backdrop-blur-sm text-slate-700 px-2 py-1 rounded-md shadow-sm uppercase tracking-wider">{plant.type}</div></div>
                  </div>
                  <CardContent className="space-y-4 pt-5 pb-5 grow flex flex-col">
                    <div><CardTitle className="text-xl text-slate-900 leading-tight">{plant.name}</CardTitle></div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs pt-1">
                      <div className="flex items-center text-slate-600"><Droplets className="h-4 w-4 shrink-0 mr-2 text-sky-500" /><span className="font-medium truncate">{daysAgo === 0 ? t("watered_today") : `${daysAgo} ${t("watered_days_ago")}`}</span></div>
                      {plant.nextWateringDate && (
                        <div className="flex items-center text-slate-600 col-span-2 bg-sky-50/50 p-1.5 rounded-md border border-sky-100/50 mt-1">
                          <Droplets className="h-4 w-4 shrink-0 mr-2 text-sky-400" />
                          <span className="font-medium text-[11px]">
                            {language === "fa" ? "آبیاری بعدی: " : "Next Watering: "}
                            {new Intl.DateTimeFormat(language === "fa" ? 'fa-IR-u-ca-persian' : 'en-US', { dateStyle: 'medium' }).format(new Date(plant.nextWateringDate))}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-slate-600"><Activity className="h-4 w-4 shrink-0 mr-2 text-emerald-500" /><span className={`font-medium truncate ${plant.health === "Excellent" ? "text-emerald-600" : plant.health === "Good" ? "text-emerald-500" : "text-amber-500"}`}>{plant.health === "Excellent" ? t("health_excellent") : plant.health === "Good" ? t("health_good") : t("health_needs_attention")}</span></div>
                      <div className="flex items-center text-slate-600"><MapPin className="h-4 w-4 shrink-0 mr-2 text-indigo-400" /><span className="font-medium truncate">{plant.locationType === "Indoor" ? t("location_indoor") : t("location_outdoor")}</span></div>
                      <div className="flex items-center text-slate-600"><Sun className="h-4 w-4 shrink-0 mr-2 text-amber-400" /><span className="font-medium truncate">{plant.lightExposure === "Low Light" ? t("light_low") : plant.lightExposure === "Partial Shade" ? t("light_partial") : plant.lightExposure === "Bright Indirect" ? t("light_bright") : t("light_full")}</span></div>
                      <div className="flex items-center text-slate-600"><Box className="h-4 w-4 shrink-0 mr-2 text-amber-700/60" /><span className="font-medium truncate">{plant.potType === "Terracotta" ? t("pot_terracotta") : plant.potType === "Plastic" ? t("pot_plastic") : plant.potType === "Ceramic" ? t("pot_ceramic") : plant.potType === "Metal" ? t("pot_metal") : t("pot_other")}</span></div>
                      <div className="flex items-center text-slate-600"><Droplets className="h-4 w-4 shrink-0 mr-2 text-slate-300" /><span className="font-medium truncate flex items-center gap-1">{t("has_drainage")}{plant.hasDrainage ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-red-400" />}</span></div>
                    </div>
                    {plant.recentlyReplanted && <div className="pt-2 border-t border-slate-100 flex items-center text-amber-600 text-xs font-medium"><Sprout className="h-4 w-4 shrink-0 mr-1.5" />{t("recently_replanted")}</div>}

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

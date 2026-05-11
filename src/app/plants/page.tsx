"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { Leaf, Plus, Droplets, Activity, X, MapPin, Sun, Box, Sprout, CheckCircle2, Image as ImageIcon, Sparkles, Info } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { PlantModal } from "@/components/PlantModal"
import { getUserPlantsAction, createUserPlantAction, updateUserPlantAction, deleteUserPlantAction } from "@/app/actions/plants"

interface Plant {
  id: string
  name: string
  type: string
  locationType: "Indoor" | "Outdoor"
  lightExposure: "Low Light" | "Partial Shade" | "Bright Indirect" | "Full Sun"
  potType: "Terracotta" | "Plastic" | "Ceramic" | "Metal" | "Other"
  hasDrainage: boolean
  lastWatered: string
  recentlyReplanted: boolean
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
    recentlyReplanted: row.recentlyReplanted ?? false,
    health: row.health ?? "Excellent",
    image: row.image ?? undefined,
    careTips: row.careTips ?? undefined,
    wateringTips: row.wateringTips ?? undefined,
  }
}

export default function MyPlantsPage() {
  const { t } = useLanguage()
  const { user, status } = useAuth()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null)

  // Form state
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState("")
  const [newLocationType, setNewLocationType] = useState<Plant["locationType"]>("Indoor")
  const [newLightExposure, setNewLightExposure] = useState<Plant["lightExposure"]>("Bright Indirect")
  const [newPotType, setNewPotType] = useState<Plant["potType"]>("Plastic")
  const [newHasDrainage, setNewHasDrainage] = useState(true)
  const [newLastWatered, setNewLastWatered] = useState("")
  const [newRecentlyReplanted, setNewRecentlyReplanted] = useState(false)
  const [newHealth, setNewHealth] = useState<Plant["health"]>("Excellent")
  const [newImage, setNewImage] = useState<string>("")
  const [newCareTips, setNewCareTips] = useState("")
  const [newWateringTips, setNewWateringTips] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX = 800
        let w = img.width, h = img.height
        if (w > h ? w > MAX : h > MAX) {
          if (w > h) { h *= MAX / w; w = MAX } else { w *= MAX / h; h = MAX }
        }
        canvas.width = w; canvas.height = h
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h)
        setNewImage(canvas.toDataURL("image/jpeg", 0.7))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleAIAnalyze = async () => {
    if (!newName.trim() && !newImage) { alert("Please provide a plant name or image."); return }
    setIsAnalyzing(true)
    try {
      const apiKey = localStorage.getItem("jaliz-api-key") || ""
      const modelName = localStorage.getItem("jaliz-model") || "gemini-1.5-pro"
      const lang = localStorage.getItem("jaliz-lang") || "en"
      const response = await fetch("/api/analyze-plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: newImage, name: newName, language: lang, api_key: apiKey, model_name: modelName }),
      })
      if (!response.ok) throw new Error("Analysis failed. Check your API key in settings.")
      const data = await response.json()
      if (data.name) setNewName(data.name)
      if (data.type) setNewType(data.type)
      if (data.locationType) setNewLocationType(data.locationType)
      if (data.lightExposure) setNewLightExposure(data.lightExposure)
      if (data.potType) setNewPotType(data.potType)
      if (data.hasDrainage !== undefined) setNewHasDrainage(data.hasDrainage)
      if (data.careTips) setNewCareTips(data.careTips)
      if (data.wateringTips) setNewWateringTips(data.wateringTips)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to analyze plant")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !user) return
    try {
      const data = await createUserPlantAction({
        name: newName,
        type: newType || "Unknown",
        locationType: newLocationType,
        lightExposure: newLightExposure,
        potType: newPotType,
        hasDrainage: newHasDrainage,
        lastWatered: newLastWatered ? new Date(newLastWatered) : new Date(),
        recentlyReplanted: newRecentlyReplanted,
        health: newHealth,
        image: newImage || null,
        careTips: newCareTips || null,
        wateringTips: newWateringTips || null,
      })
      if (data) {
        setPlants((prev) => [...prev, dbRowToPlant(data)])
        setIsAdding(false)
        setNewName(""); setNewType(""); setNewLocationType("Indoor")
        setNewLightExposure("Bright Indirect"); setNewPotType("Plastic")
        setNewHasDrainage(true); setNewLastWatered(""); setNewRecentlyReplanted(false)
        setNewHealth("Excellent"); setNewImage(""); setNewCareTips(""); setNewWateringTips("")
      }
    } catch (e) {
      console.error(e)
    }
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
        hasDrainage: updated.hasDrainage,
        lastWatered: updated.lastWatered ? new Date(updated.lastWatered) : null,
        recentlyReplanted: updated.recentlyReplanted,
        health: updated.health,
        image: updated.image || null,
        careTips: updated.careTips || null,
        wateringTips: updated.wateringTips || null,
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

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t("my_plants")}</h1>
            <p className="text-slate-500 mt-1">{plants.length} plants in your collection</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white">
              <Plus className="h-4 w-4" />
              {t("add_plant")}
            </Button>
          )}
        </div>

        {isAdding && (
          <Card className="mb-8 border-slate-200 shadow-md animate-in fade-in slide-in-from-top-4 overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row justify-between items-center bg-slate-50 border-b border-slate-200 pb-4">
              <CardTitle className="text-xl text-slate-800">{t("add_new_plant")}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-800 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleAddPlant} className="bg-white">
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="col-span-1 md:col-span-2 mb-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-emerald-800 font-medium flex items-center gap-2"><Sparkles className="h-4 w-4" />AI Auto-fill</h4>
                    <p className="text-sm text-emerald-600 mt-1">Type the plant name or upload an image below, then let AI fill in the rest!</p>
                  </div>
                  <Button type="button" onClick={handleAIAnalyze} disabled={isAnalyzing || (!newName && !newImage)} className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap shadow-sm">
                    {isAnalyzing ? "Analyzing..." : "Auto-fill with AI"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("plant_name")} *</label>
                  <input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("plant_name_ph")} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("plant_type")}</label>
                  <input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder={t("plant_type_ph")} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("location_type")}</label>
                  <select value={newLocationType} onChange={(e) => setNewLocationType(e.target.value as Plant["locationType"])} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900">
                    <option value="Indoor">{t("location_indoor")}</option>
                    <option value="Outdoor">{t("location_outdoor")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("light_exposure")}</label>
                  <select value={newLightExposure} onChange={(e) => setNewLightExposure(e.target.value as Plant["lightExposure"])} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900">
                    <option value="Low Light">{t("light_low")}</option>
                    <option value="Partial Shade">{t("light_partial")}</option>
                    <option value="Bright Indirect">{t("light_bright")}</option>
                    <option value="Full Sun">{t("light_full")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("pot_type")}</label>
                  <select value={newPotType} onChange={(e) => setNewPotType(e.target.value as Plant["potType"])} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900">
                    <option value="Terracotta">{t("pot_terracotta")}</option>
                    <option value="Plastic">{t("pot_plastic")}</option>
                    <option value="Ceramic">{t("pot_ceramic")}</option>
                    <option value="Metal">{t("pot_metal")}</option>
                    <option value="Other">{t("pot_other")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("last_watered")}</label>
                  <input type="date" value={newLastWatered} onChange={(e) => setNewLastWatered(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("health_status")}</label>
                  <select value={newHealth} onChange={(e) => setNewHealth(e.target.value as Plant["health"])} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900">
                    <option value="Excellent">{t("health_excellent")}</option>
                    <option value="Good">{t("health_good")}</option>
                    <option value="Needs Attention">{t("health_needs_attention")}</option>
                  </select>
                </div>
                <div className="space-y-2 flex items-center h-full pt-6 gap-2">
                  <input type="checkbox" checked={newHasDrainage} onChange={(e) => setNewHasDrainage(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                  <label className="text-sm font-medium text-slate-700">{t("has_drainage")}</label>
                </div>
                <div className="space-y-2 flex items-center h-full pt-6 gap-2">
                  <input type="checkbox" checked={newRecentlyReplanted} onChange={(e) => setNewRecentlyReplanted(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                  <label className="text-sm font-medium text-slate-700">{t("recently_replanted")}</label>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">{t("plant_image")}</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium file:px-3 file:py-1 file:rounded-md file:mr-3 text-slate-900" />
                  {newImage && <div className="mt-4 h-40 w-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm"><img src={newImage} alt="Preview" className="w-full h-full object-cover" /></div>}
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">{t("care_tips")}</label>
                  <textarea value={newCareTips} onChange={(e) => setNewCareTips(e.target.value)} placeholder={t("care_tips_ph")} dir="auto" className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-400" />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">{t("watering_tips")}</label>
                  <textarea value={newWateringTips} onChange={(e) => setNewWateringTips(e.target.value)} placeholder={t("watering_tips_ph")} dir="auto" className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-400" />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-3 pt-4 pb-6 bg-slate-50/50 border-t border-slate-100 mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-slate-600">{t("cancel")}</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">{t("save")}</Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400">Loading...</div>
          ) : plants.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed shadow-sm">
              <Leaf className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">{t("no_plants")}</p>
            </div>
          ) : (
            plants.map((plant) => {
              const daysAgo = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 3600 * 24))
              return (
                <Card key={plant.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 bg-white hover:-translate-y-1 flex flex-col cursor-pointer ring-0 hover:ring-2 hover:ring-emerald-300" onClick={() => setSelectedPlantId(plant.id)}>
                  <div className="w-full h-48 bg-slate-100 relative overflow-hidden border-b border-slate-100 shrink-0">
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
                      <div className="flex items-center text-slate-600"><Activity className="h-4 w-4 shrink-0 mr-2 text-emerald-500" /><span className={`font-medium truncate ${plant.health === "Excellent" ? "text-emerald-600" : plant.health === "Good" ? "text-emerald-500" : "text-amber-500"}`}>{plant.health === "Excellent" ? t("health_excellent") : plant.health === "Good" ? t("health_good") : t("health_needs_attention")}</span></div>
                      <div className="flex items-center text-slate-600"><MapPin className="h-4 w-4 shrink-0 mr-2 text-indigo-400" /><span className="font-medium truncate">{plant.locationType === "Indoor" ? t("location_indoor") : t("location_outdoor")}</span></div>
                      <div className="flex items-center text-slate-600"><Sun className="h-4 w-4 shrink-0 mr-2 text-amber-400" /><span className="font-medium truncate">{plant.lightExposure === "Low Light" ? t("light_low") : plant.lightExposure === "Partial Shade" ? t("light_partial") : plant.lightExposure === "Bright Indirect" ? t("light_bright") : t("light_full")}</span></div>
                      <div className="flex items-center text-slate-600"><Box className="h-4 w-4 shrink-0 mr-2 text-amber-700/60" /><span className="font-medium truncate">{plant.potType === "Terracotta" ? t("pot_terracotta") : plant.potType === "Plastic" ? t("pot_plastic") : plant.potType === "Ceramic" ? t("pot_ceramic") : plant.potType === "Metal" ? t("pot_metal") : t("pot_other")}</span></div>
                      <div className="flex items-center text-slate-600"><Droplets className="h-4 w-4 shrink-0 mr-2 text-slate-300" /><span className="font-medium truncate flex items-center gap-1">{t("has_drainage")}{plant.hasDrainage ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-red-400" />}</span></div>
                    </div>
                    {plant.recentlyReplanted && <div className="pt-2 border-t border-slate-100 flex items-center text-amber-600 text-xs font-medium"><Sprout className="h-4 w-4 shrink-0 mr-1.5" />{t("recently_replanted")}</div>}
                    {(plant.careTips || plant.wateringTips) && (
                      <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                        {plant.careTips && <div className="flex items-start text-xs text-slate-600"><Info className="h-3.5 w-3.5 shrink-0 mr-1.5 text-emerald-500 mt-0.5" /><span className="leading-snug">{plant.careTips}</span></div>}
                        {plant.wateringTips && <div className="flex items-start text-xs text-slate-600"><Droplets className="h-3.5 w-3.5 shrink-0 mr-1.5 text-sky-500 mt-0.5" /><span className="leading-snug">{plant.wateringTips}</span></div>}
                      </div>
                    )}
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

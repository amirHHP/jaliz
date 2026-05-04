"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { Leaf, Plus, Droplets, Activity, X, Globe, Settings } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SettingsModal } from "@/components/SettingsModal"

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
}

export default function MyPlantsPage() {
  const { language, setLanguage, t } = useLanguage()
  const [plants, setPlants] = useState<Plant[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // Form State
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState("")
  const [newLocationType, setNewLocationType] = useState<Plant["locationType"]>("Indoor")
  const [newLightExposure, setNewLightExposure] = useState<Plant["lightExposure"]>("Bright Indirect")
  const [newPotType, setNewPotType] = useState<Plant["potType"]>("Plastic")
  const [newHasDrainage, setNewHasDrainage] = useState(true)
  const [newLastWatered, setNewLastWatered] = useState("")
  const [newRecentlyReplanted, setNewRecentlyReplanted] = useState(false)
  const [newHealth, setNewHealth] = useState<Plant["health"]>("Excellent")

  useEffect(() => {
    const saved = localStorage.getItem("jaliz-plants")
    if (saved) {
      setPlants(JSON.parse(saved))
    } else {
      setPlants([
        { 
          id: "1", name: "Monstera Deliciosa", type: "Indoor Tropical", 
          locationType: "Indoor", lightExposure: "Bright Indirect", potType: "Ceramic", 
          hasDrainage: true, lastWatered: new Date().toISOString().split('T')[0], 
          recentlyReplanted: false, health: "Excellent" 
        },
        { 
          id: "2", name: "Tomato", type: "Outdoor Vegetable", 
          locationType: "Outdoor", lightExposure: "Full Sun", potType: "Plastic", 
          hasDrainage: true, lastWatered: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], 
          recentlyReplanted: true, health: "Good" 
        }
      ])
    }
  }, [])

  const savePlants = (newPlants: Plant[]) => {
    setPlants(newPlants)
    localStorage.setItem("jaliz-plants", JSON.stringify(newPlants))
  }

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newPlant: Plant = {
      id: Date.now().toString(),
      name: newName,
      type: newType || "Unknown",
      locationType: newLocationType,
      lightExposure: newLightExposure,
      potType: newPotType,
      hasDrainage: newHasDrainage,
      lastWatered: newLastWatered || new Date().toISOString().split('T')[0],
      recentlyReplanted: newRecentlyReplanted,
      health: newHealth
    }

    savePlants([...plants, newPlant])
    setIsAdding(false)
    setNewName("")
    setNewType("")
    setNewLocationType("Indoor")
    setNewLightExposure("Bright Indirect")
    setNewPotType("Plastic")
    setNewHasDrainage(true)
    setNewLastWatered("")
    setNewRecentlyReplanted(false)
    setNewHealth("Excellent")
  }

  const deletePlant = (id: string) => {
    savePlants(plants.filter(p => p.id !== id))
  }

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en")
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <div className="p-2 bg-emerald-100 rounded-xl shadow-sm">
              <Leaf className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{t("app_title")}</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="/" className="text-slate-600 hover:text-emerald-700 transition-colors">{t("dashboard")}</a>
            <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors">{t("marketplace")}</a>
            <a href="/plants" className="text-emerald-700 font-semibold transition-colors">{t("my_plants")}</a>
          </nav>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200"
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "فارسی" : "English"}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center h-9 w-9 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors bg-slate-100 rounded-full border border-slate-200"
            >
              <Settings className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded-full bg-emerald-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("plant_name")} *</label>
                  <input 
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={t("plant_name_ph")}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("location_type")}</label>
                  <select 
                    value={newLocationType}
                    onChange={e => setNewLocationType(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900"
                  >
                    <option value="Indoor">{t("location_indoor")}</option>
                    <option value="Outdoor">{t("location_outdoor")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("light_exposure")}</label>
                  <select 
                    value={newLightExposure}
                    onChange={e => setNewLightExposure(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900"
                  >
                    <option value="Low Light">{t("light_low")}</option>
                    <option value="Partial Shade">{t("light_partial")}</option>
                    <option value="Bright Indirect">{t("light_bright")}</option>
                    <option value="Full Sun">{t("light_full")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("pot_type")}</label>
                  <select 
                    value={newPotType}
                    onChange={e => setNewPotType(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900"
                  >
                    <option value="Terracotta">{t("pot_terracotta")}</option>
                    <option value="Plastic">{t("pot_plastic")}</option>
                    <option value="Ceramic">{t("pot_ceramic")}</option>
                    <option value="Metal">{t("pot_metal")}</option>
                    <option value="Other">{t("pot_other")}</option>
                  </select>
                </div>
                <div className="space-y-2 flex items-center h-full pt-6 gap-2">
                  <input 
                    type="checkbox"
                    checked={newHasDrainage}
                    onChange={e => setNewHasDrainage(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <label className="text-sm font-medium text-slate-700">{t("has_drainage")}</label>
                </div>
                <div className="space-y-2 flex items-center h-full pt-6 gap-2">
                  <input 
                    type="checkbox"
                    checked={newRecentlyReplanted}
                    onChange={e => setNewRecentlyReplanted(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <label className="text-sm font-medium text-slate-700">{t("recently_replanted")}</label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("last_watered")}</label>
                  <input 
                    type="date"
                    value={newLastWatered}
                    onChange={e => setNewLastWatered(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t("health_status")}</label>
                  <select 
                    value={newHealth}
                    onChange={e => setNewHealth(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900"
                  >
                    <option value="Excellent">{t("health_excellent")}</option>
                    <option value="Good">{t("health_good")}</option>
                    <option value="Needs Attention">{t("health_needs_attention")}</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">{t("plant_image")}</label>
                  <input 
                    type="file"
                    accept="image/*"
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium file:px-3 file:py-1 file:rounded-md file:mr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-3 pt-4 pb-6 bg-slate-50/50 border-t border-slate-100 mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-slate-600">
                  {t("cancel")}
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  {t("save")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed shadow-sm">
              <Leaf className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">{t("no_plants")}</p>
            </div>
          ) : (
            plants.map(plant => {
              const daysAgo = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 3600 * 24))
              return (
                <Card key={plant.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-md border-slate-200 bg-white hover:-translate-y-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 z-10 transition-opacity"
                    onClick={() => deletePlant(plant.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardHeader className="pb-3 border-b border-slate-50/50">
                    <CardTitle className="text-xl text-slate-900 pr-8">{plant.name}</CardTitle>
                    <div className="inline-flex items-center text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md w-fit mt-2">
                      {plant.type}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-600">
                        <Droplets className="h-4 w-4 ml-0 mr-2 rtl:ml-2 rtl:mr-0 text-sky-500" />
                        <span className="text-slate-800 font-medium">
                          {daysAgo === 0 ? t("watered_today") : `${daysAgo} ${t("watered_days_ago")}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                      <div className="flex items-center text-slate-600">
                        <Activity className="h-4 w-4 ml-0 mr-2 rtl:ml-2 rtl:mr-0 text-emerald-500" />
                        <span className={`font-medium ${
                          plant.health === 'Excellent' ? 'text-emerald-600' : 
                          plant.health === 'Good' ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {plant.health === 'Excellent' ? t("health_excellent") : 
                           plant.health === 'Good' ? t("health_good") : t("health_needs_attention")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

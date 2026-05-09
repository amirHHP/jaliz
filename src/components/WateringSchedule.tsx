"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { Check, Droplets, Info } from "lucide-react"

// Types
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

export function WateringSchedule() {
  const { t, language } = useLanguage()
  const [plants, setPlants] = useState<Plant[]>([])
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("jaliz-plants")
    if (saved) {
      setPlants(JSON.parse(saved))
    }
    
    // Check if we already marked today as done
    const lastDone = localStorage.getItem("jaliz-watering-done")
    if (lastDone === new Date().toISOString().split('T')[0]) {
      setIsDone(true)
    }
  }, [])

  const needsWater = (plant: Plant) => {
    const daysAgo = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 3600 * 24))
    let threshold = 7
    if (plant.locationType === 'Outdoor') threshold -= 2
    if (plant.potType === 'Terracotta') threshold -= 1
    if (plant.potType === 'Plastic') threshold += 1
    if (plant.lightExposure === 'Full Sun') threshold -= 2
    if (plant.lightExposure === 'Low Light') threshold += 2
    
    // Ensure minimum threshold of 1 day
    threshold = Math.max(1, threshold)
    
    return daysAgo >= threshold
  }

  const plantsToWater = plants.filter(needsWater)
  const plantsSkip = plants.filter(p => !needsWater(p))

  const handleMarkAllDone = () => {
    // Update lastWatered for plants that needed water
    const updatedPlants = plants.map(p => {
      if (needsWater(p)) {
        return { ...p, lastWatered: new Date().toISOString().split('T')[0] }
      }
      return p
    })
    
    setPlants(updatedPlants)
    localStorage.setItem("jaliz-plants", JSON.stringify(updatedPlants))
    
    // Mark today as done
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem("jaliz-watering-done", today)
    setIsDone(true)
  }

  // Default strings in case they don't exist in translations
  const titleStr = t("watering_title") || (language === "fa" ? "برنامه آبیاری" : "Watering Schedule")
  const noPlantsStr = language === "fa" ? "هیچ گیاهی برای آبیاری در امروز وجود ندارد." : "No plants to water today."
  const needsWaterTitle = language === "fa" ? "نیاز به آب:" : "Needs Water:"
  const skipWaterTitle = language === "fa" ? "نیاز ندارد:" : "Skip:"
  const doneToday = language === "fa" ? "کار امروز انجام شد!" : "Done for today!"
  const markDoneBtn = language === "fa" ? "انجام شد" : "Mark as Done"

  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-600/30 blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <h3 className="font-semibold text-lg text-emerald-50 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-emerald-400" />
            {titleStr}
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            {isDone 
              ? doneToday 
              : plantsToWater.length > 0 
                ? (language === "fa" ? `${plantsToWater.length} گیاه امروز به آب نیاز دارند.` : `${plantsToWater.length} plants need water today.`)
                : noPlantsStr
            }
          </p>
        </div>
        
        {plantsToWater.length > 0 && !isDone && (
          <button 
            onClick={handleMarkAllDone}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Check className="w-4 h-4" />
            {markDoneBtn}
          </button>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {!isDone && plantsToWater.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-emerald-300">{needsWaterTitle}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plantsToWater.map(p => (
                <div key={p.id} className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-lg flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                      {p.name.substring(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-slate-100">{p.name}</div>
                    <div className="text-xs text-slate-400 truncate">{p.locationType} • {p.potType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {plantsSkip.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800/50">
            <h4 className="text-sm font-medium text-slate-400">{skipWaterTitle}</h4>
            <div className="flex flex-wrap gap-2">
              {plantsSkip.map(p => (
                <div key={p.id} className="bg-slate-800/40 border border-slate-700/50 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
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

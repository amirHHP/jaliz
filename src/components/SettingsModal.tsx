"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "./LanguageProvider"
import { Settings, X, Loader2, CheckCircle2, Key, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, t } = useLanguage()
  const [location, setLocation] = useState("")
  const [saved, setSaved] = useState(false)

  // Load existing settings
  useEffect(() => {
    if (isOpen) {
      const storedLocation = localStorage.getItem("jaliz-location") || ""
      
      setLocation(storedLocation)
      setSaved(false)
    }
  }, [isOpen])

  const handleSave = () => {
    if (location.trim()) {
      localStorage.setItem("jaliz-location", location.trim())
    } else {
      localStorage.removeItem("jaliz-location")
    }
    
    setSaved(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white max-h-[95vh] flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center bg-slate-50 border-b border-slate-100 pb-4 shrink-0">
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
            <Settings className="h-5 w-5 text-slate-500" />
            {t("settings")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:bg-slate-200 hover:text-slate-800 -mr-2">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-800 mb-3">{t("user_location_title")}</h3>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              {t("user_location_label")}
            </label>
            <input 
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
                setSaved(false)
              }}
              placeholder={t("user_location_ph")}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 pt-4 pb-4 flex justify-between items-center shrink-0">
          <div>
            {saved && (
              <span className="text-emerald-600 text-sm flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" />
                {t("saved_successfully")}
              </span>
            )}
          </div>
          <Button 
            onClick={handleSave} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t("save_settings")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

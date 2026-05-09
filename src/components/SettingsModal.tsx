"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "./LanguageProvider"
import { Settings, X, Loader2, CheckCircle2, Key } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ModelInfo {
  name: string
  inputTokenLimit: number
  outputTokenLimit: number
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, t } = useLanguage()
  const [apiKey, setApiKey] = useState("")
  const [models, setModels] = useState<ModelInfo[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Load existing settings
  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem("jaliz-api-key") || ""
      const storedModel = localStorage.getItem("jaliz-model") || ""
      const storedModels = localStorage.getItem("jaliz-models-cache")
      
      setApiKey(storedKey)
      setSelectedModel(storedModel)
      setSaved(false)
      setError(null)
      
      if (storedModels) {
        setModels(JSON.parse(storedModels))
      }
    }
  }, [isOpen])

  const fetchModels = async () => {
    if (!apiKey.trim()) {
      setError(t("api_key_required"))
      return
    }

    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey.trim() })
      })

      if (!response.ok) {
        throw new Error("Failed to fetch models. Check your API key.")
      }

      const data = await response.json()
      if (data.models && data.models.length > 0) {
        setModels(data.models)
        localStorage.setItem("jaliz-models-cache", JSON.stringify(data.models))
        if (!selectedModel || !data.models.find((m: ModelInfo) => m.name === selectedModel)) {
          setSelectedModel(data.models[0].name)
        }
      } else {
        throw new Error("No compatible models found.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.")
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError(t("api_key_required"))
      return
    }
    
    localStorage.setItem("jaliz-api-key", apiKey.trim())
    if (selectedModel) {
      localStorage.setItem("jaliz-model", selectedModel)
    }
    
    setSaved(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  if (!isOpen) return null

  const selectedModelData = models.find(m => m.name === selectedModel)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white max-h-[95vh] flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center bg-slate-50 border-b border-slate-100 pb-4 shrink-0">
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
            <Settings className="h-5 w-5 text-slate-500" />
            {t("api_key_title")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:bg-slate-200 hover:text-slate-800 -mr-2">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-5 overflow-y-auto">
          <p className="text-sm text-slate-600">
            {t("api_key_desc")}
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-600" />
              {t("api_key_label")}
            </label>
            <div className="flex gap-2">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setSaved(false)
                }}
                placeholder={t("api_key_ph")}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Button 
                type="button" 
                onClick={fetchModels} 
                disabled={loading || !apiKey.trim()}
                className="bg-slate-800 hover:bg-slate-900 text-white shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("fetch_models")}
              </Button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {models.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t("select_model")}</label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {models.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name.replace('models/', '')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedModelData && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm flex justify-between items-center">
                  <span className="text-slate-600 font-medium">{t("token_limit")}:</span>
                  <div className="flex gap-3 text-slate-500 text-xs text-right">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700">{selectedModelData.inputTokenLimit.toLocaleString()}</span>
                      <span>{t("input_tokens")}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700">{selectedModelData.outputTokenLimit.toLocaleString()}</span>
                      <span>{t("output_tokens")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
            disabled={!apiKey.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t("save_settings")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

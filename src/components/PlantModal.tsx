import { useState, useEffect, useRef } from "react"
import {
  X, Droplets, Activity, MapPin, Sun, Box, Sprout,
  Leaf, Image as ImageIcon, Sparkles, Pencil, Trash2, Save, ChevronLeft,
  History, PlusCircle, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdviceMarketplaceStrip } from "@/components/marketplace/AdviceMarketplaceStrip"
import { useLanguage } from "@/components/LanguageProvider"
import { analyzePlantAction, getStatusAdviceAction } from "@/app/actions/ai"
import { getPlantLogsAction, addPlantStatusLogAction } from "@/app/actions/plants"
import { normalizePlantHealth } from "@/lib/plant-status-health"

interface PlantStatusLog {
  id: string
  status: string
  health: string
  aiAdvice?: string | null
  image?: string | null
  createdAt: Date
}

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

interface PlantModalProps {
  plant: Plant
  onClose: () => void
  onSave: (updated: Plant) => void
  onDelete: (id: string) => void
}

const inputCls =
  "flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
const textareaCls =
  "flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
const selectCls =
  "flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"

export function PlantModal({ plant, onClose, onSave, onDelete }: PlantModalProps) {
  const { t, language } = useLanguage()
  const isRtl = language === "fa"

  const [isEditing, setIsEditing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Edit form state - initialized from plant
  const [name, setName] = useState(plant.name)
  const [type, setType] = useState(plant.type)
  const [locationType, setLocationType] = useState(plant.locationType)
  const [lightExposure, setLightExposure] = useState(plant.lightExposure)
  const [potType, setPotType] = useState(plant.potType)
  const [hasDrainage, setHasDrainage] = useState(plant.hasDrainage)
  const [lastWatered, setLastWatered] = useState(plant.lastWatered)
  const [recentlyReplanted, setRecentlyReplanted] = useState(plant.recentlyReplanted)
  const [health, setHealth] = useState(plant.health)
  const [image, setImage] = useState(plant.image || "")
  const [careTips, setCareTips] = useState(plant.careTips || "")
  const [wateringTips, setWateringTips] = useState(plant.wateringTips || "")
  const [wateringInterval, setWateringInterval] = useState(plant.wateringInterval || 7)
  const [lastSoilChange, setLastSoilChange] = useState(plant.lastSoilChange || "")

  // Log state
  const [logs, setLogs] = useState<PlantStatusLog[]>([])
  const [isLogging, setIsLogging] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [newLogHealth, setNewLogHealth] = useState<Plant["health"]>(plant.health)
  /** Optional photo for this log entry (compressed data URL), used by AI and stored on the log */
  const [logImage, setLogImage] = useState("")
  const [isInferringHealth, setIsInferringHealth] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [isSubmittingLog, setIsSubmittingLog] = useState(false)
  const healthInferGen = useRef(0)
  const newLogHealthRef = useRef(newLogHealth)
  newLogHealthRef.current = newLogHealth

  useEffect(() => {
    async function fetchLogs() {
      setIsLoadingLogs(true)
      try {
        const data = await getPlantLogsAction(plant.id)
        setLogs(data as any)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoadingLogs(false)
      }
    }
    fetchLogs()
  }, [plant.id])

  // Debounced AI health classification from status text (and optional log photo)
  useEffect(() => {
    if (!isLogging) {
      setIsInferringHealth(false)
      return
    }
    const text = newStatus.trim()
    if (text.length < 12) {
      setIsInferringHealth(false)
      return
    }

    const gen = ++healthInferGen.current
    setIsInferringHealth(true)
    const timer = window.setTimeout(async () => {
      try {
        const res = await getStatusAdviceAction({
          plant_name: name,
          plant_type: type,
          status: text,
          health: newLogHealthRef.current,
          language,
          mode: "health_only",
          image: logImage || undefined,
        })
        if (healthInferGen.current !== gen) return
        if (res.health) {
          setNewLogHealth(normalizePlantHealth(res.health) as Plant["health"])
        }
      } catch {
        /* non-blocking; user can still pick health manually */
      } finally {
        if (healthInferGen.current === gen) setIsInferringHealth(false)
      }
    }, 850)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isLogging, newStatus, logImage, name, type, language])

  const handleAddLog = async () => {
    if (!newStatus.trim()) return
    setIsSubmittingLog(true)
    try {
      const adviceData = await getStatusAdviceAction({
        plant_name: name,
        plant_type: type,
        status: newStatus.trim(),
        health: newLogHealth,
        language,
        mode: "full",
        image: logImage || undefined,
      })

      if (adviceData && adviceData.error) {
        throw new Error(adviceData.error)
      }

      const payload = adviceData as { advice?: string; health?: string }
      const resolvedHealth = normalizePlantHealth(
        payload.health ?? newLogHealth
      ) as Plant["health"]

      const newLog = await addPlantStatusLogAction(
        plant.id,
        newStatus.trim(),
        resolvedHealth,
        payload.advice,
        logImage || null
      )

      if (newLog) {
        setLogs(prev => [newLog as any, ...prev])
        setNewStatus("")
        setLogImage("")
        setIsLogging(false)
        setHealth(resolvedHealth)
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add log")
    } finally {
      setIsSubmittingLog(false)
    }
  }

  const daysAgo = Math.floor(
    (Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 3600 * 24)
  )

  const healthColor =
    plant.health === "Excellent"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : plant.health === "Good"
      ? "text-emerald-500 bg-emerald-50 border-emerald-100"
      : "text-amber-600 bg-amber-50 border-amber-200"

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
        setImage(canvas.toDataURL("image/jpeg", 0.7))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleLogImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX = 560
        let w = img.width, h = img.height
        if (w > h ? w > MAX : h > MAX) {
          if (w > h) { h *= MAX / w; w = MAX } else { w *= MAX / h; h = MAX }
        }
        canvas.width = w; canvas.height = h
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h)
        setLogImage(canvas.toDataURL("image/jpeg", 0.62))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleAIAnalyze = async () => {
    if (!name.trim() && !image) {
      alert("Please provide a plant name or upload an image for AI analysis.")
      return
    }
    setIsAnalyzing(true)
    try {
      const modelName = localStorage.getItem("jaliz-model") || "gemini-1.5-pro"
      const lang = localStorage.getItem("jaliz-lang") || "en"
      const data = await analyzePlantAction({ image, name, language: lang, model_name: modelName })
      if (data && data.error) {
        throw new Error(data.error)
      }
      if (data.name) setName(data.name)
      if (data.type) setType(data.type)
      if (data.locationType) setLocationType(data.locationType)
      if (data.lightExposure) setLightExposure(data.lightExposure)
      if (data.potType) setPotType(data.potType)
      if (data.hasDrainage !== undefined) setHasDrainage(data.hasDrainage)
      if (data.careTips || data.soilChangeTips) setCareTips([data.careTips, data.soilChangeTips].filter(Boolean).join("\n\n"))
      if (data.wateringTips) setWateringTips(data.wateringTips)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to analyze plant")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      ...plant,
      name, type, locationType, lightExposure, potType,
      hasDrainage, lastWatered, recentlyReplanted, lastSoilChange, health,
      image, careTips, wateringTips, wateringInterval
    })
    setIsEditing(false)
  }

  const handleDiscard = () => {
    setName(plant.name); setType(plant.type)
    setLocationType(plant.locationType); setLightExposure(plant.lightExposure)
    setPotType(plant.potType); setHasDrainage(plant.hasDrainage)
    setLastWatered(plant.lastWatered); setRecentlyReplanted(plant.recentlyReplanted)
    setLastSoilChange(plant.lastSoilChange || "")
    setHealth(plant.health); setImage(plant.image || "")
    setCareTips(plant.careTips || ""); setWateringTips(plant.wateringTips || "")
    setWateringInterval(plant.wateringInterval || 7)
    setIsEditing(false)
  }

  // ── Backdrop ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-200"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* ── Hero image ────────────────────────────────────────────────────── */}
        <div className="relative h-56 bg-slate-100 shrink-0 overflow-hidden">
          {image ? (
            <img src={image} alt={plant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <ImageIcon className="h-14 w-14 mb-2 opacity-40" />
              <span className="text-xs font-medium uppercase tracking-wider">No Photo</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold bg-white/90 backdrop-blur-sm text-slate-700 px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              {type || plant.type}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Name at bottom of hero */}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-md leading-tight">
              {name || plant.name}
            </h2>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {!isEditing ? (
            /* ── VIEW MODE ─────────────────────────────────────────────────── */
            <div className="p-6 space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: <Droplets className="h-4 w-4 text-sky-500" />,
                    label: t("last_watered"),
                    value: daysAgo === 0 ? t("watered_today") : `${daysAgo} ${t("watered_days_ago")}`,
                  },
                  {
                    icon: <Droplets className="h-4 w-4 text-sky-400" />,
                    label: language === "fa" ? "آبیاری بعدی" : "Next Watering",
                    value: plant.nextWateringDate ? new Intl.DateTimeFormat(language === "fa" ? 'fa-IR-u-ca-persian' : 'en-US', { dateStyle: 'medium' }).format(new Date(plant.nextWateringDate)) : "-",
                    extra: "text-sky-600 bg-sky-50 border-sky-100",
                  },
                  {
                    icon: <Activity className="h-4 w-4 text-emerald-500" />,
                    label: t("health_status"),
                    value:
                      plant.health === "Excellent" ? t("health_excellent") :
                      plant.health === "Good" ? t("health_good") : t("health_needs_attention"),
                    extra: healthColor,
                  },
                  {
                    icon: <MapPin className="h-4 w-4 text-indigo-400" />,
                    label: t("location_type"),
                    value: plant.locationType === "Indoor" ? t("location_indoor") : t("location_outdoor"),
                  },
                  {
                    icon: <Sun className="h-4 w-4 text-amber-400" />,
                    label: t("light_exposure"),
                    value:
                      plant.lightExposure === "Low Light" ? t("light_low") :
                      plant.lightExposure === "Partial Shade" ? t("light_partial") :
                      plant.lightExposure === "Bright Indirect" ? t("light_bright") : t("light_full"),
                  },
                  {
                    icon: <Box className="h-4 w-4 text-amber-700/60" />,
                    label: t("pot_type"),
                    value:
                      plant.potType === "Terracotta" ? t("pot_terracotta") :
                      plant.potType === "Plastic" ? t("pot_plastic") :
                      plant.potType === "Ceramic" ? t("pot_ceramic") :
                      plant.potType === "Metal" ? t("pot_metal") : t("pot_other"),
                  },
                  {
                    icon: <Droplets className="h-4 w-4 text-slate-300" />,
                    label: t("has_drainage"),
                    value: plant.hasDrainage ? "✓" : "✗",
                    extra: plant.hasDrainage ? "text-emerald-600" : "text-red-500",
                  },
                  {
                    icon: <Sprout className="h-4 w-4 text-amber-600" />,
                    label: t("last_soil_change"),
                    value: plant.lastSoilChange
                      ? (() => {
                          const months = Math.floor((Date.now() - new Date(plant.lastSoilChange!).getTime()) / (1000 * 3600 * 24 * 30));
                          return months === 0
                            ? (language === "fa" ? "همین ماه" : "This month")
                            : `${months} ${t("soil_change_months_ago")}`;
                        })()
                      : t("soil_change_unknown"),
                    extra: plant.lastSoilChange
                      ? (Math.floor((Date.now() - new Date(plant.lastSoilChange!).getTime()) / (1000 * 3600 * 24 * 30)) > 12
                          ? "text-amber-600 bg-amber-50 border-amber-200"
                          : "text-emerald-600")
                      : "text-slate-400",
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <p className={`text-sm font-semibold ${item.extra ? item.extra.split(" ")[0] : "text-slate-800"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Replanted badge */}
              {plant.recentlyReplanted && (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-medium">
                  <Sprout className="h-4 w-4 shrink-0" />
                  {t("recently_replanted")}
                </div>
              )}

              {/* Care / Watering tips */}
              {(plant.careTips || plant.wateringTips) && (
                <div className="space-y-3">
                  {plant.careTips && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1.5">
                        <Leaf className="h-4 w-4" />
                        {t("care_tips")}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{plant.careTips}</p>
                    </div>
                  )}
                  {plant.wateringTips && (
                    <div className="rounded-xl bg-sky-50 border border-sky-100 p-4">
                      <div className="flex items-center gap-2 text-sky-700 font-semibold text-sm mb-1.5">
                        <Droplets className="h-4 w-4" />
                        {t("watering_tips")}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{plant.wateringTips}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Status Logs ────────────────────────────────────────────── */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <History className="h-4 w-4 text-emerald-600" />
                    {language === "fa" ? "سوابق وضعیت" : "Status History"}
                  </div>
                  {!isLogging && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsLogging(true)
                        setNewStatus("")
                        setLogImage("")
                        setNewLogHealth(plant.health)
                      }}
                      className="text-xs h-8 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      {language === "fa" ? "ثبت وضعیت جدید" : "Log Status"}
                    </Button>
                  )}
                </div>

                {isLogging && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 space-y-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase">
                        {language === "fa" ? "توضیح وضعیت" : "Status Description"}
                      </label>
                      <textarea
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                        placeholder={language === "fa" ? "مثلاً: برگ‌ها کمی زرد شده‌اند..." : "e.g., Leaves are turning yellow..."}
                        className={textareaCls}
                        dir="auto"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase">
                        {language === "fa" ? "عکس اخیر گیاه (اختیاری)" : "Latest plant photo (optional)"}
                      </label>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {language === "fa"
                          ? "با آپلود عکس، پیشنهاد هوش مصنوعی هم متن و هم تصویر را در نظر می‌گیرد."
                          : "Upload a photo so AI can combine what it sees with your notes."}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogImageChange}
                        className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium file:px-2 file:py-1 file:rounded-md file:me-2 focus:outline-none text-slate-900"
                      />
                      {logImage ? (
                        <div className="flex items-center gap-3 pt-1">
                          <img src={logImage} alt="" className="h-20 w-20 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0" />
                          <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => setLogImage("")}>
                            {language === "fa" ? "حذف عکس" : "Remove photo"}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs font-semibold text-slate-600 uppercase shrink-0">
                            {t("health_status")}
                          </label>
                          {isInferringHealth ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                              <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                              {language === "fa" ? "تحلیل…" : "Analyzing…"}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          {language === "fa"
                            ? "پس از حدود یک جمله، سطح سلامت به‌صورت خودکار پیشنهاد می‌شود؛ می‌توانید آن را عوض کنید."
                            : "After a short note, AI picks a health level automatically; you can still change it."}
                        </p>
                        <select
                          value={newLogHealth}
                          onChange={e => setNewLogHealth(e.target.value as Plant["health"])}
                          className={selectCls}
                        >
                          <option value="Excellent">{t("health_excellent")}</option>
                          <option value="Good">{t("health_good")}</option>
                          <option value="Needs Attention">{t("health_needs_attention")}</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2 sm:justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsLogging(false)
                            setNewStatus("")
                            setLogImage("")
                            setNewLogHealth(plant.health)
                          }}
                          className="flex-1 sm:flex-none text-slate-600"
                        >
                          {t("cancel")}
                        </Button>
                        <Button
                          size="sm"
                          disabled={!newStatus.trim() || isSubmittingLog}
                          onClick={handleAddLog}
                          className="flex-1 sm:flex-none min-w-[100px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isSubmittingLog ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            language === "fa" ? "ثبت" : "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {isLoadingLogs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-sm">
                        {language === "fa" ? "هنوز هیچ سوابقی ثبت نشده است." : "No status logs yet."}
                      </p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="relative pl-6 pb-6 border-l-2 border-slate-100 last:pb-0 last:border-l-0">
                        <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-emerald-500 shadow-sm" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">
                              {new Date(log.createdAt).toLocaleDateString(language === "fa" ? "fa-IR" : "en-US", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              log.health === "Excellent" ? "bg-emerald-50 text-emerald-700" :
                              log.health === "Good" ? "bg-emerald-50 text-emerald-600" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              {log.health === "Excellent" ? t("health_excellent") :
                               log.health === "Good" ? t("health_good") : t("health_needs_attention")}
                            </span>
                          </div>
                          <p className="text-sm text-slate-800 font-medium leading-relaxed" dir="auto">{log.status}</p>
                          {log.image ? (
                            <div className="mt-1">
                              <img
                                src={log.image}
                                alt=""
                                className="max-h-40 rounded-lg border border-slate-200 object-cover shadow-sm"
                              />
                            </div>
                          ) : null}
                          {log.aiAdvice && (
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 mt-2">
                              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] uppercase mb-1">
                                <Sparkles className="h-3 w-3" />
                                {language === "fa" ? "پیشنهاد هوش مصنوعی" : "AI Recommendation"}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed italic" dir="auto">
                                {log.aiAdvice}
                              </p>
                            </div>
                          )}
                          {log.aiAdvice && (
                            <AdviceMarketplaceStrip
                              adviceText={log.aiAdvice}
                              contextText={log.status}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── EDIT MODE ─────────────────────────────────────────────────── */
            <div className="p-6 space-y-6">
              {/* AI Auto-fill */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-emerald-800 font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Auto-fill
                  </h4>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {language === "fa"
                      ? "نام گیاه یا تصویر را وارد کنید، سپس AI اطلاعات را تکمیل می‌کند."
                      : "Enter a name or image, then let AI fill in the details."}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing || (!name && !image)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm whitespace-nowrap shadow-sm shrink-0"
                >
                  {isAnalyzing
                    ? (language === "fa" ? "در حال تحلیل..." : "Analyzing...")
                    : (language === "fa" ? "پر کردن با AI" : "Auto-fill with AI")}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("plant_name")} *</label>
                  <input value={name} onChange={e => setName(e.target.value)} required className={inputCls} placeholder={t("plant_name_ph")} />
                </div>
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("plant_type")}</label>
                  <input value={type} onChange={e => setType(e.target.value)} className={inputCls} placeholder={t("plant_type_ph")} />
                </div>
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("location_type")}</label>
                  <select value={locationType} onChange={e => setLocationType(e.target.value as any)} className={selectCls}>
                    <option value="Indoor">{t("location_indoor")}</option>
                    <option value="Outdoor">{t("location_outdoor")}</option>
                  </select>
                </div>
                {/* Light */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("light_exposure")}</label>
                  <select value={lightExposure} onChange={e => setLightExposure(e.target.value as any)} className={selectCls}>
                    <option value="Low Light">{t("light_low")}</option>
                    <option value="Partial Shade">{t("light_partial")}</option>
                    <option value="Bright Indirect">{t("light_bright")}</option>
                    <option value="Full Sun">{t("light_full")}</option>
                  </select>
                </div>
                {/* Pot */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("pot_type")}</label>
                  <select value={potType} onChange={e => setPotType(e.target.value as any)} className={selectCls}>
                    <option value="Terracotta">{t("pot_terracotta")}</option>
                    <option value="Plastic">{t("pot_plastic")}</option>
                    <option value="Ceramic">{t("pot_ceramic")}</option>
                    <option value="Metal">{t("pot_metal")}</option>
                    <option value="Other">{t("pot_other")}</option>
                  </select>
                </div>
                {/* Health */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("health_status")}</label>
                  <select value={health} onChange={e => setHealth(e.target.value as any)} className={selectCls}>
                    <option value="Excellent">{t("health_excellent")}</option>
                    <option value="Good">{t("health_good")}</option>
                    <option value="Needs Attention">{t("health_needs_attention")}</option>
                  </select>
                </div>
                {/* Last Watered */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("last_watered")}</label>
                  <input type="date" value={lastWatered} onChange={e => setLastWatered(e.target.value)} className={inputCls} />
                </div>
                {/* Last Soil Change */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("last_soil_change")}</label>
                  <input type="date" value={lastSoilChange} onChange={e => setLastSoilChange(e.target.value)} className={inputCls} />
                </div>
                {/* Checkboxes */}
                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={hasDrainage} onChange={e => setHasDrainage(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">{t("has_drainage")}</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={recentlyReplanted} onChange={e => setRecentlyReplanted(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">{t("recently_replanted")}</span>
                  </label>
                </div>
                {/* Image */}
                <div className="space-y-2 col-span-full">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("plant_image")}</label>
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    className="flex w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium file:px-3 file:py-1 file:rounded-md file:mr-3 focus:outline-none text-slate-900" />
                  {image && (
                    <div className="mt-2 h-32 w-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {/* Care Tips */}
                <div className="space-y-1.5 col-span-full">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("care_tips")}</label>
                  <textarea value={careTips} onChange={e => setCareTips(e.target.value)}
                    placeholder={t("care_tips_ph")} dir="auto" className={textareaCls} />
                </div>
                {/* Watering Interval */}
                <div className="space-y-1.5 col-span-full">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {language === "fa" ? "فاصله آبیاری (روز)" : "Watering Interval (Days)"}
                  </label>
                  <input type="number" min="1" value={wateringInterval} onChange={e => setWateringInterval(parseInt(e.target.value) || 7)} className={inputCls} />
                </div>
                {/* Watering Tips */}
                <div className="space-y-1.5 col-span-full">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("watering_tips")}</label>
                  <textarea value={wateringTips} onChange={e => setWateringTips(e.target.value)}
                    placeholder={t("watering_tips_ph")} dir="auto" className={textareaCls} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer actions ─────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 bg-white">
          {!isEditing ? (
            <>
              {/* Delete side */}
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 font-medium">
                    {language === "fa" ? "مطمئنید؟" : "Are you sure?"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    className="text-slate-600 text-xs"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onDelete(plant.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    {language === "fa" ? "حذف" : "Delete"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  {language === "fa" ? "حذف گیاه" : "Delete plant"}
                </Button>
              )}

              {/* Edit side */}
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
              >
                <Pencil className="h-4 w-4" />
                {language === "fa" ? "ویرایش اطلاعات" : "Edit info"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={handleDiscard}
                className="text-slate-600 gap-1.5"
              >
                <ChevronLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
              >
                <Save className="h-4 w-4" />
                {t("save")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

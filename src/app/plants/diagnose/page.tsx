"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { track } from "@vercel/analytics"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { 
  Leaf, X, Sparkles, MapPin, Sun, Box, Droplets, Activity, 
  Image as ImageIcon, ChevronRight, ChevronLeft, Sprout, Loader2,
  Cloud, CloudSun, UploadCloud, Camera, RefreshCw, Info, Calendar,
  Plus, Check, AlertTriangle, ArrowRight, ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { diagnosePlantAction } from "@/app/actions/ai"
import { createUserPlantAction, addPlantStatusLogAction, getUserPlantsAction } from "@/app/actions/plants"
import {
  RELATIVE_DATE_OPTIONS,
  matchRelativeDateOption,
  relativeDateOptionToString,
  toLocalDateString,
  type RelativeDateOption,
} from "@/lib/relative-date"

const RELATIVE_DATE_LABEL_KEYS: Record<RelativeDateOption, "relative_date_today" | "relative_date_3days" | "relative_date_week"> = {
  today: "relative_date_today",
  "3days": "relative_date_3days",
  week: "relative_date_week",
}

interface DiagnosisResult {
  name: string
  type: string
  health: "Excellent" | "Good" | "Needs Attention"
  diagnosis: string
  advice: string
  locationType: "Indoor" | "Outdoor"
  lightExposure: "Low Light" | "Partial Shade" | "Bright Indirect" | "Full Sun"
  potType: "Terracotta" | "Plastic" | "Ceramic" | "Metal" | "Other"
  growingMedium: "Soil" | "Water"
  hasDrainage: boolean
  wateringInterval: number
  careTips: string
  wateringTips: string
  soilChangeTips: string
}

interface PlantDraft {
  name: string
  type: string
  locationType: "Indoor" | "Outdoor"
  lightExposure: "Low Light" | "Partial Shade" | "Bright Indirect" | "Full Sun"
  potType: "Terracotta" | "Plastic" | "Ceramic" | "Metal" | "Other"
  growingMedium: "Soil" | "Water"
  hasDrainage: boolean
  lastWatered: string
  recentlyReplanted: boolean
  lastSoilChange: string
  health: "Excellent" | "Good" | "Needs Attention"
  image?: string
  careTips?: string
  wateringTips?: string
  soilChangeTips?: string
  wateringInterval: number
}

interface ExistingPlant {
  id: string
  name: string
  type: string
  health: string
}

export default function SmartDiagnosisPage() {
  const { t, language } = useLanguage()
  const { user, status } = useAuth()
  const router = useRouter()
  const isRtl = language === "fa"

  // Steps: 
  // 1 = Upload Photo
  // 2 = Diagnosis Report View
  // 3 = Sub-flow: Register as new plant
  // 4 = Sub-flow: Log status to existing plant
  const [step, setStep] = useState(1) 
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [existingPlants, setExistingPlants] = useState<ExistingPlant[]>([])
  
  // Existing plant sub-flow state
  const [selectedPlantId, setSelectedPlantId] = useState<string>("")
  const [customStatusNotes, setCustomStatusNotes] = useState<string>("")

  // New plant sub-flow draft state
  const [draft, setDraft] = useState<PlantDraft>({
    name: "",
    type: "",
    locationType: "Indoor",
    lightExposure: "Bright Indirect",
    potType: "Plastic",
    growingMedium: "Soil",
    hasDrainage: true,
    lastWatered: toLocalDateString(),
    recentlyReplanted: false,
    lastSoilChange: toLocalDateString(),
    health: "Excellent",
    image: "",
    careTips: "",
    wateringTips: "",
    soilChangeTips: "",
    wateringInterval: 7,
  })

  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0)
  const loadingMessagesFa = [
    "در حال آنالیز تصویر برگ‌ها و ساقه...",
    "تشخیص بیماری‌ها و علائم تنش گیاه...",
    "طبیعت‌شناس جالیز در حال عیب‌یابی گیاه...",
    "فرموله‌سازی دستورالعمل‌های مراقبت و آبیاری...",
    "آماده‌سازی گزارش وضعیت نهایی..."
  ]
  const loadingMessagesEn = [
    "Analyzing leaf and stem details...",
    "Detecting stress symptoms and diseases...",
    "Jaliz botanist is inspecting the issues...",
    "Formulating optimal care and recovery instructions...",
    "Compiling the final health diagnosis report..."
  ]

  // Cycle through loading messages
  useEffect(() => {
    if (!isAnalyzing) return
    const interval = setInterval(() => {
      setLoadingMessageIdx(idx => (idx + 1) % loadingMessagesFa.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isAnalyzing])

  // Load existing plants for Option 2
  useEffect(() => {
    if (status === "authenticated" && user) {
      getUserPlantsAction()
        .then(data => {
          setExistingPlants(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: p.type || "",
            health: p.health || "Good"
          })))
        })
        .catch(console.error)
    }
  }, [status, user])

  const processFile = (file: File) => {
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
        const base64 = canvas.toDataURL("image/jpeg", 0.7)
        setUploadedImage(base64)
        track("Plant Diagnose Upload Photo")
        triggerAIAnalysis(base64)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        processFile(file)
      }
    }
  }

  const triggerAIAnalysis = async (imageBase64: string) => {
    setIsAnalyzing(true)
    setLoadingMessageIdx(0)
    try {
      const data = await diagnosePlantAction({ image: imageBase64, language })
      if (data && data.error) {
        throw new Error(data.error)
      }
      
      setDiagnosis(data)
      setCustomStatusNotes(data.diagnosis || "")

      // Pre-fill new plant draft in case they register it
      setDraft({
        name: data.name || (language === "fa" ? "گیاه شناسایی شده" : "Identified Plant"),
        type: data.type || (language === "fa" ? "نامشخص" : "Unknown"),
        locationType: data.locationType || "Indoor",
        lightExposure: data.lightExposure || "Bright Indirect",
        potType: data.potType || "Plastic",
        growingMedium: data.growingMedium || "Soil",
        hasDrainage: data.hasDrainage !== undefined ? data.hasDrainage : true,
        lastWatered: toLocalDateString(),
        recentlyReplanted: false,
        lastSoilChange: toLocalDateString(),
        health: data.health || "Good",
        image: imageBase64,
        careTips: data.careTips || "",
        wateringTips: data.wateringTips || "",
        soilChangeTips: data.soilChangeTips || "",
        wateringInterval: data.wateringInterval || 7,
      })
      
      track("Plant Diagnose Analysis Success")
      setStep(2)
    } catch (error) {
      console.error("AI Diagnosis Error", error)
      alert(error instanceof Error ? error.message : (language === "fa" ? "خطا در تشخیص هوش مصنوعی." : "AI diagnosis failed."))
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle Option 1 submission: Create new plant (guests save draft → register)
  const handleCreateNewPlant = async () => {
    if (!draft.name.trim()) return
    setIsSaving(true)
    try {
      const mergedCareTips = [draft.careTips, draft.soilChangeTips].filter(Boolean).join("\n\n")
      const plantPayload = {
        name: draft.name,
        type: draft.type || "Unknown",
        locationType: draft.locationType,
        lightExposure: draft.lightExposure,
        potType: draft.potType,
        growingMedium: draft.growingMedium,
        hasDrainage: draft.hasDrainage,
        lastWatered: draft.lastWatered ? new Date(draft.lastWatered) : new Date(),
        recentlyReplanted: draft.recentlyReplanted,
        lastSoilChange: draft.lastSoilChange ? new Date(draft.lastSoilChange) : null,
        health: draft.health,
        image: draft.image || null,
        careTips: mergedCareTips || null,
        wateringTips: draft.wateringTips || null,
        wateringInterval: draft.wateringInterval,
      }

      if (status !== "authenticated" || !user) {
        localStorage.setItem(
          "jaliz_scanned_plant_draft",
          JSON.stringify({
            ...plantPayload,
            lastWatered: draft.lastWatered,
            lastSoilChange: draft.lastSoilChange || undefined,
          }),
        )
        track("Plant Diagnose Guest Save Draft", { type: draft.type || "Unknown" })
        router.push("/register")
        return
      }

      await createUserPlantAction(plantPayload)
      track("Plant Diagnose Register New Plant", { type: draft.type || "Unknown" })
      alert(t("smart_diag_new_success"))
      router.push("/")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Option 2 submission: Add status log to existing plant
  const handleSaveStatusLog = async () => {
    if (!selectedPlantId) {
      alert(language === "fa" ? "لطفاً یک گیاه انتخاب کنید." : "Please select a plant.")
      return
    }
    setIsSaving(true)
    try {
      await addPlantStatusLogAction(
        selectedPlantId,
        customStatusNotes,
        diagnosis?.health || "Good",
        diagnosis?.advice || "",
        uploadedImage
      )
      track("Plant Diagnose Log Status Existing", { health: diagnosis?.health || "Good" })
      alert(t("smart_diag_save_success"))
      router.push("/")
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Failed to save status log.")
    } finally {
      setIsSaving(false)
    }
  }

  const resetState = () => {
    setUploadedImage("")
    setDiagnosis(null)
    setSelectedPlantId("")
    setCustomStatusNotes("")
    setStep(1)
  }

  const updateDraft = (key: keyof PlantDraft, value: any) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  const isGuest = status !== "authenticated" || !user

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 md:p-6 p-0 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-md h-full md:h-[85vh] md:max-h-[780px] bg-white md:rounded-3xl md:border md:border-slate-100 md:shadow-2xl flex flex-col relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-sky-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        {/* Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-100 bg-white/60 backdrop-blur-md z-20 relative">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
            <h1 className="text-base text-slate-800 font-bold">
              {t("smart_diag_title")}
            </h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/")} 
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-grow overflow-y-auto px-6 py-4 relative z-10">
          
          {/* STEP 1: Upload Photo */}
          {step === 1 && !isAnalyzing && (
            <div className="h-full flex flex-col justify-center items-center py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center space-y-2 max-w-xs">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner">
                  <Camera className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {language === "fa" ? "عیب‌یابی سریع گل و گیاه" : "Quick Plant Diagnosis"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("smart_diag_desc")}
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.98]' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-400'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange} 
                />
                
                <div className="p-4 bg-emerald-50 rounded-full mb-3 text-emerald-500 shadow-sm animate-bounce duration-1000">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="font-semibold text-slate-700 text-sm mb-1">
                  {language === "fa" ? "انتخاب یا کشیدن عکس گیاه بیمار" : "Choose or Drag Diseased Plant Photo"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === "fa" ? "پشتیبانی از فرمت‌های JPEG, PNG" : "Supports JPEG, PNG formats"}
                </p>
              </div>

              {/* Camera Trigger */}
              <Button 
                type="button" 
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute("capture", "environment");
                    fileInputRef.current.click();
                  }
                }}
                className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md h-10 flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {language === "fa" ? "عکاسی با دوربین گوشی" : "Take Photo with Camera"}
              </Button>
            </div>
          )}

          {/* LOADING STATE: AI Analyzing */}
          {isAnalyzing && (
            <div className="h-full flex flex-col justify-center items-center py-10 space-y-6 animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-emerald-100 rounded-full animate-ping opacity-60" />
                <div className="relative w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-lg">
                  <Activity className="h-10 w-10 text-emerald-500 animate-pulse" />
                </div>
              </div>
              
              <div className="text-center space-y-2.5 max-w-xs">
                <h3 className="text-base font-bold text-slate-800 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  {language === "fa" ? "در حال معاینه گیاه..." : "Diagnosing Plant..."}
                </h3>
                <p className="text-xs text-emerald-600 font-medium min-h-[3rem] px-4 leading-relaxed animate-pulse">
                  {language === "fa" ? loadingMessagesFa[loadingMessageIdx] : loadingMessagesEn[loadingMessageIdx]}
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Diagnosis Report View */}
          {step === 2 && diagnosis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Photo Hero Preview */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                <img src={uploadedImage} alt="Diagnosed plant" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 right-3 left-3 flex justify-between items-center pointer-events-none">
                  <span className="bg-emerald-600/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {language === "fa" ? "تشخیص هوش مصنوعی" : "AI Diagnosed"}
                  </span>
                  <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
                    {diagnosis.name}
                  </span>
                </div>
              </div>

              {/* Diagnosis Health Summary */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {t("smart_diag_result_title")}
                </h3>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-xs text-slate-600 font-bold">{t("smart_diag_health")}</span>
                  <span className={`inline-flex items-center text-[10px] font-bold border px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider ${
                    diagnosis.health === "Excellent" 
                      ? "bg-emerald-50/90 text-emerald-700 border-emerald-200" 
                      : diagnosis.health === "Good"
                        ? "bg-amber-50/90 text-amber-700 border-amber-200"
                        : "bg-rose-50/90 text-rose-700 border-rose-200"
                  }`}>
                    {diagnosis.health === "Excellent" ? t("health_excellent") : diagnosis.health === "Good" ? t("health_good") : t("health_needs_attention")}
                  </span>
                </div>

                {/* Diagnosis Text Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className={`h-4 w-4 ${diagnosis.health === "Needs Attention" ? "text-rose-500" : "text-amber-500"}`} />
                    {t("smart_diag_issue")}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {diagnosis.diagnosis}
                  </p>
                </div>

                {/* Treatment Advice Card */}
                <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Sprout className="h-4 w-4 text-emerald-600" />
                    {t("smart_diag_advice")}
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    {diagnosis.advice}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 my-4" />

              {/* Action Selection Buttons */}
              <div className="space-y-2.5">
                <Button 
                  onClick={() => setStep(3)}
                  className="w-full justify-between bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-5 font-bold shadow-md flex items-center"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4.5 w-4.5" />
                    {isGuest ? t("smart_diag_opt_new_guest") : t("smart_diag_opt_new")}
                  </span>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isRtl ? "rotate-180" : ""}`} />
                </Button>

                {!isGuest && (
                  <Button 
                    onClick={() => setStep(4)}
                    className="w-full justify-between bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl py-5 font-bold shadow-sm flex items-center"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-4.5 w-4.5 text-slate-500" />
                      {t("smart_diag_opt_existing")}
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isRtl ? "rotate-180" : ""}`} />
                  </Button>
                )}

                {isGuest && (
                  <p className="text-[11px] text-center text-slate-400 px-2 leading-relaxed">
                    {t("smart_diag_guest_save_hint")}
                  </p>
                )}

                <Button 
                  variant="ghost"
                  onClick={resetState}
                  className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 py-3 rounded-xl text-xs font-bold"
                >
                  {t("smart_diag_opt_discard")}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Sub-flow Register New Plant Form */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-2.5 items-start text-xs text-slate-600">
                <Info className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <p>
                  {language === "fa" 
                    ? "اطلاعات زیر توسط هوش مصنوعی بر اساس نوع گلدان شما پیش‌فرض شده است. در صورت نیاز تغییر دهید."
                    : "The details below were pre-filled by AI. Adjust them if needed."}
                </p>
              </div>

              {/* Plant Identity */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {t("plant_name")}
                  </label>
                  <input 
                    required 
                    value={draft.name} 
                    onChange={(e) => updateDraft("name", e.target.value)} 
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-950 shadow-sm" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t("plant_type")}
                    </label>
                    <input 
                      value={draft.type} 
                      onChange={(e) => updateDraft("type", e.target.value)} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-800 shadow-sm" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t("health_status")}
                    </label>
                    <select 
                      value={draft.health} 
                      onChange={(e) => updateDraft("health", e.target.value)} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-800 shadow-sm"
                    >
                      <option value="Excellent">🌟 {t("health_excellent")}</option>
                      <option value="Good">🙂 {t("health_good")}</option>
                      <option value="Needs Attention">🥺 {t("health_needs_attention")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === "fa" ? "محیط و ظرف نگهداری" : "Environment & Pot"}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      {t("location_type")}
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-0.5 h-10">
                      <button
                        type="button"
                        onClick={() => updateDraft("locationType", "Indoor")}
                        className={`rounded-lg text-[10px] font-semibold transition-all ${draft.locationType === "Indoor" ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                      >
                        {t("location_indoor").split(" ")[0]}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDraft("locationType", "Outdoor")}
                        className={`rounded-lg text-[10px] font-semibold transition-all ${draft.locationType === "Outdoor" ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                      >
                        {t("location_outdoor").split(" ")[0]}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Box className="h-3.5 w-3.5 text-amber-700" />
                      {t("pot_type")}
                    </label>
                    <select 
                      value={draft.potType} 
                      onChange={(e) => updateDraft("potType", e.target.value)} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-800 shadow-sm"
                    >
                      <option value="Plastic">{t("pot_plastic").split(" ")[0]}</option>
                      <option value="Terracotta">{t("pot_terracotta").split(" ")[0]}</option>
                      <option value="Ceramic">{t("pot_ceramic").split(" ")[0]}</option>
                      <option value="Metal">{t("pot_metal").split(" ")[0]}</option>
                      <option value="Other">{t("pot_other")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                    {t("growing_medium")}
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-0.5 h-10">
                    <button
                      type="button"
                      onClick={() => updateDraft("growingMedium", "Soil")}
                      className={`rounded-lg text-xs font-semibold transition-all ${draft.growingMedium === "Soil" ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      🌱 {t("medium_soil")}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDraft("growingMedium", "Water")}
                      className={`rounded-lg text-xs font-semibold transition-all ${draft.growingMedium === "Water" ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      💧 {language === "fa" ? "آب" : "Water"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-slate-400" />
                      {t("has_drainage")}
                    </label>
                    <div className="flex bg-slate-100 rounded-xl p-0.5 h-10">
                      <button 
                        type="button" 
                        onClick={() => updateDraft("hasDrainage", true)} 
                        className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${draft.hasDrainage ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        {language === "fa" ? "بله" : "Yes"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => updateDraft("hasDrainage", false)} 
                        className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${!draft.hasDrainage ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}
                      >
                        {language === "fa" ? "خیر" : "No"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                      {t("recently_replanted")}
                    </label>
                    <div className="flex bg-slate-100 rounded-xl p-0.5 h-10">
                      <button 
                        type="button" 
                        onClick={() => updateDraft("recentlyReplanted", true)} 
                        className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${draft.recentlyReplanted ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        {language === "fa" ? "بله" : "Yes"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => updateDraft("recentlyReplanted", false)} 
                        className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${!draft.recentlyReplanted ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        {language === "fa" ? "خیر" : "No"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    {t("light_exposure")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "Full Sun", label: t("light_full"), icon: Sun },
                      { value: "Bright Indirect", label: t("light_bright"), icon: CloudSun },
                      { value: "Partial Shade", label: t("light_partial"), icon: Cloud },
                      { value: "Low Light", label: t("light_low"), icon: Leaf },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => updateDraft("lightExposure", opt.value)}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-all justify-start text-start ${
                          draft.lightExposure === opt.value 
                            ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm ring-1 ring-amber-400' 
                            : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-5'
                        }`}
                      >
                        <opt.icon className={`h-4 w-4 shrink-0 ${draft.lightExposure === opt.value ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="font-semibold text-[10px] leading-tight truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Watering */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === "fa" ? "دوره و آبیاری" : "Watering Details"}
                </h4>

                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sky-950">
                      {t("last_watered")}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {RELATIVE_DATE_OPTIONS.map((option) => {
                        const selected = matchRelativeDateOption(draft.lastWatered) === option
                        return (
                          <button
                            type="button"
                            key={option}
                            onClick={() => updateDraft("lastWatered", relativeDateOptionToString(option))}
                            className={`rounded-lg px-1.5 py-2 text-[10px] font-semibold transition-all ${
                              selected
                                ? "bg-sky-600 text-white shadow-sm"
                                : "bg-white text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50"
                            }`}
                          >
                            {t(RELATIVE_DATE_LABEL_KEYS[option])}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sky-950 flex justify-between">
                      <span>{t("watering_interval_label")}</span>
                      <span className="bg-sky-200 text-sky-800 px-1.5 py-0.25 rounded font-bold text-[9px]">
                        {draft.wateringInterval} {t("watering_interval_days")}
                      </span>
                    </label>
                    <div className="flex items-start gap-2 rounded-xl bg-white/80 border border-sky-100 px-3 py-2.5">
                      <Info className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-sky-800 leading-relaxed">
                        {t("watering_interval_locked_hint")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Change */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("last_soil_change")}
                </h4>

                <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-1.5">
                    {RELATIVE_DATE_OPTIONS.map((option) => {
                      const selected = matchRelativeDateOption(draft.lastSoilChange) === option
                      return (
                        <button
                          type="button"
                          key={option}
                          onClick={() => updateDraft("lastSoilChange", relativeDateOptionToString(option))}
                          className={`rounded-lg px-1.5 py-2 text-[10px] font-semibold transition-all ${
                            selected
                              ? "bg-amber-600 text-white shadow-sm"
                              : "bg-white text-amber-900 ring-1 ring-amber-200 hover:bg-amber-50"
                          }`}
                        >
                          {t(RELATIVE_DATE_LABEL_KEYS[option])}
                        </button>
                      )
                    })}
                  </div>

                  {draft.soilChangeTips && (
                    <div className="text-[11px] text-amber-800 bg-white/70 rounded-xl p-3 border border-amber-100/50 leading-relaxed flex gap-2">
                      <Sprout className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">{language === "fa" ? "توصیه تعویض خاک هوش مصنوعی:" : "AI Soil Advice:"}</span>
                        {draft.soilChangeTips}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Sub-flow Log Status to Existing Plant */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {t("smart_diag_select_plant")}
                </label>
                
                {existingPlants.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center text-xs text-amber-800">
                    {language === "fa" ? "هیچ گیاهی ثبت نشده است. ابتدا یک گیاه ثبت کنید." : "No registered plants found. Create a plant first."}
                  </div>
                ) : (
                  <select 
                    value={selectedPlantId}
                    onChange={(e) => setSelectedPlantId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-800 shadow-sm"
                  >
                    <option value="">{t("smart_diag_select_placeholder")}</option>
                    {existingPlants.map(p => (
                      <option key={p.id} value={p.id}>{p.name} {p.type ? `(${p.type})` : ''}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status Note Summary */}
              {selectedPlantId && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      {t("smart_diag_issue")}
                    </label>
                    <textarea 
                      value={customStatusNotes}
                      onChange={(e) => setCustomStatusNotes(e.target.value)}
                      className="flex min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                      placeholder={language === "fa" ? "شرح کوتاهی از وضعیت گیاه..." : "Short description of the plant status..."}
                    />
                  </div>

                  {diagnosis && (
                    <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-4 space-y-1.5">
                      <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-600" />
                        {t("smart_diag_advice")}
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                        {diagnosis.advice}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer Navigation */}
        <footer className="h-20 shrink-0 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md px-6 flex items-center justify-between z-20 relative">
          {step === 1 ? (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.push("/")} 
              className="text-slate-500 hover:text-slate-800 rounded-xl"
            >
              {t("cancel")}
            </Button>
          ) : step === 2 ? (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={resetState} 
              className="text-slate-500 hover:text-slate-800 rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {language === "fa" ? "آپلود مجدد عکس" : "Re-upload Photo"}
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setStep(2)} 
              className="text-slate-500 hover:text-slate-800 rounded-xl"
            >
              {language === "fa" ? "بازگشت به گزارش" : "Back to Report"}
            </Button>
          )}
          
          {step === 3 && (
            <Button 
              type="button"
              onClick={handleCreateNewPlant} 
              disabled={isSaving || !draft.name}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md px-6 font-bold text-sm h-10 flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isGuest
                ? t("smart_diag_opt_new_guest")
                : (language === "fa" ? "ثبت نهایی گیاه جدید" : "Save New Plant")}
            </Button>
          )}

          {step === 4 && (
            <Button 
              type="button"
              onClick={handleSaveStatusLog} 
              disabled={isSaving || !selectedPlantId || !customStatusNotes}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md px-6 font-bold text-sm h-10 flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {t("smart_diag_save_log_btn")}
            </Button>
          )}
        </footer>
      </div>
    </div>
  )
}

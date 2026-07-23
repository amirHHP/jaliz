"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { 
  Leaf, X, Sparkles, MapPin, Sun, Box, Droplets, Activity, 
  Image as ImageIcon, ChevronRight, ChevronLeft, Sprout, Loader2,
  Cloud, CloudSun, Home, TreePine, UploadCloud, Camera, RefreshCw, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyzePlantAction } from "@/app/actions/ai"
import { createUserPlantAction } from "@/app/actions/plants"
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

export default function NewPlantPage() {
  const { t, language } = useLanguage()
  const { user, status } = useAuth()
  const router = useRouter()
  const isRtl = language === "fa"

  const [step, setStep] = useState(1) // 1 = Upload, 2 = Review & Confirm
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0)
  const loadingMessagesFa = [
    "در حال شناسایی نوع گیاه شما...",
    "بررسی شکل و رنگ برگ‌ها برای تشخیص شادابی...",
    "تحلیل شرایط نوری مورد نیاز...",
    "محاسبه زمان‌بندی بهینه آبیاری...",
    "طبیعت‌شناس جالیز در حال آماده‌سازی راهنمای مراقبت..."
  ]
  const loadingMessagesEn = [
    "Identifying your plant species...",
    "Analyzing leaf shapes and colors...",
    "Evaluating light requirements...",
    "Calculating optimal watering schedule...",
    "Jaliz botanist is preparing care guidelines..."
  ]

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

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  // Cycle through loading messages when AI is analyzing
  useEffect(() => {
    if (!isAnalyzing) return
    const interval = setInterval(() => {
      setLoadingMessageIdx(idx => (idx + 1) % loadingMessagesFa.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isAnalyzing])

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
        setDraft(prev => ({ ...prev, image: base64 }))
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
      const data = await analyzePlantAction({ image: imageBase64, language })
      if (data && data.error) {
        throw new Error(data.error)
      }
      
      setDraft(prev => ({
        ...prev,
        name: data.name || (language === "fa" ? "گیاه جدید من" : "My New Plant"),
        type: data.type || (language === "fa" ? "نامشخص" : "Unknown"),
        locationType: data.locationType as any || prev.locationType,
        lightExposure: data.lightExposure as any || prev.lightExposure,
        potType: data.potType as any || prev.potType,
        growingMedium: data.growingMedium as any || prev.growingMedium,
        hasDrainage: data.hasDrainage !== undefined ? data.hasDrainage : prev.hasDrainage,
        careTips: data.careTips || "",
        wateringTips: data.wateringTips || "",
        soilChangeTips: data.soilChangeTips || "",
        wateringInterval: data.wateringInterval || prev.wateringInterval,
      }))
      
      setStep(2)
    } catch (error) {
      console.error("AI Error", error)
      alert(error instanceof Error ? error.message : (language === "fa" ? "خطا در تحلیل هوش مصنوعی." : "Failed to analyze plant."))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async () => {
    if (!draft.name.trim()) return
    setIsSaving(true)
    try {
      // Merge careTips and soilChangeTips before database save
      const mergedCareTips = [draft.careTips, draft.soilChangeTips].filter(Boolean).join("\n\n")

      await createUserPlantAction({
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
      })
      router.push("/")
    } catch (error) {
      console.error(error)
      setIsSaving(false)
    }
  }

  const resetState = () => {
    setDraft({
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

  if (status === "unauthenticated" || !user) {
    return null
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 md:p-6 p-0 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-md h-full md:h-[85vh] md:max-h-[750px] bg-white md:rounded-3xl md:border md:border-slate-100 md:shadow-2xl flex flex-col relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-sky-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        {/* Fixed Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-100 bg-white/60 backdrop-blur-md z-20 relative">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-500" />
            <h1 className="text-lg text-slate-800 font-bold">
              {language === "fa" ? "دوست سبز جدید من" : "My New Green Friend"}
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

        {/* Scrollable Form Content */}
        <main className="flex-grow overflow-y-auto px-6 py-4 relative z-10">
          
          {/* STEP 1: Upload Photo */}
          {step === 1 && !isAnalyzing && (
            <div className="h-full flex flex-col justify-center items-center py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center space-y-2 max-w-xs">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner">
                  <Camera className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {language === "fa" ? "ثبت فوری با عکس گیاه" : "Quick Register with Photo"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === "fa" 
                    ? "عکس گیاهت رو بفرست تا هوش مصنوعی گونه‌اش رو بشناسه و برنامه نگهداریش رو بسازه!" 
                    : "Upload a photo of your plant and our AI will identify it and generate a personalized care plan!"}
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
                  {language === "fa" ? "انتخاب یا کشیدن عکس گیاه" : "Choose or Drag Plant Photo"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === "fa" ? "پشتیبانی از فرمت‌های JPEG, PNG" : "Supports JPEG, PNG formats"}
                </p>
              </div>

              {/* Camera Trigger Helper on Mobile */}
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
                {/* Pulsing ring */}
                <div className="absolute w-24 h-24 bg-emerald-100 rounded-full animate-ping opacity-60" />
                <div className="relative w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-lg">
                  <Sprout className="h-10 w-10 text-emerald-500 animate-pulse" />
                </div>
              </div>
              
              <div className="text-center space-y-2.5 max-w-xs">
                <h3 className="text-base font-bold text-slate-800 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  {language === "fa" ? "در حال تحلیل تصویر..." : "Analyzing Photo..."}
                </h3>
                <p className="text-xs text-emerald-600 font-medium min-h-[3rem] px-4 leading-relaxed animate-pulse">
                  {language === "fa" ? loadingMessagesFa[loadingMessageIdx] : loadingMessagesEn[loadingMessageIdx]}
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Review & Confirm */}
          {step === 2 && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Image Hero Preview */}
              {draft.image && (
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                  <img src={draft.image} alt="Identified Plant" className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 right-3 left-3 flex justify-between items-center pointer-events-none">
                    <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {language === "fa" ? "شناسایی با هوش مصنوعی" : "AI Identified"}
                    </span>
                    {draft.type && (
                      <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
                        {draft.type}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Plant Identity */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {language === "fa" ? "نام دوست سبز شما" : "Name of your Green Friend"}
                  </label>
                  <div className="relative">
                    <input 
                      required 
                      value={draft.name} 
                      onChange={(e) => updateDraft("name", e.target.value)} 
                      placeholder={language === "fa" ? "نام گیاه را وارد کنید..." : "Enter plant name..."} 
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-950 shadow-sm" 
                    />
                    <Sparkles className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-500 opacity-70 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {language === "fa" ? "دسته‌بندی/نوع" : "Category/Type"}
                    </label>
                    <input 
                      value={draft.type} 
                      onChange={(e) => updateDraft("type", e.target.value)} 
                      placeholder={language === "fa" ? "مثلا استوایی" : "e.g. Tropical"} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-800 shadow-sm" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {language === "fa" ? "حالش چطوره؟" : "How is it doing?"}
                    </label>
                    <select 
                      value={draft.health} 
                      onChange={(e) => updateDraft("health", e.target.value)} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-800 shadow-sm"
                    >
                      <option value="Excellent">🌟 {language === "fa" ? "عالی و سرحال" : "Excellent"}</option>
                      <option value="Good">🙂 {language === "fa" ? "خوب" : "Good"}</option>
                      <option value="Needs Attention">🥺 {language === "fa" ? "نیاز به توجه" : "Needs Love"}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="border-t border-slate-100" />

              {/* Environment & Pot */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === "fa" ? "محیط و ظرف نگهداری" : "Environment & Pot"}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      {language === "fa" ? "مکان" : "Location"}
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-0.5 h-10">
                      <button
                        type="button"
                        onClick={() => updateDraft("locationType", "Indoor")}
                        className={`rounded-lg text-xs font-semibold transition-all ${draft.locationType === "Indoor" ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {language === "fa" ? "داخلی" : "Indoor"}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDraft("locationType", "Outdoor")}
                        className={`rounded-lg text-xs font-semibold transition-all ${draft.locationType === "Outdoor" ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {language === "fa" ? "بیرون" : "Outdoor"}
                      </button>
                    </div>
                  </div>

                  {/* Pot Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Box className="h-3.5 w-3.5 text-amber-700/70" />
                      {language === "fa" ? "جنس گلدان" : "Pot Type"}
                    </label>
                    <select 
                      value={draft.potType} 
                      onChange={(e) => updateDraft("potType", e.target.value)} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-800 shadow-sm"
                    >
                      <option value="Plastic">{language === "fa" ? "پلاستیکی" : "Plastic"}</option>
                      <option value="Terracotta">{language === "fa" ? "سفالی" : "Terracotta"}</option>
                      <option value="Ceramic">{language === "fa" ? "سرامیکی" : "Ceramic"}</option>
                      <option value="Metal">{language === "fa" ? "فلزی" : "Metal"}</option>
                      <option value="Other">{language === "fa" ? "سایر" : "Other"}</option>
                    </select>
                  </div>
                </div>

                {/* Growing Medium */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                    {language === "fa" ? "محیط رشد" : "Growing Medium"}
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-0.5 h-10">
                    <button
                      type="button"
                      onClick={() => updateDraft("growingMedium", "Soil")}
                      className={`rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${draft.growingMedium === "Soil" ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      🌱 {language === "fa" ? "خاک" : "Soil"}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDraft("growingMedium", "Water")}
                      className={`rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${draft.growingMedium === "Water" ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      💧 {language === "fa" ? "آب (هیدروپونیک)" : "Water (Hydroponic)"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Drainage */}
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-slate-400" />
                      {language === "fa" ? "زهکشی مناسب؟" : "Has Drainage?"}
                    </label>
                    <div className="flex bg-slate-100 rounded-xl p-0.5 h-10">
                      <button 
                        type="button" 
                        onClick={() => updateDraft("hasDrainage", true)} 
                        className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${draft.hasDrainage ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {language === "fa" ? "بله" : "Yes"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => updateDraft("hasDrainage", false)} 
                        className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${!draft.hasDrainage ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {language === "fa" ? "خیر" : "No"}
                      </button>
                    </div>
                  </div>

                  {/* Repotted */}
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                      {language === "fa" ? "تعویض خاک اخیر؟" : "Repotted recently?"}
                    </label>
                    <div className="flex bg-slate-100 rounded-xl p-0.5 h-10">
                      <button 
                        type="button" 
                        onClick={() => updateDraft("recentlyReplanted", true)} 
                        className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${draft.recentlyReplanted ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {language === "fa" ? "بله" : "خیر"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => updateDraft("recentlyReplanted", false)} 
                        className={`flex-1 rounded-lg text-xs font-semibold transition-colors ${!draft.recentlyReplanted ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {language === "fa" ? "خیر" : "No"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Light */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    {language === "fa" ? "میزان نور دریافتی" : "Light Exposure"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "Full Sun", label: language === "fa" ? "نور مستقیم آفتاب" : "Full Sun", icon: Sun },
                      { value: "Bright Indirect", label: language === "fa" ? "نور زیاد غیرمستقیم" : "Bright Indirect", icon: CloudSun },
                      { value: "Partial Shade", label: language === "fa" ? "سایه روشن" : "Partial Shade", icon: Cloud },
                      { value: "Low Light", label: language === "fa" ? "نور کم" : "Low Light", icon: Leaf },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => updateDraft("lightExposure", opt.value)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all justify-start text-start ${
                          draft.lightExposure === opt.value 
                            ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm ring-1 ring-amber-400' 
                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <opt.icon className={`h-4 w-4 shrink-0 ${draft.lightExposure === opt.value ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="font-semibold text-[10px] leading-tight truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="border-t border-slate-100" />

              {/* Watering Schedule */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === "fa" ? "زمان‌بندی و اصول آبیاری" : "Watering Habit & Schedule"}
                </h4>

                <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 space-y-4">
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
                  </div>

                  {draft.wateringTips && (
                    <div className="text-[11px] text-sky-800 bg-white/70 rounded-xl p-3 border border-sky-100/50 leading-relaxed flex gap-2">
                      <Droplets className="h-4.5 w-4.5 text-sky-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">
                          {language === "fa" ? "توصیه آبیاری هوش مصنوعی:" : "AI Watering Advice:"}
                        </span>
                        {draft.wateringTips}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Divider */}
              <div className="border-t border-slate-100" />

              {/* Soil Change */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === "fa" ? "خاک و زمان تعویض آن" : "Soil Change Schedule"}
                </h4>

                <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-amber-700" />
                      {t("last_soil_change")}
                    </label>
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

              {/* Section Divider */}
              <div className="border-t border-slate-100" />

              {/* General Care Advice */}
              {draft.careTips && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === "fa" ? "سایر توصیه‌های مراقبتی" : "General Care Advice"}
                  </h4>
                  <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 flex gap-2 text-emerald-800 text-[11px] leading-relaxed">
                    <Leaf className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">{language === "fa" ? "نکات طلایی نگهداری:" : "Golden Rules:"}</span>
                      {draft.careTips}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

        {/* Fixed Footer Navigation */}
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
          ) : (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={resetState} 
              disabled={isSaving}
              className="text-slate-500 hover:text-slate-800 rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {language === "fa" ? "آپلود مجدد عکس" : "Re-upload Photo"}
            </Button>
          )}
          
          {step === 2 && (
            <Button 
              type="button"
              onClick={handleSubmit} 
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md px-6 font-bold text-sm h-10 flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Leaf className="h-4 w-4" />}
              {language === "fa" ? "ذخیره دوست جدید من!" : "Save My New Friend!"}
            </Button>
          )}
        </footer>
      </div>
    </div>
  )
}

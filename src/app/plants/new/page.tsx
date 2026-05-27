"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { 
  Leaf, X, Sparkles, MapPin, Sun, Box, Droplets, Activity, 
  Image as ImageIcon, ChevronRight, ChevronLeft, Sprout, Loader2,
  Cloud, CloudSun, Home, TreePine
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyzePlantAction } from "@/app/actions/ai"
import { createUserPlantAction } from "@/app/actions/plants"

interface PlantDraft {
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
  wateringInterval: number
}

export default function NewPlantPage() {
  const { t, language } = useLanguage()
  const { user, status } = useAuth()
  const router = useRouter()
  const isRtl = language === "fa"

  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [draft, setDraft] = useState<PlantDraft>({
    name: "",
    type: "",
    locationType: "Indoor",
    lightExposure: "Bright Indirect",
    potType: "Plastic",
    hasDrainage: true,
    lastWatered: new Date().toISOString().split("T")[0],
    recentlyReplanted: false,
    health: "Excellent",
    image: "",
    careTips: "",
    wateringTips: "",
    wateringInterval: 7,
  })

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

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
        setDraft(prev => ({ ...prev, image: canvas.toDataURL("image/jpeg", 0.7) }))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleAIAnalyze = async () => {
    if (!draft.name.trim() && !draft.image) {
      alert(language === "fa" ? "لطفا نام گیاه را وارد کنید یا یک عکس آپلود کنید." : "Please provide a plant name or image.")
      return
    }
    setIsAnalyzing(true)
    try {
      const data = await analyzePlantAction({ image: draft.image, name: draft.name, language })
      if (data && data.error) {
        throw new Error(data.error)
      }
      setDraft(prev => ({
        ...prev,
        name: data.name || prev.name,
        type: data.type || prev.type,
        locationType: data.locationType as any || prev.locationType,
        lightExposure: data.lightExposure as any || prev.lightExposure,
        potType: data.potType as any || prev.potType,
        hasDrainage: data.hasDrainage !== undefined ? data.hasDrainage : prev.hasDrainage,
        careTips: data.careTips || prev.careTips,
        wateringTips: data.wateringTips || prev.wateringTips,
      }))
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
      await createUserPlantAction({
        name: draft.name,
        type: draft.type || "Unknown",
        locationType: draft.locationType,
        lightExposure: draft.lightExposure,
        potType: draft.potType,
        hasDrainage: draft.hasDrainage,
        lastWatered: draft.lastWatered ? new Date(draft.lastWatered) : new Date(),
        recentlyReplanted: draft.recentlyReplanted,
        health: draft.health,
        image: draft.image || null,
        careTips: draft.careTips || null,
        wateringTips: draft.wateringTips || null,
        wateringInterval: draft.wateringInterval,
      })
      router.push("/")
    } catch (error) {
      console.error(error)
      setIsSaving(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && !draft.name.trim()) {
      alert(language === "fa" ? "لطفا نام گیاه را وارد کنید." : "Please enter a name.")
      return
    }
    setStep(s => Math.min(s + 1, 4))
  }
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const updateDraft = (key: keyof PlantDraft, value: any) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-2">
      {[1, 2, 3, 4].map(i => (
        <div 
          key={i} 
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step 
              ? 'w-8 bg-emerald-500' 
              : i < step 
                ? 'w-2.5 bg-emerald-300' 
                : 'w-2.5 bg-slate-200'
          }`} 
        />
      ))}
    </div>
  )

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

        {/* Fixed Step Indicator below Header */}
        <div className="shrink-0 pt-3 pb-1 px-6 bg-white/80 backdrop-blur-md z-15 relative">
          <StepIndicator />
        </div>

        {/* Scrollable Form Content */}
        <main className="flex-grow overflow-y-auto px-6 py-4 relative z-10">
          {/* STEP 1: Intro */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {language === "fa" ? "بیا با هم آشنا بشیم!" : "Let's get to know each other!"}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "fa" ? "چه اسمی براش انتخاب کردی؟ عکسش رو هم می‌تونی اضافه کنی." : "What did you name it? You can also add a photo."}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                {/* Image Upload Circle */}
                <div 
                  className="relative group cursor-pointer w-28 h-28 rounded-full border-4 border-dashed border-emerald-200 bg-emerald-50 flex items-center justify-center overflow-hidden hover:border-emerald-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
                  {draft.image ? (
                    <img src={draft.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-emerald-500 group-hover:text-emerald-600 transition-colors">
                      <ImageIcon className="h-7 w-7 mx-auto mb-1 opacity-70" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider">{language === "fa" ? "آپلود عکس" : "Upload Photo"}</span>
                    </div>
                  )}
                  {draft.image && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <input 
                    required 
                    value={draft.name} 
                    onChange={(e) => updateDraft("name", e.target.value)} 
                    placeholder={language === "fa" ? "اسم گیاه (مثلاً پتوس قشنگم)" : "Plant name (e.g., My lovely Pothos)"} 
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-300 shadow-sm transition-all" 
                  />
                </div>

                <div className="w-full p-4 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 rounded-2xl border border-emerald-100/50 shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    {language === "fa" ? "جادوی هوش مصنوعی" : "AI Magic"}
                  </div>
                  <p className="text-[10px] text-emerald-600 mb-2.5 leading-relaxed">
                    {language === "fa" ? "اسم یا عکس گیاهت رو دادی؟ بذار بقیه اطلاعاتش رو من حدس بزنم تا راحت باشی!" : "Gave it a name or photo? Let me guess the rest of the details so you don't have to!"}
                  </p>
                  <Button 
                    type="button" 
                    onClick={handleAIAnalyze} 
                    disabled={isAnalyzing || (!draft.name && !draft.image)} 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-all text-xs h-9"
                  >
                    {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                    {isAnalyzing ? (language === "fa" ? "در حال حدس زدن..." : "Guessing...") : (language === "fa" ? "تکمیل خودکار اطلاعات" : "Auto-fill with AI")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Environment */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {language === "fa" ? "خونه‌ی جدیدش کجاست؟" : "Where is its new home?"}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "fa" ? "به ما بگو کجا زندگی می‌کنه تا بهتر مراقبش باشیم." : "Tell us where it lives so we can care for it better."}
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-4">
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                    {language === "fa" ? "مکان" : "Location"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "Indoor", label: language === "fa" ? "داخل خونه" : "Indoor", icon: Home },
                      { value: "Outdoor", label: language === "fa" ? "بیرون / حیاط" : "Outdoor", icon: TreePine },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => updateDraft("locationType", opt.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${draft.locationType === opt.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <opt.icon className={`h-6 w-6 mb-1 ${draft.locationType === opt.value ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className="font-semibold text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Light */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    {language === "fa" ? "میزان نور" : "Light Exposure"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "Full Sun", label: language === "fa" ? "نور مستقیم" : "Full Sun", icon: Sun },
                      { value: "Bright Indirect", label: language === "fa" ? "نور زیاد غیرمستقیم" : "Bright Indirect", icon: CloudSun },
                      { value: "Partial Shade", label: language === "fa" ? "سایه ملایم" : "Partial Shade", icon: Cloud },
                      { value: "Low Light", label: language === "fa" ? "نور کم" : "Low Light", icon: Leaf },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => updateDraft("lightExposure", opt.value)}
                        className={`flex items-center gap-1.5 p-2.5 rounded-xl border transition-all text-start justify-start ${draft.lightExposure === opt.value ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm ring-1 ring-amber-400' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <opt.icon className={`h-4 w-4 shrink-0 ${draft.lightExposure === opt.value ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="font-medium text-[10px] leading-tight truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Care Basics */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {language === "fa" ? "وضعیت سلامتی و گلدون" : "Health & Pot"}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "fa" ? "یه کوچولو درباره وضعیت فعلیش بهمون بگو." : "Tell us a little bit about its current state."}
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-4">
                {/* Health */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Activity className="h-3.5 w-3.5 text-rose-400" />
                    {language === "fa" ? "حالش چطوره؟" : "How is it doing?"}
                  </label>
                  <div className="flex justify-between gap-2">
                    {[
                      { value: "Excellent", emoji: "🌟", label: language === "fa" ? "عالی" : "Excellent", colorClass: "bg-emerald-50 ring-2 ring-emerald-400 text-emerald-800" },
                      { value: "Good", emoji: "😊", label: language === "fa" ? "خوب" : "Good", colorClass: "bg-blue-50 ring-2 ring-blue-400 text-blue-800" },
                      { value: "Needs Attention", emoji: "🥺", label: language === "fa" ? "نیاز به توجه" : "Needs Love", colorClass: "bg-amber-50 ring-2 ring-amber-400 text-amber-800" },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => updateDraft("health", opt.value)}
                        className={`flex-1 py-2 px-1 flex flex-col items-center gap-0.5 rounded-xl transition-all ${draft.health === opt.value ? opt.colorClass : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="text-[10px] font-semibold">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Pot Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Box className="h-3.5 w-3.5 text-amber-700/60" />
                      {language === "fa" ? "جنس گلدون" : "Pot Type"}
                    </label>
                    <select 
                      value={draft.potType} 
                      onChange={(e) => updateDraft("potType", e.target.value)} 
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-slate-700 shadow-sm"
                    >
                      <option value="Plastic">{language === "fa" ? "پلاستیکی" : "Plastic"}</option>
                      <option value="Terracotta">{language === "fa" ? "سفالی" : "Terracotta"}</option>
                      <option value="Ceramic">{language === "fa" ? "سرامیکی" : "Ceramic"}</option>
                      <option value="Metal">{language === "fa" ? "فلزی" : "Metal"}</option>
                      <option value="Other">{language === "fa" ? "سایر" : "Other"}</option>
                    </select>
                  </div>

                  {/* Drainage */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-slate-400" />
                      {language === "fa" ? "سوراخ زهکشی داره؟" : "Has Drainage?"}
                    </label>
                    <div className="flex bg-slate-100 rounded-xl p-0.5 shadow-inner h-10">
                      <button type="button" onClick={() => updateDraft("hasDrainage", true)} className={`flex-1 rounded-lg text-xs font-medium transition-colors ${draft.hasDrainage ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {language === "fa" ? "بله" : "Yes"}
                      </button>
                      <button type="button" onClick={() => updateDraft("hasDrainage", false)} className={`flex-1 rounded-lg text-xs font-medium transition-colors ${!draft.hasDrainage ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {language === "fa" ? "خیر" : "No"}
                      </button>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 transition-colors mt-1">
                  <input type="checkbox" checked={draft.recentlyReplanted} onChange={e => updateDraft("recentlyReplanted", e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 transition-colors" />
                  <span className="text-xs font-semibold text-slate-700">
                    {language === "fa" ? "تازگی گلدونش رو عوض کردم 🌱" : "I recently repotted it 🌱"}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Watering */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {language === "fa" ? "برنامه آب‌نوشی" : "Watering Habit"}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "fa" ? "کی باید بهش آب بدیم؟ ما یادت میندازیم!" : "When should we water it? We'll remind you!"}
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-4">
                <div className="bg-sky-50/80 rounded-2xl p-5 border border-sky-100 relative overflow-hidden">
                  <Droplets className="absolute -right-4 -top-4 w-20 h-20 text-sky-100 opacity-50 pointer-events-none transform -rotate-12" />
                  
                  <div className="relative z-10 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                        {language === "fa" ? "آخرین باری که آب خورده کی بوده؟" : "When was the last time it drank?"}
                      </label>
                      <input 
                        type="date" 
                        value={draft.lastWatered} 
                        onChange={(e) => updateDraft("lastWatered", e.target.value)} 
                        className="flex h-11 w-full rounded-xl border-0 ring-1 ring-sky-200 bg-white px-4 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-sky-900 shadow-sm" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-sky-900 flex items-center justify-between">
                        <span>{language === "fa" ? "هر چند روز یکبار تشنه میشه؟" : "How often is it thirsty?"}</span>
                        <span className="bg-sky-200 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">{draft.wateringInterval} {language === "fa" ? "روز" : "Days"}</span>
                      </label>
                      <div className="flex items-center gap-4">
                         <input 
                          type="range" 
                          min="1" 
                          max="30" 
                          value={draft.wateringInterval} 
                          onChange={(e) => updateDraft("wateringInterval", parseInt(e.target.value) || 7)} 
                          className="w-full accent-sky-500" 
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-sky-600 font-medium">
                        <span>1 {language === "fa" ? "روز" : "Day"}</span>
                        <span>30 {language === "fa" ? "روز" : "Days"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Fixed Footer Navigation */}
        <footer className="h-20 shrink-0 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md px-6 flex items-center justify-between z-20 relative">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={step === 1 ? () => router.push("/") : prevStep} 
            className="text-slate-500 hover:text-slate-800 rounded-xl"
          >
            {step === 1 ? t("cancel") : (
              <span className="flex items-center gap-1">
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {language === "fa" ? "قبلی" : "Back"}
              </span>
            )}
          </Button>
          
          {step < 4 ? (
            <Button 
              type="button"
              onClick={nextStep} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md px-6 flex items-center gap-1 h-10"
            >
              {language === "fa" ? "بعدی" : "Next"}
              {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <Button 
              type="button"
              onClick={handleSubmit} 
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md px-6 font-bold text-sm h-10"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Leaf className="h-4 w-4 mr-1.5" />}
              {language === "fa" ? "ذخیره دوست جدید من!" : "Save My New Friend!"}
            </Button>
          )}
        </footer>
      </div>
    </div>
  )
}

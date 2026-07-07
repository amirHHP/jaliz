"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"
import { 
  Leaf, Sparkles, Droplets, Camera, Loader2, Info, 
  Share, Plus, ArrowLeft, Heart, ShieldCheck, CheckCircle2,
  AlertTriangle, LogIn, ExternalLink, QrCode, Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { diagnosePlantAction } from "@/app/actions/ai"

function StoreScanContent() {
  const { t, language } = useLanguage()
  const { status } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const storeName = searchParams.get("store") || ""
  const isRtl = language === "fa"
  
  // UI states
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // PWA detection & trigger states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0)

  const loadingMessagesFa = [
    "در حال فعال‌سازی دوربین هوشمند...",
    "اسکن جزئیات برگ و ساقه گیاه...",
    "ارتباط با گیاه‌شناس هوشمند جالیز...",
    "بررسی شرایط نوری و نیاز آبی گیاه...",
    "آماده‌سازی راهنمای نگهداری اختصاصی..."
  ]

  const loadingMessagesEn = [
    "Activating smart camera...",
    "Scanning leaf and stem details...",
    "Consulting with Jaliz AI Botanist...",
    "Analyzing lighting and water needs...",
    "Preparing your custom care guide..."
  ]

  // Detect PWA support and device type
  useEffect(() => {
    if (typeof window === "undefined") return

    // Standalone check
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    )

    // iOS check
    const isIOSDevice = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  // Rotate loading messages
  useEffect(() => {
    if (!isAnalyzing) return
    const interval = setInterval(() => {
      setLoadingMessageIdx(idx => (idx + 1) % loadingMessagesFa.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isAnalyzing])

  // Handle file capture
  const processFile = (file: File) => {
    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX = 800
        let w = img.width, h = img.height
        if (w > h ? w > MAX : h > MAX) {
          if (w > h) { h *= MAX / w; w = MAX } else { w *= MAX / h; h = MAX }
        }
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, w, h)
        const base64 = canvas.toDataURL("image/jpeg", 0.7)
        
        setUploadedImage(base64)
        triggerAIAnalysis(base64)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const triggerAIAnalysis = async (imageBase64: string) => {
    setIsAnalyzing(true)
    setDiagnosis(null)
    try {
      const result = await diagnosePlantAction({ image: imageBase64, language })
      if (result.error) {
        setError(result.error)
      } else {
        setDiagnosis(result)
      }
    } catch (err: any) {
      setError(err?.message || "Failed to analyze plant")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }
  }

  const saveDraftAndRedirect = (destination: "/register" | "/login") => {
    if (!diagnosis) return
    
    const draftPlant = {
      name: diagnosis.name,
      type: diagnosis.type || "Indoor",
      locationType: diagnosis.locationType || "Indoor",
      lightExposure: diagnosis.lightExposure || "Bright Indirect",
      potType: diagnosis.potType || "Plastic",
      growingMedium: diagnosis.growingMedium || "Soil",
      hasDrainage: diagnosis.hasDrainage !== false,
      lastWatered: new Date().toISOString().split("T")[0],
      recentlyReplanted: false,
      health: diagnosis.health || "Excellent",
      image: uploadedImage,
      careTips: diagnosis.careTips || "",
      wateringTips: diagnosis.wateringTips || "",
      wateringInterval: diagnosis.wateringInterval || 7,
      store: storeName
    }
    
    localStorage.setItem("jaliz_scanned_plant_draft", JSON.stringify(draftPlant))
    router.push(destination)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-teal-50 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 px-4 py-6 flex flex-col items-center">
      
      {/* Header Bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
          <Home className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-1.5 px-3 rounded-full border border-emerald-100 dark:border-emerald-900 shadow-sm text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <Leaf className="h-3.5 w-3.5" />
          <span>جالیز | Jaliz</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => router.push("/store-scan/print")} className="rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm" title="Print Stand">
          <QrCode className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg">
        
        {/* Welcome Section */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white leading-tight">
            {storeName 
              ? (t("store_scan_welcome") as string).replace("{store}", storeName)
              : t("store_scan_welcome_default")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t("store_scan_subtitle")}
          </p>
        </div>

        {/* Step 1: Upload or Scan */}
        {!uploadedImage && !isAnalyzing && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative cursor-pointer aspect-square rounded-3xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900/80 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center p-8 text-center transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500"
          >
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mb-6 shadow-md shadow-emerald-500/10 group-hover:scale-110 transition-transform duration-300">
              <Camera className="h-10 w-10 text-emerald-700 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("store_scan_take_photo")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              {isRtl 
                ? "برای شناسایی گیاه و دریافت راهنمای نگهداری، دوربین گوشی را باز کنید یا عکسی آپلود کنید."
                : "Open your camera or upload a photo to identify the plant and get care tips."}
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) processFile(file)
              }}
              accept="image/*" 
              capture="environment" 
              className="hidden" 
            />
          </div>
        )}

        {/* Step 2: Analyzing Loader */}
        {isAnalyzing && (
          <div className="aspect-square rounded-3xl bg-white dark:bg-slate-900 shadow-xl flex flex-col items-center justify-center p-8 text-center border border-emerald-100 dark:border-emerald-950">
            <div className="relative w-28 h-28 flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-emerald-950" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
              <Leaf className="h-12 w-12 text-emerald-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              {t("store_scan_analyzing")}
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium animate-pulse max-w-xs min-h-[40px] px-4">
              {isRtl ? loadingMessagesFa[loadingMessageIdx] : loadingMessagesEn[loadingMessageIdx]}
            </p>
          </div>
        )}

        {/* Step 3: Result Display */}
        {diagnosis && (
          <div className="space-y-6 animate-slide-up">
            
            {/* Main Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-xl overflow-hidden">
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 w-full overflow-hidden">
                <img src={uploadedImage} alt="Scanned Plant" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setUploadedImage(""); setDiagnosis(null); setError(null) }}
                  className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white py-1.5 px-3 rounded-full hover:bg-black/80 transition-colors text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isRtl ? "اسکن مجدد" : "Scan Again"}</span>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {diagnosis.name}
                    </h2>
                    <span className={`text-xs font-bold border px-2.5 py-1 rounded-full shrink-0 ${
                      diagnosis.health === "Excellent" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900" 
                        : diagnosis.health === "Good"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                    }`}>
                      {diagnosis.health === "Excellent" ? "عالی" : diagnosis.health === "Good" ? "خوب" : "نیازمند توجه"}
                    </span>
                  </div>
                  {diagnosis.type && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{diagnosis.type}</p>
                  )}
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Specific Diagnosis */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isRtl ? "تشخیص وضعیت" : "Diagnosis"}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100/50 dark:border-slate-900/50">
                    {diagnosis.diagnosis}
                  </p>
                </div>

                {/* Treatment / Advice */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isRtl ? "راه‌حل‌های درمانی و احیا" : "Care & Treatment Plan"}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/20 dark:bg-amber-950/10 p-3.5 rounded-2xl border border-amber-100/30 dark:border-amber-900/20">
                    {diagnosis.advice}
                  </p>
                </div>

                {/* Care tips details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {diagnosis.careTips && (
                    <div className="bg-emerald-50/20 dark:bg-emerald-950/10 p-3.5 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/20 space-y-1">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                        {isRtl ? "مراقبت عمومی" : "General Care"}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{diagnosis.careTips}</p>
                    </div>
                  )}
                  {diagnosis.wateringTips && (
                    <div className="bg-sky-50/20 dark:bg-sky-950/10 p-3.5 rounded-2xl border border-sky-100/30 dark:border-sky-900/20 space-y-1">
                      <span className="text-xs font-bold text-sky-800 dark:text-sky-300 block">
                        {isRtl ? "نکات آبیاری" : "Watering Details"}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{diagnosis.wateringTips}</p>
                    </div>
                  )}
                </div>

                {/* Watering Interval Highlight */}
                {diagnosis.wateringInterval && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-sky-500/10 to-teal-500/10 p-4 rounded-2xl border border-sky-100 dark:border-sky-950/50">
                    <Droplets className="w-8 h-8 text-sky-500 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">{isRtl ? "برنامه آبیاری پیشنهادی" : "Suggested Watering Routine"}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {isRtl 
                          ? `هر ${diagnosis.wateringInterval} روز یک‌بار آبیاری شود`
                          : `Water every ${diagnosis.wateringInterval} days`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* HIGH-CONVERSION PWA & SIGNUP BOX */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-emerald-700/20">
              {/* Glow accents */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative space-y-5 text-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <Leaf className="w-8 h-8 text-emerald-200 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-extrabold tracking-tight">
                    {t("store_scan_pwa_title")}
                  </h3>
                  <p className="text-xs md:text-sm text-emerald-100 leading-relaxed">
                    {t("store_scan_pwa_desc")}
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  
                  {/* Native PWA Prompt (Android/Chrome) */}
                  {!isStandalone && deferredPrompt && (
                    <Button 
                      onClick={handleInstallClick} 
                      className="w-full py-6 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold shadow-lg shadow-black/10 hover:scale-[1.01] transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      {t("install_button")}
                    </Button>
                  )}

                  {/* iOS PWA Step-by-Step Guide */}
                  {!isStandalone && isIOS && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 text-start">
                      <p className="text-xs font-bold text-center border-b border-white/10 pb-2">
                        {t("install_ios_guide")}
                      </p>
                      <div className="flex items-center justify-around gap-2 text-xs">
                        <div className="flex items-center gap-1.5 bg-white/10 py-1.5 px-3 rounded-lg">
                          <span className="bg-emerald-500 text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">۱</span>
                          <Share className="w-3.5 h-3.5" />
                          <span>{t("install_ios_step1")}</span>
                        </div>
                        <div className="text-emerald-300">➔</div>
                        <div className="flex items-center gap-1.5 bg-white/10 py-1.5 px-3 rounded-lg">
                          <span className="bg-emerald-500 text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">۲</span>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t("install_ios_step2")}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* If PWA is installed, show checkmark */}
                  {isStandalone && (
                    <div className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-white/20 text-emerald-100 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{isRtl ? "نسخه اپلیکیشن جالیز روی گوشی شما فعال است 🪴" : "Jaliz App is installed 🪴"}</span>
                    </div>
                  )}

                  {/* Signup bridge to save plant */}
                  <Button 
                    onClick={() => saveDraftAndRedirect("/register")}
                    className="w-full py-6 rounded-2xl bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 font-extrabold shadow-md shadow-emerald-950/20 hover:scale-[1.01] transition-all"
                  >
                    {t("store_scan_register_cta")}
                  </Button>

                  <button 
                    onClick={() => saveDraftAndRedirect("/login")}
                    className="text-xs text-emerald-100 hover:text-white font-medium underline underline-offset-4 pt-1 opacity-90 block mx-auto"
                  >
                    {isRtl ? "قبلاً ثبت‌نام کرده‌اید؟ ورود به حساب کاربری" : "Already registered? Login"}
                  </button>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 rounded-3xl p-5 text-center flex flex-col items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold">{isRtl ? "خطا در پردازش تصویر" : "Error Processing Image"}</p>
              <p className="text-xs opacity-90 mt-1">{error}</p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => { setUploadedImage(""); setDiagnosis(null); setError(null) }}
              className="mt-2 bg-white text-red-800 hover:bg-red-50 border-red-200"
            >
              {isRtl ? "تلاش مجدد" : "Try Again"}
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}

export default function StoreScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    }>
      <StoreScanContent />
    </Suspense>
  )
}

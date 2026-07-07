"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { Printer, QrCode, ArrowLeft, Leaf, Camera, Sparkles, BookOpen, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PrintStandPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  
  const [storeName, setStoreName] = useState("سبزین")
  const [origin, setOrigin] = useState("http://localhost:3000")
  const isRtl = language === "fa"

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const qrDataUrl = `${origin}/store-scan?store=${encodeURIComponent(storeName)}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDataUrl)}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center">
      
      {/* Control Panel (Hidden on Print) */}
      <div className="print:hidden w-full max-w-4xl bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => router.push("/store-scan")}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isRtl ? "بازگشت به صفحه اسکنر" : "Back to Scanner Page"}</span>
            </button>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-6 h-6 text-emerald-600 animate-pulse" />
              <span>{isRtl ? "طراحی و چاپ استند فروشگاهی" : "Design & Print Store Stand"}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              {isRtl 
                ? "نام گل‌فروشی خود را وارد کنید تا بارکد اختصاصی آن ساخته شود. سپس این صفحه را چاپ کنید، کاغذ را از روی خط‌چین تا بزنید و روی کانتر گل‌فروشی قرار دهید تا مشتریان از آن استفاده کنند."
                : "Enter your store name to generate a custom QR code. Then print this page, fold along the dotted line, and place it on your store counter."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
            <div className="space-y-1.5 w-full sm:w-auto">
              <label htmlFor="store-name-input" className="text-xs font-bold text-slate-500 block">
                {isRtl ? "نام گل‌فروشی / فروشگاه" : "Store Name"}
              </label>
              <input
                id="store-name-input"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. سبزین"
                className="w-full sm:w-48 h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-950 dark:text-white"
              />
            </div>
            <Button 
              onClick={handlePrint}
              className="w-full sm:w-auto h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{isRtl ? "چاپ استند (Ctrl + P)" : "Print Stand (Ctrl + P)"}</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 max-w-xl">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isRtl
              ? "نکته: در پنجره چاپ مرورگر، گزینه Background Graphics را فعال کرده و Margins را روی None یا Minimum تنظیم کنید تا رنگ‌ها و ابعاد به بهترین شکل چاپ شوند."
              : "Tip: In the print dialog, enable 'Background Graphics' and set 'Margins' to 'None' or 'Minimum' for best results."}
          </p>
        </div>
      </div>

      {/* Printable Area */}
      <div className="w-full max-w-4xl flex-1 flex items-center justify-center p-4 md:p-12 print:p-0">
        
        {/* The Foldable Stand Card */}
        <div className="w-[185mm] h-[260mm] bg-white text-slate-900 border-2 border-slate-200 rounded-[20px] shadow-2xl overflow-hidden flex flex-col relative print:border-none print:shadow-none print:rounded-none print:w-full print:h-full">
          
          {/* TOP SIDE (Back facing when folded) */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-t from-slate-50 to-emerald-50/30 p-12 border-b border-dashed border-emerald-300 relative select-none">
            {/* Upside down indicator warning */}
            <div className="absolute top-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider opacity-60">
              {isRtl ? "▲ پشت استند (بعد از تا شدن) ▲" : "▲ BACK OF STAND (WHEN FOLDED) ▲"}
            </div>

            <div className="rotate-180 flex flex-col items-center text-center space-y-4 max-w-md">
              <div className="w-16 h-16 bg-emerald-600/10 rounded-full flex items-center justify-center">
                <Leaf className="w-8 h-8 text-emerald-700" />
              </div>
              <h2 className="text-2xl font-black text-emerald-900">جالیز | Jaliz</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {isRtl
                  ? "شناسنامه، تشخیص بیماری و یادآور آبیاری هوشمند گیاهان شما. جالیز را نصب کنید تا گیاهان شاداب‌تری داشته باشید."
                  : "Watering schedule, plant health diagnosis, and hyper-local tips. Keep your plants thriving with Jaliz."}
              </p>
              <div className="border border-emerald-200/60 bg-white/80 py-1.5 px-3 rounded-full text-[10px] font-bold text-emerald-800 uppercase tracking-wider shadow-sm">
                jaliz.app
              </div>
            </div>
          </div>

          {/* FOLD LINE INDICATOR */}
          <div className="h-0 relative z-10 flex items-center justify-center">
            <div className="absolute left-0 right-0 border-t border-dashed border-slate-400 pointer-events-none" />
            <div className="bg-slate-100 border border-slate-300 py-1 px-4 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none select-none flex items-center gap-1">
              <span>←</span>
              <span>{isRtl ? "محل تا زدن کاغذ" : "FOLD LINE"}</span>
              <span>→</span>
            </div>
          </div>

          {/* BOTTOM SIDE (Front facing when folded) */}
          <div className="flex-1 flex flex-col justify-between p-10 bg-gradient-to-b from-slate-50 to-emerald-50/20 relative select-none">
            
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-extrabold text-emerald-950 uppercase tracking-wider">جالیز | Jaliz</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-full border border-emerald-100">
                {storeName}
              </div>
            </div>

            {/* Main content: QR and Instructions */}
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 my-auto">
              
              {/* Left Side: Dynamic QR Code */}
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageUrl}
                    alt="QR Code to Scan"
                    width={180}
                    height={180}
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isRtl ? "برای شروع اسکن کنید" : "Scan to start"}</span>
                </span>
              </div>

              {/* Right Side: Step-by-Step guide */}
              <div className="space-y-4 max-w-sm">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {isRtl ? "چگونه از این گیاه مراقبت کنیم؟" : "How do I take care of this plant?"}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {isRtl
                      ? "تنها در سه مرحله راهنمای کامل نگهداری و برنامه آبیاری این گیاه را دریافت کنید:"
                      : "Get custom care advice and watering routines in three simple steps:"}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-emerald-600/10">۱</div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        {isRtl ? "بارکد بالا را اسکن کنید" : "Scan the QR code"}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">
                        {isRtl ? "دوربین گوشی خود را باز کرده و روی بارکد نگه دارید." : "Open your phone camera and point at the QR code."}
                      </span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-emerald-600/10">۲</div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        {isRtl ? "از گیاه عکس بگیرید" : "Snapshot the plant"}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">
                        {isRtl ? "تصویری واضح از برگ‌ها یا بدنه گیاه آپلود کنید." : "Take a clean photo of the leaves or stem to identify."}
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-emerald-600/10">۳</div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        {isRtl ? "راهنما را دریافت و ذخیره کنید" : "Read care & Save PWA"}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">
                        {isRtl 
                          ? "نکات نگهداری و عیب‌یابی را بخوانید و جالیز را به صفحه گوشی خود بیفزایید." 
                          : "Read diagnostics, and add Jaliz to your screen for smart reminders."}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom branding footer */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>{isRtl ? "جالیز، همراه باصفای گیاهان شما" : "Jaliz, your plant care companion"}</span>
              <span>www.jaliz.app</span>
            </div>

          </div>

        </div>
      </div>

      {/* Global CSS overrides for clean printing */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #__next, main, .page-shell {
            background: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

    </div>
  )
}

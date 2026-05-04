"use client"

import { useState } from "react"
import { WeatherAdvice } from "@/components/WeatherAdvice"
import { MarketplaceGrid } from "@/components/MarketplaceGrid"
import { Leaf, Globe, Settings } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { SettingsModal } from "@/components/SettingsModal"

export default function Dashboard() {
  const { language, setLanguage, t } = useLanguage()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
            <a href="/" className="text-emerald-700 font-semibold transition-colors">{t("dashboard")}</a>
            <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors">{t("marketplace")}</a>
            <a href="/plants" className="text-slate-600 hover:text-emerald-700 transition-colors">{t("my_plants")}</a>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12 max-w-6xl">
        
        {/* Welcome Section */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {t("welcome_title")}
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            {t("welcome_desc")}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: AI Advice */}
          <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
            <WeatherAdvice />
            
            <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-600/30 blur-2xl"></div>
              <h3 className="font-semibold text-lg relative z-10 text-emerald-50">{t("watering_title")}</h3>
              <p className="text-slate-300 text-sm mt-2 mb-5 relative z-10">{t("watering_desc")}</p>
              <div className="flex -space-x-2 relative z-10 rtl:space-x-reverse">
                {['M', 'F', 'S'].map((initial, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-semibold text-emerald-400 shadow-sm">
                    {initial}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Marketplace */}
          <div className="lg:col-span-7 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            <MarketplaceGrid />
          </div>

        </div>
      </main>
    </div>
  )
}


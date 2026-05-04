"use client"

import { WeatherAdvice } from "@/components/WeatherAdvice"
import { MarketplaceGrid } from "@/components/MarketplaceGrid"
import { Leaf, Globe } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"

export default function Dashboard() {
  const { language, setLanguage, t } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en")
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">{t("app_title")}</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-emerald-700/80">
            <a href="#" className="text-emerald-700 hover:text-emerald-900 transition-colors">{t("dashboard")}</a>
            <a href="#" className="hover:text-emerald-900 transition-colors">{t("marketplace")}</a>
            <a href="#" className="hover:text-emerald-900 transition-colors">{t("my_plants")}</a>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 transition-colors bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100"
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "فارسی" : "English"}
            </button>
            <div className="h-8 w-8 rounded-full bg-emerald-200 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12 max-w-6xl">
        
        {/* Welcome Section */}
        <section className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-950 tracking-tight">
            {t("welcome_title")}
          </h1>
          <p className="text-emerald-600/80 text-lg">
            {t("welcome_desc")}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: AI Advice */}
          <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
            <WeatherAdvice />
            
            <div className="bg-emerald-900 text-emerald-50 rounded-xl p-6 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-800/50 blur-2xl"></div>
              <h3 className="font-semibold text-lg relative z-10">{t("watering_title")}</h3>
              <p className="text-emerald-200/80 text-sm mt-1 mb-4 relative z-10">{t("watering_desc")}</p>
              <div className="flex -space-x-2 relative z-10 rtl:space-x-reverse">
                {['M', 'F', 'S'].map((initial, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-emerald-700 border-2 border-emerald-900 flex items-center justify-center text-xs font-medium">
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

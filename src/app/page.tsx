"use client"

import { WeatherAdvice } from "@/components/WeatherAdvice"
import { MarketplaceGrid } from "@/components/MarketplaceGrid"
import { Header } from "@/components/Header"
import { useLanguage } from "@/components/LanguageProvider"
import { useAuth } from "@/components/AuthProvider"

export default function Dashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()

  // Greet the signed-in user by their first name; fall back to the generic
  // welcome string for anonymous visitors.
  const firstName = user?.fullName?.trim().split(/\s+/)[0]
  const welcomeTitle = firstName
    ? t("welcome_title").replace(/Sarah|سارا/, firstName)
    : t("welcome_title")

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-12 max-w-6xl">
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {welcomeTitle}
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">{t("welcome_desc")}</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
            <WeatherAdvice />

            <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-600/30 blur-2xl"></div>
              <h3 className="font-semibold text-lg relative z-10 text-emerald-50">
                {t("watering_title")}
              </h3>
              <p className="text-slate-300 text-sm mt-2 mb-5 relative z-10">
                {t("watering_desc")}
              </p>
              <div className="flex -space-x-2 relative z-10 rtl:space-x-reverse">
                {["M", "F", "S"].map((initial, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-semibold text-emerald-400 shadow-sm"
                  >
                    {initial}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            <MarketplaceGrid />
          </div>
        </div>
      </main>
    </div>
  )
}

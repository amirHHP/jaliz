"use client"

import { Header } from "@/components/Header"
import { MarketplaceGrid } from "@/components/MarketplaceGrid"
import { WeatherAdvice } from "@/components/WeatherAdvice"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { WateringSchedule } from "@/components/WateringSchedule"

/**
 * Authenticated home view. Greets the signed-in user, surfaces today's
 * AI advice, and shows nearby marketplace activity.
 */
export function Dashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()

  // Greet the signed-in user by their first name; fall back to the generic
  // welcome string for anonymous visitors (which the router shouldn't show
  // here, but we stay defensive).
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

            <WateringSchedule />
          </div>

          <div className="lg:col-span-7 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            <MarketplaceGrid />
          </div>
        </div>
      </main>
    </div>
  )
}

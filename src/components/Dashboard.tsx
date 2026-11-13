"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { WeatherAdvice } from "@/components/WeatherAdvice"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { WateringSchedule } from "@/components/WateringSchedule"
import { PlantMascot } from "@/components/mascot/PlantMascot"
import { createSubscriptionPaymentAction } from "@/app/actions/payments"
import { SUBSCRIPTION_PRICE_TOMAN, isSubscriptionActive } from "@/lib/subscription"
import { Button } from "@/components/ui/button"
import { Droplets, CloudRain, Lock, Loader2 } from "lucide-react"

function formatToman(amount: number, language: string): string {
  const formatted = new Intl.NumberFormat(language === "fa" ? "fa-IR" : "en-US").format(amount)
  return language === "fa" ? `${formatted} تومان` : `${formatted} Toman`
}

/**
 * Authenticated irrigation & care view (/schedule).
 * Displays Duolingo-style mascot companion at the top with clean, unboxed daily AI advice,
 * followed by the smart watering schedule and gamified task lists.
 * Fully locked with a preview paywall for users without an active subscription.
 */
export function Dashboard() {
  const { t, language } = useLanguage()
  const { user, refreshUser } = useAuth()
  const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)

  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const subscribedFlag = params.get("subscribed")
    const payment = params.get("payment")
    if (subscribedFlag === "1") {
      setBanner(language === "fa" ? "اشتراک شما با موفقیت فعال شد." : "Your subscription is now active.")
      void refreshUser()
    } else if (payment === "cancelled") {
      setBanner(language === "fa" ? "پرداخت لغو شد." : "Payment was cancelled.")
    } else if (payment === "failed") {
      setBanner(
        language === "fa"
          ? "تأیید پرداخت ناموفق بود. دوباره تلاش کنید."
          : "Payment verification failed. Please try again."
      )
    }
  }, [language, refreshUser])

  const handleBuySubscription = async () => {
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const result = await createSubscriptionPaymentAction()
      if (!result.ok) {
        setCheckoutError(result.error)
        return
      }
      window.location.href = result.paymentUrl
    } catch (e) {
      console.error(e)
      setCheckoutError(
        language === "fa"
          ? "شروع پرداخت ممکن نشد. دوباره تلاش کنید."
          : "Could not start checkout. Please try again."
      )
    } finally {
      setCheckoutLoading(false)
    }
  }

  // Greet the signed-in user by their first name for the locked view
  const firstName = user?.fullName?.trim().split(/\s+/)[0]
  const [timeGreetingKey, setTimeGreetingKey] = useState<string>("morning_greeting")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 12 && hour < 17) {
      setTimeGreetingKey("afternoon_greeting")
    } else if (hour >= 17 && hour < 20) {
      setTimeGreetingKey("evening_greeting")
    } else if (hour >= 20 || hour < 5) {
      setTimeGreetingKey("night_greeting")
    }
  }, [])

  const welcomeTitle = firstName
    ? t(timeGreetingKey as any).replace(/Sarah|سارا/, firstName)
    : t(timeGreetingKey as any)

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900 pb-20 md:pb-12">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8 space-y-8 max-w-4xl">
        {banner && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm animate-in fade-in duration-300">
            {banner}
          </div>
        )}

        {subscribed ? (
          /* Unlocked view: Mascot & AI Advice at the very top (unboxed pure text), followed by Watering Schedule */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <WeatherAdvice />
            <WateringSchedule />
          </div>
        ) : (
          /* Entire irrigation & weather section is locked with Paywall */
          <>
            <section className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{welcomeTitle}</span>
                <span className="text-emerald-600 inline-block">🌿</span>
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-2xl">{t("welcome_desc")}</p>
            </section>

            <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 text-emerald-950 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl" />
                <div className="absolute -bottom-12 -left-8 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl" />
              </div>

              {/* Blurred preview of companion, watering, and weather sections */}
              <div className="select-none p-6 md:p-8 blur-[4px] opacity-40 space-y-6" aria-hidden="true">
                <div className="rounded-3xl border border-emerald-200/70 bg-white/70 p-5 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <PlantMascot state="thriving" size={64} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-emerald-300/60" />
                    <div className="h-3 w-64 rounded bg-emerald-200/50" />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100/70 bg-white/70 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-2.5">
                      <Droplets className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="h-5 w-40 rounded bg-emerald-800/70" />
                      <div className="h-3 w-56 rounded bg-emerald-600/40 mt-1.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lock card overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-950/20 px-5 backdrop-blur-[2px]">
                <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/95 p-6 md:p-8 text-center shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
                    <Lock className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    {language === "fa"
                      ? "بخش آبیاری، همراه برگچه و مشاوره هوشمند قفل است"
                      : "Smart Watering, Bargcheh Companion & Weather Advice are Locked"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-800/80">
                    {language === "fa"
                      ? "با فعال‌سازی اشتراک ماهانه، همراه با برگچه برنامه زمان‌بندی هوشمند آبیاری، استمرار روزانه و تحلیل آب‌وهوایی گیاهانتان را دریافت کنید."
                      : "Unlock smart watering schedule, Bargcheh mascot companion, and hyper-local weather advice with a monthly subscription."}
                  </p>
                  <div className="mt-5 rounded-2xl bg-emerald-50/80 border border-emerald-100 p-3 text-center">
                    <p className="text-2xl font-black tracking-tight text-emerald-900">
                      {formatToman(SUBSCRIPTION_PRICE_TOMAN, language)}
                      <span className="ms-1.5 text-sm font-semibold text-emerald-700/70">
                        {language === "fa" ? "/ ماه" : "/ month"}
                      </span>
                    </p>
                  </div>

                  {checkoutError && (
                    <p className="mt-3 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200/70 rounded-xl p-2">
                      {checkoutError}
                    </p>
                  )}

                  <Button
                    onClick={handleBuySubscription}
                    disabled={checkoutLoading}
                    className="mt-5 w-full rounded-2xl bg-emerald-600 py-6 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <span className="ms-2">
                      {checkoutLoading
                        ? language === "fa"
                          ? "در حال اتصال به درگاه..."
                          : "Connecting to checkout..."
                        : language === "fa"
                        ? "خرید اشتراک و فعال‌سازی"
                        : "Buy subscription"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

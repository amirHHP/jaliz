"use client"

import Link from "next/link"
import {
  ArrowRight,
  CloudSun,
  Languages,
  Leaf,
  LogIn,
  ShoppingBag,
  Sparkles,
  Sprout,
  UserPlus,
} from "lucide-react"

import { Header } from "@/components/Header"
import { useLanguage } from "@/components/LanguageProvider"

/**
 * Marketing landing page shown to anonymous visitors. The dashboard at `/`
 * takes over once a user signs in.
 */
export function LandingPage() {
  const { t, language } = useLanguage()
  // Flip the directional arrow in RTL so it always points "forward".
  const arrowClass = `h-4 w-4 ${language === "fa" ? "rotate-180" : ""}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 selection:bg-emerald-200 selection:text-emerald-900">
      <Header />

      {/* Hero ------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        {/* Decorative blurred blobs */}
        <div className="pointer-events-none absolute -top-40 -end-40 h-80 w-80 rounded-full bg-emerald-200/60 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -start-32 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl" />

        <div className="container relative mx-auto px-4 py-16 md:py-24 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                {t("landing_hero_eyebrow")}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                {t("landing_hero_title")}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl">
                {t("landing_hero_subtitle")}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  {t("landing_cta_primary")}
                  <ArrowRight className={arrowClass} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 px-5 py-3 text-sm font-semibold shadow-sm border border-slate-200 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  {t("landing_cta_secondary")}
                </Link>
              </div>

              <div className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">
                  {t("landing_trust_label")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {([
                    "landing_trust_chip_1",
                    "landing_trust_chip_2",
                    "landing_trust_chip_3",
                    "landing_trust_chip_4",
                  ] as const).map((key) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
                    >
                      <Sprout className="h-3 w-3 text-emerald-600" />
                      {t(key)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
              <HeroPreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* Features ------------------------------------------------------- */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">
            {t("landing_features_eyebrow")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mt-4">
            {t("landing_features_title")}
          </h2>
          <p className="text-slate-600 mt-3">
            {t("landing_features_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard
            icon={<CloudSun className="h-5 w-5" />}
            tone="emerald"
            title={t("landing_feature_1_title")}
            desc={t("landing_feature_1_desc")}
          />
          <FeatureCard
            icon={<Sprout className="h-5 w-5" />}
            tone="lime"
            title={t("landing_feature_2_title")}
            desc={t("landing_feature_2_desc")}
          />
          <FeatureCard
            icon={<ShoppingBag className="h-5 w-5" />}
            tone="amber"
            title={t("landing_feature_3_title")}
            desc={t("landing_feature_3_desc")}
          />
          <FeatureCard
            icon={<Languages className="h-5 w-5" />}
            tone="sky"
            title={t("landing_feature_4_title")}
            desc={t("landing_feature_4_desc")}
          />
        </div>
      </section>

      {/* How it works --------------------------------------------------- */}
      <section className="bg-slate-900 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 end-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 start-0 h-72 w-72 rounded-full bg-emerald-700/20 blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-200 px-3 py-1 text-xs font-semibold">
              {t("landing_how_eyebrow")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">
              {t("landing_how_title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step
              number={1}
              title={t("landing_step_1_title")}
              desc={t("landing_step_1_desc")}
            />
            <Step
              number={2}
              title={t("landing_step_2_title")}
              desc={t("landing_step_2_desc")}
            />
            <Step
              number={3}
              title={t("landing_step_3_title")}
              desc={t("landing_step_3_desc")}
            />
          </div>
        </div>
      </section>

      {/* Final CTA ------------------------------------------------------ */}
      <section className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-10 md:p-14 shadow-xl">
          <div className="pointer-events-none absolute -top-20 -end-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t("landing_final_cta_title")}
            </h2>
            <p className="text-emerald-50/90 text-lg mt-3">
              {t("landing_final_cta_subtitle")}
            </p>
            <div className="mt-6">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-3 text-sm font-semibold shadow-md transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                {t("landing_final_cta_button")}
                <ArrowRight className={arrowClass} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer --------------------------------------------------------- */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Leaf className="h-4 w-4 text-emerald-600" />
            <span className="font-bold text-slate-900">{t("app_title")}</span>
          </div>
          <p className="text-xs text-slate-500">{t("landing_footer")}</p>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type FeatureTone = "emerald" | "amber" | "sky" | "lime"

const TONE_CLASSES: Record<FeatureTone, { wrap: string; icon: string }> = {
  emerald: { wrap: "bg-emerald-50", icon: "text-emerald-600" },
  amber: { wrap: "bg-amber-50", icon: "text-amber-600" },
  sky: { wrap: "bg-sky-50", icon: "text-sky-600" },
  lime: { wrap: "bg-lime-50", icon: "text-lime-700" },
}

function FeatureCard({
  icon,
  title,
  desc,
  tone,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  tone: FeatureTone
}) {
  const palette = TONE_CLASSES[tone]
  return (
    <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div
        className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${palette.wrap} ${palette.icon}`}
      >
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}

function Step({
  number,
  title,
  desc,
}: {
  number: number
  title: string
  desc: string
}) {
  return (
    <div className="relative rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-lg">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-300 leading-relaxed">{desc}</p>
    </div>
  )
}

/**
 * Compact, decorative preview of the dashboard's signature feature
 * (AI-generated weather advice). Uses static copy from translations so the
 * preview reads naturally in both English and Persian.
 */
function HeroPreviewCard() {
  const { t } = useLanguage()
  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-200/60 via-emerald-100/40 to-transparent blur-2xl" />
      <div className="relative rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Mock window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CloudSun className="h-5 w-5 text-emerald-700" />
              </div>
              <h3 className="font-semibold text-slate-900">
                {t("landing_hero_card_title")}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              <Sparkles className="h-3 w-3" />
              {t("landing_hero_card_badge")}
            </span>
          </div>

          <ul className="space-y-3">
            <li className="flex gap-3 rounded-lg bg-slate-50 p-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                {t("landing_hero_card_line1")}
              </p>
            </li>
            <li className="flex gap-3 rounded-lg bg-slate-50 p-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                {t("landing_hero_card_line2")}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

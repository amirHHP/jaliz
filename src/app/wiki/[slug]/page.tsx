import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/Header"
import {
  getAllWikiPlants,
  getWikiPlantBySlug,
  getRelatedWikiPlants,
  WikiPlant,
} from "@/lib/wikiData"
import { blogPosts, type BlogPost } from "@/lib/blogData"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sun,
  Droplets,
  Thermometer,
  Sprout,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Calendar,
  Store,
  Sparkles,
  ChevronLeft,
  Leaf,
  PlusCircle,
  BookOpen,
  Info,
} from "lucide-react"
import { getCanonicalSiteUrl } from "@/lib/siteUrl"

const SITE_URL = getCanonicalSiteUrl()

interface Props {
  params: Promise<{ slug: string }>
}

function findPlant(slug: string): WikiPlant | undefined {
  const decoded = decodeURIComponent(slug)
  return getWikiPlantBySlug(slug) || getWikiPlantBySlug(decoded)
}

function getMatchingBlogPosts(plant: WikiPlant, limit = 2): BlogPost[] {
  const faPosts = blogPosts.filter((p) => p.lang === "fa")
  const keywords = [plant.nameFa, plant.nameEn, plant.scientificName, ...plant.tags].map((k) =>
    k.toLowerCase(),
  )

  const scored = faPosts.map((post) => {
    let score = 0
    const title = post.title.toLowerCase()
    const desc = post.description.toLowerCase()
    const postKws = post.keywords.map((k) => k.toLowerCase())

    for (const kw of keywords) {
      if (title.includes(kw)) score += 5
      if (desc.includes(kw)) score += 2
      if (postKws.some((pk) => pk.includes(kw))) score += 3
    }

    if (post.categoryEn === "care" || post.categoryEn === "plants") {
      score += 1
    }

    return { post, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.post)
}

export async function generateStaticParams() {
  return getAllWikiPlants().map((plant) => ({
    slug: plant.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const plant = findPlant(slug)

  if (!plant) {
    return {
      title: "گیاه یافت نشد | دانشنامه جالیز",
    }
  }

  const title = `راهنمای کامل نگهداری و پرورش ${plant.nameFa} (${plant.nameEn}) | دانشنامه جالیز`
  const description = plant.description.slice(0, 160)
  const canonical = `${SITE_URL}/wiki/${encodeURIComponent(plant.slug)}`

  return {
    title,
    description,
    keywords: [
      plant.nameFa,
      plant.nameEn,
      plant.scientificName,
      `نگهداری ${plant.nameFa}`,
      `آبیاری ${plant.nameFa}`,
      `نور ${plant.nameFa}`,
      `خاک ${plant.nameFa}`,
      `مشکلات ${plant.nameFa}`,
      "دانشنامه گیاهان آپارتمانی",
      ...plant.tags,
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "fa_IR",
      url: canonical,
      siteName: "دانشنامه گیاهان جالیز",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function WikiPlantDetailPage({ params }: Props) {
  const { slug } = await params
  const plant = findPlant(slug)

  if (!plant) {
    notFound()
  }

  const canonical = `${SITE_URL}/wiki/${encodeURIComponent(plant.slug)}`
  const relatedPlants = getRelatedWikiPlants(plant, 3)
  const relatedPosts = getMatchingBlogPosts(plant, 2)

  // 3 Authoritative CTAs
  const addGardenHref = `/plants/new?name=${encodeURIComponent(plant.nameFa)}&interval=${plant.care.watering.defaultIntervalDays}&light=${encodeURIComponent(plant.care.light.level)}`
  const marketplaceHref = `/marketplace?query=${encodeURIComponent(plant.nameFa)}`
  const diagnoseHref = `/plants/diagnose`

  // Structured JSON-LD Schemas: Article, BreadcrumbList, FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `راهنمای کامل نگهداری و پرورش ${plant.nameFa} (${plant.nameEn})`,
        description: plant.description,
        inLanguage: "fa-IR",
        mainEntityOfPage: canonical,
        datePublished: "2026-01-01T00:00:00Z",
        dateModified: new Date().toISOString(),
        author: {
          "@type": "Organization",
          name: "تیم گیاه‌پزشکی جالیز",
        },
        publisher: {
          "@type": "Organization",
          name: "جالیز | Jaliz",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/icons/icon-192x192.png`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "خانه",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "دانشنامه گیاهان",
            item: `${SITE_URL}/wiki`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: plant.nameFa,
            item: canonical,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: plant.care.commonProblems.map((prob) => ({
          "@type": "Question",
          name: `علت و راهکار مشکل ${prob.problemFa} در ${plant.nameFa} چیست؟`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `علت: ${prob.causeFa} — راهکار درمانی: ${prob.solutionFa}`,
          },
        })),
      },
    ],
  }

  const isEasy = plant.difficulty === "آسان"
  const isMedium = plant.difficulty === "متوسط"
  const difficultyBadgeClass = isEasy
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : isMedium
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-rose-100 text-rose-800 border-rose-200"

  return (
    <div
      className="min-h-screen bg-[#fcfaf8] selection:bg-emerald-200 selection:text-emerald-900"
      dir="rtl"
    >
      <Header />

      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            خانه
          </Link>
          <ChevronLeft className="h-3 w-3" />
          <Link href="/wiki" className="hover:text-emerald-600 transition-colors">
            دانشنامه گیاهان
          </Link>
          <ChevronLeft className="h-3 w-3" />
          <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">{plant.nameFa}</span>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/70 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="pointer-events-none absolute -top-12 -end-12 h-44 w-44 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 -start-12 h-44 w-44 rounded-full bg-teal-100/40 blur-3xl" />

          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 relative z-10">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${difficultyBadgeClass}`}>
              نگهداری {plant.difficulty}
            </span>

            {plant.category && (
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                {plant.category}
              </span>
            )}

            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              سرعت رشد: {plant.growthRate}
            </span>

            {plant.care.petSafety.isToxic ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                <span>سمی برای حیوانات خانگی</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>امن برای حیوانات خانگی</span>
              </span>
            )}
          </div>

          {/* Title & Taxonomy */}
          <div className="space-y-2 relative z-10">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              راهنمای نگهداری {plant.nameFa}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="font-semibold text-slate-700" dir="ltr">
                {plant.nameEn}
              </span>
              <span className="text-slate-300">•</span>
              <span className="italic text-slate-600" dir="ltr">
                {plant.scientificName}
              </span>
              <span className="text-slate-300">•</span>
              <span>خانواده: {plant.family}</span>
              <span className="text-slate-300">•</span>
              <span>خاستگاه: {plant.origin}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed relative z-10">
            {plant.description}
          </p>

          {/* Top CTAs Ribbon */}
          <div className="pt-2 flex flex-wrap gap-3 relative z-10 border-t border-slate-100">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm text-xs font-bold h-10 px-4 flex items-center gap-2"
            >
              <Link href={addGardenHref}>
                <PlusCircle className="h-4 w-4" />
                <span>افزودن به باغچه من (یادآور آبیاری)</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-semibold h-10 px-4 flex items-center gap-2"
            >
              <Link href={marketplaceHref}>
                <Store className="h-4 w-4 text-emerald-600" />
                <span>خرید و فروش در بازارچه</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-slate-200 text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-semibold h-10 px-4 flex items-center gap-2"
            >
              <Link href={diagnoseHref}>
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>تشخیص بیماری برگ با هوش مصنوعی</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Quick Specs Overview Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 text-center space-y-1 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <Droplets className="h-5 w-5" />
            </div>
            <div className="text-[11px] text-slate-400 font-medium">دوره آبیاری</div>
            <div className="text-xs font-bold text-slate-800">
              هر {plant.care.watering.defaultIntervalDays} روز یک‌بار
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 text-center space-y-1 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Sun className="h-5 w-5" />
            </div>
            <div className="text-[11px] text-slate-400 font-medium">نیاز نوری</div>
            <div className="text-xs font-bold text-slate-800 truncate" title={plant.care.light.level}>
              {plant.care.light.level.split("(")[0].trim()}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 text-center space-y-1 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Thermometer className="h-5 w-5" />
            </div>
            <div className="text-[11px] text-slate-400 font-medium">دمای مطلوب</div>
            <div className="text-xs font-bold text-slate-800">
              {plant.care.temperature.range}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 text-center space-y-1 shadow-xs">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto ${
                plant.care.petSafety.isToxic
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {plant.care.petSafety.isToxic ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">سمیت حیوانات</div>
            <div
              className={`text-xs font-bold ${
                plant.care.petSafety.isToxic ? "text-rose-700" : "text-emerald-700"
              }`}
            >
              {plant.care.petSafety.isToxic ? "سمی و خطرزا" : "کاملاً امن"}
            </div>
          </div>
        </section>

        {/* 6 Structured Care Cards */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-900">
              راهنمای گام‌به‌گام شرایط نگهداری
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Light Card */}
            <Card className="bg-white border-slate-200/70 rounded-3xl shadow-xs overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">۱. نور و مکان مناسب</h3>
                    <p className="text-[11px] text-amber-700 font-medium">{plant.care.light.level}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {plant.care.light.description}
                </p>

                <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-100/60 text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-[11px]">
                    <Info className="h-3.5 w-3.5" />
                    بهترین موقعیت پنجره در خانه:
                  </span>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    {plant.care.light.windowPlacement}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Watering Card */}
            <Card className="bg-white border-slate-200/70 rounded-3xl shadow-xs overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">۲. برنامه و نیاز آبیاری</h3>
                    <p className="text-[11px] text-sky-700 font-medium">
                      پیشنهاد پیش‌فرض: هر {plant.care.watering.defaultIntervalDays} روز
                    </p>
                  </div>
                </div>

                <div className="bg-sky-50/60 rounded-2xl p-3 border border-sky-100/60 text-xs text-sky-900">
                  <span className="font-bold block mb-0.5 text-[11px]">معیار زمان آبیاری:</span>
                  <p className="text-[11px] leading-relaxed text-sky-800">
                    {plant.care.watering.schedule}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {plant.care.watering.description}
                </p>
              </CardContent>
            </Card>

            {/* 3. Temperature & Climate Card */}
            <Card className="bg-white border-slate-200/70 rounded-3xl shadow-xs overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Thermometer className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">۳. دما و رطوبت ایده‌آل</h3>
                    <p className="text-[11px] text-rose-700 font-medium">
                      محدوده دمایی: {plant.care.temperature.range}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-400 block">حداقل دمای قابل تحمل</span>
                    <span className="font-bold text-slate-800">
                      {plant.care.temperature.minCelsius} درجه سانتی‌گراد
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-400 block">حداکثر دمای مطلوب</span>
                    <span className="font-bold text-slate-800">
                      {plant.care.temperature.maxCelsius} درجه سانتی‌گراد
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                  <span className="font-semibold text-slate-700">تحمل یخبندان:</span>
                  <span>
                    {plant.care.temperature.frostTolerance
                      ? "مقاوم به سرمای ملایم زمستان"
                      : "حساس به سرما و یخبندان (باید به داخل منتقل شود)"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 4. Soil & Potting Card */}
            <Card className="bg-white border-slate-200/70 rounded-3xl shadow-xs overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">۴. خاک و گلدان مناسب</h3>
                    <p className="text-[11px] text-emerald-700 font-medium truncate max-w-[200px]" title={plant.care.soil.type}>
                      {plant.care.soil.type.split("(")[0].trim()}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {plant.care.soil.description}
                </p>

                <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100/60 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-[11px]">
                    <Droplets className="h-3.5 w-3.5" />
                    توصیه مهم زهکشی و گلدان:
                  </span>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    {plant.care.soil.drainageTips}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 5. Pet Safety Card (Full width on md if needed or part of grid) */}
            <Card
              className={`md:col-span-2 rounded-3xl border shadow-xs overflow-hidden ${
                plant.care.petSafety.isToxic
                  ? "bg-rose-50/40 border-rose-200/80"
                  : "bg-emerald-50/40 border-emerald-200/80"
              }`}
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      plant.care.petSafety.isToxic
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {plant.care.petSafety.isToxic ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <ShieldCheck className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      ۵. امنیت و سمیت برای حیوانات خانگی (سگ و گربه)
                    </h3>
                    <span
                      className={`text-[11px] font-bold ${
                        plant.care.petSafety.isToxic ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {plant.care.petSafety.isToxic
                        ? "⚠️ هشدار سمیت برای حیوانات خانگی"
                        : "✅ کاملاً امن و بی‌خطر برای حیوانات خانگی"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {plant.care.petSafety.warningFa}
                </p>

                {plant.care.petSafety.toxicPrinciples && (
                  <div className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">ترکیب سمی شناخته‌شده: </span>
                    <span dir="ltr">{plant.care.petSafety.toxicPrinciples}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 6. Common Problems Section (Accordion / Card List) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-black text-slate-900">
                مشکلات رایج، علل و راهکارهای درمانی
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {plant.care.commonProblems.length} مشکل رایج
            </span>
          </div>

          <div className="space-y-3">
            {plant.care.commonProblems.map((prob, idx) => {
              const severityBadge =
                prob.severity === "high"
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : prob.severity === "medium"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200"

              const severityLabel =
                prob.severity === "high"
                  ? "شدت: بالا (فوری)"
                  : prob.severity === "medium"
                  ? "شدت: متوسط"
                  : "شدت: خفیف"

              return (
                <Card
                  key={idx}
                  className="bg-white border-slate-200/70 rounded-2xl shadow-xs overflow-hidden"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {prob.problemFa}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${severityBadge}`}>
                        {severityLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/60 space-y-1">
                        <span className="font-bold text-amber-900 block text-[11px]">علت احتمالی:</span>
                        <p className="text-slate-700 leading-relaxed">{prob.causeFa}</p>
                      </div>

                      <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/60 space-y-1">
                        <span className="font-bold text-emerald-900 block text-[11px]">راهکار درمان و پیشگیری:</span>
                        <p className="text-slate-700 leading-relaxed">{prob.solutionFa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* 3 Prominent CTAs Section */}
        <section className="space-y-4 pt-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900">
              اقدامات کاربردی برای این گیاه
            </h2>
            <p className="text-xs text-slate-500">
              ابزارهای هوشمند جالیز برای مراقبت حرفه‌ای از {plant.nameFa}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CTA 1: Add to Garden */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-8 -end-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
              <div className="space-y-2 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold">افزودن به باغچه من</h3>
                <p className="text-xs text-emerald-50 leading-relaxed">
                  تنظیم خودکار یادآور آبیاری اختصاصی هر {plant.care.watering.defaultIntervalDays} روز و مدیریت وضعیت گیاه.
                </p>
              </div>

              <Button
                asChild
                className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl h-10 shadow-sm relative z-10"
              >
                <Link href={addGardenHref}>
                  <span>شروع مراقبت از این گیاه</span>
                  <ChevronLeft className="h-3.5 w-3.5 ms-1" />
                </Link>
              </Button>
            </div>

            {/* CTA 2: Marketplace */}
            <div className="bg-gradient-to-br from-teal-600 to-sky-700 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-8 -end-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
              <div className="space-y-2 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold">بازارچه گیاهان جالیز</h3>
                <p className="text-xs text-teal-50 leading-relaxed">
                  مشاهده آگهی‌های خرید و فروش قلمه، گلدان و تجهیزات نگهداری {plant.nameFa}.
                </p>
              </div>

              <Button
                asChild
                className="w-full bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs rounded-xl h-10 shadow-sm relative z-10"
              >
                <Link href={marketplaceHref}>
                  <span>جستجو در بازارچه</span>
                  <ChevronLeft className="h-3.5 w-3.5 ms-1" />
                </Link>
              </Button>
            </div>

            {/* CTA 3: AI Diagnosis */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-8 -end-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
              <div className="space-y-2 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold">تشخیص بیماری با AI</h3>
                <p className="text-xs text-indigo-50 leading-relaxed">
                  برگ‌های گیاه تغییر رنگ داده یا آفت زده؟ عکس بگیرید تا هوش مصنوعی تشخیص دهد.
                </p>
              </div>

              <Button
                asChild
                className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl h-10 shadow-sm relative z-10"
              >
                <Link href={diagnoseHref}>
                  <span>اسکن و تشخیص آنلاین</span>
                  <ChevronLeft className="h-3.5 w-3.5 ms-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Related Plants */}
        {relatedPlants.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200/70">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                گیاهان هم‌خانواده یا مکمل برای نگهداری
              </h2>
              <Link href="/wiki" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                مشاهده همه گیاهان
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPlants.map((rel) => (
                <Card
                  key={rel.slug}
                  className="bg-white border-slate-200/70 rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {rel.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        هر {rel.care.watering.defaultIntervalDays} روز
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                        <Link href={`/wiki/${encodeURIComponent(rel.slug)}`}>
                          {rel.nameFa}
                        </Link>
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate" dir="ltr">
                        {rel.nameEn}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {rel.description}
                    </p>

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 justify-between text-xs h-8 p-0"
                    >
                      <Link href={`/wiki/${encodeURIComponent(rel.slug)}`}>
                        <span>مشاهده شناسنامه</span>
                        <ChevronLeft className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Related Blog Posts */}
        {relatedPosts.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  مقالات آموزشی مرتبط در وبلاگ جالیز
                </h2>
              </div>
              <Link href="/blog" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                مشاهده همه مقالات
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((post) => (
                <Card
                  key={post.slug}
                  className="bg-white border-slate-200/70 rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden"
                >
                  <CardContent className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1">
                      <Link href={`/blog/${encodeURIComponent(post.slug)}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{post.readTime}</span>
                      <Link
                        href={`/blog/${encodeURIComponent(post.slug)}`}
                        className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
                      >
                        مطالعه مقاله
                        <ChevronLeft className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

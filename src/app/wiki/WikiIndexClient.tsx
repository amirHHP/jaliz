"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/Header"
import { WikiPlant } from "@/lib/wikiData"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Search,
  Droplets,
  Sun,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Leaf,
  Sprout,
  Filter,
} from "lucide-react"

interface WikiIndexClientProps {
  plants: WikiPlant[]
}

type WikiCategoryKey = "all" | "hardy" | "air-purifying" | "low-light" | "pet-safe"

interface WikiCategoryOption {
  key: WikiCategoryKey
  label: string
}

const CATEGORIES: WikiCategoryOption[] = [
  { key: "all", label: "همه گیاهان 🌿" },
  { key: "hardy", label: "گیاهان مقاوم 🪴" },
  { key: "air-purifying", label: "تصفیه‌کننده هوا 🍃" },
  { key: "low-light", label: "مناسب آپارتمان کم‌نور ⛅" },
  { key: "pet-safe", label: "امن برای حیوانات خانگی 🐾" },
]

export function WikiIndexClient({ plants }: WikiIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<WikiCategoryKey>("all")

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      // Category filter
      if (activeCategory === "hardy") {
        const isHardy = plant.tags.includes("مقاوم") || plant.difficulty === "آسان"
        if (!isHardy) return false
      } else if (activeCategory === "air-purifying") {
        const isAirPurifying =
          plant.tags.some((t) => t.includes("تصفیه")) ||
          (plant.category && plant.category.includes("تصفیه"))
        if (!isAirPurifying) return false
      } else if (activeCategory === "low-light") {
        const isLowLight =
          plant.tags.includes("کم نور") ||
          plant.care.light.level.includes("کم") ||
          plant.care.light.level.includes("سایه")
        if (!isLowLight) return false
      } else if (activeCategory === "pet-safe") {
        if (plant.care.petSafety.isToxic) return false
      }

      // Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase()
        const matchFa = plant.nameFa.toLowerCase().includes(q)
        const matchEn = plant.nameEn.toLowerCase().includes(q)
        const matchSci = plant.scientificName.toLowerCase().includes(q)
        const matchDesc = plant.description.toLowerCase().includes(q)
        const matchTags = plant.tags.some((tag) => tag.toLowerCase().includes(q))
        return matchFa || matchEn || matchSci || matchDesc || matchTags
      }

      return true
    })
  }, [plants, activeCategory, searchQuery])

  return (
    <div
      className="min-h-screen bg-[#fcfaf8] selection:bg-emerald-200 selection:text-emerald-900"
      dir="rtl"
    >
      <Header />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-emerald-100/50 py-12 md:py-16">
        <div className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-lime-200/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -start-24 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-xs">
            <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
            <span>دانشنامه تخصصی گیاهان آپارتمانی</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            دانشنامه و راهنمای جامع گیاهان آپارتمانی 🌿
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            شناسنامه، مشخصات زیستی و راهنمای دقیق نگهداری محبوب‌ترین گونه‌های آپارتمانی در ایران:
            برنامه آبیاری، نیاز نوری، ترکیب خاک، امنیت برای حیوانات خانگی و رفع مشکلات رایج.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام گیاه (فارسی، انگلیسی یا علمی)..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pe-4 ps-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
              />
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg px-2 py-1"
                >
                  پاک کردن
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Category Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-200/60 pb-6">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 ps-1">
              <Filter className="h-3.5 w-3.5" />
              دسته‌بندی:
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200"
                      : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <div className="text-xs text-slate-400 font-medium self-end sm:self-center">
            نمایش {filteredPlants.length} گونه از {plants.length} گونه گیاهی
          </div>
        </div>

        {/* Plant Cards Grid */}
        {filteredPlants.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Leaf className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">گیاهی با این مشخصات پیدا نشد</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              عبارت دیگری جستجو کنید یا فیلتر دسته‌بندی را روی حالت «همه گیاهان» بگذارید.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setActiveCategory("all")
              }}
              className="rounded-xl text-xs font-semibold"
            >
              نمایش همه گیاهان
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => {
              const isEasy = plant.difficulty === "آسان"
              const isMedium = plant.difficulty === "متوسط"
              const difficultyBadgeClass = isEasy
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : isMedium
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-rose-100 text-rose-800 border-rose-200"

              const encodedSlug = encodeURIComponent(plant.slug)

              return (
                <Card
                  key={plant.slug}
                  className="group flex flex-col bg-white border-slate-200/70 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden"
                >
                  <CardContent className="p-6 flex flex-col justify-between flex-grow space-y-5">
                    {/* Top Row: Difficulty & Pet Safety */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${difficultyBadgeClass}`}
                      >
                        نگهداری {plant.difficulty}
                      </span>

                      {plant.care.petSafety.isToxic ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
                          <ShieldAlert className="h-3 w-3 text-rose-500" />
                          <span>سمی برای حیوانات</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          <span>امن برای حیوانات</span>
                        </span>
                      )}
                    </div>

                    {/* Plant Identity */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <Sprout className="h-6 w-6" />
                        </div>
                        <div className="space-y-0.5">
                          <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                            <Link href={`/wiki/${encodedSlug}`}>
                              {plant.nameFa}
                            </Link>
                          </h2>
                          <p className="text-xs text-slate-400 font-medium line-clamp-1" dir="ltr">
                            {plant.nameEn}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 pt-1">
                        {plant.description}
                      </p>
                    </div>

                    {/* Quick Specs Snippets */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-2.5 py-2">
                        <Droplets className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">
                          آبیاری: هر {plant.care.watering.defaultIntervalDays} روز
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-2.5 py-2">
                        <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">
                          نور: {plant.care.light.level.split("(")[0].trim()}
                        </span>
                      </div>
                    </div>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {plant.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer CTA */}
                    <div className="pt-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 justify-between font-bold rounded-xl text-xs h-9 border border-emerald-100/60"
                      >
                        <Link
                          href={`/wiki/${encodedSlug}`}
                          className="flex items-center w-full justify-between"
                        >
                          <span>مشاهده شناسنامه و راهنمای نگهداری</span>
                          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

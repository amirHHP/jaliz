"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/LanguageProvider"
import { Header } from "@/components/Header"
import { blogPosts, BlogPost } from "@/lib/blogData"
import { BlogIcon } from "@/components/BlogIcon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  BookOpenCheck
} from "lucide-react"

export default function BlogIndexPage() {
  const { language, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  // Translate category filter labels
  const categories = useMemo(() => {
    if (language === "fa") {
      return [
        { key: "all", label: "همه" },
        { key: "care", label: "مراقبت از گیاهان 💧" },
        { key: "plants", label: "معرفی گیاهان 🪴" },
        { key: "tutorials", label: "آموزش‌های کاربردی 📚" },
      ]
    } else {
      return [
        { key: "all", label: "All" },
        { key: "care", label: "Care & Watering" },
        { key: "plants", label: "Plant Intro" },
        { key: "tutorials", label: "Tutorials" },
      ]
    }
  }, [language])

  // Filter posts based on current language, search query, and category
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      // 1. Language filter
      if (post.lang !== language) return false

      // 2. Category filter
      if (activeCategory !== "all" && post.categoryEn !== activeCategory) return false

      // 3. Search query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const matchTitle = post.title.toLowerCase().includes(query)
        const matchDesc = post.description.toLowerCase().includes(query)
        const matchKeywords = post.keywords.some((k) => k.toLowerCase().includes(query))
        return matchTitle || matchDesc || matchKeywords
      }

      return true
    })
  }, [language, activeCategory, searchQuery])

  const isRtl = language === "fa"

  return (
    <div className="min-h-screen bg-[#fcfaf8] selection:bg-emerald-200 selection:text-emerald-900">
      <Header />

      {/* Banner / Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-emerald-100/50 py-12 md:py-16">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-lime-200/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -start-24 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100/70 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200/50">
            <BookOpenCheck className="h-3.5 w-3.5" />
            {language === "fa" ? "دانستنی‌های سبز جالیز" : "Jaliz Green Magazine"}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === "fa" ? "مقالات آموزشی و راهنمای باغبانی 🌿" : "Gardening Articles & Guides 🌿"}
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            {language === "fa"
              ? "مجموعه‌ای از مقالات ساده، علمی و کاربردی برای نگهداری از گیاهان آپارتمانی، رشد بهتر آن‌ها و برطرف کردن مشکلات متداول."
              : "A curated collection of simple, science-backed guides to help you care for your houseplants, improve growth, and solve common issues."}
          </p>
        </div>
      </section>

      {/* Search and Category Filters */}
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 ${
                  activeCategory === cat.key
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200"
                    : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === "fa" ? "جستجو در مقالات… 🔍" : "Search articles… 🔍"}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full h-9 ps-10 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Articles list grid */}
        {filteredPosts.length === 0 ? (
          <div className="py-24 text-center bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-200 border-dashed shadow-sm max-w-md mx-auto">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {language === "fa" ? "مقاله‌ای پیدا نشد" : "No articles found"}
            </h3>
            <p className="text-slate-500 text-sm px-4">
              {language === "fa"
                ? "هیچ مطلبی متناسب با جستجوی شما یافت نشد. کلمات کلیدی دیگری را امتحان کنید."
                : "We couldn't find any articles matching your search criteria. Try using different keywords."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              return (
                <Card
                  key={post.slug}
                  className="group overflow-hidden rounded-2xl border-slate-200 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Decorative Gradient Header */}
                  <div className={`w-full h-40 bg-gradient-to-br ${post.gradient} relative flex items-center justify-center p-6 shrink-0`}>
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <BlogIcon name={post.icon} className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-3 start-3">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-5 flex flex-col grow justify-between">
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {post.description}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-5 space-y-4">
                      {/* Meta information */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.publishedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>

                      {/* Read Link */}
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 justify-between group-hover:bg-emerald-50/30 transition-all font-semibold rounded-xl text-xs"
                      >
                        <Link href={`/blog/${post.slug}`} className="flex items-center w-full justify-between">
                          <span>{language === "fa" ? "مطالعه مقاله" : "Read Article"}</span>
                          {isRtl ? (
                            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                          ) : (
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                          )}
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

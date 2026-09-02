"use client"

import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { Header } from "@/components/Header"
import { BlogPost } from "@/lib/blogData"
import { BlogIcon } from "@/components/BlogIcon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sprout,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck
} from "lucide-react"

interface BlogPostClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const { status } = useAuth()
  
  const isRtl = post.lang === "fa"
  const isUserLoggedIn = status === "authenticated"

  return (
    <div 
      className="min-h-screen bg-[#fcfaf8] selection:bg-emerald-200 selection:text-emerald-900"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            {isRtl ? "خانه" : "Home"}
          </Link>
          {isRtl ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <Link href="/blog" className="hover:text-emerald-600 transition-colors">
            {isRtl ? "مقالات آموزشی" : "Articles"}
          </Link>
          {isRtl ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
        </nav>

        {/* Article Cover */}
        <div className="relative overflow-hidden rounded-3xl shadow-md bg-white border border-slate-200/60 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8">
          {/* Background Decorative Blob */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-50/50 blur-2xl" />
          
          {/* Large Gradient Icon */}
          <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br ${post.gradient} flex items-center justify-center p-6 shrink-0 shadow-lg relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/5" />
            <BlogIcon name={post.icon} className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
          </div>

          {/* Article Info */}
          <div className="space-y-4 text-center md:text-start grow">
            <span className="inline-flex bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {post.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {post.publishedAt}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <article 
            className="p-6 sm:p-10 leading-relaxed text-slate-700 text-base sm:text-lg 
              [&>p]:mb-6 [&>p]:leading-relaxed
              [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:pb-2 [&>h2]:border-b [&>h2]:border-slate-100
              [&>ul]:list-disc [&>ul]:ps-6 [&>ul]:mb-6 [&>ul]:space-y-2
              [&>ol]:list-decimal [&>ol]:ps-6 [&>ol]:mb-6 [&>ol]:space-y-2
              [&>li]:leading-relaxed
              [&>strong]:font-semibold [&>strong]:text-slate-900"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Article Source & Copyright Disclosure */}
          <div className="mx-6 sm:mx-10 mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs text-slate-500">
            <BookOpenCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-700">
                {isRtl ? "منبع و مالکیت معنوی" : "Source & Intellectual Property"}
              </p>
              <p className="leading-relaxed">
                {isRtl 
                  ? "این مقاله به صورت اختصاصی توسط تیم تحریریه جالیز تولید شده است. منابع علمی مورد استفاده در تدوین این مطلب شامل کتاب‌های مرجع گیاه‌شناسی آپارتمانی، مقالات آموزشی جهاد کشاورزی و تجربیات علمی باغبانان حرفه‌ای می‌باشد."
                  : "This article has been exclusively produced by the Jaliz editorial team. Scientific sources used for compiling this content include houseplant botanical reference guides, agricultural extension publications, and professional gardening experience."}
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Banner (If not logged in) */}
        {!isUserLoggedIn && (
          <Card className="rounded-3xl border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-6 sm:p-10 shadow-sm text-center relative overflow-hidden">
            <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-200/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-teal-200/20 blur-2xl" />
            
            <div className="relative z-10 space-y-5 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <Sprout className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {isRtl ? "دوست داری گیاهانت همیشه شاداب باشن؟ 🪴" : "Want to keep your plants happy? 🪴"}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {isRtl
                  ? "با ثبت‌نام رایگان در جالیز، می‌تونی برنامه هوشمند آبیاری برای گیاهانت بسازی، تصویر رشدشون رو ثبت کنی و از هوش مصنوعی برای مراقبت بهتر مشاوره بگیری!"
                  : "Join Jaliz to schedule smart watering reminders, log plant growth, and receive dynamic AI-powered advice for your houseplants!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200">
                  <Link href="/register">
                    {isRtl ? "ساخت حساب کاربری رایگان" : "Create a Free Account"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-slate-200 bg-white text-slate-600 hover:text-emerald-700 hover:border-emerald-300">
                  <Link href="/blog">
                    {isRtl ? "مطالعه سایر مقالات" : "Back to Blog"}
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 px-1">
              {isRtl ? "سایر مقالات مفید 📚" : "Related Articles 📚"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rPost) => (
                <Card 
                  key={rPost.slug}
                  className="group overflow-hidden rounded-2xl border-slate-200 bg-white hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Related Post gradient tag */}
                  <div className={`w-full h-24 bg-gradient-to-br ${rPost.gradient} relative flex items-center justify-center shrink-0`}>
                    <div className="absolute inset-0 bg-black/5" />
                    <BlogIcon name={rPost.icon} className="h-6 w-6 text-white/90" />
                  </div>
                  <CardContent className="p-4 flex flex-col grow justify-between">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">
                        {rPost.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${rPost.slug}`}>
                          {rPost.title}
                        </Link>
                      </h4>
                    </div>
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 mt-4 font-semibold text-xs rounded-xl"
                    >
                      <Link href={`/blog/${rPost.slug}`} className="flex items-center w-full justify-between">
                        <span>{isRtl ? "مطالعه" : "Read"}</span>
                        {isRtl ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

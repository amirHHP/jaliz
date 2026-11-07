"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import { getShopByCodeAction, joinShopAction } from "@/app/actions/shop"
import {
  Store,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  LogIn,
  Sprout,
  ShieldCheck,
} from "lucide-react"

export default function JoinShopPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params?.code as string)?.trim()

  const { status, user, refreshUser } = useAuth()
  const [shop, setShop] = useState<{ id: string; name: string; code: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) {
      setError("کد فروشگاه نامعتبر است.")
      setLoading(false)
      return
    }

    // Save pending code in case user is not logged in yet
    try {
      localStorage.setItem("pending_shop_code", code)
    } catch {}

    getShopByCodeAction(code)
      .then((data) => {
        if (!data) {
          setError("فروشگاهی با این کد در جالیز یافت نشد.")
        } else {
          setShop(data)
        }
      })
      .catch((err) => {
        setError(err?.message || "خطا در دریافت اطلاعات فروشگاه")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [code])

  // If user is authenticated and shop is loaded, auto-join
  useEffect(() => {
    if (status === "authenticated" && shop && !joined && !joining) {
      setJoining(true)
      joinShopAction(shop.code)
        .then(async (res) => {
          if (res.success) {
            setJoined(true)
            try {
              localStorage.removeItem("pending_shop_code")
            } catch {}
            await refreshUser()
            setTimeout(() => {
              router.push("/")
            }, 2000)
          }
        })
        .catch((err) => {
          setError(err?.message || "خطا در عضویت در فروشگاه")
        })
        .finally(() => {
          setJoining(false)
        })
    }
  }, [status, shop, joined, joining, refreshUser, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-slate-500">
          در حال بررسی لینک دعوت فروشگاه...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 pb-16">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-lg">
        {error ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">{error}</h1>
            <p className="text-xs text-slate-500">
              لطفاً از صحیح بودن لینک یا کد اختصاصی فروشگاه مطمئن شوید.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        ) : joined ? (
          <div className="bg-white rounded-3xl p-8 border border-emerald-200/80 shadow-md text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              خوش آمدید به باشگاه مشتریان {shop?.name}! 🌿
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              شما با موفقیت به عنوان مشتری فروشگاه <strong>{shop?.name}</strong> در جالیز ثبت شدید.
              از این پس نام این فروشگاه در بالای صفحه نمایش داده خواهد شد.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-sm transition"
              >
                رفتن به گلدان‌های من
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-xs text-slate-400">در حال انتقال خودکار...</span>
            </div>
          </div>
        ) : status === "authenticated" && joining ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="h-12 w-12 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center animate-pulse">
              <Store className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              در حال اتصال شما به فروشگاه {shop?.name}...
            </h2>
          </div>
        ) : (
          /* User is not logged in: show welcome card and login prompt */
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-lg space-y-6 text-center">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <Store className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/50">
                دعوت‌نامه اختصاصی
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                باشگاه مشتریان {shop?.name}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                به دستیار هوشمند مراقبت از گل و گیاه <strong>جالیز</strong> خوش آمدید!
                با ورود یا ثبت‌نام، وضعیت گیاهان خود را ثبت کنید و از خدمات اختصاصی فروشگاه بهره‌مند شوید.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>یادآوری هوشمند و زمان‌بندی دقیق آبیاری برای هر گلدان</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>تشخیص بیماری و وضعیت سلامت گیاهان با هوش مصنوعی</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>ارتباط مستقیم و پشتیبانی گیاهان خریداری شده از {shop?.name}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-sm transition"
              >
                <LogIn className="h-4 w-4" />
                ورود یا ثبت‌نام و عضویت در باشگاه
              </Link>
              <p className="text-[11px] text-slate-400">
                (پس از ورود، شما به صورت خودکار به عنوان مشتری این فروشگاه ثبت خواهید شد)
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

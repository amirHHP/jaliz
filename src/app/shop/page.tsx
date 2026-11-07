"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import { getShopCustomersAction, getAdminShopsAction } from "@/app/actions/shop"
import {
  Store,
  Users,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react"

function ShopPanelContent() {
  const { status, user, isAdmin } = useAuth()
  const searchParams = useSearchParams()
  const shopIdParam = searchParams.get("shopId") || searchParams.get("id")

  const [shop, setShop] = useState<any>(null)
  const [allShops, setAllShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [copied, setCopied] = useState(false)
  const limit = 20

  useEffect(() => {
    if (status === "authenticated") {
      loadShop(page, shopIdParam || undefined)
      if (isAdmin) {
        getAdminShopsAction().then(setAllShops).catch(() => {})
      }
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status, page, shopIdParam, isAdmin])

  async function loadShop(currentPage: number, targetShopId?: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await getShopCustomersAction(currentPage, limit, targetShopId)
      setShop(data)
    } catch (e: any) {
      setError(e.message || "اطلاعات فروشگاه یافت نشد.")
    } finally {
      setLoading(false)
    }
  }

  function copyJoinLink(shopCode: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.jalizapp.ir"
    const link = `${origin}/join/${shopCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (status === "loading" || (!shop && loading)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-slate-500">
          در حال بارگذاری اطلاعات فروشگاه...
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-rose-500 font-semibold">لطفاً برای مشاهده پنل فروشگاه وارد حساب خود شوید.</p>
          <Link
            href="/login"
            className="inline-flex px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
          >
            ورود به حساب کاربری
          </Link>
        </div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
            {error || "اطلاعات فروشگاه یافت نشد یا شما مالک این فروشگاه نیستید."}
          </div>
          {isAdmin && (
            <Link
              href="/admin/shops"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700"
            >
              <ArrowRight className="h-4 w-4" />
              رفتن به مدیریت فروشگاه‌ها
            </Link>
          )}
        </div>
      </div>
    )
  }

  const isCurrentOwner = user && shop.owner && (shop.owner.id === user.id || shop.owner.email === user.email)

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Breadcrumb / Back for Admin */}
        {isAdmin && (
          <div className="flex items-center justify-between">
            <Link
              href="/admin/shops"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              بازگشت به صفحه مدیریت فروشگاه‌ها
            </Link>

            {allShops.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">انتخاب فروشگاه:</span>
                <select
                  value={shop.id}
                  onChange={(e) => {
                    const newId = e.target.value
                    window.location.href = `/shop?shopId=${newId}`
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {allShops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Header Shop Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {shop.name}
                  {isCurrentOwner && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      فروشگاه شما
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-500">
                  مالک: <span className="font-semibold text-slate-700">{shop.owner?.fullName || "—"}</span> ({shop.owner?.email})
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-slate-500">کد دعوت:</span>
              <span className="font-mono text-sm font-bold text-slate-800" dir="ltr">{shop.code}</span>
            </div>

            <button
              type="button"
              onClick={() => copyJoinLink(shop.code)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>لینک کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>کپی لینک دعوت مشتریان</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium">مشتریان متصل</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{shop._count?.customers ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium">مجموع گیاهان در حال مراقبت</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {shop.customers?.reduce((acc: number, c: any) => acc + (c.plants?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium">وضعیت باشگاه</p>
            <p className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              فعال و آماده پذیرش مشتری
            </p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              لیست مشتریان و وضعیت گیاهان
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="p-4">نام مشتری</th>
                  <th className="p-4">ایمیل / شماره</th>
                  <th className="p-4 text-center">تعداد گلدان</th>
                  <th className="p-4">وضعیت گیاهان مشتری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shop.customers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-800">{customer.fullName || "بی‌نام"}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs" dir="ltr">{customer.email}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-full font-bold text-xs">
                        {customer.plants.length}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 max-w-md">
                        {customer.plants.slice(0, 3).map((plant: any) => {
                          const isOk = plant.health === "Excellent" || plant.health === "Good"
                          return (
                            <div
                              key={plant.id}
                              className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                            >
                              <span className="font-medium text-slate-700">{plant.name}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                  isOk ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {plant.health === "Excellent"
                                  ? "عالی"
                                  : plant.health === "Good"
                                  ? "خوب"
                                  : "نیازمند رسیدگی"}
                              </span>
                            </div>
                          )
                        })}
                        {customer.plants.length > 3 && (
                          <div className="text-[11px] text-slate-400 text-center">
                            + {customer.plants.length - 3} گیاه دیگر
                          </div>
                        )}
                        {customer.plants.length === 0 && (
                          <div className="text-xs text-slate-400 italic">هنوز گیاهی ثبت نکرده است</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {shop.customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500 space-y-2">
                      <p className="font-semibold text-slate-700">هنوز مشتری‌ای به این فروشگاه متصل نشده است.</p>
                      <p className="text-xs text-slate-400">
                        لینک دعوت فروشگاه را به مشتریان خود ارسال کنید تا پس از ورود به طور خودکار به این لیست اضافه شوند.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {shop && shop._count?.customers > limit && (
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded-xl hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold"
              >
                قبلی
              </button>
              <span className="text-xs text-slate-500">
                صفحه {page} از {Math.ceil(shop._count.customers / limit)}
              </span>
              <button
                disabled={page >= Math.ceil(shop._count.customers / limit)}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-100 disabled:opacity-50 text-xs font-semibold"
              >
                بعدی
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ShopPanelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <Header />
          <div className="container mx-auto px-4 py-16 text-center text-slate-500">
            در حال بارگذاری...
          </div>
        </div>
      }
    >
      <ShopPanelContent />
    </Suspense>
  )
}

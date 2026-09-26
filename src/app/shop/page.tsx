"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import { getShopCustomersAction } from "@/app/actions/shop"

export default function ShopPanelPage() {
  const { status, user } = useAuth()
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    if (status === "authenticated" && user?.ownedShop) {
      loadShop(page)
    } else if (status === "authenticated" && !user?.ownedShop) {
      setError("شما مالک هیچ فروشگاهی نیستید.")
      setLoading(false)
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status, user, page])

  async function loadShop(currentPage: number) {
    setLoading(true)
    try {
      const data = await getShopCustomersAction(currentPage, limit)
      setShop(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || (!shop && loading)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-slate-500">
          در حال بارگذاری...
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-rose-500">
          لطفا وارد حساب کاربری خود شوید.
        </div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-rose-500">
          {error || "اطلاعات فروشگاه یافت نشد."}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">پنل فروشگاه: {shop.name}</h1>
        <p className="text-slate-500 mb-8 font-mono bg-slate-100 inline-block px-2 py-1 rounded">
          کد دعوت: {shop.code}
        </p>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold">نام مشتری</th>
                <th className="p-4 font-semibold">ایمیل / شماره</th>
                <th className="p-4 font-semibold">تعداد گلدان</th>
                <th className="p-4 font-semibold">وضعیت گلدان‌ها</th>
              </tr>
            </thead>
            <tbody>
              {shop.customers.map((customer: any) => (
                <tr key={customer.id} className="border-b">
                  <td className="p-4 font-medium">{customer.fullName}</td>
                  <td className="p-4 text-slate-500">{customer.email}</td>
                  <td className="p-4 text-center">{customer.plants.length}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {customer.plants.slice(0, 3).map((plant: any) => {
                        const isOk = plant.health === "Excellent" || plant.health === "Good";
                        return (
                          <div key={plant.id} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                            <span>{plant.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {plant.health}
                            </span>
                          </div>
                        )
                      })}
                      {customer.plants.length > 3 && (
                        <div className="text-xs text-slate-400 text-center">+ {customer.plants.length - 3} گلدان دیگر</div>
                      )}
                      {customer.plants.length === 0 && (
                        <div className="text-xs text-slate-400">گلدانی ثبت نشده</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {shop.customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">هیچ مشتری هنوز به این فروشگاه متصل نشده است.</td>
                </tr>
              )}
            </tbody>
          </table>
          {shop && shop._count?.customers > limit && (
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded hover:bg-slate-100 disabled:opacity-50 text-sm"
              >
                قبلی
              </button>
              <span className="text-sm text-slate-500">
                صفحه {page} از {Math.ceil(shop._count.customers / limit)}
              </span>
              <button 
                disabled={page >= Math.ceil(shop._count.customers / limit)}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded hover:bg-slate-100 disabled:opacity-50 text-sm"
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

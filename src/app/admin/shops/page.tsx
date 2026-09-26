"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import { getAdminShopsAction, createShopAction } from "@/app/actions/shop"
import { Button } from "@/components/ui/button"

export default function AdminShopsPage() {
  const { status, isAdmin, users, refreshUsers } = useAuth()
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [ownerId, setOwnerId] = useState("")

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      loadShops()
      refreshUsers()
    }
  }, [status, isAdmin])

  async function loadShops() {
    setLoading(true)
    try {
      const data = await getAdminShopsAction()
      setShops(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createShopAction({ name, code, ownerId })
      setName("")
      setCode("")
      setOwnerId("")
      loadShops()
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (status === "loading") return <div>Loading...</div>
  if (!isAdmin) return <div>Access Denied</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-4">مدیریت فروشگاه‌ها</h1>
        
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl shadow-sm mb-8 space-y-4">
          <h2 className="text-xl font-semibold">افزودن فروشگاه جدید</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="نام فروشگاه"
              className="border p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="کد اختصاصی"
              className="border p-2 rounded"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <select
              className="border p-2 rounded"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              required
            >
              <option value="">انتخاب مالک فروشگاه</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>
          <Button type="submit">ایجاد فروشگاه</Button>
        </form>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">نام</th>
                <th className="p-4">کد</th>
                <th className="p-4">مالک</th>
                <th className="p-4">تعداد مشتریان</th>
              </tr>
            </thead>
            <tbody>
              {shops.map(shop => (
                <tr key={shop.id} className="border-b">
                  <td className="p-4">{shop.name}</td>
                  <td className="p-4" dir="ltr">{shop.code}</td>
                  <td className="p-4">{shop.owner.fullName}</td>
                  <td className="p-4">{shop._count.customers}</td>
                </tr>
              ))}
              {shops.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-500">هیچ فروشگاهی یافت نشد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

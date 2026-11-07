"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import {
  getAdminShopsAction,
  createShopAction,
  updateShopAction,
  deleteShopAction,
} from "@/app/actions/shop"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Store,
  Users,
  Info,
  CheckCircle2,
  X,
} from "lucide-react"

export default function AdminShopsPage() {
  const { status, isAdmin, user, users, refreshUsers, refreshUser } = useAuth()
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Creation form state
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [ownerId, setOwnerId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Editing state
  const [editingShop, setEditingShop] = useState<any | null>(null)
  const [editName, setEditName] = useState("")
  const [editCode, setEditCode] = useState("")
  const [editOwnerId, setEditOwnerId] = useState("")
  const [updating, setUpdating] = useState(false)

  // Copy link feedback
  const [copiedShopId, setCopiedShopId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      loadShops()
      refreshUsers()
    }
  }, [status, isAdmin])

  async function loadShops() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminShopsAction()
      setShops(data)
    } catch (e: any) {
      setError(e.message || "خطا در بارگذاری فروشگاه‌ها")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setActionSuccess(null)
    try {
      await createShopAction({ name: name.trim(), code: code.trim(), ownerId })
      setName("")
      setCode("")
      setOwnerId("")
      setActionSuccess("فروشگاه با موفقیت ایجاد شد.")
      await loadShops()
      await refreshUser()
    } catch (e: any) {
      setError(e.message || "خطا در ایجاد فروشگاه")
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(shop: any) {
    setEditingShop(shop)
    setEditName(shop.name)
    setEditCode(shop.code)
    setEditOwnerId(shop.owner.id || shop.ownerId)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingShop) return
    setUpdating(true)
    setError(null)
    try {
      await updateShopAction(editingShop.id, {
        name: editName.trim(),
        code: editCode.trim(),
        ownerId: editOwnerId,
      })
      setEditingShop(null)
      setActionSuccess("اطلاعات فروشگاه با موفقیت ویرایش شد.")
      await loadShops()
      await refreshUser()
    } catch (e: any) {
      setError(e.message || "خطا در به‌روزرسانی فروشگاه")
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete(shop: any) {
    if (!window.confirm(`آیا از حذف فروشگاه «${shop.name}» اطمینان دارید؟`)) {
      return
    }
    setError(null)
    try {
      await deleteShopAction(shop.id)
      setActionSuccess(`فروشگاه «${shop.name}» با موفقیت حذف شد.`)
      await loadShops()
      await refreshUser()
    } catch (e: any) {
      setError(e.message || "خطا در حذف فروشگاه")
    }
  }

  function copyJoinLink(shopCode: string, shopId: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.jalizapp.ir"
    const link = `${origin}/join/${shopCode}`
    navigator.clipboard.writeText(link)
    setCopiedShopId(shopId)
    setTimeout(() => {
      setCopiedShopId((current) => (current === shopId ? null : current))
    }, 2500)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-slate-500">
          در حال بارگذاری...
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-rose-500 font-semibold">
          دسترسی به این صفحه فقط برای ادمین مجاز است.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Page Title & Direct Access */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <Store className="h-8 w-8 text-emerald-600" />
              مدیریت فروشگاه‌ها و باشگاه مشتریان
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              تعریف فروشگاه‌ها، اتصال مالکان و مشاهده لیست مشتریان و گلدان‌های متصل
            </p>
          </div>
          {shops.length > 0 && (
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              ورود به پنل فروشگاه (نمای مدیریت)
            </Link>
          )}
        </div>

        {/* Informative Guidance Banner */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-sm text-emerald-900 flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">راهنمای استفاده از باشگاه مشتریان:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs sm:text-sm text-emerald-800">
              <li>
                <strong>ورود به نمای فروشگاه:</strong> برای مشاهده مشتریان و وضعیت گلدان‌های هر فروشگاه، کافیست روی دکمه <strong>«مشاهده پنل فروشگاه»</strong> در جدول زیر کلیک کنید.
              </li>
              <li>
                <strong>لینک دعوت مشتریان:</strong> دکمه <strong>«کپی لینک دعوت»</strong> را بزنید و لینک را در اختیار مشتریان یا شبکه‌های اجتماعی بگذارید؛ کاربران با باز کردن آن مستقیم به باشگاه متصل می‌شوند.
              </li>
              <li>
                <strong>تعیین مالک:</strong> اگر می‌خواهید با حساب فعلی خودتان پنل فروشگاه را ببینید، مطمئن شوید که در ستون «مالک»، حساب شما انتخاب شده باشد (می‌توانید با دکمه ویرایش مالک را تغییر دهید).
              </li>
            </ul>
          </div>
        </div>

        {/* Feedback alerts */}
        {actionSuccess && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-rose-100 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Create Shop Card */}
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600" />
              افزودن فروشگاه جدید
            </h2>
            {user && (
              <button
                type="button"
                onClick={() => setOwnerId(user.id)}
                className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
              >
                + انتخاب خودم به عنوان مالک
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">نام فروشگاه</label>
              <input
                type="text"
                placeholder="مثال: فروشگاه گلدان"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">کد اختصاصی (انگلیسی / عدد)</label>
              <input
                type="text"
                placeholder="مثال: goldan"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-left"
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">مالک فروشگاه (اکانت صاحب فروشگاه)</label>
              <select
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                required
              >
                <option value="">انتخاب از بین کاربران...</option>
                {users.map((u) => {
                  const isCurrent = u.id === user?.id
                  return (
                    <option key={u.id} value={u.id}>
                      {u.fullName || "بی‌نام"} — {u.email} {isCurrent ? "⭐ (حساب کاربری شما)" : ""}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
            >
              {submitting ? "در حال ثبت..." : "ایجاد فروشگاه"}
            </Button>
          </div>
        </form>

        {/* Edit Modal / Card */}
        {editingShop && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-emerald-600" />
                  ویرایش فروشگاه «{editingShop.name}»
                </h3>
                <button
                  onClick={() => setEditingShop(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">نام فروشگاه</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">کد اختصاصی</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left"
                    dir="ltr"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">مالک فروشگاه (اکانت کاربر)</label>
                  <select
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={editOwnerId}
                    onChange={(e) => setEditOwnerId(e.target.value)}
                    required
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || "بی‌نام"} — {u.email} {u.id === user?.id ? "⭐ (حساب کاربری شما)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingShop(null)}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {updating ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Existing Shops Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              لیست فروشگاه‌های ثبت‌شده ({shops.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="p-4">نام فروشگاه</th>
                  <th className="p-4">کد اختصاصی</th>
                  <th className="p-4">مالک فروشگاه (نام و ایمیل)</th>
                  <th className="p-4 text-center">تعداد مشتریان</th>
                  <th className="p-4 text-center">عملیات و دسترسی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((shop) => {
                  const isCurrentOwner = user && shop.owner && (shop.owner.id === user.id || shop.owner.email === user.email)
                  const isCopied = copiedShopId === shop.id

                  return (
                    <tr key={shop.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-800">
                        {shop.name}
                      </td>
                      <td className="p-4" dir="ltr">
                        <span className="bg-slate-100 text-slate-800 font-mono px-2.5 py-1 rounded-lg text-xs font-semibold inline-block">
                          {shop.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 flex items-center gap-1.5">
                            {shop.owner?.fullName || "نامشخص"}
                            {isCurrentOwner && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                شما
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500 font-mono" dir="ltr">
                            {shop.owner?.email || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                          {shop._count?.customers ?? 0} مشتری
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Go to shop panel button */}
                          <Link
                            href={`/shop?shopId=${shop.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition border border-emerald-200"
                            title="مشاهده پنل و لیست مشتریان این فروشگاه"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            مشاهده پنل
                          </Link>

                          {/* Copy invite link */}
                          <button
                            type="button"
                            onClick={() => copyJoinLink(shop.code, shop.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                            title="کپی لینک اختصاصی عضویت مشتریان"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">کپی شد</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>لینک دعوت</span>
                              </>
                            )}
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => startEdit(shop)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="ویرایش مشخصات یا تغییر مالک"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(shop)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="حذف فروشگاه"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {shops.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      هیچ فروشگاهی تاکنون ثبت نشده است. از فرم بالا برای ساخت اولین فروشگاه استفاده کنید.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

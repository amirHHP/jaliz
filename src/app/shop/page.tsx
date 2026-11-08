"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import { getShopCustomersAction, getAdminShopsAction } from "@/app/actions/shop"
import {
  sendShopMessageAction,
  getShopSentMessagesAction,
  deleteShopMessageAction,
} from "@/app/actions/shop-messages"
import {
  Store,
  Users,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Megaphone,
  MessageSquare,
  Send,
  Trash2,
  Clock,
  CheckCheck,
  X,
  Loader2,
  Mail,
  Plus,
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

  // Tabs: "customers" or "messages"
  const [activeTab, setActiveTab] = useState<"customers" | "messages">("customers")

  // Messages state
  const [sentMessages, setSentMessages] = useState<any[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesTotal, setMessagesTotal] = useState(0)
  const [messagesPage, setMessagesPage] = useState(1)

  // Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [composeRecipient, setComposeRecipient] = useState<{ id: string; fullName: string; email: string } | null>(null)
  const [composeTitle, setComposeTitle] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)

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

  useEffect(() => {
    if (shop?.id) {
      loadSentMessages(shop.id, messagesPage)
    }
  }, [shop?.id, messagesPage])

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

  async function loadSentMessages(shopId: string, pageNum: number) {
    setMessagesLoading(true)
    try {
      const res = await getShopSentMessagesAction(shopId, pageNum, 15)
      setSentMessages(res.messages || [])
      setMessagesTotal(res.total || 0)
    } catch (e: any) {
      console.warn("Failed to load sent messages:", e)
    } finally {
      setMessagesLoading(false)
    }
  }

  function copyJoinLink(shopCode: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.jalizapp.ir"
    const link = `${origin}/join/${shopCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function openBroadcastCompose() {
    setComposeRecipient(null)
    setComposeTitle("")
    setComposeBody("")
    setSendError(null)
    setSendSuccess(null)
    setIsComposeOpen(true)
  }

  function openDirectCompose(customer: { id: string; fullName: string; email: string }) {
    setComposeRecipient(customer)
    setComposeTitle("")
    setComposeBody("")
    setSendError(null)
    setSendSuccess(null)
    setIsComposeOpen(true)
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!shop?.id) return
    if (!composeBody.trim()) {
      setSendError("لطفاً متن پیام را وارد کنید.")
      return
    }

    setSending(true)
    setSendError(null)
    try {
      await sendShopMessageAction({
        shopId: shop.id,
        recipientId: composeRecipient?.id || null,
        title: composeTitle.trim() || null,
        body: composeBody.trim(),
      })

      setSendSuccess(
        composeRecipient
          ? `پیام اختصاصی با موفقیت به ${composeRecipient.fullName || composeRecipient.email} ارسال شد.`
          : "پیام همگانی با موفقیت برای تمام مشتریان فروشگاه ارسال شد."
      )
      // Reload sent messages
      loadSentMessages(shop.id, 1)

      setTimeout(() => {
        setIsComposeOpen(false)
        setSendSuccess(null)
        setComposeBody("")
        setComposeTitle("")
      }, 1500)
    } catch (err: any) {
      setSendError(err.message || "خطا در ارسال پیام.")
    } finally {
      setSending(false)
    }
  }

  async function handleDeleteMessage(messageId: string) {
    if (!window.confirm("آیا از حذف این پیام اطمینان دارید؟")) return
    try {
      await deleteShopMessageAction(messageId)
      if (shop?.id) {
        loadSentMessages(shop.id, messagesPage)
      }
    } catch (e: any) {
      alert(e.message || "خطا در حذف پیام.")
    }
  }

  function formatDate(dateStr: string | Date) {
    try {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat("fa-IR", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d)
    } catch {
      return ""
    }
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
  const customersCount = shop._count?.customers ?? 0

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

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-slate-500">کد دعوت:</span>
              <span className="font-mono text-sm font-bold text-slate-800" dir="ltr">{shop.code}</span>
            </div>

            <button
              type="button"
              onClick={() => copyJoinLink(shop.code)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-500" />
                  <span>کپی لینک دعوت</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={openBroadcastCompose}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Megaphone className="h-4 w-4" />
              <span>ارسال پیام همگانی</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium">مشتریان متصل</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{customersCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium">مجموع گیاهان در حال مراقبت</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {shop.customers?.reduce((acc: number, c: any) => acc + (c.plants?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium">پیام‌های ارسال شده</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">
              {messagesTotal}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === "customers"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>لیست مشتریان ({customersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === "messages"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>پیام‌ها و اطلاعیه‌ها ({messagesTotal})</span>
          </button>
        </div>

        {/* TAB 1: Customers Table */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  لیست مشتریان و وضعیت گیاهان
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  می‌توانید برای هر مشتری پیام اختصاصی مشاوره ارسال کرده یا پیام همگانی برای همه بفرستید.
                </p>
              </div>

              <button
                type="button"
                onClick={openBroadcastCompose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition"
              >
                <Megaphone className="h-3.5 w-3.5" />
                ارسال پیام همگانی به همه
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="p-4">نام مشتری</th>
                    <th className="p-4">ایمیل / شماره</th>
                    <th className="p-4 text-center">تعداد گلدان</th>
                    <th className="p-4">وضعیت گیاهان مشتری</th>
                    <th className="p-4 text-center">عملیات</th>
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
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => openDirectCompose(customer)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-semibold transition"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          ارسال پیام
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shop.customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500 space-y-2">
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
        )}

        {/* TAB 2: Sent Messages History */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  تاریخچه پیام‌ها و اطلاعیه‌های ارسالی
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  گزارش تمام پیام‌های همگانی و پیام‌های اختصاصی ارسال شده به مشتریان
                </p>
              </div>

              <button
                type="button"
                onClick={openBroadcastCompose}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Plus className="h-4 w-4" />
                ارسال پیام جدید
              </button>
            </div>

            {messagesLoading && sentMessages.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                در حال بارگذاری پیام‌ها...
              </div>
            )}

            {!messagesLoading && sentMessages.length === 0 && (
              <div className="py-16 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Mail className="h-6 w-6 opacity-60" />
                </div>
                <p className="font-bold text-slate-700 text-sm">هنوز هیچ پیامی ارسال نکرده‌اید.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  با ارسال پیام‌های همگانی یا اختصاصی، ارتباط مستمری با مشتریانتان ایجاد کنید و نکات نگهداری گیاهان یا تخفیف‌ها را به آنها اطلاع دهید.
                </p>
                <button
                  type="button"
                  onClick={openBroadcastCompose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition mt-2"
                >
                  <Megaphone className="h-4 w-4" />
                  ارسال اولین پیام همگانی
                </button>
              </div>
            )}

            <div className="space-y-3">
              {sentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {msg.isBroadcast ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800">
                          <Megaphone className="h-3 w-3" />
                          همگانی (همه مشتریان)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">
                          <MessageSquare className="h-3 w-3" />
                          اختصاصی به: {msg.recipient?.fullName || msg.recipient?.email || "مشتری"}
                        </span>
                      )}

                      {msg.title && (
                        <span className="font-bold text-slate-800 text-sm">{msg.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                        title="حذف پیام"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {msg.body}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CheckCheck className="h-4 w-4 text-emerald-600" />
                      {msg.isBroadcast ? (
                        <span>
                          <strong>{msg._count?.reads ?? 0} نفر</strong> از مشتریان این پیام را مشاهده کرده‌اند
                        </span>
                      ) : (
                        <span>
                          {(msg._count?.reads ?? 0) > 0 ? (
                            <span className="text-emerald-700 font-semibold">توسط مشتری مشاهده شده است</span>
                          ) : (
                            <span className="text-slate-400">هنوز مشاهده نشده است</span>
                          )}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      فرستنده: {msg.sender?.fullName || "مالک فروشگاه"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPOSE MESSAGE MODAL */}
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    composeRecipient ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                  }`}>
                    {composeRecipient ? <MessageSquare className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {composeRecipient ? "ارسال پیام اختصاصی" : "ارسال پیام همگانی به همه مشتریان"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {composeRecipient
                        ? `گیرنده: ${composeRecipient.fullName || "بی‌نام"} (${composeRecipient.email})`
                        : `این پیام برای تمام ${customersCount} مشتری عضو این فروشگاه ارسال می‌شود.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {sendError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {sendError}
                </div>
              )}

              {sendSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {sendSuccess}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    عنوان پیام (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={composeTitle}
                    onChange={(e) => setComposeTitle(e.target.value)}
                    placeholder="مثال: تخفیف ویژه آخر هفته / نکته آبیاری پاییزی"
                    maxLength={100}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      متن پیام <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                      {composeBody.length} / 3000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="متن پیام خود را اینجا بنویسید..."
                    maxLength={3000}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none leading-relaxed"
                  />
                </div>

                {/* Quick Templates */}
                <div>
                  <p className="text-[11px] text-slate-400 font-medium mb-1.5">پیشنهادهای آماده:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setComposeTitle("تخفیف ویژه خرید حضوری")
                        setComposeBody("سلام! با عضویت در باشگاه مشتریان ما، این هفته از ۱۰٪ تخفیف برای تمام خاک‌ها و کودهای تقویتی در فروشگاه ما بهره‌مند شوید.")
                      }}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                    >
                      تخفیف ویژه
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeTitle("نکته مراقبت پاییزی")
                        setComposeBody("با سرد شدن هوا، فواصل آبیاری گیاهان آپارتمانی را طولانی‌تر کنید و مراقب جریان باد مستقیم پنجره‌ها باشید.")
                      }}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                    >
                      نکته مراقبتی
                    </button>
                    {composeRecipient && (
                      <button
                        type="button"
                        onClick={() => {
                          setComposeTitle("مشاوره گیاهان شما")
                          setComposeBody(`سلام ${composeRecipient.fullName || "عزیز"}، وضعیت گلدان‌های شما را در جالیز بررسی کردم؛ اگر درباره شادابی یا آبیاری آنها سوالی داشتید در خدمتیم.`)
                        }}
                        className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg transition"
                      >
                        پیگیری گیاه
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !composeBody.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>در حال ارسال...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>ارسال پیام</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

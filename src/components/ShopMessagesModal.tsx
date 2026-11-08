"use client"

import { useEffect, useState } from "react"
import {
  X,
  Store,
  Megaphone,
  MessageSquare,
  CheckCheck,
  Clock,
  Sparkles,
  RefreshCw,
  BellRing
} from "lucide-react"
import {
  getCustomerShopMessagesAction,
  markAllCustomerMessagesReadAction
} from "@/app/actions/shop-messages"

interface ShopMessagesModalProps {
  isOpen: boolean
  onClose: () => void
  onRead?: () => void
}

export function ShopMessagesModal({ isOpen, onClose, onRead }: ShopMessagesModalProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [shop, setShop] = useState<{ id: string; name: string; code: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadMessages()
    }
  }, [isOpen])

  async function loadMessages() {
    setLoading(true)
    setError(null)
    try {
      const data = await getCustomerShopMessagesAction()
      setMessages(data.messages || [])
      setShop(data.shop || null)

      // Mark unread messages as read
      const hasUnread = data.messages?.some((m: any) => !m.isRead)
      if (hasUnread) {
        await markAllCustomerMessagesReadAction()
        if (onRead) onRead()
      }
    } catch (e: any) {
      setError(e.message || "خطا در دریافت پیام‌ها")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  function formatDate(dateStr: string | Date) {
    try {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat("fa-IR", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(d)
    } catch {
      return ""
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                پیام‌های {shop ? shop.name : "فروشگاه"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اطلاعیه‌ها و مشاوره‌های ارسالی از طرف فروشگاه شما
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadMessages}
              disabled={loading}
              title="بروزرسانی پیام‌ها"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {loading && messages.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
              <p>در حال دریافت پیام‌ها...</p>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs text-center">
              {error}
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="py-14 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <BellRing className="h-7 w-7 opacity-60" />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                هنوز پیامی از طرف فروشگاه ارسال نشده است
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                وقتی فروشگاه تخفیف‌ها، نکات مراقبت از گیاهان یا پیامی برای شما بفرستد، اینجا نمایش داده می‌شود.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition space-y-2.5"
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {msg.isBroadcast ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
                      <Megaphone className="h-3 w-3" />
                      اطلاعیه عمومی فروشگاه
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40">
                      <MessageSquare className="h-3 w-3" />
                      پیام اختصاصی برای شما
                    </span>
                  )}
                  {msg.title && (
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      {msg.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(msg.createdAt)}</span>
                </div>
              </div>

              {/* Message Body */}
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {msg.body}
              </p>

              {/* Message Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>ارسال شده از: <strong className="text-slate-600 dark:text-slate-300">{msg.senderName}</strong></span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCheck className="h-3.5 w-3.5" />
                  مشاهده شده
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  )
}

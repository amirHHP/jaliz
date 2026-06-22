"use client"

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronLeft,
  ImageIcon,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Send,
  Store,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { useMarketplace } from "@/components/MarketplaceProvider"
import { getListingOwnerNameAction } from "@/app/actions/marketplace"
import { Conversation, Message } from "@/lib/marketplace"
import { telLink, whatsappLink } from "@/components/marketplace/listing-helpers"

interface OtherUserInfo {
  fullName: string | null
  phone: string | null
  avatar: string | null
}

export default function MarketplaceChatsPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const { user, status } = useAuth()
  const {
    ready,
    revision,
    listConversations,
    listMessages,
    sendMessage,
    list,
    isConversationUnread,
    markAsRead,
    markAsUnread,
  } = useMarketplace()

  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [chatError, setChatError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/marketplace/chats")
    }
  }, [status, router])

  // Remove body padding-bottom on mobile to prevent the black scrollable gap above bottom nav
  useEffect(() => {
    document.body.classList.add("!pb-0")
    return () => {
      document.body.classList.remove("!pb-0")
    }
  }, [])

  // Get all user conversations
  const conversations = useMemo(() => {
    if (!user) return []
    return listConversations(user.id)
  }, [user, listConversations, revision])

  // Active conversation object
  const activeConv = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId) || null
  }, [conversations, activeConvId])

  // Fetch all marketplace listings to resolve details
  const listings = useMemo(() => {
    return list()
  }, [list, revision])

  // Resolve listing for each conversation
  const convListingsMap = useMemo(() => {
    const map = new Map<string, any>()
    conversations.forEach((c) => {
      const listing = listings.find((l) => l.id === c.listingId)
      if (listing) {
        map.set(c.id, listing)
      }
    })
    return map
  }, [conversations, listings])

  // Load other participant info for the active conversation
  const [otherUser, setOtherUser] = useState<OtherUserInfo | null>(null)
  useEffect(() => {
    if (!activeConv || !user) {
      setOtherUser(null)
      return
    }
    const otherId = activeConv.participantIds.find((id) => id !== user.id) || ""
    let active = true
    getListingOwnerNameAction(otherId)
      .then((data) => {
        if (active && data) setOtherUser(data)
      })
      .catch(console.error)
    return () => {
      active = false
    }
  }, [activeConv, user])

  // Load messages for the active conversation
  const messages = useMemo(() => {
    if (!activeConv || !user) return []
    try {
      return listMessages(activeConv.id, user.id)
    } catch {
      return []
    }
  }, [activeConv, user, listMessages, revision])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, activeConvId])

  // Automatically mark as read when selecting conversation or receiving new messages
  useEffect(() => {
    if (activeConvId && user) {
      markAsRead(activeConvId, user.id)
    }
  }, [activeConvId, user, markAsRead, messages.length])

  const handleToggleReadStatus = useCallback((e: React.MouseEvent, convId: string) => {
    e.stopPropagation()
    if (!user) return
    if (isConversationUnread(convId, user.id)) {
      markAsRead(convId, user.id)
    } else {
      markAsUnread(convId, user.id)
    }
  }, [user, isConversationUnread, markAsRead, markAsUnread])

  // Handle send message
  const sendingRef = useRef(false)
  const handleSendMessage = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!user || !activeConv) return
      const text = draft.trim()
      if (!text) return
      if (sendingRef.current) return
      sendingRef.current = true

      setDraft("")
      setChatError(null)

      try {
        await sendMessage(activeConv.id, user.id, text)
      } catch (err) {
        console.error(err)
        setDraft(text) // Restore draft on failure
        setChatError(language === "fa" ? "ارسال پیام انجام نشد." : "Failed to send message.")
      } finally {
        sendingRef.current = false
      }
    },
    [user, activeConv, draft, sendMessage, language]
  )

  if (status === "loading" || !ready) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-slate-500 font-medium">
            {language === "fa" ? "در حال بارگذاری گفتگوها..." : "Loading chats..."}
          </p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-[calc(100vh-4rem-4rem)] md:h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      {/* Sidebar - Conversations list */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-white border-e border-slate-200 flex flex-col shrink-0 transition-all ${
          activeConvId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600" />
            {language === "fa" ? "صندوق پیام‌های بازارچه" : "Marketplace Inbox"}
          </h1>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
            {conversations.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageCircle className="h-12 w-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {language === "fa" ? "هیچ گفتگویی یافت نشد" : "No active chats"}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                {language === "fa"
                  ? "با ارسال پیام به آگهی‌های دیگران، چت خود را شروع کنید."
                  : "Start a chat by sending a message on listing details page."}
              </p>
              <Link
                href="/marketplace"
                className="mt-4 inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow-sm"
              >
                <Store className="h-3.5 w-3.5" />
                {language === "fa" ? "مشاهده بازارچه" : "Browse Marketplace"}
              </Link>
            </div>
          ) : (
            conversations.map((c) => {
              const listing = convListingsMap.get(c.id)
              const otherId = c.participantIds.find((id) => id !== user.id) || ""
              const isSeller = listing ? listing.ownerId === user.id : false

              // Get last message info
              let lastMsg = ""
              let lastTime: Date | null = null
              try {
                const msgs = listMessages(c.id, user.id)
                if (msgs.length > 0) {
                  lastMsg = msgs[msgs.length - 1].body
                  lastTime = new Date(msgs[msgs.length - 1].createdAt)
                }
              } catch (err) {
                console.error(err)
              }
              if (!lastTime) lastTime = new Date(c.lastMessageAt)

              const active = activeConvId === c.id
              const unread = isConversationUnread(c.id, user.id)

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`group w-full text-start p-4 flex items-start gap-3 hover:bg-slate-50 transition-all ${
                    active ? "bg-emerald-50/50 border-s-4 border-emerald-600" : ""
                  }`}
                >
                  {/* Listing thumbnail */}
                  <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50 flex items-center justify-center">
                    {listing?.image ? (
                      <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        <ParticipantTextName userId={otherId} />
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] text-slate-400">
                          {lastTime.toLocaleTimeString(language === "fa" ? "fa-IR" : undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          onClick={(e) => handleToggleReadStatus(e, c.id)}
                          className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-slate-200 transition"
                          title={
                            unread
                              ? language === "fa"
                                ? "علامت‌گذاری به‌عنوان خوانده‌شده"
                                : "Mark as read"
                              : language === "fa"
                              ? "علامت‌گذاری به‌عنوان خوانده‌نشده"
                              : "Mark as unread"
                          }
                        >
                          {unread ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm" />
                          ) : (
                            <span className="h-2 w-2 rounded-full border border-slate-300 group-hover:border-slate-400 transition" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 truncate mb-1">
                      {listing?.title || (language === "fa" ? "آگهی حذف شده" : "Deleted listing")}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 truncate flex-1">
                        {lastMsg || (language === "fa" ? "بدون پیام" : "No messages")}
                      </p>
                      {listing && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isSeller
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isSeller
                            ? language === "fa"
                              ? "فروشنده"
                              : "Seller"
                            : language === "fa"
                            ? "خریدار"
                            : "Buyer"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main chat view */}
      <div
        className={`flex-1 bg-slate-100 flex flex-col transition-all ${
          !activeConvId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConv ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                  aria-label="Back"
                >
                  <ArrowLeft className={`h-5 w-5 ${language === "fa" ? "rotate-180" : ""}`} />
                </button>

                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 overflow-hidden flex items-center justify-center shrink-0">
                  {otherUser?.avatar ? (
                    <img src={otherUser.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-emerald-800" />
                  )}
                </div>

                {/* Name & phone */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {otherUser?.fullName || "..."}
                  </p>
                  {otherUser?.phone && (
                    <p className="text-xs text-slate-500 font-medium">
                      {otherUser.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons (Call, WhatsApp, View listing) */}
              <div className="flex items-center gap-2">
                {otherUser?.phone && (
                  <>
                    <a
                      href={telLink(otherUser.phone)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                      title={language === "fa" ? "تماس تلفنی" : "Call"}
                    >
                      <PhoneCall className="h-4.5 w-4.5" />
                    </a>
                    <a
                      href={whatsappLink(otherUser.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition"
                      title={language === "fa" ? "ارسال پیام در واتساپ" : "WhatsApp"}
                    >
                      <MessageCircle className="h-4.5 w-4.5" />
                    </a>
                  </>
                )}

                {convListingsMap.get(activeConv.id) && (
                  <Link
                    href={`/marketplace/${convListingsMap.get(activeConv.id).id}`}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition"
                  >
                    <Store className="h-3.5 w-3.5" />
                    {language === "fa" ? "مشاهده آگهی" : "View Listing"}
                  </Link>
                )}
              </div>
            </div>

            {/* Listing strip on top of chat thread */}
            {convListingsMap.get(activeConv.id) && (
              <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 shrink-0">
                <span className="font-semibold truncate">
                  {language === "fa" ? "درباره کالا: " : "Listing: "}
                  {convListingsMap.get(activeConv.id).title}
                </span>
                <Link
                  href={`/marketplace/${convListingsMap.get(activeConv.id).id}`}
                  className="text-[11px] font-bold text-emerald-700 hover:underline shrink-0"
                >
                  {language === "fa" ? "مشاهده آگهی ←" : "View details →"}
                </Link>
              </div>
            )}

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-slate-400 text-center py-10 bg-white px-6 rounded-2xl border border-slate-100 shadow-sm">
                    {t("mp_chat_no_messages" as never)}
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId === user.id
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                            mine
                              ? "bg-emerald-600 text-white rounded-te-none"
                              : "bg-white text-slate-800 border border-slate-200/50 rounded-ts-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p
                            className={`text-[9px] mt-1 text-end ${
                              mine ? "text-emerald-100/80" : "text-slate-400"
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString(
                              language === "fa" ? "fa-IR" : undefined,
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {chatError && (
              <div className="px-4 py-2 bg-red-50 text-red-700 text-xs border-t border-red-100 font-semibold shrink-0">
                {chatError}
              </div>
            )}

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-3 flex gap-2 shrink-0">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("mp_chat_input_ph" as never)}
                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 caret-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner"
              />
              <Button
                type="submit"
                disabled={!draft.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-4 shadow-sm transition"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline ms-1.5">{t("mp_chat_send" as never)}</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {language === "fa" ? "گفتگوهای شما" : "Your Conversations"}
            </h3>
            <p className="text-xs text-slate-500 max-w-[280px] mt-1.5 leading-relaxed">
              {language === "fa"
                ? "برای شروع چت یا دیدن پیام‌های یک کالا، از منوی سمت راست یک گفتگو را انتخاب کنید."
                : "Select a chat from the sidebar to view message history and send messages."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ParticipantTextName({ userId }: { userId: string }) {
  const [name, setName] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    getListingOwnerNameAction(userId)
      .then((data) => {
        if (active) setName(data?.fullName || null)
      })
      .catch(console.error)
    return () => {
      active = false
    }
  }, [userId])
  return <span>{name || "..."}</span>
}

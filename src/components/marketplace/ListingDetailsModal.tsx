"use client"

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
// useEffect is retained for the chat auto-scroll side effect, which is a
// pure DOM interaction (not a setState).
import Link from "next/link"
import {
  CheckCircle2,
  ImageIcon,
  MapPin,
  MessageCircle,
  PhoneCall,
  RefreshCw,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { useMarketplace } from "@/components/MarketplaceProvider"
import { Conversation, Listing, Message } from "@/lib/marketplace"

import {
  MODE_BADGE_CLASS,
  MODE_ICON,
  MODE_TRANSLATION_KEY,
  TYPE_ICON,
  TYPE_TRANSLATION_KEY,
  formatToman,
  telLink,
  whatsappLink,
} from "./listing-helpers"

interface ListingDetailsModalProps {
  listing: Listing
  onClose: () => void
  onEdit?: (listing: Listing) => void
}

/**
 * Detail view for a listing. Shows the metadata, owner contact actions, and
 * an inline chat panel for buyer↔seller conversations tied to *this* listing.
 *
 * The card adapts to two roles:
 *  - **Owner**: can mark done / reopen / edit / delete.
 *  - **Visitor**: can call, open WhatsApp, or send messages in-app.
 *
 * The modal must be remounted when the listing changes — parent should pass
 * `key={listing.id}` so React resets local state (chat draft, conversation
 * handle) for each fresh listing.
 */
export function ListingDetailsModal({
  listing,
  onClose,
  onEdit,
}: ListingDetailsModalProps) {
  const { t, language } = useLanguage()
  const { user, status, getUser } = useAuth()
  const {
    revision,
    setCompleted,
    remove,
    getOrCreateConversation,
    listConversations,
    listMessages,
    sendMessage,
  } = useMarketplace()

  const isOwner = user?.id === listing.ownerId
  const isAuthenticated = status === "authenticated" && !!user

  const owner = useMemo(() => getUser(listing.ownerId), [getUser, listing.ownerId])
  const TypeIcon = TYPE_ICON[listing.type]
  const ModeIcon = MODE_ICON[listing.mode]

  // ----- Conversation state -------------------------------------------------
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [draft, setDraft] = useState("")
  const [chatError, setChatError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Eagerly load an existing conversation for this listing so that previous
  // messages are visible as soon as the modal opens (not only after sending).
  useEffect(() => {
    if (conversation || !user || isOwner) return
    const existing = listConversations(user.id).find(
      (c) => c.listingId === listing.id,
    )
    if (existing) setConversation(existing)
  }, [conversation, user, isOwner, listConversations, listing.id])

  // Re-derive on every revision so newly-sent messages render immediately.
  const messages: Message[] = useMemo(() => {
    if (!conversation || !user) return []
    try {
      return listMessages(conversation.id, user.id)
    } catch {
      return []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, user?.id, listMessages, revision])

  // Auto-scroll to the latest message when new ones arrive. This is a pure
  // DOM side-effect (no setState), so it stays in useEffect.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  // ----- Owner actions ------------------------------------------------------
  const handleToggleCompleted = async () => {
    if (!user) return
    try {
      await setCompleted(listing.id, user.id, listing.status !== "completed")
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!window.confirm(t("mp_confirm_delete" as never))) return
    try {
      await remove(listing.id, user.id)
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  // ----- Chat actions -------------------------------------------------------
  const ensureConversation = async (): Promise<Conversation | null> => {
    if (!user || isOwner) return null
    if (conversation) return conversation
    try {
      const conv = await getOrCreateConversation(listing.id, user.id, listing.ownerId)
      setConversation(conv)
      return conv
    } catch (err) {
      console.error(err)
      setChatError("Couldn't open the conversation.")
      return null
    }
  }

  // Guard against double-send while a request is in-flight.
  const sendingRef = useRef(false)

  const handleSendMessage = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    const text = draft.trim()
    if (!text) return
    if (sendingRef.current) return            // prevent duplicate clicks
    sendingRef.current = true

    // Optimistic: clear the input immediately so the UI feels responsive.
    setDraft("")
    setChatError(null)

    const conv = await ensureConversation()
    if (!conv) {
      setDraft(text)                          // restore on failure
      sendingRef.current = false
      return
    }
    try {
      await sendMessage(conv.id, user.id, text)
    } catch (err) {
      console.error(err)
      setDraft(text)                          // restore on failure
      setChatError("Couldn't send the message.")
    } finally {
      sendingRef.current = false
    }
  }, [user, draft, ensureConversation, sendMessage])

  const phone = listing.contactPhone || owner?.phone
  const ownerName = owner?.fullName ?? "—"

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 sm:my-8">
        {/* Hero image with close button */}
        <div className="relative h-80 sm:h-[380px] bg-slate-950 overflow-hidden flex items-center justify-center">
          {listing.image ? (
            <>
              {/* Blurred background image */}
              <img
                src={listing.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
              />
              {/* Main crisp image, fully contained */}
              <img
                src={listing.image}
                alt={listing.title}
                className="relative max-w-full max-h-full object-contain z-10"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 end-3 h-9 w-9 rounded-full bg-white/95 shadow flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition z-20"
            aria-label={t("cancel" as never)}
          >
            <X className="h-5 w-5" />
          </button>

          {listing.status === "completed" && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("mp_completed_badge" as never)}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Header --------------------------------------------------- */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                <TypeIcon className="h-3 w-3" />
                {t(TYPE_TRANSLATION_KEY[listing.type] as never)}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${MODE_BADGE_CLASS[listing.mode]}`}
              >
                <ModeIcon className="h-3 w-3" />
                {t(MODE_TRANSLATION_KEY[listing.mode] as never)}
              </span>
              {listing.mode === "sell" && typeof listing.price === "number" && (
                <span className="text-emerald-700 font-bold text-sm ms-auto">
                  {formatToman(listing.price, language)}{" "}
                  {language === "fa" ? "تومان" : "Toman"}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {listing.title}
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            {listing.mode === "exchange" && listing.exchangeFor && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                ↔ {listing.exchangeFor}
              </p>
            )}

            {listing.location && (
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {listing.location}
              </p>
            )}
          </div>

          {/* Owner row + meta ---------------------------------------- */}
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center shrink-0 shadow-sm">
                <User className="h-5 w-5 text-emerald-800" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-emerald-600/70 font-medium">
                  {t("mp_details_owner" as never)}
                </p>
                <p className="text-sm font-bold text-emerald-950 truncate">
                  {ownerName}
                </p>
              </div>
            </div>
            <div className="text-end text-xs text-emerald-700/60">
              <p className="font-medium">{t("mp_details_posted_at" as never)}</p>
              <p className="font-bold text-emerald-800">
                {new Date(listing.createdAt).toLocaleDateString(
                  language === "fa" ? "fa-IR" : undefined,
                  { year: "numeric", month: "short", day: "numeric" },
                )}
              </p>
            </div>
          </div>

          {/* Action row --------------------------------------------- */}
          {isOwner ? (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleToggleCompleted}
                className={
                  listing.status === "completed"
                    ? "bg-slate-200 hover:bg-slate-300 text-slate-800 gap-2"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                }
              >
                {listing.status === "completed" ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {t("mp_action_reopen" as never)}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t("mp_action_complete" as never)}
                  </>
                )}
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(listing)}
                  className="gap-2"
                >
                  {t("mp_action_edit" as never)}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("mp_action_delete" as never)}
              </Button>
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {phone ? (
                  <>
                    <a
                      href={telLink(phone)}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                    >
                      <PhoneCall className="h-4 w-4" />
                      {t("mp_action_call" as never)}
                    </a>
                    <a
                      href={whatsappLink(phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      {t("mp_action_whatsapp" as never)}
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">
                    {t("mp_details_no_phone" as never)}
                  </span>
                )}
              </div>

              {/* Inline chat ------------------------------------------ */}
              <ChatPanel
                messages={messages}
                draft={draft}
                onDraftChange={setDraft}
                onSubmit={handleSendMessage}
                currentUserId={user!.id}
                error={chatError}
                bottomRef={messagesEndRef}
              />
            </div>
          ) : (
            <div className="rounded-md bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600 flex items-center justify-between">
              <span>{t("mp_action_sign_in_to_contact" as never)}</span>
              <Link
                href={`/login?redirect=/marketplace`}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5"
              >
                {t("sign_in" as never)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ChatPanelProps {
  messages: Message[]
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  currentUserId: string
  error: string | null
  bottomRef: React.MutableRefObject<HTMLDivElement | null>
}

function ChatPanel({
  messages,
  draft,
  onDraftChange,
  onSubmit,
  currentUserId,
  error,
  bottomRef,
}: ChatPanelProps) {
  const { t, language } = useLanguage()
  return (
    <div className="border border-slate-200 rounded-xl bg-white">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          {t("mp_chat_title" as never)}
        </h3>
      </div>
      <div className="px-4 py-3 max-h-64 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            {t("mp_chat_no_messages" as never)}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    mine
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={`text-[10px] mt-1 ${mine ? "text-emerald-100" : "text-slate-400"}`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString(
                      language === "fa" ? "fa-IR" : undefined,
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
      {error && (
        <p className="px-4 pb-2 text-xs text-red-600">{error}</p>
      )}
      <form
        onSubmit={onSubmit}
        className="border-t border-slate-100 p-2 flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder={t("mp_chat_input_ph" as never)}
          className="flex-1 h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 caret-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <Button
          type="submit"
          disabled={!draft.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
        >
          <Send className="h-4 w-4" />
          {t("mp_chat_send" as never)}
        </Button>
      </form>
    </div>
  )
}

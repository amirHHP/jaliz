"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from "react"
import { Conversation, Message } from "@/lib/marketplace"
import { INBOX_POLL_MS, shouldPollInbox } from "@/lib/marketplace/inbox-poll"
import { useAuth } from "@/components/AuthProvider"
import {
  getMarketplaceInboxAction,
  getOrCreateConversationAction,
  sendMessageAction,
  getListingOwnerNameAction,
} from "@/app/actions/marketplace"

export interface MarketplaceInboxContextValue {
  inboxReady: boolean
  revision: number
  getOrCreateConversation: (listingId: string, requesterId: string, otherUserId: string) => Promise<Conversation>
  listConversations: (userId: string) => Conversation[]
  listMessages: (conversationId: string, requesterId: string) => Message[]
  sendMessage: (conversationId: string, senderId: string, body: string) => Promise<Message>
  isConversationUnread: (conversationId: string, userId: string) => boolean
  markAsRead: (conversationId: string, userId: string) => void
  markAsUnread: (conversationId: string, userId: string) => void
  getUnreadCount: (userId: string) => number
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
}

const MarketplaceInboxContext = createContext<MarketplaceInboxContextValue | undefined>(undefined)

export function MarketplaceInboxProvider({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth()

  const [inboxReady, setInboxReady] = useState(false)
  const [revision, setRevision] = useState(0)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const bump = useCallback(() => setRevision((n) => n + 1), [])

  const userRef = useRef(user)
  const inboxReadyRef = useRef(inboxReady)
  const activeConversationIdRef = useRef(activeConversationId)

  useEffect(() => {
    userRef.current = user
    inboxReadyRef.current = inboxReady
    activeConversationIdRef.current = activeConversationId
  }, [user, inboxReady, activeConversationId])

  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()

      const playBeep = (delay: number, frequency: number, duration: number) => {
        const osc = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()

        osc.connect(gainNode)
        gainNode.connect(audioCtx.destination)

        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + delay)
        osc.type = "sine"

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay)
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + delay + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration)

        osc.start(audioCtx.currentTime + delay)
        osc.stop(audioCtx.currentTime + delay + duration)
      }

      if (audioCtx.state === "suspended") {
        audioCtx.resume()
      }

      playBeep(0, 523.25, 0.15)
      playBeep(0.15, 659.25, 0.25)
    } catch (err) {
      console.error("Failed to play notification sound", err)
    }
  }, [])

  const showLocalNotification = useCallback(async (msg: Message) => {
    if (typeof window === "undefined") return

    playNotificationSound()

    const isTabInactive = document.hidden
    const isDifferentChat = activeConversationIdRef.current !== msg.conversationId

    if ((isTabInactive || isDifferentChat) && "Notification" in window && Notification.permission === "granted") {
      try {
        let senderName = "کاربر جالیز"
        try {
          const ownerInfo = await getListingOwnerNameAction(msg.senderId)
          if (ownerInfo?.fullName) {
            senderName = ownerInfo.fullName
          }
        } catch (e) {
          console.error(e)
        }

        new Notification(`پیام جدید از ${senderName}`, {
          body: msg.body,
          tag: `chat-${msg.conversationId}`,
        })
      } catch (err) {
        console.error("Failed to display notification", err)
      }
    }
  }, [playNotificationSound])

  const applyInboxMessages = useCallback((mData: Message[]) => {
    setMessages((prev) => {
      const currentUser = userRef.current
      const isReady = inboxReadyRef.current

      if (isReady && currentUser) {
        const newMessages = mData.filter((m) =>
          m.senderId !== currentUser.id &&
          !prev.some((p) => p.id === m.id)
        )
        if (newMessages.length > 0) {
          newMessages.forEach((msg) => {
            showLocalNotification(msg)
          })
        }
      }
      return mData
    })
  }, [showLocalNotification])

  const pollInbox = useCallback(async () => {
    try {
      const { conversations: cData, messages: mData } = await getMarketplaceInboxAction()
      setConversations(cData as any)
      applyInboxMessages(mData as any)
    } catch (err) {
      console.error(err)
    } finally {
      setInboxReady(true)
    }
  }, [applyInboxMessages])

  const pollInboxRef = useRef(pollInbox)
  useEffect(() => {
    pollInboxRef.current = pollInbox
  }, [pollInbox])

  // Initial inbox load (no listing images).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (cancelled) return
      await pollInboxRef.current()
    })()
    return () => { cancelled = true }
  }, [])

  const listConversations = useCallback(
    (userId: string) =>
      conversations
        .filter((c) => c.participantIds.includes(userId))
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
    [conversations],
  )

  const listMessages = useCallback(
    (conversationId: string, _requesterId: string) =>
      messages.filter((m) => m.conversationId === conversationId),
    [messages],
  )

  const [readStates, setReadStates] = useState<{ [key: string]: number }>({})
  const [forcedUnreadStates, setForcedUnreadStates] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const states: { [key: string]: number } = {}
    const forced: { [key: string]: boolean } = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        if (key.startsWith("jaliz_chat_read_")) {
          const val = localStorage.getItem(key)
          if (val) states[key] = Number(val)
        } else if (key.startsWith("jaliz_chat_unread_forced_")) {
          forced[key] = localStorage.getItem(key) === "true"
        }
      }
    }
    setReadStates(states)
    setForcedUnreadStates(forced)
  }, [revision])

  const isConversationUnread = useCallback((conversationId: string, userId: string) => {
    const forcedKey = `jaliz_chat_unread_forced_${userId}_${conversationId}`
    if (forcedUnreadStates[forcedKey]) return true

    const readKey = `jaliz_chat_read_${userId}_${conversationId}`
    const lastRead = readStates[readKey] || 0

    const convMessages = messages.filter((m) => m.conversationId === conversationId)
    if (convMessages.length === 0) return false

    const lastMsg = convMessages[convMessages.length - 1]
    if (lastMsg.senderId === userId) return false

    return new Date(lastMsg.createdAt).getTime() > lastRead
  }, [readStates, forcedUnreadStates, messages])

  const markAsRead = useCallback((conversationId: string, userId: string) => {
    const readKey = `jaliz_chat_read_${userId}_${conversationId}`
    const forcedKey = `jaliz_chat_unread_forced_${userId}_${conversationId}`
    const now = Date.now()

    localStorage.setItem(readKey, String(now))
    localStorage.removeItem(forcedKey)

    setReadStates((prev) => ({ ...prev, [readKey]: now }))
    setForcedUnreadStates((prev) => {
      const copy = { ...prev }
      delete copy[forcedKey]
      return copy
    })
    bump()
  }, [bump])

  const markAsUnread = useCallback((conversationId: string, userId: string) => {
    const forcedKey = `jaliz_chat_unread_forced_${userId}_${conversationId}`

    localStorage.setItem(forcedKey, "true")

    setForcedUnreadStates((prev) => ({ ...prev, [forcedKey]: true }))
    bump()
  }, [bump])

  const getUnreadCount = useCallback((userId: string) => {
    const userConvs = conversations.filter((c) => c.participantIds.includes(userId))
    return userConvs.filter((c) => isConversationUnread(c.id, userId)).length
  }, [conversations, isConversationUnread])

  const getOrCreateConversation = useCallback(async (listingId: string, requesterId: string, otherUserId: string) => {
    const conv = await getOrCreateConversationAction(listingId, otherUserId)
    await pollInbox()
    bump()
    return conv as any
  }, [pollInbox, bump])

  const sendMessage = useCallback(async (conversationId: string, senderId: string, body: string) => {
    const msg = await sendMessageAction(conversationId, body)
    setMessages((prev) => [...prev, msg as any])
    bump()
    pollInbox().catch(console.error)
    return msg as any
  }, [pollInbox, bump])

  useEffect(() => {
    if (status === "authenticated" && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(console.error)
      }
    }
  }, [status])

  useEffect(() => {
    if (status !== "authenticated" || !user) return

    const tick = () => {
      if (
        !shouldPollInbox({
          authenticated: true,
          documentHidden: typeof document !== "undefined" && document.hidden,
        })
      ) {
        return
      }
      pollInbox().catch(console.error)
    }

    const interval = setInterval(tick, INBOX_POLL_MS)
    const onVisibility = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [status, user, pollInbox])

  const value = useMemo<MarketplaceInboxContextValue>(() => ({
    inboxReady,
    revision,
    getOrCreateConversation,
    listConversations,
    listMessages,
    sendMessage,
    isConversationUnread,
    markAsRead,
    markAsUnread,
    getUnreadCount,
    activeConversationId,
    setActiveConversationId,
  }), [
    inboxReady,
    revision,
    getOrCreateConversation,
    listConversations,
    listMessages,
    sendMessage,
    isConversationUnread,
    markAsRead,
    markAsUnread,
    getUnreadCount,
    activeConversationId,
  ])

  return (
    <MarketplaceInboxContext.Provider value={value}>
      {children}
    </MarketplaceInboxContext.Provider>
  )
}

export function useMarketplaceInbox(): MarketplaceInboxContextValue {
  const ctx = useContext(MarketplaceInboxContext)
  if (!ctx) throw new Error("useMarketplaceInbox must be used within a MarketplaceInboxProvider")
  return ctx
}

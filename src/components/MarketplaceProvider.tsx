"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from "react"
import { Conversation, CreateListingInput, Listing, ListingFilter, Message, UpdateListingInput } from "@/lib/marketplace"
import { useAuth } from "@/components/AuthProvider"
import {
  getMarketplaceListingsAction,
  getMarketplaceConversationsAction,
  getMarketplaceMessagesAction,
  createListingAction,
  updateListingAction,
  setListingCompletedAction,
  removeListingAction,
  getOrCreateConversationAction,
  sendMessageAction,
  getListingOwnerNameAction
} from "@/app/actions/marketplace"

interface MarketplaceContextValue {
  ready: boolean
  revision: number
  list: (filter?: ListingFilter) => Listing[]
  get: (id: string) => Listing | undefined
  create: (ownerId: string, input: CreateListingInput) => Promise<Listing>
  update: (id: string, requesterId: string, patch: UpdateListingInput) => Promise<Listing>
  setCompleted: (id: string, requesterId: string, completed: boolean) => Promise<Listing>
  remove: (id: string, requesterId: string) => Promise<void>
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

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth()

  const [ready, setReady] = useState(false)
  const [revision, setRevision] = useState(0)

  const [listings, setListings] = useState<Listing[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const bump = useCallback(() => setRevision((n) => n + 1), [])

  // Refs to avoid unnecessary rebuilds of showLocalNotification / reload
  const userRef = useRef(user)
  const readyRef = useRef(ready)
  const activeConversationIdRef = useRef(activeConversationId)

  useEffect(() => {
    userRef.current = user
    readyRef.current = ready
    activeConversationIdRef.current = activeConversationId
  }, [user, ready, activeConversationId])

  // Play a gentle beep tone using Web Audio API (completely offline/internal)
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
      
      // Play a gentle dual tone: C5 (523.25 Hz) then E5 (659.25 Hz)
      playBeep(0, 523.25, 0.15)
      playBeep(0.15, 659.25, 0.25)
    } catch (err) {
      console.error("Failed to play notification sound", err)
    }
  }, [])

  // Show browser Notification
  const showLocalNotification = useCallback(async (msg: Message) => {
    if (typeof window === "undefined") return

    // Always play the audio alert
    playNotificationSound()

    // Show visual system notification only when in background or viewing other screen/chat
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

  const reload = useCallback(async () => {
    try {
      const [lData, cData, mData] = await Promise.all([
        getMarketplaceListingsAction(),
        getMarketplaceConversationsAction(),
        getMarketplaceMessagesAction()
      ])
      // Map Prisma Date objects to ISO strings if needed
      setListings(lData as any)
      setConversations(cData as any)

      setMessages((prev) => {
        const currentUser = userRef.current
        const isReady = readyRef.current

        if (isReady && currentUser) {
          const newMessages = (mData as any[]).filter((m) => 
            m.senderId !== currentUser.id && 
            !prev.some((p) => p.id === m.id)
          )
          if (newMessages.length > 0) {
            newMessages.forEach((msg) => {
              showLocalNotification(msg)
            })
          }
        }
        return mData as any
      })
    } catch (err) {
      console.error(err)
    }
  }, [showLocalNotification])

  useEffect(() => {
    let cancelled = false
    reload().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => { cancelled = true }
  }, [reload])

  const list = useCallback((filter?: ListingFilter) => {
    const q = filter?.query?.trim().toLowerCase()
    return listings
      .filter((l) => {
        if (filter?.type && l.type !== filter.type) return false
        if (filter?.mode && l.mode !== filter.mode) return false
        if (filter?.ownerId && l.ownerId !== filter.ownerId) return false
        if (filter?.status && l.status !== filter.status) return false
        if (q && !`${l.title} ${l.description}`.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "active" ? -1 : 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [listings])

  const get = useCallback((id: string) => listings.find((l) => l.id === id), [listings])
  const listConversations = useCallback((userId: string) => conversations.filter((c) => c.participantIds.includes(userId)).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()), [conversations])
  const listMessages = useCallback((conversationId: string, requesterId: string) => messages.filter((m) => m.conversationId === conversationId), [messages])

  const create = useCallback(async (ownerId: string, input: CreateListingInput) => {
    const created = await createListingAction(input)
    await reload()
    bump()
    return created as any
  }, [reload, bump])

  const update = useCallback(async (id: string, requesterId: string, patch: UpdateListingInput) => {
    const updated = await updateListingAction(id, patch)
    await reload()
    bump()
    return updated as any
  }, [reload, bump])

  const setCompleted = useCallback(async (id: string, requesterId: string, completed: boolean) => {
    const updated = await setListingCompletedAction(id, completed)
    await reload()
    bump()
    return updated as any
  }, [reload, bump])

  const remove = useCallback(async (id: string, requesterId: string) => {
    await removeListingAction(id)
    await reload()
    bump()
  }, [reload, bump])

  // Local state for last read times and forced unread conversations
  const [readStates, setReadStates] = useState<{ [key: string]: number }>({})
  const [forcedUnreadStates, setForcedUnreadStates] = useState<{ [key: string]: boolean }>({})

  // Load initial states from localStorage on mount and sync on changes
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
    await reload()
    bump()
    return conv as any
  }, [reload, bump])

  const sendMessage = useCallback(async (conversationId: string, senderId: string, body: string) => {
    const msg = await sendMessageAction(conversationId, body)
    // Optimistic: append the new message to local state immediately so the UI
    // updates without waiting for a full reload round-trip.
    setMessages((prev) => [...prev, msg as any])
    bump()
    // Background-sync the full server state (don't block the UI on this).
    reload().catch(console.error)
    return msg as any
  }, [reload, bump])

  // Request notification permissions when authenticated
  useEffect(() => {
    if (status === "authenticated" && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(console.error)
      }
    }
  }, [status])

  // Start polling for new messages if user is logged in
  useEffect(() => {
    if (status !== "authenticated" || !user) return

    const interval = setInterval(() => {
      reload().catch(console.error)
    }, 4000)

    return () => clearInterval(interval)
  }, [status, user, reload])

  const value = useMemo<MarketplaceContextValue>(() => ({
    ready, revision, list, get, create, update, setCompleted, remove,
    getOrCreateConversation, listConversations, listMessages, sendMessage,
    isConversationUnread, markAsRead, markAsUnread, getUnreadCount,
    activeConversationId, setActiveConversationId
  }), [ready, revision, list, get, create, update, setCompleted, remove, getOrCreateConversation, listConversations, listMessages, sendMessage, isConversationUnread, markAsRead, markAsUnread, getUnreadCount, activeConversationId])

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

export function useMarketplace(): MarketplaceContextValue {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) throw new Error("useMarketplace must be used within a MarketplaceProvider")
  return ctx
}

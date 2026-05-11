"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Conversation, CreateListingInput, Listing, ListingFilter, Message, UpdateListingInput } from "@/lib/marketplace"
import {
  getMarketplaceListingsAction,
  getMarketplaceConversationsAction,
  getMarketplaceMessagesAction,
  createListingAction,
  updateListingAction,
  setListingCompletedAction,
  removeListingAction,
  getOrCreateConversationAction,
  sendMessageAction
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
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [revision, setRevision] = useState(0)
  
  const [listings, setListings] = useState<Listing[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const bump = useCallback(() => setRevision((n) => n + 1), [])

  const reload = useCallback(async () => {
    try {
      const [lData, cData, mData] = await Promise.all([
        getMarketplaceListingsAction(),
        getMarketplaceConversationsAction(),
        getMarketplaceMessagesAction()
      ])
      // Map Prisma Date objects to ISO strings if needed, Prisma client in server actions usually returns them as dates or strings depending on exact usage, but we'll cast to any for simplicity or assume they match the interface.
      setListings(lData as any)
      setConversations(cData as any)
      setMessages(mData as any)
    } catch (err) {
      console.error(err)
    }
  }, [])

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

  const getOrCreateConversation = useCallback(async (listingId: string, requesterId: string, otherUserId: string) => {
    const conv = await getOrCreateConversationAction(listingId, otherUserId)
    await reload()
    bump()
    return conv as any
  }, [reload, bump])

  const sendMessage = useCallback(async (conversationId: string, senderId: string, body: string) => {
    const msg = await sendMessageAction(conversationId, body)
    await reload()
    bump()
    return msg as any
  }, [reload, bump])

  const value = useMemo<MarketplaceContextValue>(() => ({
    ready, revision, list, get, create, update, setCompleted, remove,
    getOrCreateConversation, listConversations, listMessages, sendMessage,
  }), [ready, revision, list, get, create, update, setCompleted, remove, getOrCreateConversation, listConversations, listMessages, sendMessage])

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

export function useMarketplace(): MarketplaceContextValue {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) throw new Error("useMarketplace must be used within a MarketplaceProvider")
  return ctx
}

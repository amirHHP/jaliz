"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Conversation,
  CreateListingInput,
  IListingService,
  Listing,
  ListingFilter,
  Message,
  UpdateListingInput,
} from "@/lib/marketplace"
import { SupabaseListingService } from "@/lib/marketplace/supabase-listing-service"

interface MarketplaceContextValue {
  ready: boolean
  /**
   * Increments after every mutation. Consumers that derive data from the
   * service should include it in their memo deps so they refresh on writes.
   */
  revision: number
  // Listings
  list: (filter?: ListingFilter) => Listing[]
  get: (id: string) => Listing | undefined
  create: (ownerId: string, input: CreateListingInput) => Listing
  update: (id: string, requesterId: string, patch: UpdateListingInput) => Listing
  setCompleted: (id: string, requesterId: string, completed: boolean) => Listing
  remove: (id: string, requesterId: string) => void
  // Messaging
  getOrCreateConversation: (
    listingId: string,
    requesterId: string,
    otherUserId: string,
  ) => Conversation
  listConversations: (userId: string) => Conversation[]
  listMessages: (conversationId: string, requesterId: string) => Message[]
  sendMessage: (
    conversationId: string,
    senderId: string,
    body: string,
  ) => Message
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(
  undefined,
)

interface MarketplaceProviderProps {
  children: React.ReactNode
  /** Optional service override (e.g. for tests / Storybook / Supabase swap). */
  service?: IListingService
}

export function MarketplaceProvider({
  children,
  service,
}: MarketplaceProviderProps) {
  const serviceRef = useRef<IListingService | null>(null)
  if (serviceRef.current === null) {
    serviceRef.current = service ?? new SupabaseListingService()
  }

  const [ready, setReady] = useState(false)
  const [revision, setRevision] = useState(0)
  const bump = useCallback(() => setRevision((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    serviceRef.current!
      .init()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((err) => {
        console.error("Marketplace init failed", err)
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // ----- Reads (no bump) -----------------------------------------------------
  const list = useCallback(
    (filter?: ListingFilter) => serviceRef.current!.list(filter),
    [],
  )
  const get = useCallback((id: string) => serviceRef.current!.get(id), [])
  const listConversations = useCallback(
    (userId: string) => serviceRef.current!.listConversations(userId),
    [],
  )
  const listMessages = useCallback(
    (conversationId: string, requesterId: string) =>
      serviceRef.current!.listMessages(conversationId, requesterId),
    [],
  )

  // ----- Writes (always bump) -----------------------------------------------
  const create = useCallback(
    (ownerId: string, input: CreateListingInput) => {
      const created = serviceRef.current!.create(ownerId, input)
      bump()
      return created
    },
    [bump],
  )
  const update = useCallback(
    (id: string, requesterId: string, patch: UpdateListingInput) => {
      const updated = serviceRef.current!.update(id, requesterId, patch)
      bump()
      return updated
    },
    [bump],
  )
  const setCompleted = useCallback(
    (id: string, requesterId: string, completed: boolean) => {
      const updated = serviceRef.current!.setCompleted(
        id,
        requesterId,
        completed,
      )
      bump()
      return updated
    },
    [bump],
  )
  const remove = useCallback(
    (id: string, requesterId: string) => {
      serviceRef.current!.remove(id, requesterId)
      bump()
    },
    [bump],
  )
  const getOrCreateConversation = useCallback(
    (listingId: string, requesterId: string, otherUserId: string) => {
      const conv = serviceRef.current!.getOrCreateConversation(
        listingId,
        requesterId,
        otherUserId,
      )
      bump()
      return conv
    },
    [bump],
  )
  const sendMessage = useCallback(
    (conversationId: string, senderId: string, body: string) => {
      const msg = serviceRef.current!.sendMessage(
        conversationId,
        senderId,
        body,
      )
      bump()
      return msg
    },
    [bump],
  )

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      ready,
      revision,
      list,
      get,
      create,
      update,
      setCompleted,
      remove,
      getOrCreateConversation,
      listConversations,
      listMessages,
      sendMessage,
    }),
    [
      ready,
      revision,
      list,
      get,
      create,
      update,
      setCompleted,
      remove,
      getOrCreateConversation,
      listConversations,
      listMessages,
      sendMessage,
    ],
  )

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace(): MarketplaceContextValue {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider")
  }
  return ctx
}

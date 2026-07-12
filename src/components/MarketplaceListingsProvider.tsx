"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { CreateListingInput, Listing, ListingFilter, UpdateListingInput } from "@/lib/marketplace"
import {
  getMarketplaceListingsAction,
  createListingAction,
  updateListingAction,
  setListingCompletedAction,
  removeListingAction,
} from "@/app/actions/marketplace"

export interface MarketplaceListingsContextValue {
  /** Listings fetched at least once after ensureLoaded(). */
  ready: boolean
  revision: number
  /** Start (or no-op) the heavy listings fetch. Safe to call often. */
  ensureLoaded: () => void
  list: (filter?: ListingFilter) => Listing[]
  get: (id: string) => Listing | undefined
  create: (ownerId: string, input: CreateListingInput) => Promise<Listing>
  update: (id: string, requesterId: string, patch: UpdateListingInput) => Promise<Listing>
  setCompleted: (id: string, requesterId: string, completed: boolean) => Promise<Listing>
  remove: (id: string, requesterId: string) => Promise<void>
}

const MarketplaceListingsContext = createContext<MarketplaceListingsContextValue | undefined>(undefined)

export function MarketplaceListingsProvider({ children }: { children: React.ReactNode }) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const [revision, setRevision] = useState(0)
  const [listings, setListings] = useState<Listing[]>([])

  const bump = useCallback(() => setRevision((n) => n + 1), [])

  const ensureLoaded = useCallback(() => {
    setShouldLoad(true)
  }, [])

  const reloadListings = useCallback(async () => {
    try {
      const lData = await getMarketplaceListingsAction()
      setListings(lData as any)
    } catch (err) {
      console.error(err)
    }
  }, [])

  // Heavy fetch only after a consumer asks for listings (marketplace / dashboard grid).
  useEffect(() => {
    if (!shouldLoad) return
    let cancelled = false
    ;(async () => {
      try {
        const lData = await getMarketplaceListingsAction()
        if (cancelled) return
        setListings(lData as any)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => { cancelled = true }
  }, [shouldLoad])

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

  const create = useCallback(async (ownerId: string, input: CreateListingInput) => {
    const created = await createListingAction(input)
    setShouldLoad(true)
    await reloadListings()
    setReady(true)
    bump()
    return created as any
  }, [reloadListings, bump])

  const update = useCallback(async (id: string, requesterId: string, patch: UpdateListingInput) => {
    const updated = await updateListingAction(id, patch)
    await reloadListings()
    bump()
    return updated as any
  }, [reloadListings, bump])

  const setCompleted = useCallback(async (id: string, requesterId: string, completed: boolean) => {
    const updated = await setListingCompletedAction(id, completed)
    await reloadListings()
    bump()
    return updated as any
  }, [reloadListings, bump])

  const remove = useCallback(async (id: string, requesterId: string) => {
    await removeListingAction(id)
    await reloadListings()
    bump()
  }, [reloadListings, bump])

  const value = useMemo<MarketplaceListingsContextValue>(() => ({
    ready,
    revision,
    ensureLoaded,
    list,
    get,
    create,
    update,
    setCompleted,
    remove,
  }), [ready, revision, ensureLoaded, list, get, create, update, setCompleted, remove])

  return (
    <MarketplaceListingsContext.Provider value={value}>
      {children}
    </MarketplaceListingsContext.Provider>
  )
}

export function useMarketplaceListings(): MarketplaceListingsContextValue {
  const ctx = useContext(MarketplaceListingsContext)
  if (!ctx) throw new Error("useMarketplaceListings must be used within a MarketplaceListingsProvider")
  return ctx
}

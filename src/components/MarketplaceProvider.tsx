"use client"

import React, { useEffect } from "react"
import {
  MarketplaceInboxProvider,
  useMarketplaceInbox,
  type MarketplaceInboxContextValue,
} from "@/components/MarketplaceInboxProvider"
import {
  MarketplaceListingsProvider,
  useMarketplaceListings,
  type MarketplaceListingsContextValue,
} from "@/components/MarketplaceListingsProvider"

export type MarketplaceContextValue = MarketplaceListingsContextValue & MarketplaceInboxContextValue

/**
 * Composes inbox (always light) + listings (lazy) providers.
 * Mount at the app root so Header unread badges keep working without
 * shipping listing images on every page.
 */
export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  return (
    <MarketplaceInboxProvider>
      <MarketplaceListingsProvider>
        {children}
      </MarketplaceListingsProvider>
    </MarketplaceInboxProvider>
  )
}

export type UseMarketplaceOptions = {
  /**
   * When true (default), triggers the heavy listings fetch.
   * Pass false for consumers that only need inbox, or optional listing
   * previews that should stay hidden until listings were loaded elsewhere.
   */
  loadListings?: boolean
}

/**
 * Combined marketplace API. Prefer `useMarketplaceInbox` in Header/BottomNav
 * so those chrome surfaces never trigger the listings payload.
 */
export function useMarketplace(options: UseMarketplaceOptions = {}): MarketplaceContextValue {
  const { loadListings = true } = options
  const inbox = useMarketplaceInbox()
  const listings = useMarketplaceListings()

  useEffect(() => {
    if (loadListings) listings.ensureLoaded()
  }, [loadListings, listings.ensureLoaded])

  return {
    ...listings,
    ...inbox,
    // Re-render dependents when either store changes.
    revision: listings.revision + inbox.revision,
  }
}

export { useMarketplaceInbox } from "@/components/MarketplaceInboxProvider"
export { useMarketplaceListings } from "@/components/MarketplaceListingsProvider"

import {
  Conversation,
  CreateListingInput,
  IListingService,
  Listing,
  ListingFilter,
  ListingMode,
  ListingStatus,
  ListingType,
  LISTING_MODES,
  LISTING_TYPES,
  MarketplaceError,
  Message,
  UpdateListingInput,
} from "./types"

const LISTINGS_KEY = "jaliz-listings"
const CONVERSATIONS_KEY = "jaliz-conversations"
const MESSAGES_KEY = "jaliz-messages"

/**
 * Minimal Storage shape we depend on. Mirrors the standard `Storage` API
 * (`window.localStorage`) but lets us inject an in-memory store from tests.
 */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export class InMemoryStore implements KeyValueStore {
  private readonly map = new Map<string, string>()

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
  removeItem(key: string): void {
    this.map.delete(key)
  }
}

function generateId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function sortPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

function isListingType(value: unknown): value is ListingType {
  return (
    typeof value === "string" && (LISTING_TYPES as readonly string[]).includes(value)
  )
}
function isListingMode(value: unknown): value is ListingMode {
  return (
    typeof value === "string" && (LISTING_MODES as readonly string[]).includes(value)
  )
}

/**
 * Local, browser-only marketplace service. Persists listings, conversations
 * and messages to a `KeyValueStore` (defaults to `localStorage`).
 *
 * The same caveats as `LocalAuthService` apply: this is fine for an MVP /
 * demo where data lives in the browser, but should be replaced with a
 * server-backed implementation before production. Because everything sits
 * behind `IListingService`, that swap is mechanical.
 */
export class LocalListingService implements IListingService {
  private readonly store: KeyValueStore
  private initialized = false

  constructor(store?: KeyValueStore) {
    if (store) {
      this.store = store
    } else if (typeof window !== "undefined" && window.localStorage) {
      this.store = window.localStorage
    } else {
      this.store = new InMemoryStore()
    }
  }

  async init(): Promise<void> {
    this.initialized = true
  }

  list(filter: ListingFilter = {}): Listing[] {
    const all = this.readListings()
    const q = filter.query?.trim().toLowerCase()
    const filtered = all.filter((l) => {
      if (filter.type && l.type !== filter.type) return false
      if (filter.mode && l.mode !== filter.mode) return false
      if (filter.ownerId && l.ownerId !== filter.ownerId) return false
      if (filter.status && l.status !== filter.status) return false
      if (q) {
        const haystack = `${l.title} ${l.description}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    // Newest first: a listing's "freshness" is its creation time, not its
    // last edit. Completed listings sink below active ones.
    return filtered.sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1
      return b.createdAt.localeCompare(a.createdAt)
    })
  }

  get(id: string): Listing | undefined {
    return this.readListings().find((l) => l.id === id)
  }

  create(ownerId: string, input: CreateListingInput): Listing {
    if (!ownerId) throw new MarketplaceError("EMPTY_FIELD", "ownerId is required")
    const title = input.title?.trim()
    const description = input.description?.trim()
    if (!title || !description) {
      throw new MarketplaceError("EMPTY_FIELD")
    }
    if (!isListingType(input.type) || !isListingMode(input.mode)) {
      throw new MarketplaceError("EMPTY_FIELD", "invalid type or mode")
    }
    if (input.mode === "sell") {
      if (input.price === undefined || input.price === null || Number.isNaN(input.price)) {
        throw new MarketplaceError("INVALID_PRICE", "price required for sell")
      }
      if (input.price < 0) {
        throw new MarketplaceError("INVALID_PRICE", "price must be non-negative")
      }
    }

    const listing: Listing = {
      id: generateId(),
      ownerId,
      type: input.type,
      mode: input.mode,
      title,
      description,
      price: input.mode === "sell" ? input.price : undefined,
      exchangeFor:
        input.mode === "exchange" ? input.exchangeFor?.trim() || undefined : undefined,
      location: input.location?.trim() || undefined,
      image: input.image || undefined,
      contactPhone: input.contactPhone?.trim() || undefined,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    const all = this.readListings()
    all.push(listing)
    this.writeListings(all)
    return listing
  }

  update(id: string, requesterId: string, patch: UpdateListingInput): Listing {
    return this.mutate(id, requesterId, (l) => {
      const next: Listing = { ...l }
      if (patch.title !== undefined) {
        const trimmed = patch.title.trim()
        if (!trimmed) throw new MarketplaceError("EMPTY_FIELD")
        next.title = trimmed
      }
      if (patch.description !== undefined) {
        const trimmed = patch.description.trim()
        if (!trimmed) throw new MarketplaceError("EMPTY_FIELD")
        next.description = trimmed
      }
      if (patch.type !== undefined) {
        if (!isListingType(patch.type)) throw new MarketplaceError("EMPTY_FIELD")
        next.type = patch.type
      }
      if (patch.mode !== undefined) {
        if (!isListingMode(patch.mode)) throw new MarketplaceError("EMPTY_FIELD")
        next.mode = patch.mode
        // Clear cross-mode fields so a listing can't claim "free" *and* a price.
        if (next.mode !== "sell") next.price = undefined
        if (next.mode !== "exchange") next.exchangeFor = undefined
      }
      if (patch.price !== undefined) {
        if (next.mode === "sell") {
          if (Number.isNaN(patch.price) || patch.price < 0) {
            throw new MarketplaceError("INVALID_PRICE")
          }
          next.price = patch.price
        }
      }
      if (patch.exchangeFor !== undefined && next.mode === "exchange") {
        next.exchangeFor = patch.exchangeFor.trim() || undefined
      }
      if (patch.location !== undefined) {
        next.location = patch.location.trim() || undefined
      }
      if (patch.image !== undefined) {
        next.image = patch.image || undefined
      }
      if (patch.contactPhone !== undefined) {
        next.contactPhone = patch.contactPhone.trim() || undefined
      }
      return next
    })
  }

  setCompleted(id: string, requesterId: string, completed: boolean): Listing {
    return this.mutate(id, requesterId, (l) => {
      const next: Listing = { ...l }
      const status: ListingStatus = completed ? "completed" : "active"
      next.status = status
      next.completedAt = completed ? new Date().toISOString() : undefined
      return next
    })
  }

  remove(id: string, requesterId: string): void {
    const listings = this.readListings()
    const target = listings.find((l) => l.id === id)
    if (!target) throw new MarketplaceError("NOT_FOUND")
    if (target.ownerId !== requesterId) throw new MarketplaceError("FORBIDDEN")
    this.writeListings(listings.filter((l) => l.id !== id))

    // Cascade: drop conversations and messages tied to this listing so we
    // don't leak orphaned chat history between users.
    const conversations = this.readConversations().filter(
      (c) => c.listingId !== id,
    )
    this.writeConversations(conversations)
    const validIds = new Set(conversations.map((c) => c.id))
    const messages = this.readMessages().filter((m) =>
      validIds.has(m.conversationId),
    )
    this.writeMessages(messages)
  }

  // ----- Messaging ---------------------------------------------------------

  getOrCreateConversation(
    listingId: string,
    requesterId: string,
    otherUserId: string,
  ): Conversation {
    if (!requesterId || !otherUserId) {
      throw new MarketplaceError("EMPTY_FIELD")
    }
    if (requesterId === otherUserId) {
      throw new MarketplaceError("SAME_PARTICIPANT")
    }
    const listing = this.get(listingId)
    if (!listing) throw new MarketplaceError("NOT_FOUND")

    const participants = sortPair(requesterId, otherUserId)
    const conversations = this.readConversations()
    const existing = conversations.find(
      (c) =>
        c.listingId === listingId &&
        c.participantIds[0] === participants[0] &&
        c.participantIds[1] === participants[1],
    )
    if (existing) return existing

    const created: Conversation = {
      id: generateId(),
      listingId,
      participantIds: participants,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    }
    conversations.push(created)
    this.writeConversations(conversations)
    return created
  }

  listConversations(userId: string): Conversation[] {
    return this.readConversations()
      .filter((c) => c.participantIds.includes(userId))
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
  }

  listMessages(conversationId: string, requesterId: string): Message[] {
    const conv = this.findConversation(conversationId)
    if (!conv) throw new MarketplaceError("NOT_FOUND")
    if (!conv.participantIds.includes(requesterId)) {
      throw new MarketplaceError("FORBIDDEN")
    }
    return this.readMessages()
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  sendMessage(conversationId: string, senderId: string, body: string): Message {
    const text = body?.trim()
    if (!text) throw new MarketplaceError("EMPTY_MESSAGE")
    const conv = this.findConversation(conversationId)
    if (!conv) throw new MarketplaceError("NOT_FOUND")
    if (!conv.participantIds.includes(senderId)) {
      throw new MarketplaceError("FORBIDDEN")
    }

    const message: Message = {
      id: generateId(),
      conversationId,
      senderId,
      body: text,
      createdAt: new Date().toISOString(),
    }
    const messages = this.readMessages()
    messages.push(message)
    this.writeMessages(messages)

    // Bump the conversation's lastMessageAt so the inbox sorts naturally.
    const conversations = this.readConversations().map((c) =>
      c.id === conversationId ? { ...c, lastMessageAt: message.createdAt } : c,
    )
    this.writeConversations(conversations)
    return message
  }

  // ----- Internals ---------------------------------------------------------

  private mutate(
    id: string,
    requesterId: string,
    fn: (l: Listing) => Listing,
  ): Listing {
    const listings = this.readListings()
    const idx = listings.findIndex((l) => l.id === id)
    if (idx === -1) throw new MarketplaceError("NOT_FOUND")
    if (listings[idx].ownerId !== requesterId) {
      throw new MarketplaceError("FORBIDDEN")
    }
    const updated = fn(listings[idx])
    listings[idx] = updated
    this.writeListings(listings)
    return updated
  }

  private findConversation(id: string): Conversation | undefined {
    return this.readConversations().find((c) => c.id === id)
  }

  private readListings(): Listing[] {
    return readArray<Listing>(this.store, LISTINGS_KEY)
  }
  private writeListings(listings: Listing[]): void {
    this.store.setItem(LISTINGS_KEY, JSON.stringify(listings))
  }

  private readConversations(): Conversation[] {
    return readArray<Conversation>(this.store, CONVERSATIONS_KEY)
  }
  private writeConversations(items: Conversation[]): void {
    this.store.setItem(CONVERSATIONS_KEY, JSON.stringify(items))
  }

  private readMessages(): Message[] {
    return readArray<Message>(this.store, MESSAGES_KEY)
  }
  private writeMessages(items: Message[]): void {
    this.store.setItem(MESSAGES_KEY, JSON.stringify(items))
  }
}

function readArray<T>(store: KeyValueStore, key: string): T[] {
  const raw = store.getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

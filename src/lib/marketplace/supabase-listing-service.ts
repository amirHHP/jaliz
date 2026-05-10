import { supabase } from "@/lib/supabase"
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

function isListingType(v: unknown): v is ListingType {
  return typeof v === "string" && (LISTING_TYPES as readonly string[]).includes(v)
}
function isListingMode(v: unknown): v is ListingMode {
  return typeof v === "string" && (LISTING_MODES as readonly string[]).includes(v)
}

function sortPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

function rowToListing(r: Record<string, unknown>): Listing {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    type: r.type as ListingType,
    mode: r.mode as ListingMode,
    title: r.title as string,
    description: r.description as string,
    price: r.price != null ? (r.price as number) : undefined,
    exchangeFor: (r.exchange_for as string | null) ?? undefined,
    location: (r.location as string | null) ?? undefined,
    image: (r.image as string | null) ?? undefined,
    contactPhone: (r.contact_phone as string | null) ?? undefined,
    status: (r.status as ListingStatus) ?? "active",
    createdAt: r.created_at as string,
    completedAt: (r.completed_at as string | null) ?? undefined,
  }
}

function rowToConversation(r: Record<string, unknown>): Conversation {
  const participants = (r.participant_ids as string[]) as [string, string]
  return {
    id: r.id as string,
    listingId: r.listing_id as string,
    participantIds: participants,
    lastMessageAt: r.last_message_at as string,
    createdAt: r.created_at as string,
  }
}

function rowToMessage(r: Record<string, unknown>): Message {
  return {
    id: r.id as string,
    conversationId: r.conversation_id as string,
    senderId: r.sender_id as string,
    body: r.body as string,
    createdAt: r.created_at as string,
  }
}

/**
 * Supabase-backed implementation of IListingService.
 * All methods are synchronous by interface but perform async Supabase calls.
 * The MarketplaceProvider calls init() once and then uses the cached data
 * for reads, while writes go straight to Supabase and refresh the cache.
 */
export class SupabaseListingService implements IListingService {
  private listings: Listing[] = []
  private conversations: Conversation[] = []
  private messages: Message[] = []

  async init(): Promise<void> {
    await this.reload()
  }

  private async reload(): Promise<void> {
    const [{ data: lData }, { data: cData }, { data: mData }] = await Promise.all([
      supabase.from("marketplace_listings").select("*").order("created_at", { ascending: false }),
      supabase.from("marketplace_conversations").select("*"),
      supabase.from("marketplace_messages").select("*").order("created_at", { ascending: true }),
    ])
    this.listings = (lData ?? []).map(rowToListing)
    this.conversations = (cData ?? []).map(rowToConversation)
    this.messages = (mData ?? []).map(rowToMessage)
  }

  list(filter: ListingFilter = {}): Listing[] {
    const q = filter.query?.trim().toLowerCase()
    return this.listings
      .filter((l) => {
        if (filter.type && l.type !== filter.type) return false
        if (filter.mode && l.mode !== filter.mode) return false
        if (filter.ownerId && l.ownerId !== filter.ownerId) return false
        if (filter.status && l.status !== filter.status) return false
        if (q && !`${l.title} ${l.description}`.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "active" ? -1 : 1
        return b.createdAt.localeCompare(a.createdAt)
      })
  }

  get(id: string): Listing | undefined {
    return this.listings.find((l) => l.id === id)
  }

  create(ownerId: string, input: CreateListingInput): Listing {
    if (!ownerId) throw new MarketplaceError("EMPTY_FIELD", "ownerId required")
    if (!input.title?.trim() || !input.description?.trim()) throw new MarketplaceError("EMPTY_FIELD")
    if (!isListingType(input.type) || !isListingMode(input.mode)) throw new MarketplaceError("EMPTY_FIELD")
    if (input.mode === "sell" && (input.price == null || Number.isNaN(input.price) || input.price < 0)) throw new MarketplaceError("INVALID_PRICE")

    const row = {
      owner_id: ownerId,
      title: input.title.trim(),
      description: input.description.trim(),
      type: input.type,
      mode: input.mode,
      price: input.mode === "sell" ? input.price : null,
      exchange_for: input.mode === "exchange" ? (input.exchangeFor?.trim() || null) : null,
      location: input.location?.trim() || null,
      image: input.image || null,
      contact_phone: input.contactPhone?.trim() || null,
      status: "active",
    }

    // Fire-and-forget async insert, refresh cache after
    supabase.from("marketplace_listings").insert(row).select().single()
      .then(({ data }) => { if (data) this.listings = [rowToListing(data), ...this.listings] })

    // Optimistic local update
    const optimistic: Listing = {
      id: crypto.randomUUID(),
      ownerId,
      type: input.type,
      mode: input.mode,
      title: row.title,
      description: row.description,
      price: row.price ?? undefined,
      exchangeFor: row.exchange_for ?? undefined,
      location: row.location ?? undefined,
      image: row.image ?? undefined,
      contactPhone: row.contact_phone ?? undefined,
      status: "active",
      createdAt: new Date().toISOString(),
    }
    this.listings = [optimistic, ...this.listings]
    // Reload to get real ID
    setTimeout(() => this.reload(), 1000)
    return optimistic
  }

  update(id: string, requesterId: string, patch: UpdateListingInput): Listing {
    const listing = this.listings.find((l) => l.id === id)
    if (!listing) throw new MarketplaceError("NOT_FOUND")
    if (listing.ownerId !== requesterId) throw new MarketplaceError("FORBIDDEN")

    const updates: Record<string, unknown> = {}
    if (patch.title !== undefined) updates.title = patch.title.trim()
    if (patch.description !== undefined) updates.description = patch.description.trim()
    if (patch.type !== undefined) updates.type = patch.type
    if (patch.mode !== undefined) {
      updates.mode = patch.mode
      if (patch.mode !== "sell") updates.price = null
      if (patch.mode !== "exchange") updates.exchange_for = null
    }
    if (patch.price !== undefined) updates.price = patch.price
    if (patch.exchangeFor !== undefined) updates.exchange_for = patch.exchangeFor.trim() || null
    if (patch.location !== undefined) updates.location = patch.location.trim() || null
    if (patch.image !== undefined) updates.image = patch.image || null
    if (patch.contactPhone !== undefined) updates.contact_phone = patch.contactPhone.trim() || null

    const updated: Listing = {
      ...listing,
      ...Object.fromEntries(
        Object.entries({
          title: updates.title as string | undefined,
          description: updates.description as string | undefined,
          type: updates.type as ListingType | undefined,
          mode: updates.mode as ListingMode | undefined,
          price: updates.price as number | undefined,
          exchangeFor: updates.exchange_for as string | undefined,
          location: updates.location as string | undefined,
          image: updates.image as string | undefined,
          contactPhone: updates.contact_phone as string | undefined,
        }).filter(([, v]) => v !== undefined)
      ),
    }
    this.listings = this.listings.map((l) => l.id === id ? updated : l)
    supabase.from("marketplace_listings").update(updates).eq("id", id).then(() => this.reload())
    return updated
  }

  setCompleted(id: string, requesterId: string, completed: boolean): Listing {
    const listing = this.listings.find((l) => l.id === id)
    if (!listing) throw new MarketplaceError("NOT_FOUND")
    if (listing.ownerId !== requesterId) throw new MarketplaceError("FORBIDDEN")
    const status: ListingStatus = completed ? "completed" : "active"
    const completedAt = completed ? new Date().toISOString() : null
    const updated = { ...listing, status, completedAt: completedAt ?? undefined }
    this.listings = this.listings.map((l) => l.id === id ? updated : l)
    supabase.from("marketplace_listings").update({ status, completed_at: completedAt }).eq("id", id)
    return updated
  }

  remove(id: string, requesterId: string): void {
    const listing = this.listings.find((l) => l.id === id)
    if (!listing) throw new MarketplaceError("NOT_FOUND")
    if (listing.ownerId !== requesterId) throw new MarketplaceError("FORBIDDEN")
    this.listings = this.listings.filter((l) => l.id !== id)
    supabase.from("marketplace_listings").delete().eq("id", id)
  }

  getOrCreateConversation(listingId: string, requesterId: string, otherUserId: string): Conversation {
    if (!requesterId || !otherUserId) throw new MarketplaceError("EMPTY_FIELD")
    if (requesterId === otherUserId) throw new MarketplaceError("SAME_PARTICIPANT")
    if (!this.get(listingId)) throw new MarketplaceError("NOT_FOUND")

    const participants = sortPair(requesterId, otherUserId)
    const existing = this.conversations.find(
      (c) => c.listingId === listingId && c.participantIds[0] === participants[0] && c.participantIds[1] === participants[1],
    )
    if (existing) return existing

    const now = new Date().toISOString()
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      listingId,
      participantIds: participants,
      lastMessageAt: now,
      createdAt: now,
    }
    this.conversations = [...this.conversations, newConv]
    supabase.from("marketplace_conversations").insert({
      id: newConv.id,
      listing_id: listingId,
      participant_ids: participants,
      last_message_at: now,
      created_at: now,
    }).then(() => this.reload())
    return newConv
  }

  listConversations(userId: string): Conversation[] {
    return this.conversations
      .filter((c) => c.participantIds.includes(userId))
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
  }

  listMessages(conversationId: string, requesterId: string): Message[] {
    const conv = this.conversations.find((c) => c.id === conversationId)
    if (!conv) throw new MarketplaceError("NOT_FOUND")
    if (!conv.participantIds.includes(requesterId)) throw new MarketplaceError("FORBIDDEN")
    return this.messages.filter((m) => m.conversationId === conversationId)
  }

  sendMessage(conversationId: string, senderId: string, body: string): Message {
    const text = body?.trim()
    if (!text) throw new MarketplaceError("EMPTY_MESSAGE")
    const conv = this.conversations.find((c) => c.id === conversationId)
    if (!conv) throw new MarketplaceError("NOT_FOUND")
    if (!conv.participantIds.includes(senderId)) throw new MarketplaceError("FORBIDDEN")

    const recipientId = conv.participantIds.find((id) => id !== senderId)!
    const now = new Date().toISOString()
    const msg: Message = { id: crypto.randomUUID(), conversationId, senderId, body: text, createdAt: now }
    this.messages = [...this.messages, msg]
    this.conversations = this.conversations.map((c) => c.id === conversationId ? { ...c, lastMessageAt: now } : c)

    supabase.from("marketplace_messages").insert({
      id: msg.id,
      conversation_id: conversationId,
      listing_id: conv.listingId,
      sender_id: senderId,
      recipient_id: recipientId,
      body: text,
      created_at: now,
    }).then(() => {
      supabase.from("marketplace_conversations").update({ last_message_at: now }).eq("id", conversationId)
    })
    return msg
  }
}

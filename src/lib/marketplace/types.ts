/** Domain types for the marketplace feature. */

export type ListingType = "seed" | "cutting" | "tool" | "produce"
export type ListingMode = "sell" | "exchange" | "free"
export type ListingStatus = "active" | "completed"

export const LISTING_TYPES: readonly ListingType[] = [
  "seed",
  "cutting",
  "tool",
  "produce",
] as const
export const LISTING_MODES: readonly ListingMode[] = [
  "sell",
  "exchange",
  "free",
] as const

export interface ListingOwnerPreview {
  fullName: string
  phone?: string | null
  avatar?: string | null
}

export interface Listing {
  id: string
  ownerId: string
  /** Populated when listings are fetched with owner include (avoids extra round-trip). */
  owner?: ListingOwnerPreview
  type: ListingType
  mode: ListingMode
  title: string
  description: string
  /** Price in Iranian toman; only meaningful for `mode === "sell"`. */
  price?: number
  /** What the owner wants in return; only meaningful for `mode === "exchange"`. */
  exchangeFor?: string
  /** Free-form location text (e.g. "Tehran, district 5"). */
  location?: string
  /** Optional listing photo (data URL or remote URL). */
  image?: string
  /** Snapshot of the owner's contact phone at posting time. */
  contactPhone?: string
  status: ListingStatus
  createdAt: string
  completedAt?: string
}

export interface CreateListingInput {
  type: ListingType
  mode: ListingMode
  title: string
  description: string
  price?: number
  exchangeFor?: string
  location?: string
  image?: string
  contactPhone?: string
}

export type UpdateListingInput = Partial<CreateListingInput>

export interface ListingFilter {
  type?: ListingType
  mode?: ListingMode
  ownerId?: string
  status?: ListingStatus
  /** Case-insensitive substring against title and description. */
  query?: string
}

export interface Conversation {
  id: string
  listingId: string
  /** Always sorted ascending so the same pair maps to the same conversation. */
  participantIds: [string, string]
  lastMessageAt: string
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
}

export type MarketplaceErrorCode =
  | "EMPTY_FIELD"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "INVALID_PRICE"
  | "SAME_PARTICIPANT"
  | "EMPTY_MESSAGE"

export class MarketplaceError extends Error {
  readonly code: MarketplaceErrorCode

  constructor(code: MarketplaceErrorCode, message?: string) {
    super(message ?? code)
    this.code = code
    this.name = "MarketplaceError"
  }
}

export interface IListingService {
  init(): Promise<void>
  list(filter?: ListingFilter): Listing[]
  get(id: string): Listing | undefined
  create(ownerId: string, input: CreateListingInput): Listing
  update(id: string, requesterId: string, patch: UpdateListingInput): Listing
  setCompleted(id: string, requesterId: string, completed: boolean): Listing
  remove(id: string, requesterId: string): void

  // Messaging --------------------------------------------------------------
  getOrCreateConversation(
    listingId: string,
    requesterId: string,
    otherUserId: string,
  ): Conversation
  listConversations(userId: string): Conversation[]
  listMessages(conversationId: string, requesterId: string): Message[]
  sendMessage(conversationId: string, senderId: string, body: string): Message
}

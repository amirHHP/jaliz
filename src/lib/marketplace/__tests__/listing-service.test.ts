import { beforeEach, describe, expect, it } from "vitest"

import { InMemoryStore, LocalListingService } from "../listing-service"
import { CreateListingInput, MarketplaceError } from "../types"

const OWNER = "owner-1"
const OTHER = "user-2"

function newSeedlingInput(
  overrides: Partial<CreateListingInput> = {},
): CreateListingInput {
  return {
    type: "seed",
    mode: "sell",
    title: "Heirloom Tomato Seeds",
    description: "10 seeds, organic.",
    price: 50000,
    location: "Tehran",
    ...overrides,
  }
}

async function freshService(): Promise<LocalListingService> {
  const svc = new LocalListingService(new InMemoryStore())
  await svc.init()
  return svc
}

describe("create listing", () => {
  let svc: LocalListingService
  beforeEach(async () => {
    svc = await freshService()
  })

  it("creates an active listing with normalized fields", () => {
    const listing = svc.create(OWNER, newSeedlingInput({ title: "  Seeds  " }))
    expect(listing.ownerId).toBe(OWNER)
    expect(listing.status).toBe("active")
    expect(listing.title).toBe("Seeds")
    expect(listing.completedAt).toBeUndefined()
    expect(listing.id).toBeTruthy()
    expect(listing.createdAt).toBeTruthy()
  })

  it("rejects empty required fields", () => {
    expect(() =>
      svc.create(OWNER, newSeedlingInput({ title: "  " })),
    ).toThrow(MarketplaceError)
    expect(() =>
      svc.create(OWNER, newSeedlingInput({ description: "" })),
    ).toThrow(MarketplaceError)
  })

  it("requires a non-negative price for sell mode", () => {
    expect(() =>
      svc.create(OWNER, newSeedlingInput({ price: undefined })),
    ).toThrow(MarketplaceError)
    expect(() => svc.create(OWNER, newSeedlingInput({ price: -1 }))).toThrow(
      MarketplaceError,
    )
  })

  it("clears the price when mode is not sell", () => {
    const listing = svc.create(
      OWNER,
      newSeedlingInput({ mode: "free", price: 100 as number }),
    )
    expect(listing.price).toBeUndefined()
  })

  it("keeps exchangeFor only for exchange mode", () => {
    const exchange = svc.create(OWNER, {
      type: "cutting",
      mode: "exchange",
      title: "Mint cutting",
      description: "Healthy cutting.",
      exchangeFor: "Basil cutting",
    })
    expect(exchange.exchangeFor).toBe("Basil cutting")

    const sell = svc.create(OWNER, {
      ...newSeedlingInput(),
      exchangeFor: "Should be ignored",
    })
    expect(sell.exchangeFor).toBeUndefined()
  })
})

describe("list & filter listings", () => {
  let svc: LocalListingService
  beforeEach(async () => {
    svc = await freshService()
    svc.create(OWNER, newSeedlingInput({ title: "Tomato seeds" }))
    svc.create(OTHER, {
      type: "tool",
      mode: "free",
      title: "Pruning shears",
      description: "Used.",
    })
    svc.create(OWNER, {
      type: "cutting",
      mode: "exchange",
      title: "Mint cutting",
      description: "Looking for basil.",
    })
  })

  it("returns all listings sorted by recency by default", () => {
    const all = svc.list()
    expect(all).toHaveLength(3)
  })

  it("filters by type", () => {
    expect(svc.list({ type: "tool" })).toHaveLength(1)
    expect(svc.list({ type: "seed" })).toHaveLength(1)
  })

  it("filters by mode", () => {
    expect(svc.list({ mode: "free" })).toHaveLength(1)
    expect(svc.list({ mode: "exchange" })).toHaveLength(1)
  })

  it("filters by ownerId", () => {
    expect(svc.list({ ownerId: OWNER })).toHaveLength(2)
    expect(svc.list({ ownerId: OTHER })).toHaveLength(1)
  })

  it("does case-insensitive substring search across title and description", () => {
    expect(svc.list({ query: "tomato" })).toHaveLength(1)
    expect(svc.list({ query: "BASIL" })).toHaveLength(1)
  })

  it("places completed listings after active ones", () => {
    const [firstActive] = svc.list({ ownerId: OWNER })
    svc.setCompleted(firstActive.id, OWNER, true)
    const sorted = svc.list()
    expect(sorted[sorted.length - 1].id).toBe(firstActive.id)
  })
})

describe("update + delete + complete", () => {
  let svc: LocalListingService
  let listingId: string

  beforeEach(async () => {
    svc = await freshService()
    listingId = svc.create(OWNER, newSeedlingInput()).id
  })

  it("only the owner can update", () => {
    expect(() =>
      svc.update(listingId, OTHER, { title: "Hijack" }),
    ).toThrow(MarketplaceError)
  })

  it("update strips/normalizes fields and respects mode invariants", () => {
    const updated = svc.update(listingId, OWNER, {
      title: "  Better title  ",
      mode: "free",
      price: 99,
    })
    expect(updated.title).toBe("Better title")
    expect(updated.mode).toBe("free")
    expect(updated.price).toBeUndefined()
  })

  it("setCompleted toggles status and timestamps", () => {
    const completed = svc.setCompleted(listingId, OWNER, true)
    expect(completed.status).toBe("completed")
    expect(completed.completedAt).toBeTruthy()

    const reopened = svc.setCompleted(listingId, OWNER, false)
    expect(reopened.status).toBe("active")
    expect(reopened.completedAt).toBeUndefined()
  })

  it("only the owner can complete", () => {
    expect(() => svc.setCompleted(listingId, OTHER, true)).toThrow(
      MarketplaceError,
    )
  })

  it("only the owner can delete and cascade clears related conversations", () => {
    const conv = svc.getOrCreateConversation(listingId, OTHER, OWNER)
    svc.sendMessage(conv.id, OTHER, "Hi!")
    expect(() => svc.remove(listingId, OTHER)).toThrow(MarketplaceError)

    svc.remove(listingId, OWNER)
    expect(svc.get(listingId)).toBeUndefined()
    expect(svc.listConversations(OWNER)).toHaveLength(0)
    expect(svc.listConversations(OTHER)).toHaveLength(0)
  })
})

describe("messaging", () => {
  let svc: LocalListingService
  let listingId: string

  beforeEach(async () => {
    svc = await freshService()
    listingId = svc.create(OWNER, newSeedlingInput()).id
  })

  it("creates a single conversation per listing+pair regardless of caller order", () => {
    const a = svc.getOrCreateConversation(listingId, OTHER, OWNER)
    const b = svc.getOrCreateConversation(listingId, OWNER, OTHER)
    expect(a.id).toBe(b.id)
    expect(a.participantIds).toEqual([
      ...[OWNER, OTHER].sort(),
    ])
  })

  it("rejects a conversation between the same user", () => {
    expect(() =>
      svc.getOrCreateConversation(listingId, OWNER, OWNER),
    ).toThrow(MarketplaceError)
  })

  it("only participants can read and send messages", () => {
    const conv = svc.getOrCreateConversation(listingId, OTHER, OWNER)
    expect(() => svc.listMessages(conv.id, "stranger")).toThrow(
      MarketplaceError,
    )
    expect(() => svc.sendMessage(conv.id, "stranger", "hi")).toThrow(
      MarketplaceError,
    )
  })

  it("send + list returns messages in chronological order", async () => {
    const conv = svc.getOrCreateConversation(listingId, OTHER, OWNER)
    svc.sendMessage(conv.id, OTHER, "Hello!")
    // Tiny pause to ensure distinct createdAt timestamps regardless of clock
    // resolution on slower CI machines.
    await new Promise((r) => setTimeout(r, 2))
    svc.sendMessage(conv.id, OWNER, "Hi back")

    const messages = svc.listMessages(conv.id, OWNER)
    expect(messages.map((m) => m.body)).toEqual(["Hello!", "Hi back"])
  })

  it("rejects empty or whitespace-only messages", () => {
    const conv = svc.getOrCreateConversation(listingId, OTHER, OWNER)
    expect(() => svc.sendMessage(conv.id, OTHER, "   ")).toThrow(
      MarketplaceError,
    )
  })

  it("listConversations returns conversations sorted by recency for that user", async () => {
    const conv = svc.getOrCreateConversation(listingId, OTHER, OWNER)
    svc.sendMessage(conv.id, OTHER, "Hi")
    const list = svc.listConversations(OWNER)
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(conv.id)
    expect(svc.listConversations("stranger")).toHaveLength(0)
  })
})

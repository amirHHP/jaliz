import type { Listing } from "./types"

/** Synonym clusters: if any term appears in advice/context, we rank listings that mention any term in the cluster. */
export const ADVICE_PRODUCT_TERM_GROUPS: readonly (readonly string[])[] = [
  ["کود", "کوددهی", "fertilizer", "fertiliser", "npk", "کمپوست", "compost", "urea", "اوره"],
  ["قارچ‌کش", "قارچ کش", "fungicide", "فنجیسید"],
  ["سم", "حشره‌کش", "حشره کش", "pesticide", "insecticide", "آفت‌کش", "آفت کش"],
  ["خاک", "soil", "potting", "پیت ماس", "peat", "perlite", "پرلیت", "coco", "کوکوپیت"],
  ["گلدان", "pot", "planter", "container"],
  ["بذر", "seed", "نشاء", "seedling"],
  ["قلمه", "cutting", "clone"],
  ["هرس", "prune", "pruning", "قیچی باغبانی", "shears"],
  ["مالچ", "mulch"],
  ["ابزار", "tool", "بیلچه", "trowel", "باغبانی"],
] as const

const DEFAULT_LIMIT = 6
const TITLE_WEIGHT = 10
const DESC_WEIGHT = 3

export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u200c\u200f\u00a0]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function collectTriggeredTerms(haystack: string): Set<string> {
  const n = normalizeForMatch(haystack)
  const out = new Set<string>()
  for (const group of ADVICE_PRODUCT_TERM_GROUPS) {
    let groupHit = false
    for (const term of group) {
      if (n.includes(normalizeForMatch(term))) {
        groupHit = true
        break
      }
    }
    if (groupHit) {
      for (const term of group) out.add(normalizeForMatch(term))
    }
  }
  return out
}

function listingScore(
  listing: Listing,
  triggered: Set<string>,
): number {
  const title = normalizeForMatch(listing.title)
  const desc = normalizeForMatch(listing.description)
  let score = 0
  for (const term of triggered) {
    if (!term) continue
    if (title.includes(term)) score += TITLE_WEIGHT
    else if (desc.includes(term)) score += DESC_WEIGHT
  }
  return score
}

export interface MatchListingsToAdviceOptions {
  /** Max listings to return (default 6). */
  limit?: number
}

/**
 * Ranks active marketplace listings by overlap between advice/context text
 * and listing title/description using synonym groups (FA/EN).
 */
export function matchListingsToAdvice(
  adviceText: string | null | undefined,
  contextText: string | null | undefined,
  listings: readonly Listing[],
  options?: MatchListingsToAdviceOptions,
): Listing[] {
  const limit = options?.limit ?? DEFAULT_LIMIT
  const combined = [adviceText ?? "", contextText ?? ""].join(" ")
  const triggered = collectTriggeredTerms(combined)
  if (triggered.size === 0) return []

  const active = listings.filter((l) => l.status === "active")
  const scored = active
    .map((l) => ({ listing: l, score: listingScore(l, triggered) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(b.listing.createdAt).getTime() - new Date(a.listing.createdAt).getTime()
    })

  return scored.slice(0, limit).map((x) => x.listing)
}

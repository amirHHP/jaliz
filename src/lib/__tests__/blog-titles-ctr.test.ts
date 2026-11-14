import { describe, expect, it } from "vitest"
import { blogPosts } from "../blogData"

describe("Blog Titles CTR Optimization & Slug Preservation (Tiers 1-4)", () => {
  /* ==========================================================================
   * TIER 1: FROZEN SLUG PRESERVATION & ZERO ROUTE BREAKAGE
   * ========================================================================== */
  describe("Tier 1: Slug Invariance & Zero 404 Route Breakage", () => {
    it("preserves exactly 104 total blog posts across all collections", () => {
      expect(blogPosts).toHaveLength(104)
    })

    it("guarantees 100% unique slugs across entire collection", () => {
      const slugs = blogPosts.map((p) => p.slug)
      expect(new Set(slugs).size).toBe(104)
    })

    it("ensures every slug is URL-safe with no illegal characters or unencoded spaces", () => {
      for (const post of blogPosts) {
        expect(post.slug.length).toBeGreaterThan(0)
        expect(post.slug).not.toContain(" ")
        expect(post.slug).not.toContain("/")
        expect(post.slug).not.toContain("?")
        expect(post.slug).not.toContain("#")
      }
    })

    it("ensures every bilingual post maintains its alternateSlug pairing without breakage", () => {
      const slugMap = new Map(blogPosts.map((p) => [p.slug, p]))
      for (const post of blogPosts) {
        if (post.alternateSlug && post.alternateSlug !== post.slug) {
          const alternate = slugMap.get(post.alternateSlug)
          expect(
            alternate,
            `Post ${post.slug} references missing alternateSlug: ${post.alternateSlug}`
          ).toBeDefined()
        }
      }
    })
  })

  /* ==========================================================================
   * TIER 2: TITLE INTEGRITY & STRUCTURAL QUALITY
   * ========================================================================== */
  describe("Tier 2: Title Length, Character Bounds, & Bracket Balance", () => {
    it("enforces non-empty, well-bounded title lengths for Persian and English posts", () => {
      for (const post of blogPosts) {
        expect(post.title).toBeTypeOf("string")
        const trimmed = post.title.trim()
        expect(trimmed.length).toBeGreaterThanOrEqual(10)
        expect(trimmed.length).toBeLessThanOrEqual(120)
      }
    })

    it("enforces proper closing and balancing of Persian/Unicode brackets", () => {
      for (const post of blogPosts) {
        const title = post.title

        // Check Unicode full-width brackets 【...】
        const openThick = (title.match(/【/g) || []).length
        const closeThick = (title.match(/】/g) || []).length
        expect(openThick, `Unbalanced thick brackets in: "${title}"`).toBe(closeThick)

        // Check standard brackets [...]
        const openSquare = (title.match(/\[/g) || []).length
        const closeSquare = (title.match(/\]/g) || []).length
        expect(openSquare, `Unbalanced square brackets in: "${title}"`).toBe(closeSquare)

        // Check standard parentheses (...)
        const openParen = (title.match(/\(/g) || []).length
        const closeParen = (title.match(/\)/g) || []).length
        expect(openParen, `Unbalanced parentheses in: "${title}"`).toBe(closeParen)
      }
    })

    it("disallows raw HTML tags or unrendered template markers in titles", () => {
      const forbiddenTokens = ["<", ">", "undefined", "null", "NaN", "[object Object]", "[TBD]"]
      for (const post of blogPosts) {
        for (const token of forbiddenTokens) {
          expect(post.title).not.toContain(token)
        }
      }
    })
  })

  /* ==========================================================================
   * TIER 3: CTR ENHANCEMENTS & HOOK COVERAGE
   * ========================================================================== */
  describe("Tier 3: CTR Enhancements (Brackets, Emojis, & Engaging Hooks)", () => {
    // Regex for plant and care relevant emojis
    const CTR_EMOJI_REGEX = /[\u{1F331}\u{1F33F}\u{1FAB4}\u{1F4A7}\u{2702}\u{1F338}\u{2600}\u{1F41B}\u{1FAB5}\u{1F9F4}\u{1F9EA}\u{1F4A1}\u{1F3E1}\u{1F342}\u{1F343}\u{2728}\u{1F514}\u{2705}]/u

    // Engaging Persian hooks for high search CTR
    const PERSIAN_HOOK_PATTERNS = [
      /راهنمای/i,
      /علت/i,
      /چگونه/i,
      /آموزش/i,
      /بهترین/i,
      /روش/i,
      /درمان/i,
      /ترفند/i,
      /راز/i,
      /گام به گام/i,
      /طلایی/i,
      /کامل/i,
      /تضمینی/i,
      /سریع/i,
      /حل/i,
      /کاربرد/i,
      /معرفی/i,
      /نگهداری/i,
      /تکثیر/i,
    ]

    it("ensures every Persian article contains at least one CTR element (bracket, emoji, or compelling hook)", () => {
      const persianPosts = blogPosts.filter((p) => p.lang === "fa")
      expect(persianPosts.length).toBeGreaterThanOrEqual(54)

      for (const post of persianPosts) {
        const hasBracket = post.title.includes("【") || post.title.includes("(") || post.title.includes("[")
        const hasEmoji = CTR_EMOJI_REGEX.test(post.title)
        const hasHook = PERSIAN_HOOK_PATTERNS.some((pattern) => pattern.test(post.title))

        expect(
          hasBracket || hasEmoji || hasHook,
          `Persian title "${post.title}" must contain CTR enhancement (bracket, emoji, or engaging hook)`
        ).toBe(true)
      }
    })

    it("maintains high descriptive quality without duplicate generic titles", () => {
      const titles = blogPosts.map((p) => p.title)
      expect(new Set(titles).size).toBe(titles.length)
    })
  })

  /* ==========================================================================
   * TIER 4: KEYWORD PRESERVATION & SEO FIDELITY
   * ========================================================================== */
  describe("Tier 4: Topical Relevance & Primary Keyword Preservation", () => {
    it("ensures title retains the primary keyword or its essential tokens", () => {
      for (const post of blogPosts) {
        if (!post.primaryKeyword) continue

        const normalizedTitle = post.title.replace(/\u200c/g, " ").toLowerCase()
        const normalizedKeyword = post.primaryKeyword.replace(/\u200c/g, " ").toLowerCase()

        // Either exact keyword in title, or at least one significant keyword word (>= 2 chars) present
        const STOPWORDS = new Set(["در", "از", "با", "به", "تا", "که", "رو", "بر", "یا", "و", "این", "آن", "های"])
        const keywordTokens = normalizedKeyword
          .split(" ")
          .filter((token) => token.length >= 2 && !STOPWORDS.has(token))

        const tokenMatchCount = keywordTokens.filter((token) => normalizedTitle.includes(token)).length
        expect(
          tokenMatchCount > 0,
          `Title "${post.title}" must retain core topical tokens from primaryKeyword "${post.primaryKeyword}"`
        ).toBe(true)
      }
    })
  })
})

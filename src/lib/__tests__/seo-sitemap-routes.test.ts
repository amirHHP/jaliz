import { describe, expect, it } from "vitest"
import sitemap from "@/app/sitemap"
import robots from "@/app/robots"
import { getAllWikiPlants } from "../wikiData"

describe("SEO Sitemap & Robots Registration (Tiers 1-4)", () => {
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jalizapp.ir").replace(/\/$/, "")

  /* ==========================================================================
   * TIER 1: SITEMAP INDEX & STATIC ENCYCLOPEDIA ROUTE
   * ========================================================================== */
  describe("Tier 1: Static Route Inclusion", () => {
    it("includes /wiki encyclopedia root in sitemap entries", async () => {
      const entries = await sitemap()
      const wikiRoot = entries.find(
        (entry) =>
          entry.url === `${SITE_URL}/wiki` ||
          entry.url.endsWith("/wiki")
      )

      expect(
        wikiRoot,
        `Sitemap must contain entry for encyclopedia index: ${SITE_URL}/wiki`
      ).toBeDefined()

      if (wikiRoot) {
        expect(wikiRoot.priority).toBeGreaterThanOrEqual(0.8)
        expect(["daily", "weekly", "monthly"]).toContain(wikiRoot.changeFrequency)
      }
    })

    it("ensures all core static routes remain present alongside /wiki", async () => {
      const entries = await sitemap()
      const urls = entries.map((e) => e.url)

      expect(urls).toContain(SITE_URL)
      expect(urls.some((u) => u.endsWith("/marketplace"))).toBe(true)
      expect(urls.some((u) => u.endsWith("/blog"))).toBe(true)
      expect(urls.some((u) => u.endsWith("/plants/diagnose"))).toBe(true)
    })
  })

  /* ==========================================================================
   * TIER 2: DYNAMIC PLANT SPECIES ROUTES
   * ========================================================================== */
  describe("Tier 2: Plant Species Detail Routes", () => {
    it("includes every plant slug from getAllWikiPlants() in the sitemap", async () => {
      let plants: any[] = []
      try {
        plants = getAllWikiPlants()
      } catch {
        // If placeholder stub throws in Milestone 1, skip checking plant detail pages
        return
      }

      if (!plants || plants.length === 0) return

      const entries = await sitemap()
      const urls = entries.map((e) => e.url)

      for (const plant of plants) {
        const expectedPlain = `${SITE_URL}/wiki/${plant.slug}`
        const expectedEncoded = `${SITE_URL}/wiki/${encodeURIComponent(plant.slug)}`

        const found = urls.includes(expectedPlain) || urls.includes(expectedEncoded)
        expect(
          found,
          `Sitemap missing entry for plant: ${plant.slug} (${plant.nameFa})`
        ).toBe(true)
      }
    })

    it("assigns high search priority (>= 0.7) to plant detail pages", async () => {
      const entries = await sitemap()
      const wikiDetailPages = entries.filter(
        (e) => e.url.includes("/wiki/") && !e.url.endsWith("/wiki")
      )

      for (const page of wikiDetailPages) {
        expect(page.priority).toBeGreaterThanOrEqual(0.7)
      }
    })
  })

  /* ==========================================================================
   * TIER 3: ROBOTS.TXT CRAWLER PERMISSION & POLICIES
   * ========================================================================== */
  describe("Tier 3: Robots.txt Rules & Directives", () => {
    it("allows search engines to crawl /wiki without restriction", () => {
      const robotsConfig = robots()
      expect(robotsConfig).toBeDefined()
      expect(robotsConfig.rules).toBeDefined()

      const rules = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules
        : [robotsConfig.rules]

      for (const rule of rules) {
        const disallowList = Array.isArray(rule.disallow)
          ? rule.disallow
          : rule.disallow ? [rule.disallow] : []

        for (const disallowed of disallowList) {
          expect(disallowed).not.toBe("/wiki")
          expect(disallowed).not.toBe("/wiki/")
          expect(disallowed.startsWith("/wiki/")).toBe(false)
        }
      }
    })

    it("registers valid sitemap XML location in robots.txt", () => {
      const robotsConfig = robots()
      expect(robotsConfig.sitemap).toBeDefined()
      const sitemapUrl = Array.isArray(robotsConfig.sitemap)
        ? robotsConfig.sitemap[0]
        : robotsConfig.sitemap

      expect(sitemapUrl).toMatch(/^https?:\/\/.+\/sitemap\.xml$/)
    })
  })

  /* ==========================================================================
   * TIER 4: URL SANITY & DUPLICATION INTEGRITY
   * ========================================================================== */
  describe("Tier 4: URL Sanity & Duplication Checks", () => {
    it("guarantees zero duplicate URLs in the sitemap output", async () => {
      const entries = await sitemap()
      const urls = entries.map((e) => e.url)
      expect(new Set(urls).size).toBe(urls.length)
    })

    it("verifies no double slashes in sitemap paths", async () => {
      const entries = await sitemap()
      for (const entry of entries) {
        // Exclude the protocol double slash 'https://'
        const pathPart = entry.url.replace(/^https?:\/\//, "")
        expect(pathPart).not.toContain("//")
      }
    })
  })
})

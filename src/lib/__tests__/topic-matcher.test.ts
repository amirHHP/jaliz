import { describe, expect, it } from "vitest"
import { resolveMarketplaceTopic, type MarketplaceMatchResult } from "../marketplace/topic-matcher"

describe("Marketplace Topic Matcher Engine (Tiers 1-4)", () => {
  /* ==========================================================================
   * TIER 1: SPECIES KEYWORD MATCHING
   * ========================================================================== */
  describe("Tier 1: Plant Species Matching", () => {
    const SPECIES_TEST_CASES = [
      { input: { title: "آموزش نگهداری گیاه سانسوریا در آپارتمان" }, expectedQuery: "سانسوریا" },
      { input: { slug: "نگهداری-پتوس-مرمری" }, expectedQuery: "پتوس" },
      { input: { keywords: ["زامیفولیا", "آبیاری", "نور"] }, expectedQuery: "زامیفولیا" },
      { input: { title: "راهنمای کامل نگهداری برگ انجیری مونسترا" }, expectedQuery: "برگ انجیری" },
      { input: { slug: "فیکوس-الاستیکا-ابلق" }, expectedQuery: "فیکوس" },
      { input: { title: "علت زرد شدن برگ آگلونما" }, expectedQuery: "آگلونما" },
      { input: { title: "نگهداری نخل یوکا در بالکن" }, expectedQuery: "یوکا" },
      { input: { title: "درمان لکه‌های زرد دیفن باخیا" }, expectedQuery: "دیفن باخیا" },
      { input: { slug: "نگهداری-شفلرا-ابلق" }, expectedQuery: "شفلرا" },
      { input: { keywords: ["کالانکوئه", "گلدهی"] }, expectedQuery: "کالانکوئه" },
      { input: { title: "قلمه زدن پپرومیا قاشقی" }, expectedQuery: "قاشقی" },
      { input: { title: "آبیاری و رطوبت اسپاتی فیلوم" }, expectedQuery: "اسپاتی فیلوم" },
    ]

    it("extracts exact species query from titles, slugs, and keywords", () => {
      for (const tc of SPECIES_TEST_CASES) {
        const result: MarketplaceMatchResult = resolveMarketplaceTopic(tc.input)
        expect(result).toBeDefined()
        expect(result.query).toBeTypeOf("string")
        expect(result.query.length).toBeGreaterThan(0)

        // Query or speciesMatch should contain the expected species keyword
        const normQuery = result.query.replace(/\u200c/g, " ")
        const normExpected = tc.expectedQuery.replace(/\u200c/g, " ")
        const matchesQuery = normQuery.includes(normExpected)
        const matchesSpecies = result.speciesMatch
          ? result.speciesMatch.replace(/\u200c/g, " ").includes(normExpected)
          : false

        expect(
          matchesQuery || matchesSpecies,
          `Expected query for '${JSON.stringify(tc.input)}' to contain '${tc.expectedQuery}', got '${result.query}'`
        ).toBe(true)
      }
    })

    it("populates localized titleFa and descriptionFa when species is matched", () => {
      const result = resolveMarketplaceTopic({ title: "راهنمای نگهداری سانسوریا" })
      expect(result.titleFa).toBeTypeOf("string")
      expect(result.titleFa.length).toBeGreaterThan(0)
      expect(result.descriptionFa).toBeTypeOf("string")
      expect(result.descriptionFa.length).toBeGreaterThan(0)
    })
  })

  /* ==========================================================================
   * TIER 2: CARE TOPIC & ACCESSORY MATCHING
   * ========================================================================== */
  describe("Tier 2: Care Topic & Supplies Matching", () => {
    it("matches soil and substrate topics", () => {
      const inputs = [
        { title: "بهترین ترکیب خاک برگ برای گیاهان خانگی" },
        { slug: "ترکیب-خاک-مناسب-کاکتوس" },
        { keywords: ["خاک برگ", "پیت ماس", "پرلیت"] },
      ]

      for (const input of inputs) {
        const result = resolveMarketplaceTopic(input)
        expect(
          result.query.includes("خاک") ||
          result.careTopicMatch?.toLowerCase().includes("soil") ||
          result.careTopicMatch?.includes("خاک")
        ).toBe(true)
      }
    })

    it("matches fertilizer and nutrition topics", () => {
      const inputs = [
        { title: "کود آهن برای گیاهان آپارتمانی و زمان مصرف" },
        { slug: "کود-فسفر-بالا-ریشه-زایی" },
        { keywords: ["کود NPK", "تقویت گیاه"] },
      ]

      for (const input of inputs) {
        const result = resolveMarketplaceTopic(input)
        expect(
          result.query.includes("کود") ||
          result.careTopicMatch?.toLowerCase().includes("fertilizer") ||
          result.careTopicMatch?.includes("کود")
        ).toBe(true)
      }
    })

    it("matches pest control and treatment topics", () => {
      const inputs = [
        { title: "درمان شپشک آردآلود با سم کنفیدور" },
        { slug: "درمان-کنه-تار-عنکبوتی-با-آفت-کش" },
        { keywords: ["قارچ کش مانکوزب", "سمپاشی"] },
      ]

      for (const input of inputs) {
        const result = resolveMarketplaceTopic(input)
        const matchesPest =
          result.query.includes("سم") ||
          result.query.includes("آفت") ||
          result.query.includes("شپشک") ||
          result.careTopicMatch?.toLowerCase().includes("pesticide") ||
          result.careTopicMatch?.includes("سم") ||
          result.careTopicMatch?.includes("قارچ")

        expect(matchesPest).toBe(true)
      }
    })

    it("matches moss poles, pots, and accessories", () => {
      const inputs = [
        { title: "آموزش ساخت قیم خزه ای برای فیلودندرون" },
        { slug: "راهنمای-انتخاب-گلدان-سفالی-مناسب" },
      ]

      for (const input of inputs) {
        const result = resolveMarketplaceTopic(input)
        expect(result.query.length).toBeGreaterThan(0)
        expect(result.titleFa.length).toBeGreaterThan(0)
      }
    })
  })

  /* ==========================================================================
   * TIER 3: PERSIAN NORMALIZATION & CHARACTER VARIANT RESILIENCE
   * ========================================================================== */
  describe("Tier 3: Persian Character Normalization", () => {
    it("handles zero-width non-joiner (half-space \\u200c) transparently", () => {
      // With half-space vs standard space
      const withHalfSpace = resolveMarketplaceTopic({ title: "نگهداری برگ\u200cانجیری در آپارتمان" })
      const withStandardSpace = resolveMarketplaceTopic({ title: "نگهداری برگ انجیری در آپارتمان" })

      expect(withHalfSpace.query.replace(/\u200c/g, " ")).toBe(
        withStandardSpace.query.replace(/\u200c/g, " ")
      )
    })

    it("normalizes Arabic Ye (ي) to Persian Ye (ی)", () => {
      const arabicYeResult = resolveMarketplaceTopic({ title: "نگهداري سانسوريا" })
      const persianYeResult = resolveMarketplaceTopic({ title: "نگهداری سانسوریا" })

      expect(arabicYeResult.query.replace(/\u200c/g, " ")).toContain("سانسوریا")
      expect(persianYeResult.query.replace(/\u200c/g, " ")).toContain("سانسوریا")
    })

    it("normalizes Arabic Kaf (ك) to Persian Kaf (ک)", () => {
      const arabicKafResult = resolveMarketplaceTopic({ title: "پرورش گياه يوكا" })
      expect(arabicKafResult.query).toMatch(/یوکا/)
    })

    it("strips punctuation, hashtags, and noisy symbols from query", () => {
      const noisyResult = resolveMarketplaceTopic({
        title: "!!! راهنمای #پتوس طلایی (سریع و آسان) ???",
      })
      expect(noisyResult.query).not.toContain("!")
      expect(noisyResult.query).not.toContain("?")
      expect(noisyResult.query).not.toContain("#")
      expect(noisyResult.query).toMatch(/پتوس/)
    })
  })

  /* ==========================================================================
   * TIER 4: FALLBACKS, IMMUNITY, & COMMERCIAL RELEVANCE
   * ========================================================================== */
  describe("Tier 4: Robust Fallbacks & Query Contract", () => {
    it("returns general houseplant fallback query for empty or undefined input", () => {
      const emptyResult = resolveMarketplaceTopic({})
      expect(emptyResult).toBeDefined()
      expect(emptyResult.query).toBeTypeOf("string")
      expect(emptyResult.query.length).toBeGreaterThan(0)
      expect(emptyResult.titleFa).toBeTypeOf("string")
      expect(emptyResult.titleFa.length).toBeGreaterThan(0)
      expect(emptyResult.descriptionFa).toBeTypeOf("string")
      expect(emptyResult.descriptionFa.length).toBeGreaterThan(0)
    })

    it("returns general fallback query for unrelated non-botanical text without throwing", () => {
      const genericResult = resolveMarketplaceTopic({
        title: "شرایط و ضوابط استفاده از اپلیکیشن و حریم خصوصی",
        slug: "terms-and-conditions",
      })
      expect(genericResult).toBeDefined()
      expect(genericResult.query.length).toBeGreaterThan(0)
      expect(genericResult.titleFa.length).toBeGreaterThan(0)
    })

    it("prioritizes specific plant species over generic care topics when both exist", () => {
      const combined = resolveMarketplaceTopic({
        title: "ترکیب خاک مناسب برای سانسوریا ابلق",
        keywords: ["خاک", "سانسوریا"],
      })
      // Should retain species specificity in query
      expect(combined.query.replace(/\u200c/g, " ")).toContain("سانسوریا")
    })
  })
})

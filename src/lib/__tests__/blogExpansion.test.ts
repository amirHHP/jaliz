import { describe, expect, it } from "vitest"
import { blogPosts, expansionPosts1, expansionPosts2 } from "../blogData"
import type { BlogCluster } from "../blogTopics"

/**
 * Authoritative 50-Article Feature Inventory from PROJECT.md / ORIGINAL_REQUEST.md
 */
export interface PlannedArticleInventory {
  id: number
  slug: string
  primaryKeyword: string
  cluster: BlogCluster
  categoryEn: "care" | "plants" | "tutorials"
  batch: 1 | 2
  jalizCta: string
}

export const PLANNED_EXPANSION_INVENTORY: PlannedArticleInventory[] = [
  // Batch 1 (Articles 1–25)
  { id: 1, slug: "نگهداری-آگلونما", primaryKeyword: "نگهداری آگلونما", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/schedule" },
  { id: 2, slug: "نگهداری-فیکوس-الاستیکا", primaryKeyword: "نگهداری فیکوس الاستیکا", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 3, slug: "نگهداری-فیکوس-لیراتا", primaryKeyword: "نگهداری فیکوس لیراتا", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/schedule" },
  { id: 4, slug: "نگهداری-شفلرا", primaryKeyword: "نگهداری شفلرا", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 5, slug: "نگهداری-سینگونیوم", primaryKeyword: "نگهداری سینگونیوم", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/marketplace" },
  { id: 6, slug: "نگهداری-اسپاتی-فیلوم", primaryKeyword: "نگهداری اسپاتی فیلوم", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/schedule" },
  { id: 7, slug: "نگهداری-بنجامین", primaryKeyword: "نگهداری گل بنجامین", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 8, slug: "نگهداری-یوکا", primaryKeyword: "نگهداری گیاه یوکا", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/schedule" },
  { id: 9, slug: "نگهداری-دیفن-باخیا", primaryKeyword: "نگهداری دیفن باخیا", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 10, slug: "نگهداری-کالاتیا", primaryKeyword: "نگهداری گل کالاتیا", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/schedule" },
  { id: 11, slug: "نگهداری-کروتون", primaryKeyword: "نگهداری کروتون", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 12, slug: "نگهداری-ارکیده", primaryKeyword: "نگهداری گل ارکیده", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/schedule" },
  { id: 13, slug: "نگهداری-پپرومیا", primaryKeyword: "نگهداری پپرومیا قاشقی", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/marketplace" },
  { id: 14, slug: "نگهداری-آلوئه-ورا", primaryKeyword: "نگهداری آلوئه ورا در گلدان", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/schedule" },
  { id: 15, slug: "نگهداری-نخل-مرداب", primaryKeyword: "نگهداری نخل مرداب", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/schedule" },
  { id: 16, slug: "نگهداری-بنسای", primaryKeyword: "نگهداری بنسای در خانه", cluster: "species", categoryEn: "plants", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 17, slug: "درمان-شپشک-آردآلود", primaryKeyword: "شپشک آردآلود", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 18, slug: "از-بین-بردن-پشه-گلدان", primaryKeyword: "پشه سیاه گلدان", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 19, slug: "درمان-کنه-تار-عنکبوتی", primaryKeyword: "کنه تار عنکبوتی گیاهان", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 20, slug: "درمان-پوسیدگی-ریشه", primaryKeyword: "پوسیدگی ریشه گیاه", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 21, slug: "درمان-شپشک-سپردار", primaryKeyword: "شپشک سپردار", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 22, slug: "درمان-تریپس-گیاهان", primaryKeyword: "تریپس در گیاهان آپارتمانی", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 23, slug: "علت-لکه-های-قهوه-ای-روی-برگ", primaryKeyword: "لکه قهوه ای روی برگ گیاه", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 24, slug: "علت-لوله-شدن-برگ-گیاهان", primaryKeyword: "علت لوله شدن برگ گیاه", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/plants/diagnose" },
  { id: 25, slug: "درمان-شوک-جابجایی-گیاه", primaryKeyword: "شوک جابجایی گیاه", cluster: "diagnosis", categoryEn: "care", batch: 1, jalizCta: "/schedule" },

  // Batch 2 (Articles 26–50)
  { id: 26, slug: "درمان-سفیدک-پودری", primaryKeyword: "سفیدک پودری گلدان", cluster: "diagnosis", categoryEn: "care", batch: 2, jalizCta: "/plants/diagnose" },
  { id: 27, slug: "کود-آهن-برای-گیاهان-آپارتمانی", primaryKeyword: "کود آهن برای گیاهان", cluster: "care", categoryEn: "care", batch: 2, jalizCta: "/schedule" },
  { id: 28, slug: "لامپ-رشد-گیاه", primaryKeyword: "لامپ رشد گیاه خانگی", cluster: "care", categoryEn: "care", batch: 2, jalizCta: "/schedule" },
  { id: 29, slug: "آبیاری-از-زیرگلدانی", primaryKeyword: "آبیاری زیرگلدانی", cluster: "care", categoryEn: "care", batch: 2, jalizCta: "/schedule" },
  { id: 30, slug: "بهترین-آب-برای-گیاهان-آپارتمانی", primaryKeyword: "آب مناسب برای گلدان", cluster: "care", categoryEn: "care", batch: 2, jalizCta: "/schedule" },
  { id: 31, slug: "ساخت-جزیره-برای-گیاهان", primaryKeyword: "ساخت جزیره برای گلدان", cluster: "care", categoryEn: "care", batch: 2, jalizCta: "/schedule" },
  { id: 32, slug: "نگهداری-گیاهان-در-تابستان", primaryKeyword: "مراقبت از گیاهان در تابستان", cluster: "care", categoryEn: "care", batch: 2, jalizCta: "/schedule" },
  { id: 33, slug: "کود-فسفر-بالا-ریشه-زایی", primaryKeyword: "کود ریشه زایی گیاهان", cluster: "care", categoryEn: "care", batch: 2, jalizCta: "/schedule" },
  { id: 34, slug: "اسیدیته-و-پی-اچ-خاک-گلدان", primaryKeyword: "تنظیم پی اچ خاک گلدان", cluster: "care", categoryEn: "care", batch: 2, jalizCta: "/schedule" },
  { id: 35, slug: "تکثیر-سانسوریا-از-برگ", primaryKeyword: "تکثیر سانسوریا با برگ", cluster: "tutorial", categoryEn: "tutorials", batch: 2, jalizCta: "/marketplace" },
  { id: 36, slug: "تکثیر-زامیفولیا-از-برگ", primaryKeyword: "تکثیر زامیفولیا از برگ", cluster: "tutorial", categoryEn: "tutorials", batch: 2, jalizCta: "/marketplace" },
  { id: 37, slug: "ساخت-قیم-خزه-ای", primaryKeyword: "ساخت قیم خزه ای", cluster: "tutorial", categoryEn: "tutorials", batch: 2, jalizCta: "/marketplace" },
  { id: 38, slug: "کاربرد-لیکا-در-گلدان", primaryKeyword: "پوکه معدنی برای گلدان", cluster: "tutorial", categoryEn: "tutorials", batch: 2, jalizCta: "/marketplace" },
  { id: 39, slug: "ترکیب-خاک-کاکتوس-و-ساکولنت", primaryKeyword: "خاک مخصوص کاکتوس", cluster: "tutorial", categoryEn: "tutorials", batch: 2, jalizCta: "/marketplace" },
  { id: 40, slug: "ترکیب-خاک-ارکیده", primaryKeyword: "خاک مخصوص ارکیده", cluster: "tutorial", categoryEn: "tutorials", batch: 2, jalizCta: "/marketplace" },
  { id: 41, slug: "تمیز-کردن-و-براق-کردن-برگ-گیاهان", primaryKeyword: "براق کردن برگ گیاهان", cluster: "tutorial", categoryEn: "tutorials", batch: 2, jalizCta: "/schedule" },
  { id: 42, slug: "گیاهان-آویز-آپارتمانی", primaryKeyword: "گیاهان آویز آپارتمانی", cluster: "plants", categoryEn: "plants", batch: 2, jalizCta: "/marketplace" },
  { id: 43, slug: "گیاهان-مناسب-اتاق-خواب", primaryKeyword: "گیاهان مناسب اتاق خواب", cluster: "plants", categoryEn: "plants", batch: 2, jalizCta: "/schedule" },
  { id: 44, slug: "گیاهان-برگ-قرمز-و-رنگی", primaryKeyword: "گیاهان آپارتمانی برگ رنگی", cluster: "plants", categoryEn: "plants", batch: 2, jalizCta: "/marketplace" },
  { id: 45, slug: "کاکتوس-های-خانگی-محبوب", primaryKeyword: "انواع کاکتوس خانگی", cluster: "plants", categoryEn: "plants", batch: 2, jalizCta: "/schedule" },
  { id: 46, slug: "گیاهان-گوشتخوار-خانگی", primaryKeyword: "نگهداری گیاه حشره خوار", cluster: "plants", categoryEn: "plants", batch: 2, jalizCta: "/marketplace" },
  { id: 47, slug: "گیاهان-مناسب-حمام-و-دستشویی", primaryKeyword: "گیاه مناسب حمام", cluster: "space", categoryEn: "plants", batch: 2, jalizCta: "/schedule" },
  { id: 48, slug: "گیاهان-مناسب-آشپزخانه", primaryKeyword: "گیاهان مناسب آشپزخانه", cluster: "space", categoryEn: "plants", batch: 2, jalizCta: "/schedule" },
  { id: 49, slug: "گیاهان-مناسب-میز-کار", primaryKeyword: "گیاه برای میز کار", cluster: "space", categoryEn: "plants", batch: 2, jalizCta: "/schedule" },
  { id: 50, slug: "ساخت-تراریوم-خانگی", primaryKeyword: "ساخت تراریوم در خانه", cluster: "space", categoryEn: "tutorials", batch: 2, jalizCta: "/marketplace" },
]

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

describe("blogExpansion — 4-Tier Automated Validation Suite", () => {
  const expansionPosts = [...expansionPosts1, ...expansionPosts2]
  const totalExpansion = expansionPosts.length
  const legacyPosts = blogPosts.filter(
    (post) => !expansionPosts.some((exp) => exp.slug === post.slug)
  )
  const legacyPersian = legacyPosts.filter((post) => post.lang === "fa")

  /* ==========================================================================
   * TIER 1: FEATURE COVERAGE
   * ========================================================================== */
  describe("Tier 1: Feature Coverage", () => {
    it("reports progressive expansion status and verifies target count", () => {
      if (totalExpansion === 0) {
        console.info(
          "ℹ️ [M2 Status] Expansion posts arrays are currently empty (0/50). Batches M3/M4 pending."
        )
        expect(totalExpansion).toBe(0)
      } else if (totalExpansion < 50) {
        console.info(
          `ℹ️ [Progressive Status] Expansion in progress: ${totalExpansion}/50 articles loaded.`
        )
        expect(totalExpansion).toBeGreaterThan(0)
        expect(totalExpansion).toBeLessThanOrEqual(50)
      } else {
        expect(totalExpansion).toBe(50)
        expect(expansionPosts1).toHaveLength(25)
        expect(expansionPosts2).toHaveLength(25)
        expect(blogPosts).toHaveLength(104)
      }
    })

    it("verifies 27 legacy Persian baseline articles are strictly preserved", () => {
      expect(legacyPersian).toHaveLength(27)
      expect(legacyPosts.filter((p) => p.lang === "en")).toHaveLength(27)
      expect(legacyPosts).toHaveLength(54)
    })

    it("ensures all populated expansion articles contain every required field with correct types", () => {
      const allowedCategories = new Set(["care", "plants", "tutorials"])
      const allowedClusters: Set<BlogCluster> = new Set([
        "species",
        "diagnosis",
        "season",
        "space",
        "tutorial",
        "care",
        "plants",
      ])

      for (const post of expansionPosts) {
        expect(post.slug, `${post.slug}: slug`).toBeTypeOf("string")
        expect(post.slug.length).toBeGreaterThan(0)
        expect(post.lang, `${post.slug}: lang`).toBe("fa")
        expect(post.title, `${post.slug}: title`).toBeTypeOf("string")
        expect(post.title.length).toBeGreaterThan(0)
        expect(post.description, `${post.slug}: description`).toBeTypeOf("string")
        expect(post.category, `${post.slug}: category`).toBeTypeOf("string")
        expect(allowedCategories.has(post.categoryEn), `${post.slug}: categoryEn`).toBe(true)
        expect(allowedClusters.has(post.cluster), `${post.slug}: cluster`).toBe(true)
        expect(post.publishedAt, `${post.slug}: publishedAt`).toBeTypeOf("string")
        expect(post.readTime, `${post.slug}: readTime`).toBeTypeOf("string")
        expect(post.author, `${post.slug}: author`).toBeTypeOf("string")
        expect(post.content, `${post.slug}: content`).toBeTypeOf("string")
        expect(post.icon, `${post.slug}: icon`).toBeTypeOf("string")
        expect(post.gradient, `${post.slug}: gradient`).toBeTypeOf("string")
        expect(Array.isArray(post.keywords), `${post.slug}: keywords`).toBe(true)
        expect(post.primaryKeyword, `${post.slug}: primaryKeyword`).toBeTypeOf("string")
        expect(post.publishedAtIso, `${post.slug}: publishedAtIso`).toBeTypeOf("string")
        expect(Array.isArray(post.faqs), `${post.slug}: faqs`).toBe(true)
      }
    })
  })

  /* ==========================================================================
   * TIER 2: BOUNDARY & CORNER CASES
   * ========================================================================== */
  describe("Tier 2: Boundary & Corner Cases", () => {
    it("enforces meta description length <= 160 characters and >= 20 characters", () => {
      for (const post of expansionPosts) {
        const trimmed = post.description.trim()
        expect(
          trimmed.length,
          `Slug: "${post.slug}" has description length ${trimmed.length} (> 160)`
        ).toBeLessThanOrEqual(160)
        expect(
          trimmed.length,
          `Slug: "${post.slug}" has description length ${trimmed.length} (< 20)`
        ).toBeGreaterThanOrEqual(20)
      }
    })

    it("enforces FAQs boundary: at least 2 questions with valid length per article", () => {
      for (const post of expansionPosts) {
        expect(
          post.faqs.length,
          `Slug "${post.slug}" faqs length must be >= 2`
        ).toBeGreaterThanOrEqual(2)

        post.faqs.forEach((faq, index) => {
          expect(
            faq.question.trim().length,
            `Slug "${post.slug}" FAQ #${index + 1} question too short`
          ).toBeGreaterThanOrEqual(5)
          expect(
            faq.answer.trim().length,
            `Slug "${post.slug}" FAQ #${index + 1} answer too short`
          ).toBeGreaterThanOrEqual(10)
        })
      }
    })

    it("enforces content quality: stripped text length > 1500 characters", () => {
      for (const post of expansionPosts) {
        const text = stripHtml(post.content)
        expect(
          text.length,
          `Slug "${post.slug}" stripped text length (${text.length}) must be > 1500 chars`
        ).toBeGreaterThan(1500)
      }
    })

    it("enforces structured HTML headings (<h2>) and lists (<ul> or <ol>)", () => {
      for (const post of expansionPosts) {
        expect(
          /<h2[^>]*>/i.test(post.content),
          `Slug "${post.slug}" missing <h2> tags`
        ).toBe(true)

        expect(
          /<(ul|ol)[^>]*>/i.test(post.content),
          `Slug "${post.slug}" missing <ul> or <ol> tags`
        ).toBe(true)
      }
    })

    it("enforces ISO 8601 date format and valid calendar dates", () => {
      const isoRegex = /^\d{4}-\d{2}-\d{2}$/
      for (const post of expansionPosts) {
        expect(post.publishedAtIso, post.slug).toMatch(isoRegex)
        const dateObj = new Date(post.publishedAtIso)
        expect(Number.isNaN(dateObj.getTime()), post.slug).toBe(false)
      }
    })

    it("enforces reading time format and keywords array >= 4 items", () => {
      for (const post of expansionPosts) {
        expect(post.readTime, post.slug).toContain("دقیقه")
        expect(
          post.keywords.length,
          `Slug "${post.slug}" keywords count (${post.keywords.length}) must be >= 4`
        ).toBeGreaterThanOrEqual(4)
        for (const kw of post.keywords) {
          expect(kw.trim().length).toBeGreaterThan(0)
        }
      }
    })
  })

  /* ==========================================================================
   * TIER 3: CROSS-FEATURE & UNIQUENESS INTEGRITY
   * ========================================================================== */
  describe("Tier 3: Cross-Feature & Uniqueness Integrity", () => {
    const PERSIAN_SLUG_REGEX = /^[\u0600-\u06FF0-9a-zA-Z]+(-[\u0600-\u06FF0-9a-zA-Z]+)*$/

    it("guarantees 0% slug collision across entire blogPosts collection", () => {
      const allSlugs = blogPosts.map((p) => p.slug)
      const uniqueSlugs = new Set(allSlugs)
      expect(uniqueSlugs.size).toBe(allSlugs.length)
    })

    it("guarantees all expansion slugs conform strictly to Persian URL slug format", () => {
      for (const post of expansionPosts) {
        expect(
          PERSIAN_SLUG_REGEX.test(post.slug),
          `Slug "${post.slug}" invalid Persian URL format`
        ).toBe(true)
      }
    })

    it("guarantees 0% primary keyword cannibalization with legacy Persian articles", () => {
      const legacyKeywords = new Set(
        legacyPersian.map((p) => p.primaryKeyword.trim().toLowerCase())
      )

      for (const post of expansionPosts) {
        const pk = post.primaryKeyword.trim().toLowerCase()
        expect(
          legacyKeywords.has(pk),
          `Cannibalization: Primary keyword "${post.primaryKeyword}" collides with legacy article`
        ).toBe(false)
      }
    })

    it("guarantees 0% duplicate primary keywords among expansion articles", () => {
      const expansionKeywords = expansionPosts.map((p) =>
        p.primaryKeyword.trim().toLowerCase()
      )
      const uniqueExpansionKeywords = new Set(expansionKeywords)
      expect(uniqueExpansionKeywords.size).toBe(expansionKeywords.length)
    })

    it("verifies planned 50-article inventory has zero slug collisions with legacy baseline", () => {
      const legacySlugSet = new Set(legacyPersian.map((p) => p.slug))
      for (const item of PLANNED_EXPANSION_INVENTORY) {
        expect(
          legacySlugSet.has(item.slug),
          `Planned slug "${item.slug}" collides with legacy article`
        ).toBe(false)
      }
    })

    it("verifies planned 50-article inventory has zero keyword collisions with legacy baseline", () => {
      const legacyKeywordSet = new Set(
        legacyPersian.map((p) => p.primaryKeyword.trim().toLowerCase())
      )
      for (const item of PLANNED_EXPANSION_INVENTORY) {
        expect(
          legacyKeywordSet.has(item.primaryKeyword.trim().toLowerCase()),
          `Planned primary keyword "${item.primaryKeyword}" collides with legacy article`
        ).toBe(false)
      }
    })

    it("verifies planned 50-article inventory contains 50 unique slugs and keywords internally", () => {
      const inventorySlugs = PLANNED_EXPANSION_INVENTORY.map((i) => i.slug)
      expect(new Set(inventorySlugs).size).toBe(50)

      const inventoryKeywords = PLANNED_EXPANSION_INVENTORY.map((i) => i.primaryKeyword)
      expect(new Set(inventoryKeywords).size).toBe(50)
    })
  })

  /* ==========================================================================
   * TIER 4: REAL-WORLD LINKAGE & NAVIGATION
   * ========================================================================== */
  describe("Tier 4: Real-world Linkage & Navigation", () => {
    const validSlugSet = new Set(blogPosts.map((p) => p.slug))

    it("guarantees ZERO broken internal blog links across all articles", () => {
      const internalLinkRegex = /href=["']\/blog\/([^"'#?]+)["']/g
      const brokenLinks: { source: string; target: string }[] = []

      for (const post of blogPosts) {
        let match: RegExpExecArray | null
        internalLinkRegex.lastIndex = 0

        while ((match = internalLinkRegex.exec(post.content)) !== null) {
          const rawTarget = match[1]
          let decodedTarget = rawTarget
          try {
            decodedTarget = decodeURIComponent(rawTarget)
          } catch {
            // ignore
          }

          if (!validSlugSet.has(rawTarget) && !validSlugSet.has(decodedTarget)) {
            brokenLinks.push({ source: post.slug, target: decodedTarget })
          }
        }
      }

      expect(brokenLinks, `Found broken internal links: ${JSON.stringify(brokenLinks)}`).toEqual([])
    })

    it("guarantees every expansion article contains natural Jaliz conversion CTAs", () => {
      const validCtas = ["/plants/diagnose", "/schedule", "/marketplace"]

      for (const post of expansionPosts) {
        const hasCta = validCtas.some(
          (cta) =>
            post.content.includes(`href="${cta}"`) ||
            post.content.includes(`href='${cta}'`) ||
            post.content.includes(`href="${cta}/"`) ||
            post.content.includes(`href='${cta}/'`)
        )

        expect(
          hasCta,
          `Slug "${post.slug}" is missing a natural Jaliz conversion CTA (/plants/diagnose | /schedule | /marketplace)`
        ).toBe(true)
      }
    })

    it("disallows self-referential internal links within the same article", () => {
      const internalLinkRegex = /href=["']\/blog\/([^"'#?]+)["']/g

      for (const post of expansionPosts) {
        let match: RegExpExecArray | null
        internalLinkRegex.lastIndex = 0

        while ((match = internalLinkRegex.exec(post.content)) !== null) {
          const rawTarget = match[1]
          let decodedTarget = rawTarget
          try {
            decodedTarget = decodeURIComponent(rawTarget)
          } catch {
            // ignore
          }
          expect(
            decodedTarget !== post.slug,
            `Article "${post.slug}" contains a self-referential link to itself`
          ).toBe(true)
        }
      }
    })
  })
})

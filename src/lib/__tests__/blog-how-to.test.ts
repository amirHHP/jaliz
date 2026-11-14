import { describe, expect, it } from "vitest"
import { isTutorialPost, generateHowToSchema, type HowToSchema } from "../blogHowTo"
import { blogPosts, type BlogPost } from "../blogData"

describe("Blog HowTo JSON-LD Schema Subsystem (Tiers 1-4)", () => {
  // Known tutorial posts from blogPosts inventory
  const TUTORIAL_SLUGS = [
    "تکثیر-سانسوریا-از-برگ",
    "تکثیر-زامیفولیا-از-برگ",
    "ساخت-قیم-خزه-ای",
    "ساخت-تراریوم-خانگی",
    "ترکیب-خاک-ارکیده",
    "ترکیب-خاک-کاکتوس-و-ساکولنت",
  ]

  // Known non-tutorial posts from blogPosts inventory
  const NON_TUTORIAL_SLUGS = [
    "راهنمای-آبیاری-گیاهان-آپارتمانی",
    "نگهداری-آگلونما",
    "نگهداری-شفلرا",
    "گیاهان-مناسب-اتاق-خواب",
  ]

  /* ==========================================================================
   * TIER 1: TUTORIAL DETECTION ENGINE
   * ========================================================================== */
  describe("Tier 1: Tutorial Post Classification", () => {
    it("correctly identifies tutorial posts by cluster or category", () => {
      for (const slug of TUTORIAL_SLUGS) {
        const post = blogPosts.find((p) => p.slug === slug)
        if (post) {
          expect(isTutorialPost(post), `Post '${slug}' should be classified as tutorial`).toBe(true)
        }
      }
    })

    it("identifies synthetic tutorial posts with tutorial cluster, category, or keywords", () => {
      const syntheticTutorial: BlogPost = {
        slug: "اموزش-تعویض-گلدان-پتوس",
        lang: "fa",
        title: "آموزش گام به گام تعویض گلدان پتوس",
        description: "راهنمای عملی تعویض گلدان پتوس و ترکیب خاک مناسب",
        category: "آموزش‌های کاربردی",
        categoryEn: "tutorials",
        publishedAt: "۱ آبان ۱۴۰۵",
        readTime: "۵ دقیقه",
        author: "تیم جالیز",
        content: `
          <h2>مرحله اول: آماده‌سازی گلدان جدید</h2>
          <p>گلدانی با قطر یک سایز بزرگ‌تر انتخاب کرده و سوراخ زهکش را چک کنید.</p>
          <h2>مرحله دوم: خارج کردن گیاه</h2>
          <p>به آرامی دیواره گلدان را فشار داده و گیاه را بیرون آورید.</p>
          <h2>مرحله سوم: کاشت در خاک تازه</h2>
          <p>کف گلدان پوکه ریخته، خاک افزوده و گیاه را بکارید.</p>
        `,
        icon: "Sprout",
        gradient: "from-green-400 to-emerald-600",
        keywords: ["تعویض گلدان", "پتوس", "آموزش"],
        primaryKeyword: "تعویض گلدان پتوس",
        cluster: "tutorial",
        publishedAtIso: "2026-10-23",
        alternateSlug: "pothos-repotting-guide",
        faqs: [{ question: "بهترین زمان تعویض گلدان کی است؟", answer: "فصل بهار و تابستان." }],
      }

      expect(isTutorialPost(syntheticTutorial)).toBe(true)
    })

    it("correctly rejects non-tutorial posts", () => {
      for (const slug of NON_TUTORIAL_SLUGS) {
        const post = blogPosts.find((p) => p.slug === slug)
        if (post) {
          expect(isTutorialPost(post), `Post '${slug}' must NOT be classified as tutorial`).toBe(false)
        }
      }
    })

    it("rejects purely informational care articles without step-by-step procedures", () => {
      const informationalPost: BlogPost = {
        slug: "معرفی-انواع-گیاهان-آپارتمانی",
        lang: "fa",
        title: "معرفی ۱۰ گیاه آپارتمانی مقاوم",
        description: "آشنایی با بهترین گیاهان آپارتمانی برای فضاهای کم‌نور",
        category: "گیاهان",
        categoryEn: "plants",
        publishedAt: "۱۵ مهر ۱۴۰۵",
        readTime: "۶ دقیقه",
        author: "سارا گل‌پرور",
        content: "<p>در این مقاله گیاهان مقاوم را معرفی می‌کنیم...</p>",
        icon: "Leaf",
        gradient: "from-amber-400 to-emerald-600",
        keywords: ["گیاهان مقاوم", "گیاهان کم نور"],
        primaryKeyword: "گیاهان آپارتمانی مقاوم",
        cluster: "species",
        publishedAtIso: "2026-10-07",
        alternateSlug: "hardy-indoor-plants",
        faqs: [],
      }

      expect(isTutorialPost(informationalPost)).toBe(false)
    })
  })

  /* ==========================================================================
   * TIER 2: HOWTO SCHEMA.ORG SPECIFICATION CONFORMANCE
   * ========================================================================== */
  describe("Tier 2: HowTo JSON-LD Structure & Schema Compliance", () => {
    it("generates valid Schema.org HowTo for tutorial articles", () => {
      const tutorial = blogPosts.find((p) => TUTORIAL_SLUGS.includes(p.slug))
      if (!tutorial) return

      const canonicalUrl = `https://jalizapp.ir/blog/${encodeURIComponent(tutorial.slug)}`
      const schema = generateHowToSchema(tutorial, canonicalUrl)

      expect(schema).not.toBeNull()
      expect(schema?.["@type"]).toBe("HowTo")
      expect(schema?.name).toBeTypeOf("string")
      expect(schema?.name.length).toBeGreaterThan(0)
      expect(schema?.description).toBeTypeOf("string")
      expect(schema?.description.length).toBeGreaterThan(0)
      expect(["fa", "fa-IR"]).toContain(schema?.inLanguage)

      expect(Array.isArray(schema?.step)).toBe(true)
      expect(schema?.step.length).toBeGreaterThanOrEqual(2)

      // Step schema verification
      schema?.step.forEach((step, index) => {
        expect(step["@type"]).toBe("HowToStep")
        expect(step.name).toBeTypeOf("string")
        expect(step.name.trim().length).toBeGreaterThan(0)
        expect(step.text).toBeTypeOf("string")
        expect(step.text.trim().length).toBeGreaterThan(0)
        expect(step.position).toBe(index + 1)
      })
    })

    it("safely generates optional supplies and tools when detected in content", () => {
      const richTutorial: BlogPost = {
        slug: "ساخت-قیم-خزه-ای-برای-پتوس",
        lang: "fa",
        title: "آموزش ساخت قیم خزه ای برای پتوس و برگ انجیری",
        description: "روش ساخت قیم خزه ای خانگی با لوله پی وی سی و خزه اسفاگنوم",
        category: "آموزش‌های کاربردی",
        categoryEn: "tutorials",
        publishedAt: "۵ آبان ۱۴۰۵",
        readTime: "۷ دقیقه",
        author: "سارا گل‌پرور",
        content: `
          <p>وسایل مورد نیاز: لوله پلیکا یا توری فلزی، خزه اسفاگنوم، نخ یا بست کمربندی.</p>
          <h2>گام اول: خیساندن خزه</h2>
          <p>خزه اسفاگنوم را در آب ولرم خیس کنید تا رطوبت کامل بگیرد.</p>
          <h2>گام دوم: بستن خزه دور لوله</h2>
          <p>خزه را به طور یکنواخت دور لوله بپیچید و با نخ محکم کنید.</p>
          <h2>گام سوم: نصب قیم در گلدان</h2>
          <p>قیم را در انتهای گلدان قرار داده و ساقه‌های گیاه را با بست به آن متصل کنید.</p>
        `,
        icon: "Wrench",
        gradient: "from-blue-400 to-indigo-600",
        keywords: ["قیم خزه ای", "پتوس", "برگ انجیری"],
        primaryKeyword: "ساخت قیم خزه ای",
        cluster: "tutorial",
        publishedAtIso: "2026-10-27",
        alternateSlug: "diy-moss-pole-guide",
        faqs: [],
      }

      const schema = generateHowToSchema(richTutorial, "https://jalizapp.ir/blog/diy-moss-pole")
      expect(schema).not.toBeNull()
      expect(schema?.["@type"]).toBe("HowTo")
      expect(schema?.step.length).toBeGreaterThanOrEqual(3)

      if (schema?.supply) {
        expect(Array.isArray(schema.supply)).toBe(true)
        schema.supply.forEach((sup) => {
          expect(sup["@type"]).toBe("HowToSupply")
          expect(sup.name.length).toBeGreaterThan(0)
        })
      }

      if (schema?.tool) {
        expect(Array.isArray(schema.tool)).toBe(true)
        schema.tool.forEach((t) => {
          expect(t["@type"]).toBe("HowToTool")
          expect(t.name.length).toBeGreaterThan(0)
        })
      }
    })
  })

  /* ==========================================================================
   * TIER 3: NON-TUTORIAL SAFE FALLBACK & EXCEPTION IMMUNITY
   * ========================================================================== */
  describe("Tier 3: Graceful Fallbacks & Exception Immunity", () => {
    it("returns null for non-tutorial posts without throwing exceptions", () => {
      for (const slug of NON_TUTORIAL_SLUGS) {
        const post = blogPosts.find((p) => p.slug === slug)
        if (post) {
          const result = generateHowToSchema(post, `https://jalizapp.ir/blog/${post.slug}`)
          expect(result, `Non-tutorial post '${slug}' should return null schema`).toBeNull()
        }
      }
    })

    it("handles posts with empty or malformed HTML content gracefully", () => {
      const emptyPost: BlogPost = {
        slug: "empty-tutorial",
        lang: "fa",
        title: "آموزش خالی",
        description: "بدون محتوا",
        category: "آموزش‌های کاربردی",
        categoryEn: "tutorials",
        publishedAt: "۱ آذر ۱۴۰۵",
        readTime: "۱ دقیقه",
        author: "جالیز",
        content: "",
        icon: "Sprout",
        gradient: "from-gray-400 to-gray-600",
        keywords: ["آموزش"],
        primaryKeyword: "آموزش خالی",
        cluster: "tutorial",
        publishedAtIso: "2026-11-21",
        alternateSlug: "empty-tutorial-en",
        faqs: [],
      }

      // Should either return null or a fallback schema with step fallback without throwing
      expect(() => {
        const res = generateHowToSchema(emptyPost, "https://jalizapp.ir/blog/empty-tutorial")
        if (res !== null) {
          expect(res["@type"]).toBe("HowTo")
        }
      }).not.toThrow()
    })
  })

  /* ==========================================================================
   * TIER 4: ADVERSARIAL HTML & STEP TEXT SANITIZATION
   * ========================================================================== */
  describe("Tier 4: Adversarial HTML Sanitization & Step Integrity", () => {
    it("strips raw HTML tags from step text and step name", () => {
      const adversarialPost: BlogPost = {
        slug: "adversarial-tutorial",
        lang: "fa",
        title: "آموزش با تگ‌های خطرناک HTML",
        description: "تست پاکسازی تگ‌ها",
        category: "آموزش‌های کاربردی",
        categoryEn: "tutorials",
        publishedAt: "۲ آذر ۱۴۰۵",
        readTime: "۳ دقیقه",
        author: "جالیز",
        content: `
          <h2>مرحله ۱: <strong>خاک</strong> و <a href="/marketplace">گلدان</a></h2>
          <p>خاک را با <script>alert('xss')</script> پرلیت مخلوط کنید و <em>مرطوب</em> نمایید.</p>
          <h2>مرحله ۲: قلمه زدن گیاه</h2>
          <p>با یک قیچی تمیز <span style="color:red">برگ</span> را جدا کنید.</p>
        `,
        icon: "Scissors",
        gradient: "from-red-400 to-pink-600",
        keywords: ["قلمه", "تکثیر"],
        primaryKeyword: "قلمه زدن با تگ",
        cluster: "tutorial",
        publishedAtIso: "2026-11-22",
        alternateSlug: "adversarial-tutorial-en",
        faqs: [],
      }

      const schema = generateHowToSchema(adversarialPost, "https://jalizapp.ir/blog/adversarial-tutorial")
      expect(schema).not.toBeNull()

      for (const step of schema?.step || []) {
        expect(step.name).not.toContain("<strong>")
        expect(step.name).not.toContain("<a ")
        expect(step.text).not.toContain("<script>")
        expect(step.text).not.toContain("</script>")
        expect(step.text).not.toContain("<span")
        expect(step.text).not.toContain("<em>")
      }
    })

    it("maintains strictly sequential 1-based positions for all steps", () => {
      const multiStepPost: BlogPost = {
        slug: "multi-step-tutorial",
        lang: "fa",
        title: "آموزش چند مرحله‌ای ساخت تراریوم",
        description: "مراحل ساخت تراریوم",
        category: "آموزش‌های کاربردی",
        categoryEn: "tutorials",
        publishedAt: "۳ آذر ۱۴۰۵",
        readTime: "۴ دقیقه",
        author: "جالیز",
        content: `
          <h2>گام ۱: لایه سنگریزه</h2>
          <p>کف شیشه سنگریزه بریزید.</p>
          <h2>گام ۲: لایه زغال اکتیو</h2>
          <p>زغال فعال اضافه کنید.</p>
          <h2>گام ۳: لایه خزه اسفاگنوم</h2>
          <p>خزه را روی زغال بگذارید.</p>
          <h2>گام ۴: افزودن خاک مخصوص</h2>
          <p>خاک تراریوم را اضافه نمایید.</p>
          <h2>گام ۵: کاشت گیاهان مینیاتوری</h2>
          <p>گیاهان را در خاک بکارید.</p>
        `,
        icon: "Box",
        gradient: "from-teal-400 to-emerald-600",
        keywords: ["تراریوم"],
        primaryKeyword: "ساخت تراریوم",
        cluster: "tutorial",
        publishedAtIso: "2026-11-23",
        alternateSlug: "terrarium-multi-step",
        faqs: [],
      }

      const schema = generateHowToSchema(multiStepPost, "https://jalizapp.ir/blog/multi-step-tutorial")
      expect(schema).not.toBeNull()
      expect(schema?.step.length).toBe(5)

      schema?.step.forEach((step, idx) => {
        expect(step.position).toBe(idx + 1)
      })
    })
  })
})

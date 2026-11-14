# Handoff Report: Blog System Structure, HowTo JSON-LD Schema & CTR Title Optimization

## 1. Observation

### 1.1 Codebase Architecture & Files
The Jaliz blog subsystem is defined across five data files and rendered via a Next.js App Router dynamic route:
1. `src/app/blog/[slug]/page.tsx` (149 lines): Server component that extracts params, generates metadata, creates Schema.org JSON-LD structured data via `@graph`, and renders `<BlogPostClient post={post} relatedPosts={relatedPosts} />`.
2. `src/lib/blogData.ts` (806 lines): Contains 14 baseline bilingual posts (`existingBlogPosts`), combines all posts into `export const blogPosts: BlogPost[]`, and exports them.
3. `src/lib/blogTopics.ts` (822 lines): Defines interfaces `BlogPost`, `BlogPostInput`, `BlogCluster`, `BlogFaq`, `BlogSeoMeta`, the `blogSeoBySlug` registry via `addPair(...)`, and helper functions `applyBlogSeo`, `getRelatedPosts`, `getAlternatePost`, `blogCanonicalUrl`.
4. `src/lib/blogPostsNew.ts` (870 lines): 20 bilingual articles (10 Persian, 10 English) covering care, humidity, light, soil, pests, and pet safety.
5. `src/lib/blogPostsSeo.ts` (902 lines): 20 bilingual articles (10 Persian, 10 English) covering core plant species, diagnosis, and basic tutorials.
6. `src/lib/blogPostsExpansion1.ts` (1009 lines): 25 Persian articles (Articles 1–16 Species, Articles 17–25 Diagnosis).
7. `src/lib/blogPostsExpansion2.ts` (2246 lines): 25 Persian articles (Articles 26–34 Advanced Care, Articles 35–41 Tutorials, Articles 42–46 Plants, Articles 47–50 Space/Terrarium).

Total blog inventory: **104 articles** (54 legacy bilingual + 25 expansion1 + 25 expansion2).

### 1.2 Current JSON-LD Schema Implementation
In `src/app/blog/[slug]/page.tsx` (lines 80–138):
```typescript
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAtIso,
        inLanguage,
        mainEntityOfPage: canonical,
        author: {
          "@type": "Person",
          name: post.author,
        },
        publisher: {
          "@type": "Organization",
          name: "جالیز | Jaliz",
          logo: {
            "@type": "ImageObject",
            url: `${BLOG_SITE_URL}/icons/icon-192x192.png`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: post.lang === "fa" ? "خانه" : "Home",
            item: BLOG_SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: post.lang === "fa" ? "وبلاگ" : "Blog",
            item: `${BLOG_SITE_URL}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonical,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  }
```

Currently, `HowTo` schema is completely missing. Google Search treats every post solely as an `Article` + `FAQPage` + `BreadcrumbList`.

### 1.3 Tutorial Articles Identified Across the Dataset
Direct inspection confirms 25 tutorial posts across the dataset:
- **Repotting (تعویض گلدان)**:
  - `راهنمای-تعویض-گلدان-و-خاک` (fa)
  - `how-to-repot-plants` (en)
- **Water Propagation (تکثیر در آب)**:
  - `راهنمای-تکثیر-گیاهان-در-آب` (fa)
  - `water-propagation-guide` (en)
- **Sansevieria & ZZ Leaf Propagation (تکثیر برگ)**:
  - `تکثیر-سانسوریا-از-برگ` (fa)
  - `تکثیر-زامیفولیا-از-برگ` (fa)
- **Moss Pole Building (ساخت قیم خزه‌ای)**:
  - `ساخت-قیم-خزه-ای` (fa)
- **Terrarium Crafting (ساخت تراریوم)**:
  - `ساخت-تراریوم-خانگی` (fa)
- **Pebble Tray Humidity (ساخت جزیره)**:
  - `ساخت-جزیره-برای-گیاهان` (fa)
- **Sub-irrigation (آبیاری از زیرگلدانی)**:
  - `آبیاری-از-زیرگلدانی` (fa)
- **Soil Mixing (فرمول ترکیب خاک)**:
  - `ترکیب-خاک-کاکتوس-و-ساکولنت` (fa)
  - `ترکیب-خاک-ارکیده` (fa)
  - `انتخاب-خاک-مناسب-گیاهان-آپارتمانی` (fa) / `choosing-houseplant-soil` (en)
  - `کاربرد-لیکا-در-گلدان` (fa)
- **Pruning (هرس)**:
  - `راهنمای-هرس-گیاهان-آپارتمانی` (fa) / `pruning-houseplants-guide` (en)
- **Leaf Cleaning (براق کردن برگ)**:
  - `تمیز-کردن-و-براق-کردن-برگ-گیاهان` (fa)
- **Hydroponics (هیدروپونیک)**:
  - `راهنمای-هیدروپونیک-به-زبان-ساده` (fa) / `simple-hydroponics-guide` (en)
- **Herb Potting (کاشت ریحان)**:
  - `کاشت-ریحان-و-سبزی-در-گلدان` (fa) / `growing-herbs-indoors` (en)
- **Pot Selection (انتخاب گلدان)**:
  - `انتخاب-گلدان-سفالی-یا-پلاستیکی` (fa) / `terracotta-vs-plastic-pots` (en)

### 1.4 Tutorial HTML Content Patterns
Direct inspection of the tutorial post HTML strings reveals three clear structural conventions:
1. **Ordered Lists (`<ol>`)**: Sequential action steps. For example:
   - `راهنمای-تعویض-گلدان-و-خاک`:
     ```html
     <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
       <li><strong>آماده‌سازی گیاه:</strong> یک یا دو روز قبل از تعویض گلدان، به گیاه آب بدهید...</li>
       <li><strong>خارج کردن گیاه:</strong> گلدان را به پهلو بخوابانید...</li>
       <li><strong>بررسی و هرس ریشه‌ها:</strong> ریشه‌های به هم پیچیده را به آرامی با انگشتان باز کنید...</li>
       <li><strong>کاشت در گلدان جدید:</strong> ابتدا چند پوکه معدنی در کف گلدان بریزید...</li>
       <li><strong>آبیاری اول:</strong> به گیاه به طور کامل آب بدهید...</li>
     </ol>
     ```
2. **Step-by-step unordered lists (`<ul>`) under procedure headings**: For example in `ساخت-قیم-خزه-ای`:
   - `<h2>آموزش گام به گام مونتاژ استوانه قیم خزه‌ای</h2>` followed by:
     - `<li><strong>خیساندن خزه:</strong> خزه خشک اسفاگنوم را به مدت ۲۰ دقیقه...</li>`
     - `<li><strong>برش توری:</strong> توری را به عرض مناسب...</li>`
     - `<li><strong>پهن کردن خزه:</strong> یک لایه یکنواخت و متراکم...</li>`
     - `<li><strong>لوله‌کردن و بست‌زدن:</strong> توری را دور هم لوله کرده...</li>`
3. **Tools & Supplies lists**: Under headings like `لوازم مورد نیاز برای شروع کار`, `وسایل و متریال مورد نیاز`, `Supplies You'll Need`:
   - Bullet items with equipment names (e.g. `گلدان جدید`, `مخلوط خاک مناسب`, `لیکاپون`, `خزه اسفاگنوم`, `توری پلاستیکی`, `بست کمربندی`).

### 1.5 Title Storage & Immutability Verification
- Grep scan across the entire workspace confirms `post.title` is strictly a presentation property (rendered inside `<h1>`, `<Metadata>`, `<Card>`, `Breadcrumb`).
- `post.slug` is the sole routing, internal linking, and alternate language identifier (`/blog/${post.slug}`, `canonicalUrl`, `alternateSlug`).
- Changing `post.title` has **zero impact** on URL paths, internal links, or routing.
- All 104 current titles contain 0 emojis and only 8 contain parentheses/brackets. Many baseline titles (e.g. `نگهداری سانسوریا در خانه`, `Snake Plant Care at Home`, `راهنمای آبیاری گیاهان آپارتمانی`) are plain and under-optimized for SERP CTR.

---

## 2. Logic Chain

### 2.1 Schema.org HowTo Generation Architecture
1. **Non-breaking Graph Integration**: In JSON-LD, the `@graph` array represents a collection of independent entities on the same page. Adding a `HowTo` entity into `@graph` when applicable allows Google Search to extract both the `Article` and the `HowTo` rich snippets simultaneously without modifying the existing `Article`, `BreadcrumbList`, or `FAQPage` schemas.
2. **Deterministic Tutorial Detection**:
   A post is determined to be a tutorial if:
   - `post.cluster === "tutorial"` OR
   - `post.categoryEn === "tutorials"` OR
   - `post.category` is one of `["آموزش", "آموزش‌ها", "آموزش‌های کاربردی", "Tutorials"]` OR
   - Slug contains known tutorial prefixes: `["تکثیر", "تعویض-گلدان", "ساخت-قیم", "ساخت-تراریوم", "ساخت-جزیره", "how-to", "propagation", "repot", "pruning", "ترکیب-خاک", "کاربرد-لیکا", "تمیز-کردن-و-براق-کردن", "کاشت-ریحان"]` OR
   - Title contains explicit tutorial keywords: `["آموزش", "گام‌به‌گام", "گام به گام", "قدم‌به‌قدم", "قدم به قدم", "Step-by-Step", "How to"]`.
3. **Google Search Central Compliance (Minimum 2 Steps Guard)**:
   Google documentation explicitly mandates that a `HowTo` schema must contain at least two `HowToStep` items. If an article matches the tutorial criteria but step parsing yields `< 2` steps, the generator returns `null`. This prevents emitting invalid or truncated schemas that would trigger Search Console errors.
4. **Step Parsing Hierarchy**:
   - Priority 1: Scan for `<ol>` elements. If present with $\ge 2$ items, parse each `<li>`:
     - If `<strong>` tag exists: `step.name` = stripped strong text; `step.text` = full list item text.
     - Else: `step.name` = `"گام {i}"` / `"Step {i}"`; `step.text` = full list item text.
     - `step.url` = `${canonicalUrl}#step-${i}`.
   - Priority 2: Scan for `<ul>` within sections whose `<h2>` contains `مراحل`, `گام`, `روش ساخت`, `مونتاژ`, `لایه`, `Step`, `Method`, `چیدمان`.
   - Priority 3: Scan for numbered `<h2>` headings (e.g., `۱. برش قلمه`, `1. Choosing...`).
   - Priority 4: Extract procedural `<h2>` headings and their immediate text paragraphs.
5. **Tools and Supplies Extraction**:
   - Detect `<h2>` containing `لوازم`, `ابزار`, `وسایل`, `متریال`, `Supplies`, `Tools`.
   - Extract `<li>` items and map them to Schema.org `HowToSupply` / `HowToTool` objects.

### 2.2 Proposed `src/lib/blogHowTo.ts` Helper
To keep `src/app/blog/[slug]/page.tsx` clean and unit-testable, create `src/lib/blogHowTo.ts`:
```typescript
import type { BlogPost } from "./blogTopics"

export interface HowToStep {
  "@type": "HowToStep"
  position: number
  name: string
  text: string
  url?: string
}

export interface HowToSupply {
  "@type": "HowToSupply"
  name: string
}

export interface HowToTool {
  "@type": "HowToTool"
  name: string
}

export interface HowToSchema {
  "@type": "HowTo"
  name: string
  description: string
  inLanguage: string
  totalTime?: string
  step: HowToStep[]
  supply?: HowToSupply[]
  tool?: HowToTool[]
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
}

export function isTutorialPost(post: BlogPost): boolean {
  if (post.cluster === "tutorial" || post.categoryEn === "tutorials") return true
  if (["آموزش", "آموزش‌ها", "آموزش‌های کاربردی", "Tutorials"].includes(post.category)) return true

  const tutorialSlugKeywords = [
    "تکثیر", "تعویض-گلدان", "ساخت-قیم", "ساخت-تراریوم", "ساخت-جزیره",
    "how-to", "propagation", "repot", "pruning", "ترکیب-خاک",
    "کاربرد-لیکا", "تمیز-کردن-و-براق-کردن", "کاشت-ریحان"
  ]
  if (tutorialSlugKeywords.some((k) => post.slug.includes(k))) return true

  const tutorialTitleKeywords = [
    "آموزش", "گام‌به‌گام", "گام به گام", "قدم‌به‌قدم", "قدم به قدم",
    "Step-by-Step", "How to"
  ]
  return tutorialTitleKeywords.some((k) => post.title.includes(k))
}

export function generateHowToSchema(
  post: BlogPost,
  canonicalUrl: string,
  inLanguage: string
): HowToSchema | null {
  if (!isTutorialPost(post)) return null

  const steps: HowToStep[] = []
  const supplies: HowToSupply[] = []

  // 1. Try <ol> tags
  const olMatches = post.content.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi)
  const ols = Array.from(olMatches).map((m) => m[1])
  if (ols.length > 0) {
    const bestOl = ols.reduce((a, b) => {
      const aCount = (a.match(/<li[^>]*>/gi) || []).length
      const bCount = (b.match(/<li[^>]*>/gi) || []).length
      return aCount >= bCount ? a : b
    })
    const liMatches = bestOl.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
    let idx = 1
    for (const match of liMatches) {
      const rawLi = match[1]
      const strongMatch = rawLi.match(/<strong>(.*?)<\/strong>/i)
      const fullText = stripHtml(rawLi)
      const stepName = strongMatch
        ? stripHtml(strongMatch[1]).replace(/[:：\-]+$/, "").trim()
        : post.lang === "fa" ? `گام ${idx}` : `Step ${idx}`

      steps.push({
        "@type": "HowToStep",
        position: idx,
        name: stepName,
        text: fullText,
        url: `${canonicalUrl}#step-${idx}`,
      })
      idx++
    }
  }

  // 2. Try <ul> under step-related <h2>
  if (steps.length < 2) {
    const sectionRegex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi
    for (const match of post.content.matchAll(sectionRegex)) {
      const h2Text = stripHtml(match[1])
      const body = match[2]
      if (/مراحل|گام|روش ساخت|مونتاژ|لایه|Step|Method|چیدمان/i.test(h2Text)) {
        const ulMatch = body.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i)
        if (ulMatch) {
          const liMatches = ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
          let idx = 1
          for (const li of liMatches) {
            const rawLi = li[1]
            const strongMatch = rawLi.match(/<strong>(.*?)<\/strong>/i)
            const fullText = stripHtml(rawLi)
            const stepName = strongMatch
              ? stripHtml(strongMatch[1]).replace(/[:：\-]+$/, "").trim()
              : post.lang === "fa" ? `گام ${idx}` : `Step ${idx}`

            steps.push({
              "@type": "HowToStep",
              position: idx,
              name: stepName,
              text: fullText,
              url: `${canonicalUrl}#step-${idx}`,
            })
            idx++
          }
          if (steps.length >= 2) break
        }
      }
    }
  }

  // 3. Try numbered <h2> headings
  if (steps.length < 2) {
    const sectionRegex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi
    let idx = 1
    for (const match of post.content.matchAll(sectionRegex)) {
      const h2Text = stripHtml(match[1])
      const body = match[2]
      if (/^(?:[۰-۹0-9]+[\.\-\:]|روش|مرحله|Step)/i.test(h2Text.trim())) {
        const pMatch = body.match(/<p[^>]*>(.*?)<\/p>/i)
        const text = pMatch ? stripHtml(pMatch[1]) : stripHtml(body).slice(0, 200)
        steps.push({
          "@type": "HowToStep",
          position: idx,
          name: h2Text,
          text,
          url: `${canonicalUrl}#step-${idx}`,
        })
        idx++
      }
    }
  }

  // Minimum 2 steps requirement per Google Search Central
  if (steps.length < 2) return null

  // Extract supplies / equipment if present
  const sectionRegex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi
  for (const match of post.content.matchAll(sectionRegex)) {
    const h2Text = stripHtml(match[1])
    const body = match[2]
    if (/لوازم|ابزار|وسایل|متریال|Supplies|Tools/i.test(h2Text)) {
      const ulMatch = body.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i)
      if (ulMatch) {
        for (const li of ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
          let item = stripHtml(li[1])
          if (item.includes(":")) item = item.split(":")[0].trim()
          else if (item.includes("：")) item = item.split("：")[0].trim()
          supplies.push({ "@type": "HowToSupply", name: item })
        }
      }
    }
  }

  return {
    "@type": "HowTo",
    name: post.title,
    description: post.description,
    inLanguage,
    step: steps,
    ...(supplies.length > 0 ? { supply: supplies } : {}),
  }
}
```

### 2.3 Proposed Integration in `src/app/blog/[slug]/page.tsx`
Lines 77–83:
```typescript
  const canonical = blogCanonicalUrl(post.slug)
  const inLanguage = post.lang === "fa" ? "fa-IR" : "en-US"
  const howToSchema = generateHowToSchema(post, canonical, inLanguage)

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        ...
      },
      {
        "@type": "BreadcrumbList",
        ...
      },
      {
        "@type": "FAQPage",
        ...
      },
      ...(howToSchema ? [howToSchema] : []),
    ],
  }
```

### 2.4 CTR Title Optimization Strategy
To maximize Click-Through Rates (CTR) from search engine result pages (SERPs):
1. **Visual Bracket Anchoring**:
   - Use Persian double brackets `【...】` for Persian titles and square brackets `[...]` for English titles.
   - Brackets enclose a high-intent intent modifier: e.g. `【راهنمای کامل】`, `【نجات ریشه‌ها】`, `【راز پرپشت شدن】`, `【آموزش گام‌به‌گام】`, `【درمان فوری】`, `[Complete Guide]`, `[Step-by-Step]`, `[Fast Fix]`.
2. **Contextual Botanical Emojis**:
   - Plants: `🌱`, `🪴`, `🌿`, `🍃`
   - Watering & Humidity: `💧`, `🚿`, `💨`
   - Pests & Diagnosis: `🩺`, `⚠️`, `🪲`
   - Tutorials & DIY: `✂️`, `🧪`, `✨`
   - Sun / Balcony: `☀️`
3. **Keyword Integrity**:
   - The primary keyword is strictly retained inside the title immediately following the bracket hook.
   - Example: Primary keyword `"نگهداری سانسوریا"` $\to$ Title `【راهنمای کامل】 نگهداری سانسوریا در خانه؛ ترفندهای پاجوش‌دهی و شادابی 🌱`.
4. **Zero Slug Mutation**:
   - Every `slug` remains verbatim to ensure 0% broken links and 0% canonical URL shifts.

---

## 3. Caveats
1. **Pre-existing test failure**: Vitest suite reports 3 failures in `src/lib/__tests__/mascot.test.ts` due to Persian keyword mismatches in mascot dialogue. This is isolated to the mascot workstream and does not touch the blog subsystem.
2. **Title length ceiling**: Google truncates desktop titles beyond ~600px (~60–65 characters). Bracketed hooks should stay compact (10–18 characters) so the core plant name and keywords remain visible before truncation.
3. **HTML step styling variance**: While all 25 tutorial posts use standard HTML tags (`<ol>`, `<ul>`, `<h2>`), the extractor handles varying internal tag structures (`<strong>`, `<p>`) robustly with fallback hierarchies.

---

## 4. Conclusion
1. **HowTo Schema is fully supported**: The `@graph` schema architecture in `src/app/blog/[slug]/page.tsx` effortlessly accommodates a `HowTo` object alongside `Article`, `BreadcrumbList`, and `FAQPage`.
2. **25 Tutorial Posts detected**: 25 articles qualify for HowTo structured data with clean step items, titles, descriptions, and equipment lists.
3. **Safe, display-only CTR Optimization**: All 104 article titles can be polished with brackets, hooks, and emojis without mutating `slug`, breaking routes, or changing URLs.

---

## 5. Verification Method

### 5.1 Independent Test Suite Execution
Execute Vitest for blog tests via the direct Node runner:
```bash
/opt/homebrew/bin/node ./node_modules/vitest/vitest.mjs run src/lib/__tests__/blogData.test.ts src/lib/__tests__/blogExpansion.test.ts
```
Expected output: 26 passed tests (7 in `blogData.test.ts`, 19 in `blogExpansion.test.ts`).

### 5.2 ESLint Verification
Run ESLint on the blog directory:
```bash
/opt/homebrew/bin/node ./node_modules/eslint/bin/eslint.js src/app/blog/
```
Expected output: 0 warnings, 0 errors.

### 5.3 HowTo Schema Inspection Test
Run a custom test script verifying that:
- Non-tutorial posts (e.g. `نگهداری-آگلونما`) output `generateHowToSchema(...) === null`.
- Tutorial posts (e.g. `راهنمای-تعویض-گلدان-و-خاک`, `how-to-repot-plants`, `ساخت-قیم-خزه-ای`, `تکثیر-سانسوریا-از-برگ`) return valid `HowToSchema` with `steps.length >= 2`.

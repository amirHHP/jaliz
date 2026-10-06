# Handoff Report: Blog Codebase Architecture, Types & Data Survey

## 1. Observation

### 1.1 File Locations & Roles

Through codebase search and inspection, the entire blog subsystem in `/Users/sotoon/personal/jaliz` consists of the following files:

| File Path | Role & Purpose |
|---|---|
| `src/lib/blogTopics.ts` | Source of truth for TypeScript types (`BlogPost`, `BlogPostInput`, `BlogSeoMeta`, `BlogCluster`, `BlogFaq`), site URL constant, SEO metadata pairing (`addPair`, `blogSeoBySlug`), and core helpers (`applyBlogSeo`, `getRelatedPosts`, `getAlternatePost`, `blogCanonicalUrl`, `listPrimaryKeywords`). |
| `src/lib/blogData.ts` | Re-exports types; stores initial 14 articles (`existingBlogPosts`); imports and aggregates `seoBlogPosts` and `newBlogPosts`; exports `blogPosts: BlogPost[]` mapped with `applyBlogSeo`. |
| `src/lib/blogPostsNew.ts` | Stores 20 articles (`newBlogPosts`: 10 Persian, 10 English) typed as `BlogPostInput[]`. |
| `src/lib/blogPostsSeo.ts` | Stores 20 articles (`seoBlogPosts`: 10 Persian, 10 English) typed as `BlogPostInput[]`. |
| `src/lib/__tests__/blogData.test.ts` | Vitest test suite testing uniqueness of slugs, SEO fields, category validity, clusters, primary keyword uniqueness per language, bilingual alternate pairing, and content length. |
| `src/app/blog/page.tsx` | Next.js Server Component for `/blog` index route defining static metadata. |
| `src/app/blog/BlogIndexClient.tsx` | Next.js Client Component for `/blog` index rendering search bar, category filters, and card grid with icons, authors, read time, and badges. |
| `src/app/blog/[slug]/page.tsx` | Next.js Server Component for `/blog/[slug]` implementing `generateStaticParams`, `generateMetadata`, and Schema.org JSON-LD generation (`Article`, `BreadcrumbList`, `FAQPage`). |
| `src/app/blog/[slug]/BlogPostClient.tsx` | Next.js Client Component for viewing an article: breadcrumbs, cover, body HTML rendering via `dangerouslySetInnerHTML`, FAQ accordion/cards, source disclaimer, CTA banner for Jaliz services, and related articles cards. |
| `src/app/sitemap.ts` | Next.js dynamic sitemap generator including all `blogPosts` mapped with `/blog/${encodeURIComponent(post.slug)}`. |
| `src/components/BlogIcon.tsx` | Icon rendering switch mapping icon name strings to Lucide React icons. |

---

### 1.2 TypeScript Interfaces & Type Specifications

Directly observed in `src/lib/blogTopics.ts` (lines 1–48):

```typescript
export type BlogCluster =
  | "species"
  | "diagnosis"
  | "season"
  | "space"
  | "tutorial"
  | "care"
  | "plants"

export interface BlogFaq {
  question: string
  answer: string
}

export interface BlogSeoMeta {
  primaryKeyword: string
  cluster: BlogCluster
  publishedAtIso: string
  alternateSlug: string
  faqs: BlogFaq[]
}

export interface BlogPost {
  slug: string
  lang: "fa" | "en"
  title: string
  description: string
  category: string
  categoryEn: string
  publishedAt: string
  readTime: string
  author: string
  content: string
  icon: string
  gradient: string
  keywords: string[]
  primaryKeyword: string
  cluster: BlogCluster
  publishedAtIso: string
  alternateSlug: string
  faqs: BlogFaq[]
}

export type BlogPostInput = Omit<
  BlogPost,
  "primaryKeyword" | "cluster" | "publishedAtIso" | "alternateSlug" | "faqs"
>
```

#### Field-by-Field Breakdown & Validation Rules

| Field Name | Type | Optionality | Description & Validation Rules |
|---|---|---|---|
| `slug` | `string` | **Required** | URL slug (e.g., `"راهنمای-آبیاری-گیاهان-آپارتمانی"`). Must be globally unique across all posts. Used in `/blog/[slug]`. |
| `lang` | `"fa" \| "en"` | **Required** | Language code. Must be either `"fa"` or `"en"`. |
| `title` | `string` | **Required** | Article headline (Persian). Must be non-empty. |
| `description` | `string` | **Required** | Meta description. Max 160 characters recommended by SEO best practices. |
| `category` | `string` | **Required** | Localized category display name (e.g., `"نگهداری"`, `"معرفی گیاهان"`, `"آموزش‌های کاربردی"`). |
| `categoryEn` | `string` | **Required** | English category identifier. **Strict validation**: Must be one of `["care", "plants", "tutorials"]` (validated in `blogData.test.ts:14` and filtered in `BlogIndexClient.tsx:31-41`). |
| `publishedAt` | `string` | **Required** | Human-readable Persian date string (e.g., `"۲۱ شهریور ۱۴۰۵"`). |
| `readTime` | `string` | **Required** | Estimated reading time in Persian (e.g., `"۱۲ دقیقه"`). |
| `author` | `string` | **Required** | Author name. Existing Persian articles use `"سارا گل‌پرور"` or `"علی سبزواری"`. |
| `content` | `string` | **Required** | Raw HTML string rendered into the DOM. Must be non-empty (for SEO articles, stripped text length > 1500 chars). |
| `icon` | `string` | **Required** | Lucide icon identifier supported by `BlogIcon.tsx`: `"Droplets"`, `"Sprout"`, `"BookOpen"`, `"Sun"`, `"Bug"`, `"Heart"`, `"Scissors"`, `"Snowflake"`, `"Sparkles"`, `"Leaf"`. Defaults to `"BookOpen"`. |
| `gradient` | `string` | **Required** | Tailwind CSS gradient classes for cards and cover (e.g., `"from-emerald-500 to-lime-600"`, `"from-cyan-400 to-sky-600"`, `"from-sky-400 to-emerald-500"`). |
| `keywords` | `string[]` | **Required** | Array of SEO keyword strings (non-empty). Used in meta keywords and search filtering. |
| `primaryKeyword` | `string` | **Required** | Primary target keyword. **Strict validation**: Must be unique within each language (`blogData.test.ts:38-43`). |
| `cluster` | `BlogCluster` | **Required** | Must be one of: `"species"`, `"diagnosis"`, `"season"`, `"space"`, `"tutorial"`, `"care"`, `"plants"`. |
| `publishedAtIso` | `string` | **Required** | ISO 8601 date string. **Strict validation**: Must match `/^\d{4}-\d{2}-\d{2}$/` (e.g., `"2026-09-12"`). Used in sitemap and schema. |
| `alternateSlug` | `string` | **Required** | Slug of the counterpart article in the alternate language. |
| `faqs` | `BlogFaq[]` | **Required** | Array of `{ question: string, answer: string }`. Must be non-empty (typically 2 to 5 FAQs). Used in Schema.org `FAQPage` and UI. |

---

### 1.3 Existing Articles Inventory (27 Pairs = 54 Posts)

Currently, the repository contains **54 blog posts** arranged in **27 bilingual pairs** (27 Persian, 27 English):

1. **`existingBlogPosts`** (`src/lib/blogData.ts:7-795`): 14 posts (7 Persian, 7 English)
2. **`newBlogPosts`** (`src/lib/blogPostsNew.ts:3-864`): 20 posts (10 Persian, 10 English)
3. **`seoBlogPosts`** (`src/lib/blogPostsSeo.ts:8-897`): 20 posts (10 Persian, 10 English)

#### Catalog of All 27 Existing Persian Articles

| # | Slug | Primary Keyword | Cluster | CategoryEn | Category |
|---|---|---|---|---|---|
| 1 | `راهنمای-آبیاری-گیاهان-آپارتمانی` | آبیاری گیاهان آپارتمانی | `care` | `care` | نگهداری |
| 2 | `گیاهان-آپارتمانی-مقاوم-برای-تازه-کارها` | گیاهان آپارتمانی مقاوم | `plants` | `plants` | گیاهان |
| 3 | `راهنمای-تعویض-گلدان-و-خاک` | تعویض گلدان | `tutorial` | `tutorials` | آموزش |
| 4 | `راهنمای-تکثیر-گیاهان-در-آب` | تکثیر گیاهان در آب | `tutorial` | `tutorials` | آموزش |
| 5 | `راهنمای-هیدروپونیک-به-زبان-ساده` | کشت هیدروپونیک | `tutorial` | `tutorials` | آموزش |
| 6 | `علت-زرد-شدن-برگ-گیاهان` | علت زرد شدن برگ گیاهان | `diagnosis` | `care` | نگهداری |
| 7 | `گیاهان-آپارتمانی-نور-کم` | گیاهان آپارتمانی نور کم | `space` | `plants` | گیاهان |
| 8 | `راهنمای-رطوبت-گیاهان-آپارتمانی` | رطوبت گیاهان آپارتمانی | `care` | `care` | نگهداری |
| 9 | `راهنمای-کوددهی-گیاهان-آپارتمانی` | کود گیاهان آپارتمانی | `care` | `care` | نگهداری |
| 10 | `راهنمای-نور-گیاهان-آپارتمانی` | نور گیاهان آپارتمانی | `care` | `care` | نگهداری |
| 11 | `آفات-رایج-گیاهان-آپارتمانی` | آفات گیاهان آپارتمانی | `diagnosis` | `care` | نگهداری |
| 12 | `گیاهان-بی-خطر-برای-حیوانات-خانگی` | گیاهان سمی برای گربه | `plants` | `plants` | گیاهان |
| 13 | `مراقبت-زمستانی-گیاهان-آپارتمانی` | مراقبت زمستانی گیاه | `season` | `care` | نگهداری |
| 14 | `انتخاب-خاک-مناسب-گیاهان-آپارتمانی` | خاک گیاهان آپارتمانی | `tutorial` | `tutorials` | آموزش |
| 15 | `گیاهان-تصفیه-کننده-هوا` | گیاهان تصفیه کننده هوا | `plants` | `plants` | گیاهان |
| 16 | `علت-قهوه-ای-شدن-نوک-برگ` | نوک برگ قهوه ای | `diagnosis` | `care` | نگهداری |
| 17 | `راهنمای-هرس-گیاهان-آپارتمانی` | هرس گیاهان آپارتمانی | `tutorial` | `tutorials` | آموزش |
| 18 | `نگهداری-سانسوریا` | نگهداری سانسوریا | `species` | `plants` | معرفی گیاهان |
| 19 | `نگهداری-پتوس` | نگهداری پتوس | `species` | `plants` | معرفی گیاهان |
| 20 | `نگهداری-زامیفولیا` | نگهداری زامیفولیا | `species` | `plants` | معرفی گیاهان |
| 21 | `نگهداری-برگ-انجیری` | نگهداری برگ انجیری | `species` | `plants` | معرفی گیاهان |
| 22 | `گیاهان-مناسب-بالکن` | گیاه مناسب بالکن | `space` | `plants` | معرفی گیاهان |
| 23 | `کاشت-ریحان-و-سبزی-در-گلدان` | کاشت ریحان در گلدان | `tutorial` | `tutorials` | آموزش‌های کاربردی |
| 24 | `قارچ-سفید-روی-خاک-گلدان` | قارچ سفید روی خاک گلدان | `diagnosis` | `care` | مراقبت از گیاهان |
| 25 | `انتخاب-گلدان-سفالی-یا-پلاستیکی` | گلدان سفالی یا پلاستیکی | `tutorial` | `tutorials` | آموزش‌های کاربردی |
| 26 | `نگهداری-گیاه-در-مسافرت` | آبیاری گیاه در مسافرت | `care` | `care` | مراقبت از گیاهان |
| 27 | `گیاهان-گلدار-آپارتمانی` | گل آپارتمانی گلدار | `plants` | `plants` | معرفی گیاهان |

> ⚠️ **Anti-Cannibalization Rule**: The 50 new articles MUST NOT reuse any of the 27 slugs or primary keywords listed above.

---

### 1.4 Content Formatting & HTML Markup

In `src/app/blog/[slug]/BlogPostClient.tsx` (lines 95–106):

```tsx
<article 
  lang={post.lang}
  className="p-6 sm:p-10 leading-relaxed text-slate-700 text-base sm:text-lg 
    [&>p]:mb-6 [&>p]:leading-relaxed
    [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:pb-2 [&>h2]:border-b [&>h2]:border-slate-100
    [&>ul]:list-disc [&>ul]:ps-6 [&>ul]:mb-6 [&>ul]:space-y-2
    [&>ol]:list-decimal [&>ol]:ps-6 [&>ol]:mb-6 [&>ol]:space-y-2
    [&>li]:leading-relaxed
    [&>strong]:font-semibold [&>strong]:text-slate-900
    [&>a]:text-emerald-700 [&>a]:font-semibold [&>a]:hover:underline"
  dangerouslySetInnerHTML={{ __html: post.content }}
/>
```

#### Content Structural Patterns Directly Observed in `src/lib/blogPostsSeo.ts`:

1. **Lead Paragraph**: `<p class="lead text-lg text-slate-600 mb-6 font-medium">...</p>`
2. **Headings (H2)**: `<h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">...</h2>`
3. **Paragraphs**: `<p class="text-slate-600 mb-4">...</p>`
4. **Lists**: `<ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4"><li><strong>...:</strong> ...</li></ul>`
5. **Internal Links**: `<a href="/blog/<exact-slug>">عنوان لینک</a>`
6. **Service CTAs (Jaliz Context)**: Naturally woven into the closing paragraphs:
   - Smart watering reminders: `"در جالیز [نام گیاه] را با نور و نوع گلدان ثبت کنید تا فاصله آبیاری حدسی نباشد."`
   - AI diagnosis & photo growth log: `"ثبت یادآور در جالیز کمک می‌کند الگوی شخصی خانه خودتان را بعد از سه چهار آبیاری پیدا کنید."`
   - Marketplace: references to obtaining healthy cuttings or potting supplies.

---

### 1.5 FAQ Structure & Rich Snippets

FAQs are stored as an array of objects in `faqs: BlogFaq[]`:
```typescript
faqs: [
  { question: "...", answer: "..." },
  { question: "...", answer: "..." },
]
```
These are dual-rendered:
1. **Schema.org FAQPage JSON-LD** in `src/app/blog/[slug]/page.tsx` (lines 127–137):
   ```json
   {
     "@type": "FAQPage",
     "mainEntity": [
       {
         "@type": "Question",
         "name": "سوال",
         "acceptedAnswer": {
           "@type": "Answer",
           "text": "پاسخ"
         }
       }
     ]
   }
   ```
2. **On-page FAQ section** in `src/app/blog/[slug]/BlogPostClient.tsx` (lines 108–122) as `<dl>` with stylized questions (`<dt>`) and answers (`<dd>`).

---

### 1.6 Export, Import, and Consumption Pipeline

1. **Exports**:
   - `src/lib/blogData.ts`:
     ```typescript
     export const blogPosts: BlogPost[] = [
       ...seoBlogPosts,
       ...newBlogPosts,
       ...existingBlogPosts,
     ].map(applyBlogSeo)
     ```
2. **Imports & Consumers**:
   - `src/app/sitemap.ts`: Maps `blogPosts` into dynamic sitemap XML entries with `priority: 0.7` and `changeFrequency: "weekly"`.
   - `src/app/blog/BlogIndexClient.tsx`: Filters `blogPosts` by language (`post.lang === language`), active category (`post.categoryEn === activeCategory`), and search query (`title`, `description`, `keywords`).
   - `src/app/blog/[slug]/page.tsx`: Generates static paths (`generateStaticParams`), metadata (`generateMetadata`), Schema.org (`Article`, `BreadcrumbList`, `FAQPage`), and passes `post` and `relatedPosts` to `BlogPostClient`.
   - `src/app/blog/[slug]/BlogPostClient.tsx`: Renders the single article layout.
   - `src/lib/__tests__/blogData.test.ts`: Runs automated unit tests on all posts.

---

### 1.7 Test Suite & Build Verification Results

Commands executed:
1. `npm run test src/lib/__tests__/blogData.test.ts`:
   - **Result**: Exit code 0, 7 passed (7 tests in 234ms).
2. `npx vitest run`:
   - **Result**: Exit code 0, 28 test files passed (209 tests in 1.32s).
3. `npx tsc --noEmit`:
   - **Result**: Found 9 errors in 3 test files unrelated to blog:
     - `src/app/actions/__tests__/subscription-admin.test.ts:209` (type conversion)
     - `src/lib/auth/__tests__/session-cookie.test.ts:12,18,24,30` (`process.env.NODE_ENV` read-only assignment)
     - `src/lib/email/__tests__/send-otp-email.test.ts:32,44,54,74` (`process.env.NODE_ENV` read-only assignment)
     - **Crucial observation**: Zero TypeScript errors in any `blog*` file or blog page.

---

## 2. Logic Chain

1. **From Observation 1.1 & 1.2**:
   All blog posts conform to `BlogPost` which extends `BlogPostInput` with SEO fields (`primaryKeyword`, `cluster`, `publishedAtIso`, `alternateSlug`, `faqs`).
2. **From Observation 1.2 & 1.3**:
   Currently, `blogTopics.ts` uses a private `blogSeoBySlug` dictionary populated via `addPair(faSlug, enSlug, faMeta, enMeta)`. `applyBlogSeo` looks up this dictionary by slug.
3. **From Observation 1.3 & Requirement R1/R3**:
   The user requested 50 comprehensive Persian SEO blog posts. Currently, there are 27 Persian articles. The new 50 articles must have 0% keyword cannibalization with these 27 articles.
4. **From Observation 1.2 & 1.7 (`blogData.test.ts:45-54`)**:
   In `src/lib/__tests__/blogData.test.ts`, there is an assertion:
   ```typescript
   it("pairs every post with an alternate-language slug", () => {
     const bySlug = new Map(blogPosts.map((post) => [post.slug, post]))
     for (const post of blogPosts) {
       const alternate = bySlug.get(post.alternateSlug)
       expect(alternate).toBeDefined()
       expect(alternate?.lang).not.toBe(post.lang)
       expect(alternate?.alternateSlug).toBe(post.slug)
       expect(alternate?.cluster).toBe(post.cluster)
     }
   })
   ```
   If 50 Persian-only articles are added to `blogPosts` without English alternate pairs, this existing vitest assertion will fail on `expect(alternate).toBeDefined()` unless:
   - The test is scoped to test bilingual pairs for the 27 legacy pairs, while testing the 50 new Persian articles against the new criteria (50 count, lang "fa", unique primary keywords, schema, valid internal links), OR
   - The data is partitioned so legacy pairs remain tested while expansion posts are tested with their dedicated suite.
5. **From Observation 1.4 & 1.5**:
   HTML rendering via `dangerouslySetInnerHTML` gives full control over `<p>`, `<h2>`, `<h3>`, `<ul>`, `<ol>`, `<strong>`, and `<a href="/blog/...">`. The FAQs are passed directly to `FAQPage` Schema.org.

---

## 3. Caveats

1. **Bilingual vs Persian-only Expansion**: The existing architecture paired every Persian article with an English counterpart. The user's prompt explicitly requests 50 comprehensive Persian articles (`تولید و پیاده‌سازی ۵۰ مقاله جامع، غنی و سئو محور به زبان فارسی`). As noted in the logic chain, `blogData.test.ts` currently asserts that every post in `blogPosts` has an alternate-language pair. This test must be adjusted by the implementer to assert bilingual pairing on legacy posts, while validating the 50 new Persian posts.
2. **Global TypeScript Check**: `npx tsc --noEmit` currently fails on 3 non-blog test files due to strict `process.env.NODE_ENV` typing in `@types/node` and an assertion in `subscription-admin.test.ts`. The blog files themselves are 100% type-clean.
3. **File Splitting for 50 Articles**: 50 articles of ~1500+ characters each is a substantial volume of code (~150KB to 250KB). Placing all 50 in a single file could make it difficult to maintain. Splitting into 2 or 3 modular data files (e.g., `blogPostsExpansion1.ts`, `blogPostsExpansion2.ts` or organized by clusters) in `src/lib/` and combining them in `blogData.ts` is strongly advised.

---

## 4. Conclusion

1. **Type Definitions**:
   - All types are defined in `src/lib/blogTopics.ts` and re-exported from `src/lib/blogData.ts`.
   - `BlogPost` requires 18 fields: `slug`, `lang`, `title`, `description`, `category`, `categoryEn`, `publishedAt`, `readTime`, `author`, `content`, `icon`, `gradient`, `keywords`, `primaryKeyword`, `cluster`, `publishedAtIso`, `alternateSlug`, `faqs`.
   - `categoryEn` must be strictly `"care" | "plants" | "tutorials"`.
   - `cluster` must be strictly one of `"species" | "diagnosis" | "season" | "space" | "tutorial" | "care" | "plants"`.
   - `icon` should use one of the 10 icons supported by `BlogIcon.tsx`.
2. **Storage Structure**:
   - Existing posts live in `src/lib/blogData.ts`, `src/lib/blogPostsNew.ts`, and `src/lib/blogPostsSeo.ts`.
   - New articles should be added as data files in `src/lib/` and aggregated into `blogPosts` in `src/lib/blogData.ts`.
3. **Content Format**:
   - HTML string in `content` with `<p class="lead ...">`, `<h2>`, `<p>`, `<ul>`, `<strong>`, `<a href="/blog/...">` internal links, and natural Jaliz CTAs.
   - Text length > 1500 characters per article without HTML tags.
   - FAQs structured in `faqs: BlogFaq[]` with minimum 2 entries per post.
4. **Anti-Cannibalization Baseline**:
   - 27 Persian slugs and primary keywords are already taken (documented in Table 1.3). The 50 new articles must strictly target new keywords across the 7 topic clusters.

---

## 5. Verification Method

To independently verify all findings in this report:

1. **Run Blog Vitest Suite**:
   ```bash
   npx vitest run src/lib/__tests__/blogData.test.ts
   ```
   *Expected*: All 7 tests pass.

2. **Run Full Vitest Suite**:
   ```bash
   npm run test
   ```
   *Expected*: All 28 test suites (209 tests) pass.

3. **Verify Blog TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected*: Zero errors in `src/lib/blog*` or `src/app/blog*`. Note existing 9 errors in 3 non-blog test files.

4. **Verify Route & Schema Rendering**:
   Inspect `src/app/blog/[slug]/page.tsx` lines 80–138 to confirm JSON-LD schema generation for `Article`, `BreadcrumbList`, and `FAQPage`.

# Handoff Report: Plant Encyclopedia Directory (`/wiki`) & Dynamic Pages (`/wiki/[slug]`) Survey

## 1. Observation

### 1.1 Existing Plant Data & Schemas
- **Prisma Database Schema (`prisma/schema.prisma` lines 69-96)**:
  `UserPlant` model represents user-owned instances of plants in a user's private collection:
  ```prisma
  model UserPlant {
    id                 String   @id @default(uuid())
    userId             String
    user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    name               String
    type               String?  @default("")
    locationType       String?  @default("Indoor")
    lightExposure      String?  @default("Bright Indirect")
    potType            String?  @default("Plastic")
    growingMedium      String?  @default("Soil") // "Soil" or "Water"
    hasDrainage        Boolean? @default(true)
    lastWatered        DateTime?
    nextWateringDate   DateTime?
    wateringInterval   Int?     @default(7)
    recentlyReplanted  Boolean? @default(false)
    lastSoilChange     DateTime?
    health             String?  @default("Excellent")
    image              String?
    careTips           String?
    wateringTips       String?
    createdAt          DateTime @default(now())
    statusLogs         PlantStatusLog[]
    @@index([userId])
    @@index([nextWateringDate])
  }
  ```
  There is NO general public botanical encyclopedia database table or `src/data/` directory in the repository.
- **Content Architecture Precedent (`src/lib/blogData.ts`, `src/lib/blogTopics.ts`)**:
  All content-driven programmatic SEO data in Jaliz is statically structured in `src/lib/` using TypeScript models (`BlogPost`, `BlogCluster`, `BlogFaq` in `src/lib/blogTopics.ts`).
  Blog articles covering plant care (e.g. `نگهداری-سانسوریا`, `نگهداری-پتوس`, `نگهداری-زامیفولیا`, `نگهداری-برگ-انجیری` in `src/lib/blogPostsSeo.ts`) already contain rich Persian botanical content that can be referenced or cross-linked.

### 1.2 Routing & Next.js App Router Conventions
- **Next.js Version (`package.json` line 31)**:
  `"next": "16.2.4"`, `"react": "19.2.4"`.
  In Next.js 16 App Router, page and metadata parameters are asynchronous:
  `params: Promise<{ slug: string }>` (confirmed in `src/app/blog/[slug]/page.tsx` line 13, 26, 69):
  ```tsx
  interface Props {
    params: Promise<{ slug: string }>
  }
  export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    ...
  }
  export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    ...
  }
  ```
- **Sitemap Architecture (`src/app/sitemap.ts` lines 8-70)**:
  ```ts
  export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
      { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
      { url: `${SITE_URL}/marketplace`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${SITE_URL}/plants/diagnose`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
      { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ]
    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: new Date(post.publishedAtIso),
      changeFrequency: "weekly",
      priority: 0.8,
    }))
    ...
    return [...staticPages, ...blogPages, ...listingPages]
  }
  ```
  Currently `/wiki` and `/wiki/[slug]` are not registered in `src/app/sitemap.ts`.
- **Robots Configuration (`src/app/robots.ts` lines 5-23)**:
  ```ts
  export default function robots(): MetadataRoute.Robots {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/admin",
            "/admin/",
            "/schedule",
            "/plants/new",
            "/login",
            "/register",
            "/api/",
          ],
        },
      ],
      sitemap: `${SITE_URL}/sitemap.xml`,
    }
  }
  ```
  `/wiki` is not disallowed; it falls under `allow: "/"`. No `public/robots.txt` exists.

### 1.3 Call-to-Action (CTA) Endpoints & Deficiencies Observed
- **CTA 1: Add to User's Garden / Care Reminder (`src/app/plants/new/page.tsx`)**:
  - `NewPlantPage` allows users to create a plant instance.
  - Currently lines 89-106 initialize `draft` with static defaults (`wateringInterval: 7`, empty name, etc.).
  - `NewPlantPage` does not read `searchParams` on mount. Adding query parameter parsing (e.g. `?name=...&type=...&interval=...&light=...`) will allow 1-click pre-population from wiki plant pages.
- **CTA 2: Matching Marketplace Listings (`src/app/marketplace/page.tsx`)**:
  - Line 82: `const [search, setSearch] = useState("")`.
  - Line 45: `searchParams = useSearchParams()` in `MarketplaceOpenFromQuery` only reads `open` and `action`, but does NOT read `query` or `q`!
  - Therefore, if `/wiki/[slug]` links to `/marketplace?query=سانسوریا`, `MarketplacePage` currently ignores `query` and does not filter listings unless updated to parse `searchParams.get("query")`.
- **CTA 3: AI Disease Diagnosis (`src/app/plants/diagnose`)**:
  - Publicly accessible page with camera/upload flow for plant disease identification.
  - Used successfully across `BlogPostClient.tsx` (lines 172-175: `<Link href="/plants/diagnose">`).

### 1.4 Typography, Layout, and Design Tokens
- **Font (`src/app/layout.tsx` lines 5-25)**:
  `Vazirmatn` font configured as CSS variable `--font-vazirmatn`. RTL direction is natively supported.
- **Palette (`src/app/globals.css` lines 27-54)**:
  Forest green brand palette: `emerald-800: #12382e`, `emerald-600: #1f5f4e`, `emerald-500: #2e7462`.
  Card surfaces use `bg-[#fcfaf8]`, `surface-card`, `border-slate-200/60`.

---

## 2. Logic Chain

1. **Plant Encyclopedia Architecture**:
   - Because `prisma/schema.prisma` only models `UserPlant` for authenticated private gardens and there is no database table for public encyclopedias (Observation 1.1), storing the encyclopedia in a dedicated TypeScript module `src/lib/wikiData.ts` mirrors the established pattern in `src/lib/blogData.ts`.
   - Storing the data in TypeScript guarantees zero runtime database latency, instant static site generation (`generateStaticParams`), type safety across components, and zero migrations required.

2. **Plant Species Coverage**:
   - Requirement R1 explicitly asks for popular houseplants: سانسوریا، پتوس، زامیفولیا، برگ انجیری، فیکوس، آگلونما، یوکا، دیفن باخیا، شفلرا، کالانکوئه، قاشقی، اسپاتی فیلوم.
   - We must provide all 12 required species plus companion species (e.g. آلوئه‌ورا، گندمی، فیکوس لیراتا، برگ عبایی) to ensure comprehensive topical authority for Persian houseplant search queries.

3. **Care Specifications Structure**:
   - R1 requires: Light, Watering, Temperature, Soil, Pet Safety (سمیت برای حیوانات), and Common Problems (مشکلات رایج).
   - In `src/lib/wikiData.ts`, each plant entry should define:
     - `care.light`: level, description, tolerance, window placement.
     - `care.watering`: schedule, season guidance, defaultIntervalDays (for reminder CTA).
     - `care.temperature`: min/max temp, frost limit, humidity requirements.
     - `care.soil`: soil mixture, drainage recommendations, pot type.
     - `care.petSafety`: `isToxic` boolean, toxicity details (calcium oxalate, saponins, or 100% pet-friendly).
     - `care.commonProblems`: array of objects `{ problem, cause, solution, severity }`.

4. **SEO & Structured Data (JSON-LD)**:
   - To achieve search rich results, each plant page at `/wiki/[slug]` must output `@graph` containing:
     1. `Article` schema: Headline, description, botanical name, publisher info.
     2. `BreadcrumbList`: Home (`/`) > دانشنامه گیاهان (`/wiki`) > Plant Name (`/wiki/[slug]`).
     3. `FAQPage` schema: Formed dynamically from the plant's `commonProblems` (e.g. Q: "علت زرد شدن برگ‌های سانسوریا چیست؟" A: "علت: ... راهکار: ...").
   - This provides Google search results with immediate FAQ drop-downs and rich sitelinks.

5. **CTA Cohesion**:
   - For CTA 1: Linking to `/plants/new?name=${plant.nameFa}&type=${plant.nameEn}&interval=${plant.care.watering.defaultIntervalDays}&light=${encodeURIComponent(plant.care.light.level)}` enables 1-click addition into the user's garden.
   - For CTA 2: Updating `src/app/marketplace/page.tsx` to initialize `search` from `searchParams.get("query")` ensures that clicking `/marketplace?query=سانسوریا` immediately displays matching listings.
   - For CTA 3: Linking to `/plants/diagnose` directs users with leaf problems directly to AI diagnosis.

6. **Sitemap & Robots**:
   - Adding `/wiki` to `staticPages` and mapping all `wikiPlants` into `wikiPages` in `src/app/sitemap.ts` (Observation 1.2) guarantees search engine discovery.
   - `src/app/robots.ts` already permits `/` (Observation 1.2); keeping `/wiki` allowed satisfies all crawler requirements.

---

## 3. Caveats

1. **Slug Strategy**:
   - URL slugs could be English (e.g. `/wiki/sansevieria`) or Persian (e.g. `/wiki/سانسوریا`).
   - We recommend setting primary slug as Latin (`sansevieria`, `pothos`, `zamioculcas`) while supporting Persian slug lookup (`slugFa: "سانسوریا"`) so that both `/wiki/sansevieria` and `/wiki/سانسوریا` resolve seamlessly. In `sitemap.ts`, the primary canonical slug is indexed.
2. **Next.js 16 Dynamic Route Params**:
   - In Next.js 16, route `params` is a `Promise`. The implementer must `await params` in both `generateMetadata` and `Page`.
3. **No New Dependencies**:
   - All icons exist in `lucide-react`. No new external packages are needed.

---

## 4. Conclusion & Recommended Design

### 4.1 Recommended File Structure
```
src/
├── lib/
│   ├── wikiData.ts            # WikiPlant interfaces, helpers, and 16 detailed plant datasets
│   └── __tests__/
│       └── wikiData.test.ts   # Comprehensive tests for wiki data integrity and lookup
├── app/
│   ├── wiki/
│   │   ├── page.tsx           # Directory index (SSR metadata + SEO hero)
│   │   ├── WikiIndexClient.tsx# Interactive search, category/pet-safety filters, grid
│   │   └── [slug]/
│   │       ├── page.tsx       # SSG dynamic page, generateStaticParams, generateMetadata, JSON-LD
│   │       └── WikiPlantClient.tsx # Structured care tabs, cards, CTAs, common problems
│   ├── sitemap.ts             # Register /wiki and all wiki plant pages
│   └── marketplace/
│       └── page.tsx           # Enhance to read searchParams.get("query")
```

### 4.2 Data Model Specification (`src/lib/wikiData.ts`)
```typescript
export interface PlantCareSpec {
  light: {
    level: string // e.g. "نور زیاد غیرمستقیم"
    levelEn: "low" | "medium" | "bright-indirect" | "direct"
    description: string
    placementTips: string
  }
  watering: {
    schedule: string // e.g. "هر ۱۰ الی ۱۴ روز در تابستان، ۳ الی ۴ هفته در زمستان"
    rule: string // "خشک شدن کامل خاک تا عمق ۲ الی ۳ بند انگشت"
    defaultIntervalDays: number // 10
    winterAdjustment: string
  }
  temperature: {
    range: string // "۱۶ الی ۲۸ درجه سانتی‌گراد"
    minCelsius: number // 10
    humidity: string // "۳۰ الی ۵۰ درصد (رطوبت معمولی اتاق)"
    warning: string
  }
  soil: {
    mixture: string // "خاک با بافت سبک و زهکشی بالا..."
    potType: string // "گلدان سفالی یا سرامیکی سوراخ‌دار"
    repottingInterval: string // "هر ۲ الی ۳ سال"
  }
  petSafety: {
    isToxic: boolean
    toxicityLevel: "non-toxic" | "mild" | "moderate" | "severe"
    labelFa: string // "سمی برای گربه و سگ" or "کاملاً بی‌خطر (Pet-Friendly)"
    details: string
  }
  commonProblems: Array<{
    problem: string // e.g. "زرد شدن و نرم شدن برگ‌ها"
    cause: string // "آبیاری بیش از حد و خفگی ریشه"
    solution: string // "توقف آبیاری تا خشک شدن عمق خاک..."
    severity: "low" | "medium" | "high"
  }>
}

export interface WikiPlant {
  id: string
  slug: string // "sansevieria"
  slugFa: string // "سانسوریا"
  nameFa: string // "سانسوریا"
  nameEn: string // "Snake Plant"
  scientificName: string // "Dracaena trifasciata"
  family: string // "مارچوبگان (Asparagaceae)"
  difficulty: "آسان" | "متوسط" | "سخت"
  difficultyEn: "easy" | "medium" | "hard"
  growthRate: "کند" | "متوسط" | "سریع"
  airPurifying: boolean
  overview: string
  propagation: string
  fertilization: string
  care: PlantCareSpec
  matchingMarketplaceQuery: string // "سانسوریا"
  tags: string[]
  gradient: string
  iconName: string
}
```

### 4.3 Proposed Implementation Steps for Worker
1. **Step 1 — Create `src/lib/wikiData.ts`**:
   Populate all 12 required plants:
   - سانسوریا (sansevieria)
   - پتوس (pothos)
   - زامیفولیا (zamioculcas)
   - برگ انجیری (monstera)
   - فیکوس (ficus-elastica)
   - آگلونما (aglaonema)
   - یوکا (yucca)
   - دیفن باخیا (dieffenbachia)
   - شفلرا (schefflera)
   - کالانکوئه (kalanchoe)
   - قاشقی (peperomia)
   - اسپاتی فیلوم (spathiphyllum)
   Plus companion species: آلوئه‌ورا (aloe-vera), گندمی (spider-plant), فیکوس لیراتا (ficus-lyrata), برگ عبایی (cast-iron-plant).
   Implement helpers: `getAllWikiPlants()`, `findWikiPlant(slug: string)`, `wikiCanonicalUrl(slug: string)`.

2. **Step 2 — Implement `/wiki` Directory Index**:
   - `src/app/wiki/page.tsx`: Server component with rich SEO metadata (`title: "دانشنامه گیاهان آپارتمانی | راهنمای جامع نگهداری گل و گیاه"`, OpenGraph, Twitter card).
   - `src/app/wiki/WikiIndexClient.tsx`: Client component providing live search, difficulty filters, pet-friendly toggle, and responsive cards with care tags.

3. **Step 3 — Implement Dynamic `/wiki/[slug]` Pages**:
   - `src/app/wiki/[slug]/page.tsx`:
     - `generateStaticParams()` pre-rendering all slugs.
     - `generateMetadata()` setting dynamic titles, description, canonical URL, and OpenGraph.
     - Complete JSON-LD schema with `Article`, `BreadcrumbList`, and `FAQPage` (generated from `commonProblems`).
   - `src/app/wiki/[slug]/WikiPlantClient.tsx`:
     - Persian RTL layout with breadcrumbs (`خانه > دانشنامه گیاهان > [نام گیاه]`).
     - Botanical summary badge pill (نام علمی، خانواده، سختی نگهداری، تصفیه هوا).
     - 6 Care Cards:
       1. ☀️ نور (Light)
       2. 💧 آبیاری (Watering)
       3. 🌡️ دما و رطوبت (Temperature & Humidity)
       4. 🪴 خاک و گلدان (Soil & Pot)
       5. 🐾 سمیت برای حیوانات خانگی (Pet Safety)
       6. ⚠️ مشکلات رایج و درمان (Common Problems & Solutions)
     - 3 Distinct Call-to-Action (CTA) Banners:
       1. **افزودن به باغچه و یادآور آبیاری**: Link to `/plants/new?name=...&type=...&interval=...`.
       2. **جستجوی قلمه و گلدان در بازارچه**: Link to `/marketplace?query=${encodeURIComponent(plant.matchingMarketplaceQuery)}`.
       3. **عارضه‌یابی و درمان با پزشک هوش مصنوعی**: Link to `/plants/diagnose`.
     - Related Blog Posts section linking to corresponding articles in `/blog`.

4. **Step 4 — Update Sitemap & Robots**:
   - `src/app/sitemap.ts`: Add `/wiki` entry to `staticPages` and map `wikiPlants` to `wikiPages`.
   - Confirm `src/app/robots.ts` allows crawling `/wiki`.

5. **Step 5 — Enhance Marketplace Query Pre-fill**:
   - In `src/app/marketplace/page.tsx`: In `MarketplaceOpenFromQuery`, read `searchParams.get("query") || searchParams.get("q")` and pass to `setSearch`.

6. **Step 6 — Write Tests & Validate**:
   - Create `src/lib/__tests__/wikiData.test.ts`.
   - Run test suite and build verification.

---

## 5. Verification Method

To independently verify the survey findings and subsequent implementation:

1. **Data Invariants Test**:
   ```bash
   npx vitest run src/lib/__tests__/wikiData.test.ts
   ```
   Verify:
   - All 12 required plant species + bonus species exist with unique slugs.
   - All care fields (light, watering with `defaultIntervalDays > 0`, temperature, soil, petSafety with boolean `isToxic`, and non-empty `commonProblems`) are strictly populated.
   - Slug resolution correctly matches English slug, Persian slug, and Persian name.

2. **Sitemap Verification**:
   Verify `src/app/sitemap.ts` includes `${SITE_URL}/wiki` and all `${SITE_URL}/wiki/[slug]` URLs.
   Run tests or inspect sitemap output structure.

3. **Build & Typecheck**:
   ```bash
   npm run build
   ```
   Must pass with 0 errors, validating static page generation for all `/wiki` and `/wiki/[slug]` routes.

4. **Linting Check**:
   ```bash
   npm run lint
   ```
   Must pass with 0 lint errors.

5. **Invalidation Conditions**:
   - If any of the 12 required plants is omitted, requirement R1 is unsatisfied.
   - If `params` is not awaited as a `Promise` in Next.js 16, build will fail.
   - If JSON-LD output is missing or invalid, rich snippet indexing will fail.

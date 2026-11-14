# Survey Handoff Report: Marketplace Architecture & Dynamic Blog/Wiki Cross-Linking (R3)

**Author**: `teamwork_explorer_survey_3`  
**Date**: 2026-11-13  
**Status**: Completed  
**Milestone**: Investigation & Architecture for Requirement R3 (Blog-to-Marketplace Cross-Linking) & Shared Wiki CTAs  

---

## 1. Observation

Direct observations from the Jaliz codebase:

### 1.1 Marketplace Routing and Page Structure
- **Routes observed**:
  - `src/app/marketplace/page.tsx`: Client-rendered marketplace catalog (`"use client"`).
    - Lines 28–36 define filter tabs: `"all"` (`ArrowLeftRight`), `"seed"` (`Sprout`), `"cutting"` (`Scissors`), `"tool"` (`Wrench`), `"produce"` (`Apple`), and `"mine"`.
    - Lines 81–82 initialize filter state:
      ```tsx
      const [activeTab, setActiveTab] = useState<Tab>("all")
      const [search, setSearch] = useState("")
      ```
    - Lines 92–102 compute filtered listings via `list({ query: search, type: activeTab })`.
  - `src/app/marketplace/[id]/page.tsx`: SSR listing product page with `generateMetadata`, canonical link, and JSON-LD `schema.org/Product` structured data (lines 79–100).
  - `src/app/marketplace/chats/page.tsx`: Direct message inbox between buyers and sellers.
  - `src/app/marketplace/layout.tsx`: Layout setting metadata ("بازارچه خرید و فروش بذر، قلمه و ابزار باغبانی").

### 1.2 Query Parameter Ingestion in `/marketplace`
- In `src/app/marketplace/page.tsx`:
  - Lines 38–74 implement `MarketplaceOpenFromQuery`:
    ```tsx
    function MarketplaceOpenFromQuery({ setSelectedId, onOpenCreate }: ...) {
      const searchParams = useSearchParams()
      ...
      useEffect(() => {
        if (!ready) return
        const raw = searchParams.get("open")
        const action = searchParams.get("action")
        const shouldCreate = action === "new" || searchParams.get("create") === "1"
        ...
      }, [searchParams, ready, ...])
    }
    ```
  - **Direct Observation & Gap**: `searchParams.get("query")` and `searchParams.get("q")` are **never read anywhere** in `src/app/marketplace/page.tsx`.
  - When a user or link navigates to `/marketplace?query=سانسوریا`, `search` state remains `""`, meaning the incoming query parameter does not currently populate the search input or filter listings.

### 1.3 Data Persistence and Providers
- **Prisma Schema** (`prisma/schema.prisma` lines 120–145):
  - Model `MarketplaceListing` holds: `id`, `ownerId`, `title`, `description`, `type` (`seed` | `cutting` | `tool` | `produce`), `mode` (`sell` | `exchange` | `free`), `price` (Int?), `exchangeFor`, `location`, `image`, `contactPhone`, `status` (`active` | `completed`), `createdAt`, `completedAt`.
- **Server Actions** (`src/app/actions/marketplace.ts`):
  - `getMarketplaceListingsAction()` fetches all listings ordered by status and createdAt.
  - `getListingByIdAction(id)` and `getListingWithOwnerAction(id)` fetch single listings with owner info.
- **Client Providers** (`src/components/MarketplaceProvider.tsx` & `src/components/MarketplaceListingsProvider.tsx`):
  - `MarketplaceListingsProvider` provides `ready`, `revision`, `list(filter)`, `get(id)`.
  - `useMarketplace({ loadListings = true })`:
    - Calling `useMarketplace()` with `loadListings: true` (default) triggers `ensureLoaded()` which calls `getMarketplaceListingsAction()`.
    - `list({ query, type, mode, status })` performs local in-memory filtering:
      ```ts
      if (q && !`${l.title} ${l.description}`.toLowerCase().includes(q)) return false
      ```

### 1.4 Existing AI Advice Matching Mechanism
- `src/lib/marketplace/advice-listing-match.ts`:
  - `ADVICE_PRODUCT_TERM_GROUPS` defines synonym clusters for fertilizers, fungicides, pesticides, soil, pots, seeds, cuttings, pruning shears, mulch, and tools (lines 4–15).
  - `normalizeForMatch(text)` removes `\u200c`, `\u200f`, `\u00a0`, collapses whitespace, and lowercases.
  - `matchListingsToAdvice(adviceText, contextText, listings, options)` scores active listings and returns the top matches.
- `src/components/marketplace/AdviceMarketplaceStrip.tsx`:
  - Renders a horizontal scrolling strip of matching listing cards inside `PlantModal.tsx` when `aiAdvice` is present.

### 1.5 Blog System Structure & Existing Cross-Linking
- `src/lib/blogTopics.ts`:
  - `BlogPost` interface:
    - `slug: string`
    - `lang: "fa" | "en"`
    - `title: string`
    - `description: string`
    - `category: string` (e.g. `"معرفی گیاهان"`, `"نگهداری"`, `"آموزش‌های کاربردی"`)
    - `categoryEn: string` (e.g. `"plants"`, `"care"`, `"tutorials"`)
    - `keywords: string[]`
    - `primaryKeyword: string`
    - `cluster: BlogCluster` (`"species"` | `"diagnosis"` | `"season"` | `"space"` | `"tutorial"` | `"care"` | `"plants"`)
- `src/app/blog/[slug]/BlogPostClient.tsx`:
  - Lines 143–190 render a dark callout banner ("پزشک هوشمند گیاهان جالیز") with links to `/plants/diagnose` and a generic static button to `/marketplace`.
  - Lines 226–270 render related blog articles (`relatedPosts`).
  - **Direct Observation & Gap**: There is currently NO dynamic matching of plant species or keywords to related marketplace listings on blog post pages.

### 1.6 Blog Validation Rules (`scripts/validate-blog.mjs`)
- Line 78 defines allowed CTA targets:
  `const JALIZ_CTA_TARGETS = ["/plants/diagnose", "/schedule", "/marketplace"]`
- Linking to `/marketplace` is an officially recognized core CTA target in the project.

---

## 2. Logic Chain

1. **Requirement R3 Intent**:
   - The user request explicitly demands:
     *"In species blog articles or at the bottom of blog articles, dynamically link to related marketplace listings based on matching plant keywords or tags to drive commercial intent."*
   - Furthermore, requirement R1 (Encyclopedia) requires:
     *"Include clear call-to-action (CTA) buttons on each plant page: add to user's garden / care reminder, browse matching marketplace listings (`/marketplace?query=...`), and diagnose plant leaf diseases with AI (`/plants/diagnose`)."*
   - DISPATCH.md directs us to make this cross-linking mechanism reusable across both `/blog/[slug]` and `/wiki/[slug]`.

2. **Connecting URLs to the Marketplace Catalog**:
   - Because both R1 and R3 rely on `/marketplace?query=...` (e.g. `/marketplace?query=سانسوریا`), the `/marketplace` page must ingest the `query` query parameter.
   - Based on Observation 1.2, `MarketplacePage` currently ignores `query`. Therefore, modifying `src/app/marketplace/page.tsx` to read `searchParams.get("query") || searchParams.get("q")` and synchronize it to the `search` state is a foundational prerequisite for the entire cross-linking experience to work.

3. **Topic & Species Resolution Strategy**:
   - Houseplant articles fall into two distinct groups:
     1. **Species-specific articles** (`cluster === "species"` or specific plant in title/slug/keywords):
        - e.g. "نگهداری سانسوریا" -> plant name: "سانسوریا", query: "سانسوریا".
        - e.g. "نگهداری پتوس" -> plant name: "پتوس", query: "پتوس".
        - e.g. "نگهداری زامیفولیا" -> plant name: "زامیفولیا", query: "زامیفولیا".
        - e.g. "نگهداری برگ انجیری" -> plant name: "برگ انجیری", query: "برگ انجیری".
        - e.g. "نگهداری آگلونما" -> plant name: "آگلونما", query: "آگلونما".
        - e.g. "نگهداری فیکوس" -> plant name: "فیکوس", query: "فیکوس".
        - e.g. "نگهداری یوکا" -> plant name: "یوکا", query: "یوکا".
        - e.g. "نگهداری دیفن باخیا" -> plant name: "دیفن باخیا", query: "دیفن باخیا".
        - e.g. "نگهداری شفلرا" -> plant name: "شفلرا", query: "شفلرا".
        - e.g. "نگهداری پپرومیا / قاشقی" -> plant name: "قاشقی", query: "قاشقی".
        - e.g. "نگهداری اسپاتی فیلوم" -> plant name: "اسپاتی فیلوم", query: "اسپاتی فیلوم".
     2. **Care & Equipment articles** (`cluster` in `"care"`, `"tutorial"`, `"diagnosis"`, `"space"`):
        - Repotting / potting mix -> "خاک", "گلدان"
        - Fertilization -> "کود"
        - Pest diagnosis -> "سم", "قارچ‌کش"
        - Moss pole / propagation -> "قیم خزه", "قلمه", "ابزار"
        - Grow lights -> "لامپ رشد"
   - By structuring a dictionary of plant synonyms and care topics with canonical Persian terms, we can reliably map any blog post or encyclopedia page to a commercial intent query.

4. **Component Design: Two-Tier Commercial Presentation**:
   - In a production environment or active user base, there might be active listings matching "سانسوریا", or there might be periods where no seller has an active listing for that specific species yet.
   - A robust cross-linking component must handle both states gracefully:
     - **Tier 1 (Live Listings Preview)**: If `useMarketplace()` has active matching listings (`listing.title` or `listing.description` includes the topic query), display a responsive horizontal strip or grid of listing cards with photo, title, price in Toman, and direct link to `/marketplace?open=${listing.id}` (or `/marketplace/${listing.id}`).
     - **Tier 2 (Commercial Action Banner)**: Regardless of whether active individual listings exist, ALWAYS display an attractive, high-converting commercial banner:
       - Title: e.g. "خرید، فروش و تبادل قلمه و گیاه [سانسوریا] در بازارچه جالیز"
       - Description: e.g. "دنبال خرید قلمه ریشه‌دار یا فروش پاجوش‌های گیاهت هستی؟ آگهی‌های ثبت‌شده کاربران در بازارچه گل و گیاه جالیز رو ببین."
       - Primary CTA button: `<Link href={`/marketplace?query=${encodeURIComponent(query)}`}>مشاهده آگهی‌های [نام گیاه] در بازارچه</Link>`
       - Secondary CTA button: `<Link href="/marketplace?action=new">ثبت رایگان آگهی</Link>`
   - This guarantees that the page ALWAYS satisfies commercial intent without displaying an empty blank block when zero listings are seeded.

---

## 3. Caveats

1. **Client vs Server Rendering**:
   - `src/app/blog/[slug]/page.tsx` uses `generateStaticParams()` to pre-render at build time.
   - Because live marketplace listings fluctuate as users post, sell, or delete listings, live listing queries MUST run on the client via `useMarketplace()` inside `BlogPostClient.tsx`, rather than baking dynamic listings into the static HTML at build time.
   - However, the contextual links and SEO-friendly CTA links (`href="/marketplace?query=..."`) are deterministic based on the post's species/topic, so they can be rendered in the initial HTML or hydrated immediately.
2. **Database Seeding in Test Environments**:
   - Tests in `src/lib/marketplace/__tests__/` use mock `Listing` objects and `InMemoryStore`. The topic matcher module must be pure TypeScript so it can be thoroughly unit tested in Vitest without database or browser dependencies.
3. **URL Slug Preservation**:
   - Slugs of existing blog posts must NEVER be changed, as this would break existing inbound links, backlinks, and search indexation. All topic matching operates on `slug`, `title`, `primaryKeyword`, `keywords`, and `cluster` as inputs.

---

## 4. Conclusion & Architecture Proposal

### 4.1 Component & File Architecture

```
src/
├── lib/
│   └── marketplace/
│       ├── topic-matcher.ts          # Pure logic: Persian normalization & topic detection
│       └── __tests__/
│           └── topic-matcher.test.ts  # Comprehensive Vitest unit tests
├── components/
│   └── marketplace/
│       ├── MarketplaceCrossLink.tsx   # Reusable client component (strip + CTA banner)
│       └── ...
└── app/
    ├── marketplace/
    │   └── page.tsx                   # Updated to ingest `?query=...` search param
    ├── blog/[slug]/
    │   └── BlogPostClient.tsx         # Integrated with <MarketplaceCrossLink post={post} />
    └── wiki/[slug]/                   # (R1) Integrates <MarketplaceCrossLink plantName={...} />
```

---

### 4.2 Detailed Specifications

#### A. Topic Matcher (`src/lib/marketplace/topic-matcher.ts`)

```typescript
export interface MarketplaceTopic {
  id: string
  nameFa: string
  nameEn: string
  searchQuery: string
  synonyms: string[]
  isSpecies: boolean
  headlineFa: string
  descriptionFa: string
  ctaTextFa: string
}

export const MARKETPLACE_PLANT_TOPICS: readonly MarketplaceTopic[] = [
  {
    id: "sansevieria",
    nameFa: "سانسوریا",
    nameEn: "Snake Plant",
    searchQuery: "سانسوریا",
    synonyms: ["سانسوریا", "شمشیری", "snake plant", "sansevieria"],
    isSpecies: true,
    headlineFa: "خرید، فروش و تبادل قلمه و پاجوش سانسوریا",
    descriptionFa: "دنبال قلمه ریشه‌دار یا بوته شاداب سانسوریا ابلق و شمشیری هستید؟ آگهی‌های کاربران جالیز را در بازارچه ببینید.",
    ctaTextFa: "مشاهده آگهی‌های سانسوریا در بازارچه",
  },
  {
    id: "pothos",
    nameFa: "پتوس",
    nameEn: "Pothos",
    searchQuery: "پتوس",
    synonyms: ["پتوس", "پوتوس", "pothos", "epipremnum"],
    isSpecies: true,
    headlineFa: "خرید و تبادل قلمه پتوس سبز، ابلق و نئون",
    descriptionFa: "انواع قلمه‌های ریشه‌دار در آب و گلدان‌های پرپشت پتوس را بدون واسطه از عاشقان گل و گیاه بخرید.",
    ctaTextFa: "مشاهده آگهی‌های پتوس در بازارچه",
  },
  {
    id: "zz-plant",
    nameFa: "زامیفولیا",
    nameEn: "ZZ Plant",
    searchQuery: "زامیفولیا",
    synonyms: ["زامیفولیا", "زاموفیلیا", "zz plant", "zamioculcas"],
    isSpecies: true,
    headlineFa: "خرید و فروش پیاز و ریزوم زامیفولیا بلک و سبز",
    descriptionFa: "پاجوش‌ها و ریزوم‌های سالم زامیفولیا با مقاومت بالا را در بازارچه محلی جالیز پیدا کنید.",
    ctaTextFa: "مشاهده آگهی‌های زامیفولیا در بازارچه",
  },
  {
    id: "monstera",
    nameFa: "برگ انجیری",
    nameEn: "Monstera",
    searchQuery: "برگ انجیری",
    synonyms: ["برگ انجیری", "مونسترا", "monstera"],
    isSpecies: true,
    headlineFa: "خرید و تبادل قلمه و بوته برگ انجیری (مونسترا)",
    descriptionFa: "قلمه‌های ریشه‌هوایی‌دار و برگ‌های شیاردار غول‌پیکر مونسترا را در بازارچه گل و گیاه جالیز جستجو کنید.",
    ctaTextFa: "مشاهده آگهی‌های برگ انجیری در بازارچه",
  },
  {
    id: "ficus",
    nameFa: "فیکوس",
    nameEn: "Ficus",
    searchQuery: "فیکوس",
    synonyms: ["فیکوس", "الاستیکا", "لیراتا", "بنجامین", "ficus"],
    isSpecies: true,
    headlineFa: "خرید و فروش انواع فیکوس لیراتا، الاستیکا و بنجامین",
    descriptionFa: "درختچه‌ها و قلمه‌های زیبا و شاداب فیکوس را مستقیم از گلخانه‌داران و کاربران جالیز تهیه کنید.",
    ctaTextFa: "مشاهده آگهی‌های فیکوس در بازارچه",
  },
  {
    id: "aglaonema",
    nameFa: "آگلونما",
    nameEn: "Aglaonema",
    searchQuery: "آگلونما",
    synonyms: ["آگلونما", "aglaonema"],
    isSpecies: true,
    headlineFa: "خرید و فروش آگلونما برفی، صورتی و سفید",
    descriptionFa: "پاجوش‌ها و گلدان‌های شاداب آگلونما مقاوم به کم‌نوری را در بازارچه گل و گیاه جالیز بیابید.",
    ctaTextFa: "مشاهده آگهی‌های آگلونما در بازارچه",
  },
  {
    id: "yucca",
    nameFa: "یوکا",
    nameEn: "Yucca",
    searchQuery: "یوکا",
    synonyms: ["یوکا", "yucca"],
    isSpecies: true,
    headlineFa: "خرید و تبادل قلمه و نخل یوکا آپارتمانی",
    descriptionFa: "تنه و قلمه‌های مقاوم یوکا را برای فضای منزل یا محیط کار در بازارچه جستجو کنید.",
    ctaTextFa: "مشاهده آگهی‌های یوکا در بازارچه",
  },
  {
    id: "dieffenbachia",
    nameFa: "دیفن باخیا",
    nameEn: "Dieffenbachia",
    searchQuery: "دیفن باخیا",
    synonyms: ["دیفن باخیا", "دیفن‌باخیا", "dieffenbachia"],
    isSpecies: true,
    headlineFa: "خرید و فروش قلمه و بوته دیفن باخیا",
    descriptionFa: "گیاهان پهن‌برگ و قلمه‌های شاداب دیفن باخیا در بازارچه گل و گیاه جالیز.",
    ctaTextFa: "مشاهده آگهی‌های دیفن باخیا در بازارچه",
  },
  {
    id: "schefflera",
    nameFa: "شفلرا",
    nameEn: "Schefflera",
    searchQuery: "شفلرا",
    synonyms: ["شفلرا", "schefflera"],
    isSpecies: true,
    headlineFa: "خرید و تبادل قلمه و درختچه شفلرا ابلق و سبز",
    descriptionFa: "قلمه‌های ریشه‌دار و گلدان‌های چندشاخه شفلرا در بازارچه جالیز.",
    ctaTextFa: "مشاهده آگهی‌های شفلرا در بازارچه",
  },
  {
    id: "peperomia",
    nameFa: "قاشقی",
    nameEn: "Peperomia",
    searchQuery: "قاشقی",
    synonyms: ["قاشقی", "پپرومیا", "peperomia"],
    isSpecies: true,
    headlineFa: "خرید و فروش قلمه و بوته پپرومیا قاشقی",
    descriptionFa: "گیاهان مینیاتوری و برگ‌گوشتی قاشقی ابلق و سبز در بازارچه جالیز.",
    ctaTextFa: "مشاهده آگهی‌های قاشقی در بازارچه",
  },
  {
    id: "spathiphyllum",
    nameFa: "اسپاتی فیلوم",
    nameEn: "Peace Lily",
    searchQuery: "اسپاتی فیلوم",
    synonyms: ["اسپاتی فیلوم", "اسپاتی‌فیلوم", "اسپاتی", "peace lily"],
    isSpecies: true,
    headlineFa: "خرید و تبادل بوته گلدار اسپاتی فیلوم (گل صلح)",
    descriptionFa: "اسپاتی فیلوم تصفیه‌کننده هوا و شاداب با گل‌های سفید را در بازارچه جالیز پیدا کنید.",
    ctaTextFa: "مشاهده آگهی‌های اسپاتی فیلوم در بازارچه",
  },
  // Care & Product Topics
  {
    id: "fertilizer",
    nameFa: "کود و تقویتی",
    nameEn: "Fertilizer",
    searchQuery: "کود",
    synonyms: ["کود", "کوددهی", "فسفر", "آهن", "npk", "fertilizer", "fertiliser"],
    isSpecies: false,
    headlineFa: "خرید انواع کودهای تقویتی، آهن و NPK",
    descriptionFa: "کودهای تخصصی رشد برگ، ریشه‌زایی و اسید هیومیک را بدون واسطه در بازارچه باغبانی جالیز بیابید.",
    ctaTextFa: "مشاهده کودهای گیاهان در بازارچه",
  },
  {
    id: "soil",
    nameFa: "خاک و بستر کشت",
    nameEn: "Soil & Potting Mix",
    searchQuery: "خاک",
    synonyms: ["خاک", "پیت ماس", "پرلیت", "کوکوپیت", "لیکا", "soil", "potting"],
    isSpecies: false,
    headlineFa: "خرید خاک سبک، پرلیت و پیت‌ماس ارگانیک",
    descriptionFa: "بسترهای کشت آماده، پرلیت دانه‌درشت و پوکه معدنی مخصوص گلدان‌های آپارتمانی در بازارچه جالیز.",
    ctaTextFa: "مشاهده خاک و بستر کشت در بازارچه",
  },
  {
    id: "pot",
    nameFa: "گلدان",
    nameEn: "Pots & Planters",
    searchQuery: "گلدان",
    synonyms: ["گلدان", "سفالی", "پلاستیکی", "سرامیکی", "pot", "planter"],
    isSpecies: false,
    headlineFa: "خرید انواع گلدان‌های سفالی، پلاستیکی و تزیینی",
    descriptionFa: "گلدان‌های دارای زهکشی استاندارد، سفال طبیعی و زیرگلدانی مناسب در بازارچه جالیز.",
    ctaTextFa: "مشاهده گلدان‌ها در بازارچه",
  },
  {
    id: "pest-control",
    nameFa: "سم و آفت‌کش",
    nameEn: "Pest Control",
    searchQuery: "سم",
    synonyms: ["سم", "قارچ کش", "قارچ‌کش", "شپشک", "آفت کش", "آفت‌کش", "کنه", "pesticide", "fungicide"],
    isSpecies: false,
    headlineFa: "خرید سموم ارگانیک، آفت‌کش و قارچ‌کش گل و گیاه",
    descriptionFa: "درمان قطعی شپشک آردآلود، کنه تارعنکبوتی و قارچ ریشه با سموم معتبر در بازارچه باغبانی جالیز.",
    ctaTextFa: "مشاهده سموم و آفت‌کش‌ها در بازارچه",
  },
  {
    id: "tools",
    nameFa: "ابزار باغبانی و قیم",
    nameEn: "Garden Tools",
    searchQuery: "ابزار",
    synonyms: ["قیم", "قیم خزه", "قیچی", "بیلچه", "رطوبت سنج", "ابزار", "tool", "shears"],
    isSpecies: false,
    headlineFa: "خرید قیم خزه، قیچی باغبانی و ابزار نگهداری",
    descriptionFa: "ابزارهای هرس، رطوبت‌سنج خاک و قیم‌های خزه‌ای استاندارد برای رشد صعودی گیاهان در بازارچه.",
    ctaTextFa: "مشاهده ابزارهای باغبانی در بازارچه",
  },
] as const
```

#### B. Topic Resolution Engine
```typescript
export function normalizePersian(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u200c\u200b\u200f\u00a0]/g, "")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[ة]/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
}

export function detectMarketplaceTopic(input: {
  title?: string
  slug?: string
  keywords?: string[]
  primaryKeyword?: string
  cluster?: string
  plantName?: string
}): MarketplaceTopic {
  // If an explicit plant name is provided (e.g. from Wiki), prioritize it
  if (input.plantName) {
    const normTarget = normalizePersian(input.plantName)
    const found = MARKETPLACE_PLANT_TOPICS.find(
      (t) => normalizePersian(t.nameFa) === normTarget || t.synonyms.some((s) => normalizePersian(s) === normTarget)
    )
    if (found) return found
    return {
      id: "custom",
      nameFa: input.plantName,
      nameEn: input.plantName,
      searchQuery: input.plantName,
      synonyms: [input.plantName],
      isSpecies: true,
      headlineFa: `خرید، فروش و تبادل قلمه و گیاه ${input.plantName}`,
      descriptionFa: `قلمه‌ها و گلدان‌های شاداب ${input.plantName} را در بازارچه محلی گل و گیاه جالیز جستجو کنید.`,
      ctaTextFa: `مشاهده آگهی‌های ${input.plantName} در بازارچه`,
    }
  }

  const combinedHaystack = normalizePersian(
    [
      input.primaryKeyword ?? "",
      input.title ?? "",
      input.slug ? input.slug.replace(/-/g, " ") : "",
      ...(input.keywords ?? []),
    ].join(" ")
  )

  // 1. Check for species matches first (higher priority for commercial plant trading)
  for (const topic of MARKETPLACE_PLANT_TOPICS.filter((t) => t.isSpecies)) {
    for (const syn of topic.synonyms) {
      if (combinedHaystack.includes(normalizePersian(syn))) {
        return topic
      }
    }
  }

  // 2. Check for care / product matches
  for (const topic of MARKETPLACE_PLANT_TOPICS.filter((t) => !t.isSpecies)) {
    for (const syn of topic.synonyms) {
      if (combinedHaystack.includes(normalizePersian(syn))) {
        return topic
      }
    }
  }

  // 3. Fallback to general marketplace topic
  return {
    id: "general",
    nameFa: "گل و گیاه",
    nameEn: "Plants & Tools",
    searchQuery: "گیاه",
    synonyms: [],
    isSpecies: false,
    headlineFa: "بازارچه خرید، فروش و تبادل گل، گیاه و بذر",
    descriptionFa: "انواع گیاهان خانگی، قلمه، بذر و ادوات باغبانی را بدون واسطه در بازارچه جالیز بخرید یا بفروشید.",
    ctaTextFa: "ورود به بازارچه گل و گیاه جالیز",
  }
}
```

---

#### C. Cross-Link UI Component (`src/components/marketplace/MarketplaceCrossLink.tsx`)
Key features:
1. Calls `useMarketplace({ loadListings: true })`.
2. Filters matching active listings using `list({ query: topic.searchQuery, status: "active" })`.
3. If listings exist: renders a sleek, snap-scrolling carousel of mini listing cards (image, title, formatted price in Toman, link to `/marketplace?open=${listing.id}`).
4. Always renders a high-converting gradient banner with:
   - ShoppingBag / Store icon badge
   - Title: `topic.headlineFa`
   - Description: `topic.descriptionFa`
   - Primary button: `<Link href={`/marketplace?query=${encodeURIComponent(topic.searchQuery)}`}>`
   - Secondary button: `<Link href="/marketplace?action=new">ثبت آگهی رایگان</Link>`
5. Clean, dark-mode-ready styling conforming to Jaliz design:
   - RTL direction support (`dir="rtl"`)
   - Emerald & amber gradient highlights
   - Responsive layout (`flex-col md:flex-row`, smooth hover animations).

---

#### D. Updating `/marketplace/page.tsx` for `?query=` Search Ingestion
Modify `MarketplaceOpenFromQuery` in `src/app/marketplace/page.tsx`:
```tsx
function MarketplaceOpenFromQuery({
  setSelectedId,
  onOpenCreate,
  setSearch,
}: {
  setSelectedId: (id: string) => void
  onOpenCreate: () => void
  setSearch: (query: string) => void
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { get, ready } = useMarketplace()

  useEffect(() => {
    if (!ready) return
    const raw = searchParams.get("open")
    const action = searchParams.get("action")
    const shouldCreate = action === "new" || searchParams.get("create") === "1"
    const queryParam = searchParams.get("query") || searchParams.get("q")

    if (queryParam) {
      setSearch(queryParam)
    }

    if (shouldCreate) {
      onOpenCreate()
    } else if (raw) {
      const openId = decodeURIComponent(raw)
      if (get(openId)) setSelectedId(openId)
    }

    // Clean up modal query params while preserving the search query in URL
    if (raw || shouldCreate) {
      const sp = new URLSearchParams(searchParams.toString())
      sp.delete("open")
      sp.delete("action")
      sp.delete("create")
      const q = sp.toString()
      router.replace(`${pathname}${q ? `?${q}` : ""}`, { scroll: false })
    }
  }, [searchParams, ready, get, router, pathname, setSelectedId, onOpenCreate, setSearch])

  return null
}
```

---

## 5. Verification Method

To independently verify the implementation once executed by worker agents:

1. **Unit Tests**:
   - Run vitest test suite for topic detection:
     `npm test src/lib/marketplace/__tests__/topic-matcher.test.ts`
   - Test that each species post (`نگهداری-سانسوریا`, `نگهداری-پتوس`, `نگهداری-زامیفولیا`, `نگهداری-برگ-انجیری`, `نگهداری-آگلونما`, `نگهداری-یوکا`, `نگهداری-دیفن-باخیا`, `نگهداری-شفلرا`, `نگهداری-پپرومیا`, `نگهداری-اسپاتی-فیلوم`) accurately maps to its expected query.
   - Test that care/tutorial posts map to appropriate product queries (`کود`, `خاک`, `گلدان`, `سم`, `ابزار`).

2. **End-to-End Build & Lint**:
   - `npm run lint` — Must report 0 errors and 0 warnings.
   - `npm run build` — Must compile all static and dynamic pages with 0 TypeScript errors.

3. **In-Browser / Route Verification**:
   - Navigate to `/blog/نگهداری-سانسوریا`:
     - Inspect rendered HTML to confirm `<MarketplaceCrossLink>` appears.
     - Verify link href points to `/marketplace?query=%D8%B3%D8%A7%D9%86%D8%B3%D9%88%D8%B1%DB%8C%D8%A7` (URL encoded "سانسوریا").
   - Click the CTA button:
     - Verify navigation to `/marketplace?query=سانسوریا`.
     - Confirm search input automatically displays `"سانسوریا"`.
     - Confirm listing catalog filters by `"سانسوریا"`.
   - Verify on `/wiki/[slug]` (once R1 lands):
     - Confirm that browsing matching marketplace listings directs to `/marketplace?query=[plantName]`.

4. **Invalidation Conditions**:
   - If `/marketplace?query=...` fails to filter listings on page load.
   - If blog posts fail to display relevant marketplace CTAs or crash when no listings exist.
   - If TypeScript errors arise in `npm run build`.

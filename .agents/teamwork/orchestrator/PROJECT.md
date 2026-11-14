# Project: Jaliz SEO Master Strategy Implementation

## Architecture
Jaliz (Next.js 16 App Router, React 19, TypeScript, Tailwind CSS) SEO expansion:
- **Encyclopedia Subsystem (`/wiki`, `/wiki/[slug]`)**:
  - Static botanical knowledge base in `src/lib/wikiData.ts` with comprehensive care specs, pet safety, common problems, and companion plant data.
  - Directory index page `src/app/wiki/page.tsx` with search, category filtering, responsive Persian typography.
  - Dynamic plant species page `src/app/wiki/[slug]/page.tsx` with SSG (`generateStaticParams`), SEO metadata (`generateMetadata`), and structured data (`Article`, `BreadcrumbList`, `FAQPage`).
  - Direct CTAs: Add to user garden (`/plants/new?name=...`), browse matching marketplace listings (`/marketplace?query=...`), and diagnose leaf diseases with AI (`/plants/diagnose`).
  - Sitemap registration in `src/app/sitemap.ts` and crawler permission in `src/app/robots.ts`.
- **Tutorial Blog HowTo Schema Subsystem**:
  - HowTo detection and schema generator in `src/lib/blogHowTo.ts`.
  - Rich result integration in `src/app/blog/[slug]/page.tsx` adding schema.org `HowTo` to `@graph` for tutorial posts while preserving `Article` schema for non-tutorial posts.
- **Dynamic Blog & Marketplace Cross-Linking Subsystem**:
  - Query parameter ingestion in `src/app/marketplace/page.tsx` (`?query=...` and `?q=...`).
  - Topic and species matcher `src/lib/marketplace/topic-matcher.ts`.
  - Reusable commercial component `src/components/marketplace/MarketplaceCrossLink.tsx` linking species/topics to live listings and direct commercial intent CTAs.
  - Integration into `src/app/blog/[slug]/BlogPostClient.tsx` and `src/app/wiki/[slug]/page.tsx`.
- **CTR Title Optimization**:
  - Polishing blog titles across `src/lib/blogData.ts`, `src/lib/blogPostsNew.ts`, `src/lib/blogPostsSeo.ts`, `src/lib/blogPostsExpansion1.ts`, `src/lib/blogPostsExpansion2.ts` with emojis, brackets, and engaging hooks while keeping all 104 slugs strictly immutable.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Botanical Data Model & Dataset | Complete care specs for 12+ popular species in `src/lib/wikiData.ts` | M1 | R1 |
| 2 | Topic Matcher & Query Handling | Persian species/topic matching engine and marketplace `?query=` support | M1 | R3 |
| 3 | HowTo Schema Extraction Engine | Rule-based parser & schema generator for tutorial articles | M1 | R2 |
| 4 | Encyclopedia Directory (`/wiki`) | Responsive Persian directory with search and category filtering | M2 | R1 |
| 5 | Plant Detail Pages (`/wiki/[slug]`) | Dynamic plant care pages with specs, FAQ, and 3 CTAs | M2 | R1 |
| 6 | Structured Data (JSON-LD) for Wiki | Article + Breadcrumb + FAQPage schema in wiki plant pages | M2 | R1 |
| 7 | SEO Sitemap & Robots Registration | Register `/wiki` and all plant slugs in `sitemap.ts`; verify `robots.ts` | M2 | R1 |
| 8 | Garden Reminder Pre-population | Enable `NewPlantPage` to ingest query params (`?name=...`) for 1-click CTA | M2 | R1 |
| 9 | Blog HowTo JSON-LD Integration | Inject valid HowTo schema into `@graph` in `src/app/blog/[slug]/page.tsx` | M3 | R2 |
| 10 | Reusable Marketplace Cross-Linker | Two-tier commercial component (`MarketplaceCrossLink.tsx`) | M3 | R3 |
| 11 | Blog Marketplace Cross-Linking | Embed dynamic marketplace cross-linking in `BlogPostClient.tsx` | M3 | R3 |
| 12 | Blog Title CTR Optimization | Update display titles with emojis, brackets, and hooks across blog data | M3 | R4 |
| 13 | E2E Testing Suite (Tiers 1-4) | Comprehensive test suite for wiki, HowTo schema, cross-linking, titles | M-E2E / M4 | Verification |
| 14 | Adversarial Hardening (Tier 5) & Audit | White-box stress testing, linting, build check, and forensic audit | M4 | Verification |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Engines & Data Layer | `src/lib/wikiData.ts`, `src/lib/blogHowTo.ts`, `src/lib/marketplace/topic-matcher.ts`, and marketplace query param handling in `src/app/marketplace/page.tsx` | Survey complete | PLANNED |
| M2 | Programmatic Encyclopedia & Routing | `src/app/wiki/page.tsx`, `src/app/wiki/[slug]/page.tsx`, CTAs, `src/app/sitemap.ts`, `src/app/plants/new/page.tsx` prefill | M1 | PLANNED |
| M3 | Blog Enhancements & Cross-Linking | Blog HowTo schema in `src/app/blog/[slug]/page.tsx`, `MarketplaceCrossLink.tsx` in `BlogPostClient.tsx`, and CTR title updates | M1 | PLANNED |
| M4 | Final Acceptance Gate & Verification | Pass 100% E2E tests (Tiers 1-4), Adversarial hardening (Tier 5), Reviewers APPROVE, Challengers APPROVE, Forensic Auditor CLEAN, `npm run build` & `npm run lint` pass | M1, M2, M3 | PLANNED |

## Interface Contracts
### `src/lib/wikiData.ts`
```typescript
export interface WikiPlant {
  slug: string
  nameFa: string
  nameEn: string
  scientificName: string
  family: string
  origin: string
  description: string
  coverImage: string
  care: {
    light: { level: string; description: string; windowPlacement: string }
    watering: { schedule: string; description: string; defaultIntervalDays: number }
    temperature: { range: string; minCelsius: number; maxCelsius: number; frostTolerance: boolean }
    soil: { type: string; description: string; drainageTips: string }
    petSafety: { isToxic: boolean; warningFa: string; toxicPrinciples?: string }
    commonProblems: Array<{
      problemFa: string
      causeFa: string
      solutionFa: string
      severity: "low" | "medium" | "high"
    }>
  }
  tags: string[]
  difficulty: "آسان" | "متوسط" | "سخت"
  growthRate: "آرام" | "متوسط" | "سریع"
}

export function getAllWikiPlants(): WikiPlant[]
export function getWikiPlantBySlug(slug: string): WikiPlant | undefined
```

### `src/lib/blogHowTo.ts`
```typescript
export interface HowToStepSchema {
  "@type": "HowToStep"
  name: string
  text: string
  position: number
  url?: string
}

export interface HowToSchema {
  "@type": "HowTo"
  name: string
  description: string
  inLanguage: string
  step: HowToStepSchema[]
  supply?: Array<{ "@type": "HowToSupply"; name: string }>
  tool?: Array<{ "@type": "HowToTool"; name: string }>
}

export function isTutorialPost(post: BlogPost): boolean
export function generateHowToSchema(post: BlogPost, canonicalUrl: string): HowToSchema | null
```

### `src/lib/marketplace/topic-matcher.ts`
```typescript
export interface MarketplaceMatchResult {
  query: string
  titleFa: string
  descriptionFa: string
  speciesMatch?: string
  careTopicMatch?: string
}

export function resolveMarketplaceTopic(input: {
  title?: string
  slug?: string
  keywords?: string[]
  category?: string
  content?: string
}): MarketplaceMatchResult
```

## Code Layout
- Data Models & Engines:
  - `src/lib/wikiData.ts`
  - `src/lib/blogHowTo.ts`
  - `src/lib/marketplace/topic-matcher.ts`
- UI Pages & Components:
  - `src/app/wiki/page.tsx`
  - `src/app/wiki/[slug]/page.tsx`
  - `src/components/marketplace/MarketplaceCrossLink.tsx`
  - `src/app/marketplace/page.tsx` (query param parsing)
  - `src/app/plants/new/page.tsx` (query param pre-fill)
  - `src/app/blog/[slug]/page.tsx` (HowTo schema injection)
  - `src/app/blog/[slug]/BlogPostClient.tsx` (MarketplaceCrossLink integration)
  - `src/app/sitemap.ts` (wiki routes registration)
- Blog Data (Title CTR Optimization):
  - `src/lib/blogData.ts`
  - `src/lib/blogPostsNew.ts`
  - `src/lib/blogPostsSeo.ts`
  - `src/lib/blogPostsExpansion1.ts`
  - `src/lib/blogPostsExpansion2.ts`

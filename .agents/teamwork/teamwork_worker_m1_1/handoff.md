# Milestone 1: Core Engines & Data Layer — Handoff Report

## 1. Observation
- **`src/lib/wikiData.ts`**:
  - Implemented complete botanical data model matching `PROJECT.md` interface contract: `WikiPlant`, `WikiPlantCare`, `WikiPlantCareProblem`.
  - Populated comprehensive botanical care specifications, taxonomy, origin, pet toxicity, and diagnostic troubleshooting data for all 12 requested popular houseplants:
    1. سانسوریا (`Dracaena trifasciata` / Sansevieria)
    2. پتوس (`Epipremnum aureum` / Pothos)
    3. زامیفولیا (`Zamioculcas zamiifolia` / ZZ Plant)
    4. برگ انجیری (`Monstera deliciosa` / Swiss Cheese Plant)
    5. فیکوس الاستیکا (`Ficus elastica` / Rubber Plant)
    6. آگلونما (`Aglaonema commutatum` / Chinese Evergreen)
    7. یوکا (`Yucca gigantea` / Spineless Yucca)
    8. دیفن باخیا (`Dieffenbachia seguine` / Dumb Cane)
    9. شفلرا (`Schefflera arboricola` / Umbrella Tree)
    10. کالانکوئه (`Kalanchoe blossfeldiana`)
    11. قاشقی (`Peperomia magnoliifolia` / Spoon Plant)
    12. اسپاتی فیلوم (`Spathiphyllum wallisii` / Peace Lily)
    - Plus companion species: فیکوس لیراتا (`Ficus lyrata`), گندمی (`Chlorophytum comosum`), and برگ عبایی (`Aspidistra elatior`). Total: 15 complete plant records.
  - Implemented and exported query helpers: `getAllWikiPlants()`, `getWikiPlantBySlug(slug: string)`, `getPopularWikiPlants()`, `getWikiPlantsByCategory(category: string)`, `searchWikiPlants(query: string)`, and `getRelatedWikiPlants(plant: WikiPlant, limit?: number)`.
  - Resilient slug matching handles Persian slugs, English slugs, alternate slugs, URL-encoded slugs, and returns `undefined` for empty or non-existent slugs.

- **`src/lib/blogHowTo.ts`**:
  - Implemented `isTutorialPost(post: BlogPost): boolean`: Detects tutorial guides based on `cluster === "tutorial"`, tutorial categories (`"آموزش‌های کاربردی"`, `"آموزش‌ها"`, `"tutorials"`), tutorial slugs (`"تکثیر-"`, `"ساخت-"`, `"ترکیب-خاک-"`, `"تعویض-گلدان"`), tutorial title hooks, and step-indicator patterns.
  - Implemented `generateHowToSchema(post: BlogPost, canonicalUrl: string): HowToSchema | null`: Parses procedural steps from `<ol><li>` elements and `<h2>` procedural sections, extracts optional supplies (`HowToSupply`) and tools (`HowToTool`), and generates valid Schema.org `HowTo` JSON-LD schema with 1-based positions and step URLs. Returns `null` cleanly for non-tutorial posts without throwing.

- **`src/lib/marketplace/topic-matcher.ts`**:
  - Implemented `normalizePersianText(text: string): string`: Normalizes Arabic characters (`ي`, `ك`, `ة`, `أ`, `إ`, `آ`, `ؤ`, `ئ`) to Persian equivalents, strips diacritics/tanwin/vowels, converts zero-width non-joiner (`\u200c`) and punctuation to spaces, and collapses whitespace.
  - Implemented `resolveMarketplaceTopic(input)`: Evaluates titles, slugs, keywords, categories, and content against 19 species definitions and 7 care topics. Accurately disambiguates pests from species (e.g. `کنه تار عنکبوتی` maps to `سم و آفت کش` rather than `گندمی`). Returns structured `MarketplaceMatchResult` with localized Persian titles and descriptions.

- **`src/app/marketplace/page.tsx`**:
  - Updated `MarketplaceOpenFromQuery` to accept `setSearch: (query: string) => void`.
  - In `useEffect`, reads `searchParams.get("query") || searchParams.get("q")` and synchronizes non-empty values into the `search` input state on initial load.
  - Wired `setSearch={setSearch}` into `<MarketplaceOpenFromQuery>` inside `<Suspense fallback={null}>`.

- **Verification Results**:
  - `npx tsc --noEmit`: Exited with code 0 (zero TypeScript errors).
  - `npx vitest run src/lib/__tests__/wiki-data.test.ts src/lib/__tests__/blog-how-to.test.ts src/lib/__tests__/topic-matcher.test.ts`: 3 test suites passed, 37/37 tests passed (0 failures).
  - `npx eslint src/lib/wikiData.ts src/lib/blogHowTo.ts src/lib/marketplace/topic-matcher.ts src/app/marketplace/page.tsx`: 0 errors on modified/created files.

## 2. Logic Chain
1. *Requirement R1 & DISPATCH § 1*: A programmatic encyclopedia requires rich botanical data with structured care attributes (light, watering, temperature, soil, pet toxicity, common problems) for at least 12 popular houseplants. Observation confirms 15 detailed species records populated in `src/lib/wikiData.ts` with authentic Persian descriptions and scientific nomenclature.
2. *Requirement R2 & DISPATCH § 2*: Tutorial blog posts require rich Schema.org `HowTo` structured data with ordered steps while preserving standard article schema for non-tutorial posts. Observation confirms `isTutorialPost()` accurately identifies tutorial articles, and `generateHowToSchema()` extracts steps and supplies/tools into schema conforming to Google rich snippet standards, returning `null` for non-tutorial articles.
3. *Requirement R3 & DISPATCH § 3*: Commercial cross-linking requires mapping botanical keywords to marketplace search queries. Persian text often contains half-space `\u200c` and Arabic variants of letters. Observation confirms `normalizePersianText()` handles these variants, and `resolveMarketplaceTopic()` resolves both species and care supplies with high precision.
4. *DISPATCH § 4*: Direct CTAs from wiki and blog pages link to `/marketplace?query=...`. Observation confirms `MarketplaceOpenFromQuery` reads `query` or `q` parameters and updates the search state, driving instant marketplace filtering for user queries.

## 3. Caveats
- Plant images in `src/lib/wikiData.ts` reference standard asset paths (`/images/wiki/[slug].jpg`). UI components consuming these paths should provide graceful fallback icons (e.g. Lucide `Sprout` / `Leaf`) in case individual image files are added incrementally.
- Non-M1 files (`src/lib/__tests__/mascot.test.ts` pre-existing test issues and external linting warnings across older files) were intentionally left untouched in accordance with write ownership rules.

## 4. Conclusion
Milestone 1 is complete. All 4 core deliverables (`src/lib/wikiData.ts`, `src/lib/blogHowTo.ts`, `src/lib/marketplace/topic-matcher.ts`, and `src/app/marketplace/page.tsx`) have been genuinely implemented with zero shortcuts or stubs. The codebase compiles cleanly (`tsc --noEmit` code 0) and passes 100% of the associated verification test suite (37/37 passing).

## 5. Verification Method
Run the following commands in `/Users/sotoon/personal/jaliz`:
```bash
# 1. Type check
npx tsc --noEmit

# 2. Run unit tests for M1 deliverables
npx vitest run src/lib/__tests__/wiki-data.test.ts src/lib/__tests__/blog-how-to.test.ts src/lib/__tests__/topic-matcher.test.ts

# 3. Lint check on modified files
npx eslint src/lib/wikiData.ts src/lib/blogHowTo.ts src/lib/marketplace/topic-matcher.ts src/app/marketplace/page.tsx
```
Invalidation conditions:
- Any TypeScript error emitted by `npx tsc --noEmit`.
- Any test failure in `wiki-data.test.ts`, `blog-how-to.test.ts`, or `topic-matcher.test.ts`.
- Non-existent plants or missing care attributes in `getAllWikiPlants()`.

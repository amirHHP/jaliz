# Jaliz SEO Master Strategy — Testing Infrastructure (Tiers 1-4)

This document details the automated testing infrastructure created for the **Jaliz SEO Master Strategy Implementation**, satisfying user requirements **R1–R4** and interface contracts established in `PROJECT.md` and `ORIGINAL_REQUEST.md`.

---

## 1. Architectural Overview & Test Philosophy

The test infrastructure provides opaque-box, contract-driven, non-facade test suites located under `src/lib/__tests__/`. It enforces rigorous end-to-end coverage across all botanical encyclopedia data models, Schema.org HowTo generators, marketplace topic matchers, CTR title enhancements, and search engine crawlers.

```
┌────────────────────────────────────────────────────────────────────────┐
│            Jaliz SEO Master Strategy Testing Infrastructure            │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Test Suite                       │ Scope & Interface Contract          │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 1. `wiki-data.test.ts`           │ Botanical encyclopedia data model,  │
│    (14 tests, Tiers 1–4)         │ 12+ required species, care specs,   │
│                                  │ pet safety, and common problems     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 2. `blog-how-to.test.ts`         │ Tutorial article detection,         │
│    (10 tests, Tiers 1–4)         │ Schema.org HowTo JSON-LD generator, │
│                                  │ non-tutorial safe null fallback     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 3. `topic-matcher.test.ts`       │ Persian species & care topic engine,│
│    (13 tests, Tiers 1–4)         │ zero-width non-joiner & Arabic norm,│
│                                  │ marketplace search query synthesis  │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 4. `blog-titles-ctr.test.ts`     │ 104 frozen slugs (zero route break),│
│    (10 tests, Tiers 1–4)         │ CTR enhancements (emojis, brackets, │
│                                  │ hooks), primary keyword preservation│
├──────────────────────────────────┼─────────────────────────────────────┤
│ 5. `seo-sitemap-routes.test.ts`  │ `/wiki` encyclopedia & plant slugs  │
│    (8 tests, Tiers 1–4)          │ sitemap registration, robots.txt    │
│                                  │ crawl permissions, URL deduplication│
└──────────────────────────────────┴─────────────────────────────────────┘
```

Total: **55 comprehensive test cases** spanning Tiers 1 through 4.

---

## 2. Test Suites Specification

### 1. Botanical Encyclopedia Data (`src/lib/__tests__/wiki-data.test.ts`)
- **Target Module**: `src/lib/wikiData.ts`
- **Tiers Covered**:
  - **Tier 1 (Core Inventory & Retrieval)**: Validates `getAllWikiPlants()` returns >= 12 plants, ensures all 12 authoritative species from R1 exist (سانسوریا، پتوس، زامیفولیا، برگ انجیری، فیکوس، آگلونما، یوکا، دیفن باخیا، شفلرا، کالانکوئه، قاشقی، اسپاتی فیلوم), guarantees 100% unique URL-safe slugs, and tests `getPopularWikiPlants()`.
  - **Tier 2 (Care Specifications Schema Integrity)**: Enforces strict typing and presence of `light` (level, description, windowPlacement), `watering` (schedule, description, defaultIntervalDays > 0), `temperature` (range, minCelsius, maxCelsius, frostTolerance), `soil` (type, description, drainageTips), `petSafety` (isToxic boolean, warningFa), and `commonProblems` (array >= 2, problemFa, causeFa, solutionFa, severity).
  - **Tier 3 (Boundary & Resilience Testing)**: Graceful `undefined` return on nonexistent slugs, empty strings, and whitespace strings. Safe handling of URL-encoded slugs (`encodeURIComponent`) and empty array return on nonexistent categories.
  - **Tier 4 (Botanical Accuracy & Persian Localization)**: Disallows placeholder tokens (`[TBD]`, `undefined`, `NaN`). Validates toxicological accuracy for high-risk plants (Dieffenbachia) and physical realism of watering intervals (ZZ drought resistance vs Peace Lily moisture requirements).

### 2. Blog HowTo Schema (`src/lib/__tests__/blog-how-to.test.ts`)
- **Target Module**: `src/lib/blogHowTo.ts`
- **Tiers Covered**:
  - **Tier 1 (Tutorial Post Classification)**: Correctly identifies tutorial posts by cluster (`"tutorial"`), category (`"آموزش‌های کاربردی"`, `"tutorials"`), tags, and procedural content. Correctly rejects non-tutorial posts (care overviews, species showcases).
  - **Tier 2 (HowTo JSON-LD Structure)**: Verifies Schema.org specification conformance (`@type: "HowTo"`, `name`, `description`, `inLanguage`, sequential 1-based `position` integers for `HowToStep` items). Verifies optional supplies and tools extraction.
  - **Tier 3 (Exception Immunity & Safe Fallbacks)**: Guarantees non-tutorial articles return `null` without throwing. Handles malformed or empty content strings safely.
  - **Tier 4 (Adversarial HTML Sanitization)**: Strips raw HTML markup, bold tags, and dangerous `<script>` tags from step names and descriptions. Ensures gapless sequential numbering.

### 3. Marketplace Topic Matcher (`src/lib/__tests__/topic-matcher.test.ts`)
- **Target Module**: `src/lib/marketplace/topic-matcher.ts`
- **Tiers Covered**:
  - **Tier 1 (Species Keyword Extraction)**: Matches exact Persian species names (سانسوریا, پتوس, زامیفولیا, برگ انجیری, فیکوس, آگلونما, یوکا, دیفن باخیا, شفلرا, کالانکوئه, قاشقی, اسپاتی فیلوم) across titles, slugs, and keywords. Populates engaging commercial titleFa and descriptionFa.
  - **Tier 2 (Care Topics & Supplies Matching)**: Maps care subjects to marketplace queries: soil/substrates (`خاک`), fertilizers (`کود`), pest control/fungicides (`سم`), moss poles (`قیم`), and pots (`گلدان`).
  - **Tier 3 (Persian Normalization & Character Resilience)**: Seamlessly normalizes zero-width non-joiners (`\u200c`), Arabic `ي` to Persian `ی`, Arabic `ك` to Persian `ک`, and strips punctuation and noisy hashtags.
  - **Tier 4 (Robust Fallbacks & Contract Guarantees)**: Returns a sensible general houseplant marketplace query when input is empty or non-botanical without throwing. Prioritizes specific plant species over generic accessories.

### 4. Blog Titles CTR & Route Stability (`src/lib/__tests__/blog-titles-ctr.test.ts`)
- **Target Modules**: `src/lib/blogData.ts`, `src/lib/blogPostsNew.ts`, `src/lib/blogPostsSeo.ts`, `src/lib/blogPostsExpansion1.ts`, `src/lib/blogPostsExpansion2.ts`
- **Tiers Covered**:
  - **Tier 1 (Frozen Slug Invariance & Zero Route Breakage)**: Strictly verifies all 104 slugs remain frozen and unchanged, guarantees 0% duplicate slugs, and preserves bilingual `alternateSlug` pairings.
  - **Tier 2 (Title Integrity & Bracket Balancing)**: Enforces character limits (10–120 chars) and validates that Unicode full-width brackets (`【...】`), square brackets (`[...]`), and parentheses are strictly balanced and closed. Disallows unrendered template markers.
  - **Tier 3 (CTR Optimization & Hooks)**: Verifies presence of CTR enhancement elements (emojis like 🪴, 🌱, 🌿, 💧, ✂️; brackets `【...】`; and compelling Persian action hooks like "راهنمای جامع", "علت", "روش طلایی", "تضمینی").
  - **Tier 4 (Topical Relevancy & Keyword Preservation)**: Guarantees titles retain primary keywords and essential topic terms, preventing clickbait drift.

### 5. SEO Sitemap & Robots Registration (`src/lib/__tests__/seo-sitemap-routes.test.ts`)
- **Target Modules**: `src/app/sitemap.ts`, `src/app/robots.ts`
- **Tiers Covered**:
  - **Tier 1 (Static Route Inclusion)**: Verifies `sitemap()` includes the `/wiki` encyclopedia index with search priority >= 0.8 and valid changeFrequency. Preserves existing static routes.
  - **Tier 2 (Dynamic Plant Routes)**: Verifies `sitemap()` includes dynamic entries for every plant slug from `getAllWikiPlants()` with priority >= 0.7.
  - **Tier 3 (Robots.txt Crawl Directives)**: Verifies `robots()` does NOT disallow `/wiki` or `/wiki/`, and confirms `sitemap.xml` is registered.
  - **Tier 4 (URL Sanity & Deduplication)**: Guarantees zero duplicate URLs across the sitemap and prevents double slashes in paths.

---

## 3. Progressive Testability & TDD Status Matrix

| Test Suite | Total Tests | M1 Status | Downstream Target Milestone |
|------------|-------------|-----------|-----------------------------|
| `wiki-data.test.ts` | 14 | ✅ 14 PASSED | M1 Complete |
| `blog-how-to.test.ts` | 10 | ✅ 10 PASSED | M1 Complete |
| `topic-matcher.test.ts` | 13 | ✅ 13 PASSED | M1 Complete |
| `blog-titles-ctr.test.ts` | 10 | 🟡 9 Passed / 1 RED | M3 (CTR Title Polish) |
| `seo-sitemap-routes.test.ts` | 8 | 🟡 6 Passed / 2 RED | M2 (Sitemap Registration) |
| **Total** | **55** | **52 Passed / 3 RED** | **Full Green in M2 & M3** |

---

## 4. How to Execute Tests

To run the full E2E SEO test suite:
```bash
npx vitest run src/lib/__tests__/wiki-data.test.ts src/lib/__tests__/blog-how-to.test.ts src/lib/__tests__/topic-matcher.test.ts src/lib/__tests__/blog-titles-ctr.test.ts src/lib/__tests__/seo-sitemap-routes.test.ts
```

To run individual test suites:
```bash
npx vitest run src/lib/__tests__/wiki-data.test.ts
npx vitest run src/lib/__tests__/blog-how-to.test.ts
npx vitest run src/lib/__tests__/topic-matcher.test.ts
npx vitest run src/lib/__tests__/blog-titles-ctr.test.ts
npx vitest run src/lib/__tests__/seo-sitemap-routes.test.ts
```

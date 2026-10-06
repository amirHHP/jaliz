# Jaliz Blog Expansion — Testing & Validation Infrastructure

This document details the automated validation infrastructure and test suite created for the **Jaliz Blog Expansion** project (50 Persian SEO articles). It covers architectural design, validation rules, runner instructions, and testing tiers satisfying Acceptance Criteria **R1–R4**.

---

## 1. Architectural Overview

The testing infrastructure operates on two synchronized layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Jaliz Blog Validation Infrastructure                 │
├──────────────────────────────────┬─────────────────────────────────────┤
│ 1. Standalone CLI Validator       │ 2. Vitest 4-Tier Test Suite         │
│    `scripts/validate-blog.mjs`    │    `src/lib/__tests__/blogExpansion.test.ts`│
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Fast Node.js / jiti execution  │ • Deep Vitest integration           │
│ • Acceptance criteria gatekeeper │ • 19 structured unit/integration tests│
│ • Strict & Progressive modes     │ • Boundary, edge-case & link audits │
│ • Exit code 0/1 for CI/CD gates  │ • Continuous watcher & coverage ready│
└──────────────────────────────────┴─────────────────────────────────────┘
```

Both layers validate data directly from `src/lib/blogData.ts`, testing both the aggregated `blogPosts: BlogPost[]` array and the individual batch modules (`blogPostsExpansion1.ts`, `blogPostsExpansion2.ts`, and legacy articles).

---

## 2. Standalone Validator (`scripts/validate-blog.mjs`)

The standalone validator is an executable Node.js tool using `jiti` to dynamically load and inspect TypeScript modules in memory without pre-compilation.

### Command-Line Usage

```bash
# Strict Mode (Final gatekeeper: exits with 1 if total expansion < 50)
node scripts/validate-blog.mjs

# Progressive Mode (Permits partial expansion count while strictly auditing populated posts)
node scripts/validate-blog.mjs --allow-partial

# JSON Reporting Mode (Outputs structured machine-readable JSON)
node scripts/validate-blog.mjs --json

# Combined Progressive JSON
node scripts/validate-blog.mjs --allow-partial --json
```

### Enforced Quality & SEO Checks

| Check # | Category | Description | Acceptance Criteria |
|---|---|---|---|
| 1 | **Article Count** | Verifies 50 expansion posts (25 Batch 1 + 25 Batch 2) and total 104 blog posts. | R1, R4 |
| 2 | **Slug Format & Uniqueness** | Enforces Persian kebab-case regex `/^[\u0600-\u06FF0-9a-zA-Z]+(-[\u0600-\u06FF0-9a-zA-Z]+)*$/`, 0% collision with 27 legacy Persian articles, 0% internal collision. | R1, R3 |
| 3 | **Anti-Cannibalization** | Enforces zero duplicate primary keywords across all Persian articles using normalized text comparison (half-spaces, Arabic Yeh/Kaf). | R1, R4 |
| 4 | **Meta Description** | Enforces `description.trim().length <= 160` and `description.trim().length >= 20`. | R2 |
| 5 | **Category & Cluster** | Enforces `categoryEn` is strictly `"care" | "plants" | "tutorials"` and `cluster` is one of 7 valid `BlogCluster` types. | R2, R3 |
| 6 | **Reading Time** | Enforces non-empty Persian reading time containing `"دقیقه"`. | R2 |
| 7 | **Keywords Diversity** | Enforces `keywords` array has >= 4 non-empty string items. | R2 |
| 8 | **Content Quality** | Enforces stripped text length > 1500 chars, `<h2>` tags, `<ul>`/`<ol>` lists, and natural Jaliz CTAs (`/plants/diagnose`, `/schedule`, `/marketplace`). | R2, R3 |
| 9 | **FAQ Schema Quality** | Enforces `faqs.length >= 2`, each question >= 5 chars, each answer >= 10 chars. | R2 |
| 10 | **Internal Linking Network** | Scans all `<a href="/blog/...">` tags across all articles; guarantees zero broken links and flags self-referential links. | R3, R4 |
| 11 | **Metadata & ISO Dates** | Validates `lang === "fa"`, ISO 8601 date format `YYYY-MM-DD`, icons, gradients, and author fields. | R2 |

---

## 3. Vitest 4-Tier Test Suite (`src/lib/__tests__/blogExpansion.test.ts`)

The Vitest test suite is structured into 4 distinct verification tiers:

### Tier 1: Feature Coverage
- **Population Status**: Reports progressive expansion progress (M2 -> M3 -> M4 -> M5) and validates expected batch counts.
- **Baseline Preservation**: Verifies all 27 legacy Persian articles (and 27 English counterparts) remain intact and untouched.
- **Schema & Type Conformance**: Confirms all populated posts satisfy the `BlogPost` TypeScript interface contract with non-null required fields.

### Tier 2: Boundary & Corner Cases
- **Meta Description Boundary**: Asserts description length is within 20 to 160 characters.
- **FAQ Count Boundary**: Asserts every article has at least 2 FAQs, validating question and answer min lengths.
- **Content Length Boundary**: Strips HTML tags and asserts text length strictly exceeds 1500 characters.
- **Semantic Structure**: Asserts presence of `<h2>` subheadings and ordered/unordered lists.
- **Date & Format Boundaries**: Asserts valid ISO 8601 calendar dates (`YYYY-MM-DD`) and valid reading time strings.
- **Keyword Array Boundary**: Asserts `keywords.length >= 4`.

### Tier 3: Cross-Feature & Uniqueness Integrity
- **Global Slug Uniqueness**: Asserts 0 duplicate slugs across all 104 articles in `blogPosts`.
- **Persian Slug Syntax**: Validates all expansion slugs against kebab-case regex without illegal URL characters.
- **Zero Keyword Cannibalization**: Cross-references every expansion primary keyword against the 27 legacy Persian articles (0% overlap).
- **Expansion Keyword Uniqueness**: Asserts 0 duplicate primary keywords among expansion articles.
- **Planned Inventory Alignment**: Verifies that the authoritative 50-article inventory defined in `PROJECT.md` has 0% collision with legacy articles and contains 50 unique planned slugs and keywords.

### Tier 4: Real-world Linkage & Navigation
- **Zero Broken Links**: Parses all `<a href="/blog/...">` links across the entire blog; asserts 100% of target slugs resolve to existing articles.
- **Conversion Funnels (CTAs)**: Confirms that every expansion article features at least one organic conversion CTA linking to Jaliz tools:
  - `/plants/diagnose` (AI Plant Disease Diagnosis)
  - `/schedule` (Watering & Care Reminders)
  - `/marketplace` (Plant & Gardening Marketplace)
- **No Self-Links**: Prevents internal circular links pointing from an article to itself.

---

## 4. Progressive Testability & Milestone Lifecycle

To prevent intermediate milestones (M2, M3, M4) from blocking CI builds while content is being authored, tests implement **Progressive Testability**:

1. **Milestone M2 (Now)**:
   - Expansion arrays are empty (`0/50`).
   - The test suite reports current status gracefully via `console.info` while executing baseline audits and inventory validation (19 tests pass).
   - `node scripts/validate-blog.mjs --allow-partial` passes with exit code 0.
   - `node scripts/validate-blog.mjs` (strict) exits with code 1 indicating content production pending.

2. **Milestone M3 (Batch 1: Articles 1–25)**:
   - `expansionPosts1.ts` populated with 25 articles.
   - All 25 articles are immediately audited across all 4 tiers.
   - Validator reports 25/50 loaded.

3. **Milestone M4 (Batch 2: Articles 26–50)**:
   - `expansionPosts2.ts` populated with 25 articles.
   - All 50 articles audited.

4. **Milestone M5 (Final Integration Gate)**:
   - Both `node scripts/validate-blog.mjs` and `npm test` require 100% pass rate in strict mode with all 50 expansion articles (104 total articles).

---

## 5. Verification Commands

```bash
# 1. Run Vitest blog expansion suite
npx vitest run src/lib/__tests__/blogExpansion.test.ts

# 2. Run all blog tests (legacy + expansion)
npx vitest run src/lib/__tests__/blogData.test.ts src/lib/__tests__/blogExpansion.test.ts

# 3. Run validation script in progressive mode (for intermediate development)
node scripts/validate-blog.mjs --allow-partial

# 4. Run validation script in strict mode (for final milestone verification)
node scripts/validate-blog.mjs

# 5. Type-checking verification
npx tsc --noEmit
```

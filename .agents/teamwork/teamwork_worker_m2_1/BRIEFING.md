# BRIEFING — 2026-11-13T21:15:00Z

## Mission
Implement Milestone 2: Programmatic Houseplant Encyclopedia directory under `/wiki`, dynamic pages `/wiki/[slug]`, JSON-LD structured data, 3 CTAs, garden reminder pre-population in `src/app/plants/new/page.tsx`, and sitemap registration in `src/app/sitemap.ts`.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m2_1
- Original parent: eed6eb13-3f90-4d26-9c91-172933d897e5
- Milestone: milestone_2 (Programmatic Encyclopedia UI & Routing)

## 🔒 Key Constraints
- DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task.
- Exclusive write ownership:
  - `src/app/wiki/page.tsx` (create)
  - `src/app/wiki/WikiIndexClient.tsx` (create)
  - `src/app/wiki/[slug]/page.tsx` (create)
  - `src/app/wiki/__tests__/wiki-pages.test.ts` (create)
  - `src/app/plants/new/page.tsx` (edit query prefill)
  - `src/app/sitemap.ts` (edit)
- DO NOT modify blog data files or HowTo schema files.
- All vitest tests (`src/lib/__tests__/seo-sitemap-routes.test.ts`, `src/app/wiki/__tests__/wiki-pages.test.ts`) and `npx tsc --noEmit` must pass with 0 regressions.

## Current Parent
- Conversation ID: eed6eb13-3f90-4d26-9c91-172933d897e5
- Updated: 2026-11-13T21:15:00Z

## Task Summary
- **What to build**:
  1. `/wiki` directory index page (`src/app/wiki/page.tsx` & `src/app/wiki/WikiIndexClient.tsx`) with search, 5 category filters, responsive Persian typography, and SEO metadata.
  2. `/wiki/[slug]` dynamic plant pages (`src/app/wiki/[slug]/page.tsx`) with SSG (`generateStaticParams`), metadata (`generateMetadata`), Article + BreadcrumbList + FAQPage JSON-LD schemas, care specifications (Light, Watering, Temperature, Soil, Pet Safety, Common Problems), 3 CTAs, related plants, and related blog links.
  3. Pre-fill plant draft in `src/app/plants/new/page.tsx` from `useSearchParams` (`name`, `interval`, `light`, `type`) wrapped in Suspense with automatic transition to step 2.
  4. Sitemap registration in `src/app/sitemap.ts` (`/wiki` and all plant slugs).
  5. Verify `robots.ts` allows `/wiki`.
- **Success criteria**:
  - `npx vitest run src/lib/__tests__/seo-sitemap-routes.test.ts` passes 100%.
  - `npx vitest run src/app/wiki/__tests__/wiki-pages.test.ts` passes 100%.
  - `npx tsc --noEmit` completes with 0 errors.

## Key Decisions Made
- Used Next.js client component pattern (`WikiIndexClient.tsx`) with server component wrapper (`page.tsx`) for `/wiki` to ensure static metadata generation for SEO while maintaining interactive search and client-side filtering.
- Implemented `@graph` JSON-LD schema on `/wiki/[slug]` with `Article`, `BreadcrumbList`, and `FAQPage` (dynamically derived from `plant.care.commonProblems`).
- Wrapped `NewPlantContent` in `<Suspense>` in `src/app/plants/new/page.tsx` and mapped incoming `light`, `interval`, and `name` parameters, pre-setting step to 2 when plant is specified.
- Registered `/wiki` (priority 0.9, weekly) and all plant slugs (priority 0.8, weekly) in `src/app/sitemap.ts`.

## Change Tracker
- **Files modified**:
  - `src/app/wiki/page.tsx` — Encyclopedia index Server Component with metadata
  - `src/app/wiki/WikiIndexClient.tsx` — Interactive encyclopedia client with search and category filters
  - `src/app/wiki/[slug]/page.tsx` — Dynamic plant care guide with 6 care cards, JSON-LD, 3 CTAs
  - `src/app/wiki/__tests__/wiki-pages.test.ts` — Tests for metadata, static params, and CTA bindings
  - `src/app/plants/new/page.tsx` — Suspense-wrapped query parameter pre-fill for garden reminder CTA
  - `src/app/sitemap.ts` — Registered `/wiki` and dynamic plant encyclopedia pages
- **Build status**: PASS (`tsc --noEmit` exit code 0)
- **Pending issues**: none

## Quality Status
- **Build/test result**: PASS (13/13 vitest tests passing in target suites, tsc exit code 0)
- **Lint status**: clean (0 errors in `src/app/wiki` and `src/app/sitemap.ts`)
- **Tests added/modified**: `src/app/wiki/__tests__/wiki-pages.test.ts` (5 tests added)

## Loaded Skills
- None

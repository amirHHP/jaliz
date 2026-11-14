# Handoff Report: Milestone 2 — Programmatic Houseplant Encyclopedia UI & Routing

## 1. Observation
1. **Initial Sitemap Test Failure**:
   Running `npx vitest run src/lib/__tests__/seo-sitemap-routes.test.ts` initially resulted in 2 test failures:
   ```
   FAIL src/lib/__tests__/seo-sitemap-routes.test.ts > SEO Sitemap & Robots Registration (Tiers 1-4) > Tier 1: Static Route Inclusion > includes /wiki encyclopedia root in sitemap entries
   AssertionError: Sitemap must contain entry for encyclopedia index: https://jalizapp.ir/wiki: expected undefined to be defined

   FAIL src/lib/__tests__/seo-sitemap-routes.test.ts > SEO Sitemap & Robots Registration (Tiers 1-4) > Tier 2: Plant Species Detail Routes > includes every plant slug from getAllWikiPlants() in the sitemap
   AssertionError: Sitemap missing entry for plant: سانسوریا (سانسوریا (شمشیری)): expected false to be true
   ```
2. **Sitemap and Robots Route Verification**:
   - `src/app/robots.ts` disallows `/admin`, `/schedule`, `/plants/new`, `/login`, `/register`, `/api/`, and allows `/` with no restriction on `/wiki`.
   - `src/app/sitemap.ts` lacked entries for `/wiki` and individual plant species pages from `src/lib/wikiData.ts`.
3. **New Plant Garden Reminder Form**:
   - `src/app/plants/new/page.tsx` was a client component without `useSearchParams` or `Suspense`, defaulting to step 1 (upload photo) with empty draft fields.
4. **Target Route Files**:
   - Neither `src/app/wiki/page.tsx` nor `src/app/wiki/[slug]/page.tsx` existed in the repository.

## 2. Logic Chain
1. **Sitemap Integration**:
   - In `src/app/sitemap.ts`, added `${SITE_URL}/wiki` with `changeFrequency: "weekly"`, `priority: 0.9` into `staticPages`.
   - Imported `getAllWikiPlants` from `@/lib/wikiData` and generated dynamic sitemap entries for each plant using `${SITE_URL}/wiki/${encodeURIComponent(plant.slug)}` with `changeFrequency: "weekly"`, `priority: 0.8`.
   - This directly satisfied Tier 1 and Tier 2 of `seo-sitemap-routes.test.ts`.
2. **Garden Reminder Pre-population (`src/app/plants/new/page.tsx`)**:
   - Extracted form content into `NewPlantContent` and wrapped it in a `<Suspense>` boundary in `NewPlantPage` to satisfy Next.js standards for `useSearchParams()`.
   - Implemented `parseLightExposure` to translate light parameters (e.g. "نور زیاد غیرمستقیم", "Bright Indirect") into valid `PlantDraft['lightExposure']` enum values.
   - Seeded initial draft and step state with `searchParams.get("name")`, `searchParams.get("interval")`, `searchParams.get("light")`, and `searchParams.get("type")`, automatically advancing to Step 2 (Review & Confirm) when a plant name is passed from the encyclopedia CTA.
3. **Encyclopedia Directory Index (`src/app/wiki/page.tsx` & `src/app/wiki/WikiIndexClient.tsx`)**:
   - Built `src/app/wiki/page.tsx` as a Server Component providing rich Persian SEO metadata (`title`, `description`, `canonical: https://jalizapp.ir/wiki`, `openGraph`, `twitter`, `keywords`).
   - Built `src/app/wiki/WikiIndexClient.tsx` matching Jaliz design language (`bg-[#fcfaf8]`, emerald accents, Vazirmatn typography), featuring:
     - Real-time search by Persian name, English name, scientific name, tags, and description.
     - 5 Category filters: "همه گیاهان", "گیاهان مقاوم", "تصفیه‌کننده هوا", "مناسب آپارتمان کم‌نور", and "امن برای حیوانات خانگی".
     - Responsive plant card grid with difficulty badges, toxicity indicators, care snippets (watering interval, light requirements), and links to `/wiki/${encodeURIComponent(plant.slug)}`.
4. **Dynamic Plant Detail Pages (`src/app/wiki/[slug]/page.tsx`)**:
   - Handled Next.js 16 asynchronous params: `interface Props { params: Promise<{ slug: string }> }`.
   - Added `generateStaticParams()` to pre-render all 15 species from `getAllWikiPlants()`.
   - Dynamic `generateMetadata()` setting Persian title, description, canonical URL, and OpenGraph article tags.
   - Structured JSON-LD `@graph` containing:
     - `Article` schema with publisher, author, datePublished, dateModified.
     - `BreadcrumbList` schema (خانه -> دانشنامه گیاهان -> نام گیاه).
     - `FAQPage` schema dynamically generated from `plant.care.commonProblems` with Q&A formatting.
   - Care Specification UI:
     - Taxonomy header with English and scientific names, family, origin, and difficulty.
     - Quick spec metric bar (watering frequency, light level, temperature range, pet safety).
     - 6 dedicated care cards: Light, Watering, Temperature & Humidity, Soil & Potting, Pet Safety, and Common Problems & Diagnosis.
     - 3 prominent Call-to-Action (CTA) buttons:
       1. Add to Garden Reminder: `/plants/new?name=${encodeURIComponent(plant.nameFa)}&interval=${plant.care.watering.defaultIntervalDays}&light=${encodeURIComponent(plant.care.light.level)}`
       2. Browse Marketplace: `/marketplace?query=${encodeURIComponent(plant.nameFa)}`
       3. Diagnose Leaf Disease with AI: `/plants/diagnose`
     - Related companion plants and related blog educational articles.
5. **Testing & Verification**:
   - Authored unit test suite at `src/app/wiki/__tests__/wiki-pages.test.ts`.
   - Ran `npx vitest run src/lib/__tests__/seo-sitemap-routes.test.ts src/app/wiki/__tests__/wiki-pages.test.ts` (13/13 passing).
   - Ran `npx tsc --noEmit` (exit code 0).
   - Ran `npx eslint src/app/wiki src/app/sitemap.ts` (0 errors, 0 warnings).

## 3. Caveats
- No caveats. All 15 plants defined in `src/lib/wikiData.ts` render with complete care cards, structured data, and CTAs.

## 4. Conclusion
Milestone 2 is fully implemented in compliance with `ORIGINAL_REQUEST.md` and `DISPATCH.md`.
All routes (`/wiki`, `/wiki/[slug]`), JSON-LD structured data, 3 CTAs, garden reminder pre-population in `src/app/plants/new/page.tsx`, and sitemap registration in `src/app/sitemap.ts` are verified and passing.

## 5. Verification Method
Run the following commands:
1. `npx vitest run src/lib/__tests__/seo-sitemap-routes.test.ts src/app/wiki/__tests__/wiki-pages.test.ts`
   Expected: 13 passed (8 sitemap tests + 5 wiki page tests).
2. `npx tsc --noEmit`
   Expected: Exit code 0, zero TypeScript errors.
3. `npx eslint src/app/wiki src/app/sitemap.ts`
   Expected: Exit code 0, zero lint errors.

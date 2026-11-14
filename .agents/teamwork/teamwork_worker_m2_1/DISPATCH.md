# Task Assignment: Milestone 2 — Programmatic Encyclopedia UI & Routing

## Working Directory
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m2_1

## Authoritative User Request
Read: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read project specifications: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

## Objective
Implement Milestone 2: Programmatic Houseplant Encyclopedia under `/wiki` and individual pages `/wiki/[slug]`:

1. **`src/app/wiki/page.tsx` (Encyclopedia Directory Index)**:
   - Modern, responsive, clean Persian typography (Vazirmatn font) matching Jaliz styling (`bg-[#fcfaf8]`, emerald accents, clean card layout).
   - Header with title ("دانشنامه و راهنمای جامع گیاهان آپارتمانی"), search input, category filters (همه، گیاهان مقاوم، تصفیه‌کننده هوا، مناسب آپارتمان کم‌نور، امن برای حیوانات خانگی).
   - Grid of plant cards displaying photo/icon, Persian name, English name, difficulty badge, light/watering summary tags, and link to `/wiki/${encodeURIComponent(plant.slug)}`.
   - Comprehensive metadata (`generateMetadata`) with title, description, OpenGraph, canonical url (`https://jalizapp.ir/wiki`), and Persian keywords.

2. **`src/app/wiki/[slug]/page.tsx` (Dynamic Plant Care Pages)**:
   - Next.js 16 asynchronous params: `interface Props { params: Promise<{ slug: string }> }`.
   - `generateStaticParams()` pre-rendering all plants from `getAllWikiPlants()`.
   - `generateMetadata()`: Dynamic SEO title (e.g. `راهنمای کامل نگهداری و پرورش ${plant.nameFa} (${plant.nameEn}) | دانشنامه جالیز`), description, canonical URL, OpenGraph tags.
   - Structured JSON-LD `@graph` schema:
     1. `Article` schema (headline, description, datePublished, publisher, author).
     2. `BreadcrumbList` (Home -> دانشنامه گیاهان -> نام گیاه).
     3. `FAQPage` schema dynamically generated from `plant.care.commonProblems` (Question: "مشکل ... در [گیاه] چیست؟" Answer: "علت: ... راهکار: ...").
   - Persian layout with structured care specification sections:
     - Header: Botanical name, English name, family, origin, difficulty badge.
     - 6 Care Cards with distinct icons:
       1. Light (نور و مکان مناسب)
       2. Watering (برنامه و نیاز آبیاری)
       3. Temperature (دما و رطوبت ایده‌آل)
       4. Soil (خاک و گلدان مناسب)
       5. Pet Safety (سمیت برای حیوانات خانگی با برچسب هشدار یا برچسب سبز امن)
       6. Common Problems (مشکلات رایج، علل و راهکارهای درمانی به صورت لیست یا آکاردئون)
   - 3 Prominent Call-to-Action (CTA) Buttons on every plant page:
     1. Add to User's Garden / Care Reminder (`/plants/new?name=${encodeURIComponent(plant.nameFa)}&interval=${plant.care.watering.defaultIntervalDays}&light=${encodeURIComponent(plant.care.light.level)}`)
     2. Browse Matching Marketplace Listings (`/marketplace?query=${encodeURIComponent(plant.nameFa)}`)
     3. Diagnose Plant Leaf Diseases with AI (`/plants/diagnose`)
   - Related plants and related blog articles links.

3. **`src/app/plants/new/page.tsx` (Garden Pre-population)**:
   - Update `src/app/plants/new/page.tsx` to read `searchParams` (`name`, `interval`, `light`, `type`) and pre-populate the new plant draft so clicking "افزودن به باغچه من" from the wiki pre-fills the form seamlessly! Wrap `useSearchParams()` in `Suspense` if needed to satisfy Next.js standards.

4. **`src/app/sitemap.ts`**:
   - Register `${SITE_URL}/wiki` in `staticPages`.
   - Register all plant species pages (`${SITE_URL}/wiki/${encodeURIComponent(plant.slug)}`) with `changeFrequency: "weekly"`, `priority: 0.8`.

5. **`src/app/robots.ts`**:
   - Verify that `/wiki` is not disallowed and is crawlable per `robots.txt`.

6. **Validation**:
   - Run `npx vitest run src/lib/__tests__/seo-sitemap-routes.test.ts` and ensure all tests pass.
   - Run `npx tsc --noEmit` to ensure 0 TypeScript errors.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You own:
- `src/app/wiki/page.tsx` (create)
- `src/app/wiki/[slug]/page.tsx` (create)
- `src/app/plants/new/page.tsx` (edit query prefill)
- `src/app/sitemap.ts` (edit)

DO NOT modify blog data files or HowTo schema files.

# Task Assignment: Milestone 1 — Core Engines & Data Layer

## Working Directory
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m1_1

## Authoritative User Request
Read: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read project specifications: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

## Objective
Implement Milestone 1: Core Engines & Data Layer per `PROJECT.md` contracts:
1. **`src/lib/wikiData.ts`**:
   - Define TypeScript interface `WikiPlant` with all care fields: `light`, `watering`, `temperature`, `soil`, `petSafety`, and `commonProblems` (array of objects with `problemFa`, `causeFa`, `solutionFa`, `severity`).
   - Populate comprehensive botanical data for all 12 requested popular houseplants:
     1. سانسوریا (Sansevieria / Snake Plant)
     2. پتوس (Pothos / Epipremnum aureum)
     3. زامیفولیا (ZZ Plant / Zamioculcas zamiifolia)
     4. برگ انجیری (Monstera deliciosa)
     5. فیکوس (Ficus elastica / Rubber Plant)
     6. آگلونما (Aglaonema / Chinese Evergreen)
     7. یوکا (Yucca elephantipes)
     8. دیفن باخیا (Dieffenbachia)
     9. شفلرا (Schefflera arboricola / Umbrella Tree)
     10. کالانکوئه (Kalanchoe blossfeldiana)
     11. قاشقی (Peperomia magnoliifolia / Spoon Plant)
     12. اسپاتی فیلوم (Spathiphyllum / Peace Lily)
     - Plus companion species: فیکوس لیراتا (Ficus lyrata), گندمی (Chlorophytum / Spider Plant), برگ عبایی (Aspidistra elatior).
   - Export helper functions `getAllWikiPlants()`, `getWikiPlantBySlug(slug: string)`, `getPopularWikiPlants()`, `getWikiPlantsByCategory(category: string)`.
2. **`src/lib/blogHowTo.ts`**:
   - Implement `isTutorialPost(post: BlogPost): boolean` detecting tutorial articles based on category (`"آموزش‌های کاربردی"`, `"tutorials"`), cluster (`"tutorial"`), tags, and content patterns.
   - Implement `generateHowToSchema(post: BlogPost, canonicalUrl: string): HowToSchema | null` creating valid Schema.org `HowTo` with `name`, `description`, `step` array (`HowToStep` with `name`, `text`, `position`), and optional supplies/tools extracted from content or metadata.
   - Ensure clean fallback returning `null` for non-tutorial posts without throwing.
3. **`src/lib/marketplace/topic-matcher.ts`**:
   - Implement `resolveMarketplaceTopic(...)` matching plant species keywords and care topics from titles, slugs, keywords, or content to marketplace search queries.
   - Include Persian text normalization (handling half-space `\u200c`, Arabic vs Persian letters).
4. **`src/app/marketplace/page.tsx` Query Parameter Ingestion**:
   - Update `src/app/marketplace/page.tsx` so that `MarketplaceOpenFromQuery` reads `searchParams.get("query") || searchParams.get("q")` and synchronizes it with the `search` input state on initial load!
5. **Validation**:
   - Run `npx tsc --noEmit` and relevant tests. Verify 0 TypeScript errors.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You own:
- `src/lib/wikiData.ts` (create)
- `src/lib/blogHowTo.ts` (create)
- `src/lib/marketplace/topic-matcher.ts` (create)
- `src/app/marketplace/page.tsx` (edit query param ingestion)

DO NOT modify blog data files, `/wiki` page components, or test files in this milestone.


## 2026-11-13T20:25:16Z
[Message] timestamp=2026-11-13T20:25:16Z sender=eed6eb13-3f90-4d26-9c91-172933d897e5 priority=MESSAGE_PRIORITY_HIGH content=You are teamwork_worker_m1_1.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m1_1
Your task assignment is in: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m1_1/DISPATCH.md
The authoritative user request is in: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
The project architecture is in: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md first before starting your work.
Follow all instructions in DISPATCH.md to implement Milestone 1: Core Engines & Data Layer (`src/lib/wikiData.ts`, `src/lib/blogHowTo.ts`, `src/lib/marketplace/topic-matcher.ts`, and `src/app/marketplace/page.tsx` query param handling).
Run `npx tsc --noEmit` and tests to verify.
Produce a comprehensive handoff report at /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m1_1/handoff.md.
When done, message me with your completion notification.

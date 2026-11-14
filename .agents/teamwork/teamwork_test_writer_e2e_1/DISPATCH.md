# Task Assignment: E2E Test Suite Creation (Dual Track)

## Working Directory
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_e2e_1

## Authoritative User Request
Read: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read project specifications: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

## Objective
Design and implement the complete E2E opaque-box test suite for the Jaliz SEO Master Strategy items:
1. Create `TEST_INFRA.md` at project root documenting test philosophy, feature inventory, test suites, and coverage tiers (Tiers 1-4).
2. Create Vitest test suites implementing Tiers 1-4:
   - `src/lib/__tests__/wiki-data.test.ts`:
     - Verifies all 12+ required plants exist (سانسوریا، پتوس، زامیفولیا، برگ انجیری، فیکوس، آگلونما، یوکا، دیفن باخیا، شفلرا، کالانکوئه، قاشقی، اسپاتی فیلوم).
     - Verifies all required care specifications: `light`, `watering`, `temperature`, `soil`, `petSafety`, and `commonProblems` (each with `problemFa`, `causeFa`, `solutionFa`).
     - Verifies `getAllWikiPlants()`, `getWikiPlantBySlug()`, error cases for nonexistent slugs.
   - `src/lib/__tests__/blog-how-to.test.ts`:
     - Verifies `isTutorialPost(post)` detects tutorial posts (repotting, water propagation, moss pole, terrarium, soil mixing, etc.).
     - Verifies non-tutorial posts return `false`.
     - Verifies `generateHowToSchema(post, canonicalUrl)` produces schema.org `HowTo` with `name`, `description`, `step` array (`HowToStep` with `name`, `text`, `position`), and optional supplies/tools.
     - Verifies non-tutorial posts return `null` without throwing errors.
   - `src/lib/__tests__/topic-matcher.test.ts`:
     - Verifies Persian species keyword matching (exact & fuzzy/normalized).
     - Verifies care topic matching (soil, pot, fertilizer, pest control, moss pole).
     - Verifies Persian normalization (half-space `\u200c`, Arabic/Persian `ی` and `ک`).
     - Verifies default/fallback query generation.
   - `src/lib/__tests__/blog-titles-ctr.test.ts`:
     - Verifies all 104 slugs remain 100% frozen and identical to baseline (no route breakage).
     - Verifies titles include CTR enhancements (brackets `【...】`, emojis `🪴`, `🌱`, `✂️`, `💧`, or engaging hooks).
   - `src/lib/__tests__/seo-sitemap-routes.test.ts`:
     - Verifies `src/app/sitemap.ts` includes `/wiki` and all individual plant slugs.
     - Verifies `src/app/robots.ts` allows crawling `/wiki`.
3. Create `TEST_READY.md` at project root when test infrastructure and test suites are ready.
4. Execute test runner `npx vitest run src/lib/__tests__/` to verify test suite execution. Document test counts and tier coverage.

## Integrity Warning
DO NOT CHEAT. All test implementations must be genuine.


## 2026-11-13T20:25:09Z
Received from eed6eb13-3f90-4d26-9c91-172933d897e5:
You are teamwork_test_writer_e2e_1.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_e2e_1
Your task assignment is in: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_e2e_1/DISPATCH.md
The authoritative user request is in: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
The project architecture is in: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

You MUST read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md first before starting your work.
Follow all instructions in DISPATCH.md to create TEST_INFRA.md, the test suites for Tiers 1-4, and publish TEST_READY.md.
Produce a comprehensive handoff report at /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_e2e_1/handoff.md.
When done, message me with your completion notification.

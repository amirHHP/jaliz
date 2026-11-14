# BRIEFING — 2026-11-13T20:53:00Z

## Mission
Implement Milestone 3: Blog HowTo Schema injection, MarketplaceCrossLink component & integration, and Title CTR Optimization across all blog files while preserving 100% of 104 slugs.

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa, specialist
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1
- Original parent: c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413
- Milestone: M3 - Gamified UI, Mascot Components & Integration
- Archetype: teamwork_worker_m3_1
- Roles: implementer, qa
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1
- Original parent: eed6eb13-3f90-4d26-9c91-172933d897e5
- Milestone: M3 (Blog Enhancements, HowTo Schema, Cross-Linking & Title CTR)

## 🔒 Key Constraints
- DO NOT CHEAT. All implementations must be genuine.
- DO NOT hardcode test results, create dummy/facade implementations, or circumvent intended tasks.
- Only edit exclusive write files: PlantMascot.tsx, MascotSpeechBubble.tsx, MascotCompanion.tsx, GamificationBar.tsx, CareTaskCard.tsx, WateringSchedule.tsx, WeatherAdvice.tsx, Dashboard.tsx.
- Maintain compatibility with existing tests and codebase.
- Preserve subscription gating (blurred locked preview and paywall modal at 99,000 Tomans/month when not subscribed).
- All 38 test suites (342 tests) must pass with 0 errors.
- TypeScript check (`npx tsc --noEmit`) must pass with 0 errors.
- Next.js build (`npm run build`) must compile cleanly with 0 errors.
- DO NOT CHEAT: genuine implementations only, no hardcoded test outputs or facade implementations.
- All 104 `post.slug` properties MUST REMAIN 100% UNCHANGED AND IDENTICAL TO BASELINE!
- Write ownership for current assignment:
  - `src/components/marketplace/MarketplaceCrossLink.tsx` (create)
  - `src/app/blog/[slug]/page.tsx` (edit HowTo schema)
  - `src/app/blog/[slug]/BlogPostClient.tsx` (edit cross-link placement)
  - `src/lib/blogData.ts`, `src/lib/blogPostsNew.ts`, `src/lib/blogPostsSeo.ts`, `src/lib/blogPostsExpansion1.ts`, `src/lib/blogPostsExpansion2.ts` (edit display titles)
- DO NOT modify `src/app/wiki/` or `src/app/sitemap.ts`.
- Must pass `npx vitest run src/lib/__tests__/blog-titles-ctr.test.ts src/lib/__tests__/blog-how-to.test.ts` and `npx tsc --noEmit`.

## Current Parent
- Conversation ID: eed6eb13-3f90-4d26-9c91-172933d897e5
- Updated: 2026-11-13T20:51:13Z

## Task Summary
- **What to build**:
  1. Inject `HowTo` schema into `@graph` in `src/app/blog/[slug]/page.tsx` using `generateHowToSchema` and `isTutorialPost` from `@/lib/blogHowTo`.
  2. Create reusable, responsive, commercial intent component `src/components/marketplace/MarketplaceCrossLink.tsx` with two tiers (live listings from `useMarketplace` + always-displayed high-converting commercial banner).
  3. Integrate `<MarketplaceCrossLink topicQuery={post.primaryKeyword} speciesName={post.title} />` in `src/app/blog/[slug]/BlogPostClient.tsx`.
  4. Optimize blog titles with emojis, brackets (`【...】`), and hooks across 5 blog data files without touching slugs.
- **Success criteria**:
  - `npx vitest run src/lib/__tests__/blog-titles-ctr.test.ts src/lib/__tests__/blog-how-to.test.ts` passes.
  - `npx tsc --noEmit` passes with 0 errors.
  - 100% of 104 slugs preserved.
- **Interface contracts**: PROJECT.md § Interface Contracts
- **Code layout**: PROJECT.md § Code Layout

## Change Tracker
- **Files modified**: none yet
- **Build status**: pending
- **Pending issues**: none

## Quality Status
- **Build/test result**: pending
- **Lint status**: pending
- **Tests added/modified**: pending

## Key Decisions Made
- [TBD]

## Artifact Index
- handoff.md — will be generated upon completion

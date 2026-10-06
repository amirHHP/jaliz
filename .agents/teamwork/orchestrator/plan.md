# Project Plan: Jaliz Blog Expansion (50 SEO Articles)

## Objective
Fulfill all requirements (R1, R2, R3, R4) from ORIGINAL_REQUEST.md:
- R1: Keyword architecture, topic clusters, anti-cannibalization matrix for 50 articles.
- R2: 50 high-quality Persian articles with title, slug, description <= 160 chars, category, readTime, keywords, content (H2/H3/tips/CTAs), faqs >= 2.
- R3: Integration into `src/lib/` matching BlogPost and BlogSeoMeta types, smart internal linking (`<a href="/blog/...">`), Jaliz service CTAs.
- R4: Automated validation script and type check `npx tsc --noEmit` passing with 0 errors.

## Phase 0: Survey & Discovery [COMPLETED]
Spawn 3 Explorers in parallel:
1. Explorer 1: Inspect existing blog types, posts, schema, category conventions, and UI rendering. [Completed: `c45a0205`]
2. Explorer 2: Inspect repository build/test toolchain, scripts, dependencies, tsc behavior. [Completed: `0720870a`]
3. Explorer 3: Inspect existing SEO keywords, internal link anchors, Jaliz CTAs, and categories. [Completed: `02046b42`]

## Phase 1: Synthesis & Decomposition (PROJECT.md) [COMPLETED]
Synthesize reports from the 3 Explorers.
Formulate `PROJECT.md` including:
- Architecture & code layout
- 50-article Keyword Architecture & Topic Clusters & Anti-Cannibalization Matrix
- Interface contracts & schema requirements
- Decomposition into implementation milestones and parallel E2E validation track

## Phase 2: Parallel Dual Track Dispatch [COMPLETED]
- Track A: E2E Validation Track — created `scripts/validate-blog.mjs` and Vitest suite `blogExpansion.test.ts` enforcing all 50 article criteria (R4) and published `TEST_READY.md`. [Completed: `f3390b92`]
- Track B: Implementation Track — produced content in two modular 25-article batches (`blogPostsExpansion1.ts` and `blogPostsExpansion2.ts`), updated aggregated index `blogData.ts`. [Completed: `d68c69cd`, `b39e8625`]

## Phase 3: Verification & Auditing [COMPLETED]
- Pre-requisite TypeScript fixes executed in M1 (`b1344864`).
- List tag formatting fixes applied to Batch 1 (`b39e8625`).
- Missing 18 articles (33-50) authored in Batch 2 (`b39e8625`).
- Validation script `scripts/validate-blog.mjs` executed: 11/11 checks passed, Exit code 0.
- Vitest executed: 29 test files, 228/228 tests passed.
- TypeScript compiler executed: `npx tsc --noEmit` passed with 0 errors.

## Phase 4: Final Acceptance & Sentinel Reporting [COMPLETED]
- Verified all checkboxes in ORIGINAL_REQUEST.md.
- Created final `handoff.md` with complete evidence chain and verification commands.
- Report completion and claim victory to Sentinel.

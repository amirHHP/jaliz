# Task Assignment: Milestone 3 Completion & Title CTR Optimization

## Working Directory
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_2

## Authoritative User Request
Read: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read project specifications: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

## Objective
Finalize Milestone 3:
1. Review the already completed M3 files:
   - `src/components/marketplace/MarketplaceCrossLink.tsx` (already created)
   - `src/app/blog/[slug]/page.tsx` (HowTo schema already added)
   - `src/app/blog/[slug]/BlogPostClient.tsx` (cross-link already integrated)
2. Finalize CTR Title Optimization across all blog data files:
   - `src/lib/blogData.ts`
   - `src/lib/blogPostsNew.ts`
   - `src/lib/blogPostsSeo.ts`
   - `src/lib/blogPostsExpansion1.ts`
   - `src/lib/blogPostsExpansion2.ts`
   - Enhance display titles (`post.title`) using engaging hooks, Persian brackets (e.g. `【راهنمای کامل】`, `【فوری】`, `【ترفندهای طلایی】`, `【رازهای نگهداری】`), and contextual emojis (`🪴`, `🌱`, `✂️`, `💧`, `🌿`).
   - **CRITICAL CONSTRAINT**:
     All 104 `post.slug` values MUST REMAIN 100% UNCHANGED AND IDENTICAL TO BASELINE! Slugs are immutable routing and URL identifiers.
3. Verification:
   - Run `npx vitest run src/lib/__tests__/blog-titles-ctr.test.ts` — verify all tests pass!
   - Run `npx vitest run src/lib/__tests__/blog-how-to.test.ts` — verify all tests pass!
   - Run `npx tsc --noEmit` — verify 0 errors!
4. Write handoff report at `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_2/handoff.md` and message completion.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-13T21:20:35Z
You are teamwork_worker_m3_2.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_2
Your task assignment is in: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_2/DISPATCH.md
The authoritative user request is in: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
The project architecture is in: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md first before starting your work.
Follow all instructions in DISPATCH.md to complete Milestone 3: finalize the Title CTR optimization across blog data files while keeping all 104 slugs strictly untouched, run `npx vitest run src/lib/__tests__/blog-titles-ctr.test.ts src/lib/__tests__/blog-how-to.test.ts` and `npx tsc --noEmit`.
Produce a comprehensive handoff report at /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_2/handoff.md.
When done, message me with your completion notification.

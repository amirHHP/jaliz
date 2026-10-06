## 2026-10-06T06:16:42Z
You are a Worker subagent in the Jaliz blog expansion project.
Your assigned working directory is:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_m1_1

MANDATORY FIRST STEP: Read the authoritative user request at:
/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture at:
/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md
And review Explorer 2's handoff report at:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_explorer_survey_2/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership (files you own exclusively for this milestone):
- `src/app/actions/__tests__/subscription-admin.test.ts`
- `src/lib/auth/__tests__/session-cookie.test.ts`
- `src/lib/email/__tests__/send-otp-email.test.ts`
- `src/lib/__tests__/blogData.test.ts`
- `src/lib/blogPostsExpansion1.ts`
- `src/lib/blogPostsExpansion2.ts`
- `src/lib/blogData.ts`

Your mission (Milestone M1: Toolchain & Pre-requisite Remediation):
1. Fix the 9 pre-existing TypeScript compilation errors identified in Explorer 2's survey:
   - `src/app/actions/__tests__/subscription-admin.test.ts:209`: Resolve the type conversion / type assertion error.
   - `src/lib/auth/__tests__/session-cookie.test.ts:12,18,24,30`: Fix the `process.env.NODE_ENV` assignments so TypeScript compiles cleanly without mutating a readonly string literal type error (e.g. `(process.env as any).NODE_ENV = ...` or proper type assertion).
   - `src/lib/email/__tests__/send-otp-email.test.ts:32,44,54,74`: Fix the `process.env.NODE_ENV` assignments similarly.
2. In `src/lib/__tests__/blogData.test.ts:45-54`:
   - Adjust the test `pairs every post with an alternate-language slug` so that only posts that have an `alternateSlug` or legacy bilingual posts are asserted for having a counterpart of the other language, or check `if (post.alternateSlug) { ... }`, so that upcoming Persian expansion articles do not fail this legacy test.
3. Create the module files for expansion posts in `src/lib/`:
   - `src/lib/blogPostsExpansion1.ts`: export `export const expansionPosts1: BlogPost[] = []`
   - `src/lib/blogPostsExpansion2.ts`: export `export const expansionPosts2: BlogPost[] = []`
4. In `src/lib/blogData.ts`:
   - Import `expansionPosts1` and `expansionPosts2` and spread them into `blogPosts`:
     `export const blogPosts: BlogPost[] = [...seoBlogPosts, ...newBlogPosts, ...existingBlogPosts, ...expansionPosts1, ...expansionPosts2].map(applyBlogSeo)` (or if expansion posts already have full `BlogPost` shape, combine properly so all types align). Note: Check whether `applyBlogSeo` is needed or if expansion posts are already `BlogPost` with all SEO fields.
5. Run verification:
   - Execute `npx tsc --noEmit` and verify exit code 0 and ZERO errors across the entire repository.
   - Execute `npm test` and verify all tests pass.
6. Write your comprehensive completion report to:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_m1_1/handoff.md
Send a message to your parent upon completion with your exact verification results.

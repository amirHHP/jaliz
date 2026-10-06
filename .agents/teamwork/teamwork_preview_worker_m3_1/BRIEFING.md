# BRIEFING — 2026-10-06T06:30:00Z

## Mission
Implement Milestone M3: Content Production Batch 1 (Articles 1 to 25) in `src/lib/blogPostsExpansion1.ts` with complete, genuine, high-quality Persian content, strict SEO metadata, valid internal linking, and Jaliz CTAs.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_m3_1
- Original parent: 5f96e080-4eee-414c-b32c-a6a39becff6c
- Milestone: M3 (Content Production Batch 1 — Articles 1 to 25)

## 🔒 Key Constraints
- File ownership: Exclusively `src/lib/blogPostsExpansion1.ts`. Do not modify other files.
- Integrity: Genuine implementations only; no placeholder text, no facades, no shortened summaries.
- Exact slugs and primary keywords from `PROJECT.md § Feature Inventory` (Articles 1–25).
- Description must be <= 160 characters.
- Text content (excluding HTML tags) must be > 1500 characters.
- At least 2 FAQs per article.
- Internal links `<a href="/blog/...">` must point to valid slugs (27 legacy or planned expansion slugs).
- Natural Jaliz CTA matching inventory table (`/schedule`, `/plants/diagnose`, `/marketplace`).
- Strict TypeScript compliance (`npx tsc --noEmit` exit code 0).

## Current Parent
- Conversation ID: 5f96e080-4eee-414c-b32c-a6a39becff6c
- Updated: 2026-10-06T06:30:00Z

## Task Summary
- **What to build**: 25 comprehensive Persian articles exported as `expansionPosts1: BlogPost[]` in `src/lib/blogPostsExpansion1.ts`.
- **Success criteria**: Valid typing, rich content (>1500 chars clean text each), descriptions <= 160 chars, 2-4 FAQs each, clean HTML with headings/lists/links, designated CTAs, 0% keyword cannibalization.
- **Interface contracts**: `src/lib/blogTopics.ts` (`BlogPost` interface).
- **Code layout**: `src/lib/blogPostsExpansion1.ts`.

## Key Decisions Made
- All 25 articles will have `lang: "fa"`.
- `alternateSlug` set to self slug (since Persian expansion posts do not have direct English translations at this stage).
- `publishedAtIso`: `"2026-10-05"`.
- Category mapping:
  - Species 1–16: `category: "معرفی گیاهان"`, `categoryEn: "plants"`, `cluster: "species"`
  - Diagnosis 17–25: `category: "نگهداری"`, `categoryEn: "care"`, `cluster: "diagnosis"`
- Authors rotated between `"سارا گل‌پرور"` and `"علی سبزواری"`.

## Artifact Index
- `/Users/sotoon/personal/jaliz/src/lib/blogPostsExpansion1.ts` — Target export file
- `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_m3_1/progress.md` — Liveness & progress tracking
- `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_m3_1/handoff.md` — Handoff report

## Change Tracker
- **Files modified**: `src/lib/blogPostsExpansion1.ts` (in progress)
- **Build status**: tsc passes (initial empty array)
- **Pending issues**: Writing and validating all 25 articles.

## Quality Status
- **Build/test result**: Pass
- **Lint status**: Clean
- **Tests added/modified**: Covered by existing test suite and future expansion tests.

## Loaded Skills
- None required for this batch content authoring.

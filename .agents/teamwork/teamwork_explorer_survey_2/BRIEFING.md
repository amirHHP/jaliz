# BRIEFING — 2026-11-13T20:25:00Z

## Mission
Investigate blog structure, HowTo JSON-LD schema generation in `src/app/blog/[slug]/page.tsx` for tutorial articles, and CTR title optimization for blog data without breaking slugs or existing schema.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: Codebase Researcher (Mascot & Visual States)
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2
- Original parent: c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413
- Milestone: Survey & Mascot Design Specification
- Current Role: Codebase Researcher (Blog HowTo Schema & Title Optimization)
- Milestone: Blog System, HowTo Schema & Title Optimization Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Design vector SVG/CSS plant companion mascot with dynamic visual states (Thriving, Thirsty, Celebrating, Resting)
- Design dynamic speech bubble system with contextual Persian messages
- Investigate placement & responsive layout in /schedule
- Adhere to Duolingo-style gamification aesthetics
- Read-only investigation: do NOT modify application source code
- Slugs in blog data MUST NEVER change to prevent breaking existing URLs and links
- HowTo JSON-LD schema must be valid schema.org and only generated for tutorial articles (or alongside BlogPosting/Article without breaking)
- Non-tutorial blog posts must continue to render valid BlogPosting / Article schema

## Current Parent
- Conversation ID: eed6eb13-3f90-4d26-9c91-172933d897e5
- Updated: 2026-11-13T20:18:40Z

## Investigation State
- **Explored paths**:
  - `src/app/blog/[slug]/page.tsx` (metadata, jsonLd @graph generation, Article, BreadcrumbList, FAQPage)
  - `src/lib/blogData.ts` (14 posts, imports and exports, `applyBlogSeo`)
  - `src/lib/blogTopics.ts` (BlogCluster, BlogPost, BlogPostInput, `blogSeoBySlug`, `addPair`, 7 tutorial pairs)
  - `src/lib/blogPostsExpansion1.ts` (25 Persian posts: Species 1-16, Diagnosis 17-25)
  - `src/lib/blogPostsExpansion2.ts` (25 Persian posts: Care 26-34, Tutorials 35-41, Plants 42-46, Space 47-50)
  - `src/lib/blogPostsNew.ts` (20 bilingual posts: Care, Space, Tutorials)
  - `src/lib/blogPostsSeo.ts` (20 bilingual posts: Species, Care, Tutorials)
  - `src/lib/__tests__/blogData.test.ts` & `src/lib/__tests__/blogExpansion.test.ts` (validation suites)
- **Key findings**:
  1. Exactly 104 blog posts exist in the system (54 legacy bilingual + 25 expansion1 + 25 expansion2).
  2. 25 posts represent tutorials (e.g. repotting, water propagation, moss pole building, soil mixing, terrarium crafting).
  3. Tutorial posts can be reliably detected via `post.cluster === "tutorial" || post.categoryEn === "tutorials" || isTutorialSlugOrTitle(post)`.
  4. Content parsing can automatically extract `HowToStep` items from `<ol>`, step-specific `<ul>`, or numbered `<h2>` sections, as well as `supply`/`tool` from equipment lists.
  5. Injecting `HowTo` into the existing `@graph` array in `src/app/blog/[slug]/page.tsx` is completely non-breaking for non-tutorial posts and enhances rich results in SERPs.
  6. `post.title` is strictly display-only and is never used in routing or internal links (`post.slug` is the immutable identifier). Emojis (`🌱`, `💧`, `✂️`), brackets (`【...】` / `[...]`), and hooks can safely be applied to all 104 titles to boost CTR.
- **Unexplored areas**: None. Ready for handoff synthesis.

## Key Decisions Made
- Architecture for HowTo Schema: create a helper module `src/lib/blogHowTo.ts` that exports `isTutorialPost(post)` and `generateHowToSchema(post, canonicalUrl, inLanguage)`.
- Fallback guard: Only emit `HowTo` schema when `steps.length >= 2` to conform strictly to Google Search Central requirements.
- Title CTR strategy: Maintain the primary keyword intact while prepending bracketed hooks (`【...】` / `[...]`) and appending contextual botanical emojis. Slugs are 100% frozen.

## Artifact Index
- /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/DISPATCH.md — Dispatch instructions & logs
- /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/BRIEFING.md — Persistent memory
- /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/progress.md — Liveness heartbeat
- /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/handoff.md — Final handoff report

# Task Assignment: Milestone 3 — Blog Enhancements, HowTo Schema, Cross-Linking & Title CTR

## Working Directory
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1

## Authoritative User Request
Read: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read project specifications: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

## Objective
Implement Milestone 3: Blog HowTo Schema Injection, Marketplace Cross-Linking Component, and Title CTR Optimization:

1. **`src/app/blog/[slug]/page.tsx` (HowTo Schema Injection)**:
   - Import `generateHowToSchema` and `isTutorialPost` from `@/lib/blogHowTo`.
   - In `BlogPostPage`, if `isTutorialPost(post)` is true, call `generateHowToSchema(post, canonical)`.
   - If a valid `howToSchema` is returned, append it to the `@graph` array!
   - Ensure non-tutorial blog posts continue to render standard `Article`, `BreadcrumbList`, and `FAQPage` schemas without errors.

2. **`src/components/marketplace/MarketplaceCrossLink.tsx` (Reusable Cross-Linker)**:
   - Create a reusable, responsive, commercial intent component that accepts `topicQuery?: string`, `speciesName?: string`, `className?: string`.
   - Resolves the commercial topic using `resolveMarketplaceTopic` from `@/lib/marketplace/topic-matcher`.
   - Two-tier design:
     - Tier 1: Uses `useMarketplace()` to check for matching live listings. If matches exist, displays a responsive horizontal strip or grid of listing cards with thumbnail, title, price in Tomans, and link to `/marketplace?open=${listing.id}`.
     - Tier 2: An attractive, high-converting commercial banner that ALWAYS displays:
       - Contextual title (e.g. `خرید، فروش و تبادل قلمه و گیاه ${speciesName || topic} در بازارچه جالیز`).
       - Explanatory description.
       - Primary CTA: `<Link href={/marketplace?query=${encodeURIComponent(query)}}>مشاهده آگهی‌های ${topic} در بازارچه</Link>`.
       - Secondary CTA: `<Link href="/marketplace?action=new">ثبت رایگان آگهی در بازارچه</Link>`.
   - Ensure clean Persian styling, RTL layout, Lucide icons (`Store`, `ArrowLeft`, `Sparkles`, `PlusCircle`).

3. **`src/app/blog/[slug]/BlogPostClient.tsx` Integration**:
   - Embed `<MarketplaceCrossLink topicQuery={post.primaryKeyword} speciesName={post.title} />` in `BlogPostClient.tsx` (e.g. right before the related posts section or inside the content CTA area).

4. **CTR Title Optimization across Blog Data**:
   - Update and polish blog article display titles in:
     - `src/lib/blogData.ts`
     - `src/lib/blogPostsNew.ts`
     - `src/lib/blogPostsSeo.ts`
     - `src/lib/blogPostsExpansion1.ts`
     - `src/lib/blogPostsExpansion2.ts`
   - Use engaging CTR elements:
     - Persian visual brackets (e.g. `【راهنمای کامل】`, `【آموزش گام‌به‌گام】`, `【فوری】`, `【ترفندهای طلایی】`, `【رازهای نگهداری】`)
     - Engaging hooks and questions
     - Contextual botanical emojis (`🪴`, `🌱`, `✂️`, `💧`, `🌿`, `☀️`, `🧴`)
   - **CRITICAL CONSTRAINT**:
     - All 104 `post.slug` properties MUST REMAIN 100% UNCHANGED AND IDENTICAL TO BASELINE!
     - Only `post.title` (and related display text) should be enhanced. Slugs are routing identifiers; changing them would break existing backlinks and internal links.
   - Run `npx vitest run src/lib/__tests__/blog-titles-ctr.test.ts` to verify that all 104 slugs are intact and titles satisfy CTR criteria.

5. **Validation**:
   - Run `npx vitest run src/lib/__tests__/blog-how-to.test.ts src/lib/__tests__/blog-titles-ctr.test.ts`
   - Run `npx tsc --noEmit`
   - Verify 0 errors.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You own:
- `src/components/marketplace/MarketplaceCrossLink.tsx` (create)
- `src/app/blog/[slug]/page.tsx` (edit HowTo schema)
- `src/app/blog/[slug]/BlogPostClient.tsx` (edit cross-link placement)
- `src/lib/blogData.ts`, `src/lib/blogPostsNew.ts`, `src/lib/blogPostsSeo.ts`, `src/lib/blogPostsExpansion1.ts`, `src/lib/blogPostsExpansion2.ts` (edit display titles)

DO NOT modify `src/app/wiki/` or `src/app/sitemap.ts`.


## 2026-11-13T20:51:13Z
You are teamwork_worker_m3_1.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1
Your task assignment is in: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1/DISPATCH.md
The authoritative user request is in: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
The project architecture is in: /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md first before starting your work.
Follow all instructions in DISPATCH.md to implement Milestone 3: Blog HowTo Schema injection in `src/app/blog/[slug]/page.tsx`, `MarketplaceCrossLink.tsx` component and integration in `BlogPostClient.tsx`, and Title CTR Optimization across all blog data files (preserving 100% of all 104 slugs).
Run `npx vitest run src/lib/__tests__/blog-titles-ctr.test.ts src/lib/__tests__/blog-how-to.test.ts` and `npx tsc --noEmit` to verify.
Produce a comprehensive handoff report at /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1/handoff.md.
When done, message me with your completion notification.

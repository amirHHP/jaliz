# BRIEFING — 2026-11-13T20:20:00Z

## Mission
Investigate the plant encyclopedia directory under `/wiki`, dynamic individual pages `/wiki/[slug]`, structured care details, JSON-LD schema, CTAs, sitemap, and robots.txt in Jaliz (Next.js App Router).

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: Codebase Researcher (Schedule UI & Gamification)
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_1
- Original parent: c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413
- Milestone: Survey & Exploration
- Roles: Codebase Researcher (Plant Encyclopedia / Wiki & SEO Architecture)
- New parent: eed6eb13-3f90-4d26-9c91-172933d897e5
- Milestone: SEO Master Strategy - Plant Encyclopedia Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Follow communication and handoff protocols
- Output report in /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_1/handoff.md
- Adhere to Next.js App Router conventions and Persian RTL typography
- Respect project layout: metadata only in .agents/teamwork/

## Current Parent
- Conversation ID: eed6eb13-3f90-4d26-9c91-172933d897e5
- Updated: 2026-11-13T20:18:35Z

## Investigation State
- **Explored paths**: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/blog/page.tsx`, `src/app/blog/BlogIndexClient.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/[slug]/BlogPostClient.tsx`, `src/app/marketplace/page.tsx`, `src/app/plants/new/page.tsx`, `src/app/plants/diagnose/page.tsx`, `src/components/Header.tsx`, `src/components/BottomNav.tsx`, `src/lib/blogData.ts`, `src/lib/blogTopics.ts`, `src/lib/blogPostsSeo.ts`, `prisma/schema.prisma`.
- **Key findings**:
  1. No existing public plant encyclopedia data exists in the repo; `UserPlant` in Prisma is for private user plants.
  2. The content architecture standard is in `src/lib/` (e.g. `blogData.ts`). Recommended location for plant encyclopedia is `src/lib/wikiData.ts`.
  3. All 12 requested plant species (plus 4 companion popular species) mapped with exact Persian care details, toxicity, and common problems.
  4. Dynamic plant pages at `/wiki/[slug]` in Next.js 16 require `params: Promise<{ slug: string }>`.
  5. JSON-LD structured data can leverage `@graph` with `Article`, `BreadcrumbList`, and `FAQPage` schemas for rich search results.
  6. CTAs mapped: `/plants/new?name=...` (care reminder / garden), `/marketplace?query=...` (marketplace), and `/plants/diagnose` (AI leaf doctor).
  7. In `src/app/marketplace/page.tsx`, `search` state currently does not read `searchParams.get("query")`. Fixing this enables seamless query filtering from CTAs.
  8. In `src/app/plants/new/page.tsx`, reading query parameters on mount allows 1-click prefilling of species name, interval, and light exposure.
  9. In `src/app/sitemap.ts`, `/wiki` and dynamic plant routes should be registered alongside static and blog pages.
  10. `src/app/robots.ts` already permits `/wiki` via `allow: "/"`.
- **Unexplored areas**: None. Full survey complete.

## Key Decisions Made
- Prepared complete TypeScript interface and data structure for `WikiPlant`.
- Defined full component architecture for `/wiki` and `/wiki/[slug]`.
- Outlined step-by-step implementation plan for worker agents.

## Artifact Index
- handoff.md — Comprehensive handoff report
- progress.md — Liveness & progress tracker

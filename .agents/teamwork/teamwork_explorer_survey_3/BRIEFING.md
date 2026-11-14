# BRIEFING — 2026-11-13T20:26:00Z

## Mission
Investigate marketplace architecture, data, search params, and blog data to design dynamic cross-linking (R3) and reusable wiki CTAs.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: Codebase Researcher (Marketplace & Blog Cross-Linking)
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3
- Original parent: eed6eb13-3f90-4d26-9c91-172933d897e5
- Milestone: Survey & Architectural Design for Marketplace Cross-Linking (R3) & Shared Wiki CTAs

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify source files or test files
- Write only to working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3
- Use send_message to communicate with parent agent

## Current Parent
- Conversation ID: eed6eb13-3f90-4d26-9c91-172933d897e5
- Updated: 2026-11-13T20:18:46Z

## Investigation State
- **Explored paths**:
  - `src/app/marketplace/page.tsx`
  - `src/app/marketplace/[id]/page.tsx`
  - `src/app/marketplace/[id]/ListingPageClient.tsx`
  - `src/app/marketplace/layout.tsx`
  - `src/app/actions/marketplace.ts`
  - `src/components/MarketplaceProvider.tsx`
  - `src/components/MarketplaceListingsProvider.tsx`
  - `src/components/marketplace/ListingCard.tsx`
  - `src/components/marketplace/AdviceMarketplaceStrip.tsx`
  - `src/components/marketplace/MarketplacePromoCard.tsx`
  - `src/lib/marketplace/types.ts`
  - `src/lib/marketplace/listing-service.ts`
  - `src/lib/marketplace/advice-listing-match.ts`
  - `src/app/blog/[slug]/page.tsx`
  - `src/app/blog/[slug]/BlogPostClient.tsx`
  - `src/lib/blogData.ts`
  - `src/lib/blogTopics.ts`
  - `src/lib/blogPostsExpansion1.ts`
  - `src/lib/blogPostsExpansion2.ts`
  - `scripts/validate-blog.mjs`
  - `prisma/schema.prisma`
- **Key findings**:
  - Marketplace routes: `/marketplace` (main client page), `/marketplace/[id]` (SSR product page with JSON-LD Product schema), `/marketplace/chats` (messaging).
  - CRITICAL QUERY PARAM GAP: `src/app/marketplace/page.tsx` currently only reads `open`, `action`, `create` query params. It does NOT initialize `search` state from `searchParams.get("query")` or `searchParams.get("q")`. Fixing this is required so incoming links (`/marketplace?query=سانسوریا`) work as expected.
  - Data model: `MarketplaceListing` in Prisma schema with fields `title`, `description`, `type` (seed/cutting/tool/produce), `mode` (sell/exchange/free), `price`, `status` (active/completed).
  - Existing matchers: `src/lib/marketplace/advice-listing-match.ts` has `normalizeForMatch` and synonym clusters for fertilizer, soil, tools, seeds.
  - Blog structure: `BlogPost` has `title`, `slug`, `keywords`, `primaryKeyword`, `cluster` ("species", "care", "tutorial", "diagnosis", etc.).
  - Cross-linking design: Designed `topic-matcher.ts` for plant species (سانسوریا، پتوس، زامیفولیا، etc.) and care topics (کود، خاک، گلدان، سم، ابزار) + reusable `MarketplaceCrossLink` component with live listing preview and commercial CTA.
- **Unexplored areas**: None.

## Key Decisions Made
- Architecture split: Pure logic `topic-matcher.ts` (100% testable without DOM) + React component `MarketplaceCrossLink.tsx` (pluggable into `/blog/[slug]` and `/wiki/[slug]`).
- Two-tier display: Active matching listings carousel/strip + permanent commercial intent CTA card linking to `/marketplace?query=...` and `/marketplace?action=new`.
- Update `/marketplace/page.tsx` to sync with `searchParams.get("query")` seamlessly.

## Artifact Index
- DISPATCH.md — Task instructions from orchestrator
- BRIEFING.md — Situational awareness and working memory
- progress.md — Heartbeat and step tracking
- handoff.md — Comprehensive handoff report

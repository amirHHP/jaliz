# Task Assignment: Blog & Marketplace Cross-Linking & Marketplace Survey

## Working Directory
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3

## User Request
Read: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md

## Objective
Investigate the marketplace feature and how to implement dynamic cross-linking between blog articles and the marketplace:
1. Marketplace investigation:
   - What does `src/app/marketplace` look like? (routes, components, query parameters like `?query=...` or category filters).
   - What data exists for marketplace listings (e.g., plants, pots, fertilizers, care tools)? Is it in `src/data/`, `src/lib/`, or a component?
2. Cross-linking strategy:
   - In species blog articles or at the bottom of blog articles, how can we dynamically detect the relevant plant species or topic (from blog post tags, category, slug, or title) and display related marketplace cards or CTAs?
   - How can we make this reusable across both the blog posts (`/blog/[slug]`) and the encyclopedia (`/wiki/[slug]`)?
   - Design matching plant/keyword mapping to marketplace queries (e.g. "سانسوریا" -> `/marketplace?query=سانسوریا`).
3. Visual styling and component conventions:
   - What UI components, icons (lucide-react etc.), Tailwind classes, and Persian typography patterns are used in Jaliz?
   - Ensure components follow existing clean styling and responsive RTL design.

## Output Requirements
Produce a comprehensive handoff report at `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3/handoff.md` with:
- Marketplace architecture and search/query mechanisms
- Proposed cross-linking component design and keyword matching algorithm
- Reusable linking patterns for both `/blog/[slug]` and `/wiki/[slug]`
- Step-by-step implementation plan for R3


## 2026-11-13T19:59:39Z
You are teamwork_explorer_survey_3, a read-only exploration agent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3
Your task assignment is in: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3/DISPATCH.md
The authoritative user request is in: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md

You MUST read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md first before starting your investigation.
Follow all instructions in DISPATCH.md.
Investigate the codebase thoroughly regarding the marketplace feature, marketplace listings/queries, dynamic cross-linking from blog posts to marketplace listings, and styling conventions.
Produce a comprehensive handoff report at /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3/handoff.md.
When done, message me with your completion notification.


## 2026-11-13T20:18:46Z
**Context**: Server restart recovery
**Content**: The server was restarted. Please resume your exploration of the marketplace architecture, dynamic blog-to-marketplace cross-linking, and UI styling conventions per DISPATCH.md.
**Action**: Complete your survey investigation, write your findings to handoff.md, and message me when finished.

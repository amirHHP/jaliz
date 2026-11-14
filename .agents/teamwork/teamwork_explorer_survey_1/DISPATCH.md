# Task Assignment: Plant Encyclopedia & Routing Survey

## Working Directory
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_1

## User Request
Read: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md

## Objective
Investigate how to build the scalable programmatic plant encyclopedia directory at `/wiki` and dynamic pages `/wiki/[slug]` for popular houseplants in Jaliz (Next.js App Router).
Specifically investigate:
1. Existing plant data, schemas, or care guide data in `src/` (e.g. `src/data/`, `src/lib/`, `src/types/`, etc.). Is there an existing database or mock data for plants?
2. The requirements for the plant data:
   - Must cover popular houseplants (e.g., سانسوریا، پتوس، زامیفولیا، برگ انجیری، فیکوس، آگلونما، یوکا، دیفن باخیا، شفلرا، کالانکوئه، قاشقی، اسپاتی فیلوم, and more).
   - Structured care specifications: Light (نور), Watering (آبیاری), Temperature (دما), Soil (خاک), Pet Safety (سمیت برای حیوانات), Common Problems (مشکلات رایج).
   - Valid JSON-LD structured data schema (e.g. Article, Thing, or custom schema structure suited for plant guides/species).
3. The CTAs required on each plant page:
   - Add to user's garden / care reminder (how does Jaliz handle adding plants to care schedule or user garden? e.g. `/schedule`, modal, or action)
   - Browse matching marketplace listings (`/marketplace?query=...`)
   - Diagnose plant leaf diseases with AI (`/plants/diagnose` or existing diagnosis route)
4. Routing, sitemap, and SEO:
   - `src/app/sitemap.ts` (current structure and how `/wiki` and dynamic slugs should be registered)
   - `src/app/robots.ts` or `public/robots.txt` (ensure `/wiki` is crawlable)
   - Breadcrumb navigation, metadata generation (`generateMetadata`), open graph tags, Persian typography, responsive layout.

## Output Requirements
Produce a comprehensive handoff report at `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_1/handoff.md` with:
- Codebase evidence (file paths, exact types, existing routes)
- Recommended plant encyclopedia data structure and file locations
- Step-by-step implementation plan for R1


## 2026-11-13T19:59:22Z
You are teamwork_explorer_survey_1, a read-only exploration agent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_1
Your task assignment is in: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_1/DISPATCH.md
The authoritative user request is in: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md

You MUST read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md first before starting your investigation.
Follow all instructions in DISPATCH.md.
Investigate the codebase thoroughly to map the plant encyclopedia directory under `/wiki`, individual dynamic pages `/wiki/[slug]`, structured care details, JSON-LD schema, CTAs, sitemap, and robots.txt.
Produce a comprehensive handoff report at /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_1/handoff.md.
When done, message me with your completion notification.


## 2026-11-13T20:18:35Z
**Context**: Server restart recovery
**Content**: The server was restarted. Please resume your exploration of the plant encyclopedia directory (/wiki), dynamic plant pages (/wiki/[slug]), structured care specifications, JSON-LD, CTAs, sitemap, and robots.txt per DISPATCH.md.
**Action**: Complete your survey investigation, write your findings to handoff.md, and message me when finished.

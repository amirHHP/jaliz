# Task Assignment: Blog System, HowTo Schema & Title Optimization Survey

## Working Directory
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2

## User Request
Read: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md

## Objective
Investigate how blog articles are structured, rendered, and typed, and how to implement:
1. Automatic HowTo JSON-LD schema generation for tutorial blog articles in `src/app/blog/[slug]/page.tsx`:
   - Inspect `src/app/blog/[slug]/page.tsx`, `src/lib/blogData.ts`, `src/lib/blogPostsExpansion1.ts`, `src/lib/blogPostsExpansion2.ts`, and any types (`BlogPost`, etc.).
   - How are articles structured? Look at categories, tags, content headings (H2, H3), lists, or steps.
   - Which articles represent tutorials (e.g. repotting/تعویض گلدان, water propagation/تکثیر در آب, moss pole building/ساخت قیم خزه, etc.)?
   - How can we reliably detect tutorial posts without breaking non-tutorial posts?
   - How to construct valid schema.org `HowTo` JSON-LD schema (with `name`, `description`, `step` array with `name`/`text` or `HowToStep`) while keeping existing `BlogPosting`/`Article` schema intact or alongside it.
2. CTR Optimization of Blog Titles:
   - Inspect current titles in `src/lib/blogData.ts` and expansion files.
   - How are titles stored? Are they used in slugs or only as display titles? (IMPORTANT: Slugs must NEVER change to avoid breaking existing URLs and internal links!).
   - Identify CTR-enhancing patterns (emojis, Persian brackets `【...】` or `[...]`, power words, actionable hooks) that can be applied to titles across the articles.
   - Outline an exact strategy and safe modifications.

## Output Requirements
Produce a comprehensive handoff report at `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/handoff.md` with:
- Codebase evidence (file paths, types, schema structure)
- Proposed tutorial detection logic and HowTo schema generator code structure
- Recommended CTR title updates and validation that slugs remain intact
- Step-by-step implementation plan for R2 and R4


## 2026-11-13T19:59:28Z
From: eed6eb13-3f90-4d26-9c91-172933d897e5
Content:
You are teamwork_explorer_survey_2, a read-only exploration agent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2
Your task assignment is in: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/DISPATCH.md
The authoritative user request is in: /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md

You MUST read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md first before starting your investigation.
Follow all instructions in DISPATCH.md.
Investigate the codebase thoroughly regarding blog structure, HowTo JSON-LD schema generation in src/app/blog/[slug]/page.tsx for tutorial articles, and CTR title optimization for blog data.
Produce a comprehensive handoff report at /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/handoff.md.
When done, message me with your completion notification.


## 2026-11-13T20:18:40Z
From: eed6eb13-3f90-4d26-9c91-172933d897e5
Content:
**Context**: Server restart recovery
**Content**: The server was restarted. Please resume your exploration of the blog system, HowTo JSON-LD schema generation in src/app/blog/[slug]/page.tsx for tutorial articles, and CTR title optimization per DISPATCH.md.
**Action**: Complete your survey investigation, write your findings to handoff.md, and message me when finished.

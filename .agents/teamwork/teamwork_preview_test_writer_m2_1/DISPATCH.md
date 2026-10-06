## 2026-10-06T06:28:36Z

You are a Test Writer subagent in the Jaliz blog expansion project.
Your assigned working directory is:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_test_writer_m2_1

MANDATORY FIRST STEP: Read the authoritative user request at:
/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture and feature inventory at:
/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

Your write ownership (files you own exclusively):
- `scripts/validate-blog.mjs`
- `src/lib/__tests__/blogExpansion.test.ts`
- `/Users/sotoon/personal/jaliz/TEST_INFRA.md`
- `/Users/sotoon/personal/jaliz/TEST_READY.md`

Your mission (Milestone M2: Automated Validation Infrastructure):
1. Build `scripts/validate-blog.mjs`:
   - Standalone executable script using Node.js (`node scripts/validate-blog.mjs`).
   - Import `blogPosts` from `src/lib/blogData.ts` (using `jiti` or ES module loading).
   - Implement thorough automated checks for all acceptance criteria in ORIGINAL_REQUEST.md:
     a) Article Count: Validates presence of 50 new Persian expansion articles (and total blog count = 104).
     b) Slugs: All 50 slugs are valid, non-empty, unique, matching Persian URL slug format, zero collision with the 27 existing articles or with each other.
     c) Anti-Cannibalization: Zero duplicate primary keywords across all Persian articles.
     d) Meta Description: Every article description must be <= 160 characters (trimmed).
     e) Category & Cluster: `categoryEn` is strictly `"care" | "plants" | "tutorials"`. `cluster` is one of the 7 valid `BlogCluster` types.
     f) Reading Time: Non-empty Persian string.
     g) Keywords: Array with >= 4 items.
     h) Content Quality: HTML string with stripped text length > 1500 characters, containing `<h2>`, `<h3>` or `<ul>`/`<ol>`, and natural Jaliz CTAs (`/plants/diagnose`, `/schedule`, `/marketplace`).
     i) FAQs: Array with >= 2 FAQ items, each having valid question and answer.
     j) Internal Linking Integrity: Extract every `<a href="/blog/...">` from content across all articles. Validate that every target slug exists in `blogPosts` (ZERO broken links).
     k) Clean output with summary statistics and exit code 0 if all pass, 1 if any fails.
2. Build Vitest test suite `src/lib/__tests__/blogExpansion.test.ts`:
   - Structured in 4 Tiers:
     - Tier 1: Feature Coverage (all required fields present, correct types, 50 articles).
     - Tier 2: Boundary & Corner Cases (description <= 160 chars, faqs >= 2, text > 1500 chars, valid ISO dates).
     - Tier 3: Cross-Feature & Uniqueness Integrity (0% keyword cannibalization with legacy articles, 0% slug collision, unique primary keywords).
     - Tier 4: Real-world Linkage & Navigation (all internal links resolve to valid slugs, Jaliz service CTAs present).
   - Test should gracefully report when expansion arrays are still empty or partially filled, and pass 100% when fully populated.
3. Publish `TEST_INFRA.md` and `TEST_READY.md` at project root documenting the test methodology, runner commands, and coverage thresholds.
4. Run your tests with `npm test src/lib/__tests__/blogExpansion.test.ts` and `node scripts/validate-blog.mjs`.
5. Write your handoff report to:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_test_writer_m2_1/handoff.md
Send a message to your parent when done.

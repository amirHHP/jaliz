## 2026-10-06T10:33:40Z

You are a Worker subagent in the Jaliz blog expansion project.
Your assigned working directory is:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_finish_1

MANDATORY FIRST STEP: Read the authoritative user request at:
/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture and feature inventory at:
/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership:
- `src/lib/blogPostsExpansion1.ts`
- `src/lib/blogPostsExpansion2.ts`
- `src/lib/blogData.ts`

Your mission:
1. Review `src/lib/blogPostsExpansion1.ts`:
   - It contains Articles 1 to 25.
   - Run a check (or script) on all 25 articles in `expansionPosts1` to verify that each article has:
     * `<p class="lead ...">`
     * `<h2>`
     * `<ul>` or `<ol>` structured lists (check if any article is missing `<ul>` or `<ol>`, as flagged by Sentinel "رفع خطای لیست‌های Batch 1")
     * Jaliz CTA link (`/schedule`, `/plants/diagnose`, or `/marketplace`)
     * `description` length <= 160 chars
     * `faqs` length >= 2
     * clean text length > 1500 chars
     * Valid internal links `<a href="/blog/...">` pointing to existing or expansion slugs (no broken links)
   - Fix any issues in `blogPostsExpansion1.ts`.

2. Complete `src/lib/blogPostsExpansion2.ts`:
   - Currently contains Articles 26 to 32.
   - You must implement the remaining 18 articles (Articles 33 to 50) from `PROJECT.md § Feature Inventory`:
     33. `کود-فسفر-بالا-ریشه-زایی` (Care / کود ریشه زایی گیاهان / care) -> CTA: `/schedule`
     34. `اسیدیته-و-پی-اچ-خاک-گلدان` (Care / تنظیم پی اچ خاک گلدان / care) -> CTA: `/schedule`
     35. `تکثیر-سانسوریا-از-برگ` (Tutorial / تکثیر سانسوریا با برگ / tutorials) -> CTA: `/marketplace`
     36. `تکثیر-زامیفولیا-از-برگ` (Tutorial / تکثیر زامیفولیا از برگ / tutorials) -> CTA: `/marketplace`
     37. `ساخت-قیم-خزه-ای` (Tutorial / ساخت قیم خزه ای / tutorials) -> CTA: `/marketplace`
     38. `کاربرد-لیکا-در-گلدان` (Tutorial / پوکه معدنی برای گلدان / tutorials) -> CTA: `/marketplace`
     39. `ترکیب-خاک-کاکتوس-و-ساکولنت` (Tutorial / خاک مخصوص کاکتوس / tutorials) -> CTA: `/marketplace`
     40. `ترکیب-خاک-ارکیده` (Tutorial / خاک مخصوص ارکیده / tutorials) -> CTA: `/marketplace`
     41. `تمیز-کردن-و-براق-کردن-برگ-گیاهان` (Tutorial / براق کردن برگ گیاهان / tutorials) -> CTA: `/schedule`
     42. `گیاهان-آویز-آپارتمانی` (Plants / گیاهان آویز آپارتمانی / plants) -> CTA: `/marketplace`
     43. `گیاهان-مناسب-اتاق-خواب` (Plants / گیاهان مناسب اتاق خواب / plants) -> CTA: `/schedule`
     44. `گیاهان-برگ-قرمز-و-رنگی` (Plants / گیاهان آپارتمانی برگ رنگی / plants) -> CTA: `/marketplace`
     45. `کاکتوس-های-خانگی-محبوب` (Plants / انواع کاکتوس خانگی / plants) -> CTA: `/schedule`
     46. `گیاهان-گوشتخوار-خانگی` (Plants / نگهداری گیاه حشره خوار / plants) -> CTA: `/marketplace`
     47. `گیاهان-مناسب-حمام-و-دستشویی` (Space / گیاه مناسب حمام / plants) -> CTA: `/schedule`
     48. `گیاهان-مناسب-آشپزخانه` (Space / گیاهان مناسب آشپزخانه / plants) -> CTA: `/schedule`
     49. `گیاهان-مناسب-میز-کار` (Space / گیاه برای میز کار / plants) -> CTA: `/schedule`
     50. `ساخت-تراریوم-خانگی` (Space / ساخت تراریوم در خانه / tutorials) -> CTA: `/marketplace`
   - Every article must strictly follow the `BlogPost` interface and quality criteria:
     * `slug`: Exact Persian slug
     * `lang`: `"fa"`
     * `title`: Engaging Persian title
     * `description`: <= 160 characters
     * `category` and `categoryEn`: strictly valid
     * `readTime`: e.g. `"۱۰ دقیقه"`
     * `author`: `"سارا گل‌پرور"` or `"علی سبزواری"`
     * `icon`: one of the 10 valid icons
     * `gradient`: Tailwind gradient
     * `keywords`: >= 4 items
     * `primaryKeyword`: exact unique keyword
     * `cluster`: valid `BlogCluster`
     * `publishedAtIso`: `"2026-10-05"`
     * `alternateSlug`: valid slug string
     * `faqs`: >= 2 items
     * `content`: Rich HTML (>1500 chars stripped text), containing `<h2>`, `<h3>`, `<ul>` or `<ol>`, internal links `<a href="/blog/...">` to existing or expansion slugs, and natural Jaliz CTA (`/schedule`, `/plants/diagnose`, `/marketplace`).
   - Export `export const expansionPosts2: BlogPost[] = [...]` containing all 25 articles (26 to 50).

3. Verify integration in `src/lib/blogData.ts`:
   - Both `expansionPosts1` and `expansionPosts2` are exported and spread into `blogPosts`. Total blog posts should be 104 (54 legacy + 50 expansion).

4. Automated Verification:
   - Run `node scripts/validate-blog.mjs` (must pass 100% with exit code 0).
   - Run `npm test` (all test suites, including `blogData.test.ts` and `blogExpansion.test.ts`, must pass).
   - Run `npx tsc --noEmit` (must exit with code 0 and ZERO errors).

5. Write your completion report to:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_finish_1/handoff.md
Send a message to your parent upon completion with the verification outputs.

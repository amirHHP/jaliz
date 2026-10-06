## 2026-10-06T06:28:36Z

You are a Worker subagent in the Jaliz blog expansion project.
Your assigned working directory is:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_m4_1

MANDATORY FIRST STEP: Read the authoritative user request at:
/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture and feature inventory at:
/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership (files you own exclusively):
- `src/lib/blogPostsExpansion2.ts` exclusively!

Your mission (Milestone M4: Content Production Batch 2 — Articles 26 to 50):
Implement exactly Articles 26 to 50 from `PROJECT.md § Feature Inventory` in `src/lib/blogPostsExpansion2.ts`.
Export `export const expansionPosts2: BlogPost[] = [...]`.

Articles to implement (26 to 50):
26. `درمان-سفیدک-پودری` (Diagnosis / سفیدک پودری گلدان / care) -> CTA: `/plants/diagnose`
27. `کود-آهن-برای-گیاهان-آپارتمانی` (Care / کود آهن برای گیاهان / care) -> CTA: `/schedule`
28. `لامپ-رشد-گیاه` (Care / لامپ رشد گیاه خانگی / care) -> CTA: `/schedule`
29. `آبیاری-از-زیرگلدانی` (Care / آبیاری زیرگلدانی / care) -> CTA: `/schedule`
30. `بهترین-آب-برای-گیاهان-آپارتمانی` (Care / آب مناسب برای گلدان / care) -> CTA: `/schedule`
31. `ساخت-جزیره-برای-گیاهان` (Care / ساخت جزیره برای گلدان / care) -> CTA: `/schedule`
32. `نگهداری-گیاهان-در-تابستان` (Care / مراقبت از گیاهان در تابستان / care) -> CTA: `/schedule`
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

STRICT SPECIFICATION FOR EVERY ARTICLE:
- `slug`: Exact Persian slug from list above.
- `lang`: strictly `"fa"`.
- `title`: Engaging, high-CTR Persian title.
- `description`: Informative meta description, STRICTLY <= 160 characters!
- `category`: Localized category label (`"نگهداری"`, `"آموزش‌های کاربردی"`, `"معرفی گیاهان"`).
- `categoryEn`: strictly `"care"`, `"tutorials"`, or `"plants"`.
- `publishedAt`: Persian date string (e.g. `"۱۴ مهر ۱۴۰۵"`).
- `readTime`: Persian read time (e.g. `"۱۰ دقیقه"`).
- `author`: `"سارا گل‌پرور"` or `"علی سبزواری"`.
- `icon`: One of `"Droplets" | "Sprout" | "Sun" | "Bug" | "Heart" | "Scissors" | "Sparkles" | "Leaf" | "BookOpen"`.
- `gradient`: Tailwind gradient (e.g. `"from-emerald-500 to-lime-600"`, `"from-sky-400 to-emerald-500"`, `"from-amber-500 to-orange-600"`).
- `keywords`: Array of 4-6 relevant keywords.
- `primaryKeyword`: Exact primary keyword from list above (guaranteeing 0% cannibalization).
- `cluster`: `"diagnosis" | "care" | "tutorial" | "plants" | "space" | "season"`.
- `publishedAtIso`: ISO date format `"2026-10-05"`.
- `alternateSlug`: set to the post's own slug or related counterpart.
- `faqs`: Array of 2 to 4 rich FAQ items (`question` and `answer`).
- `content`: Complete, rich Persian HTML article (>1500 characters of clean text content). Include:
  - `<p class="lead text-lg text-slate-600 mb-6 font-medium">...</p>`
  - `<h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">...</h2>` and `<h3>` sections.
  - Informative paragraphs and `<ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">`.
  - Smart internal links: 2 to 4 `<a href="/blog/...">` linking to existing articles (such as `/blog/راهنمای-آبیاری-گیاهان-آپارتمانی`, `/blog/انتخاب-خاک-مناسب-گیاهان-آپارتمانی`, `/blog/راهنمای-کوددهی-گیاهان-آپارتمانی`, `/blog/راهنمای-هرس-گیاهان-آپارتمانی`, etc.) or to peer expansion articles.
  - Natural Jaliz CTA woven into the text pointing to the designated service.

Verification:
- Run `npx tsc --noEmit` to verify type compliance.
- Write completion report to:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_preview_worker_m4_1/handoff.md
Send a message to your parent when done.

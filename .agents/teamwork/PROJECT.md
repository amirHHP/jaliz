# Project: Jaliz Blog Expansion (50 SEO Articles)

## Architecture
- **Framework**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5, Vitest.
- **Data Layer**: Modular data files in `src/lib/` aggregated into `blogPosts: BlogPost[]` in `src/lib/blogData.ts`.
  - Legacy pairs: `src/lib/blogData.ts`, `src/lib/blogPostsNew.ts`, `src/lib/blogPostsSeo.ts` (27 pairs / 54 posts).
  - Expansion posts: `src/lib/blogPostsExpansion1.ts` (Posts 1–25) and `src/lib/blogPostsExpansion2.ts` (Posts 26–50).
  - Types: `BlogPost`, `BlogPostInput`, `BlogSeoMeta`, `BlogCluster`, `BlogFaq` in `src/lib/blogTopics.ts`.
- **Validation**: Independent automated validation script `scripts/validate-blog.mjs` verifying:
  - 50 expansion articles exist and are exported.
  - Zero slug collisions across all 104 articles (54 legacy + 50 expansion).
  - Zero primary keyword collisions per language.
  - Description <= 160 characters.
  - FAQs >= 2 per article.
  - Internal links validity (all `<a href="/blog/...">` resolve to real slugs).
  - Text length > 1500 chars (excluding HTML tags).
  - Schema & CategoryEn strictly `"care" | "plants" | "tutorials"`.
  - Type checking `npx tsc --noEmit` exit code 0.

## Code Layout
- `src/lib/blogTopics.ts` — Type definitions, cluster union, and SEO mapping helpers.
- `src/lib/blogData.ts` — Aggregated post array `blogPosts: BlogPost[]`.
- `src/lib/blogPostsExpansion1.ts` — 25 expansion articles (Species 1–16, Diagnosis 17–25).
- `src/lib/blogPostsExpansion2.ts` — 25 expansion articles (Diagnosis 26, Care 27–34, Tutorial 35–41, Plants 42–46, Space/Season 47–50).
- `src/lib/__tests__/blogData.test.ts` — Existing test suite updated to test both legacy bilingual pairs and new expansion posts.
- `src/lib/__tests__/blogExpansion.test.ts` — Dedicated Vitest test suite for expansion criteria.
- `scripts/validate-blog.mjs` — Standalone validation runner satisfying Acceptance Criteria R4.

---

## Anti-Cannibalization Matrix & Baseline
The existing 27 Persian articles (Slugs: `راهنمای-آبیاری-گیاهان-آپارتمانی`, `گیاهان-آپارتمانی-مقاوم-برای-تازه-کارها`, `راهنمای-تعویض-گلدان-و-خاک`, `راهنمای-تکثیر-گیاهان-در-آب`, `راهنمای-هیدروپونیک-به-زبان-ساده`, `علت-زرد-شدن-برگ-گیاهان`, `گیاهان-آپارتمانی-نور-کم`, `راهنمای-رطوبت-گیاهان-آپارتمانی`, `راهنمای-کوددهی-گیاهان-آپارتمانی`, `راهنمای-نور-گیاهان-آپارتمانی`, `آفات-رایج-گیاهان-آپارتمانی`, `گیاهان-بی-خطر-برای-حیوانات-خانگی`, `مراقبت-زمستانی-گیاهان-آپارتمانی`, `انتخاب-خاک-مناسب-گیاهان-آپارتمانی`, `گیاهان-تصفیه-کننده-هوا`, `علت-قهوه-ای-شدن-نوک-برگ`, `راهنمای-هرس-گیاهان-آپارتمانی`, `نگهداری-سانسوریا`, `نگهداری-پتوس`, `نگهداری-زامیفولیا`, `نگهداری-برگ-انجیری`, `گیاهان-مناسب-بالکن`, `کاشت-ریحان-و-سبزی-در-گلدان`, `قارچ-سفید-روی-خاک-گلدان`, `انتخاب-گلدان-سفالی-یا-پلاستیکی`, `نگهداری-گیاه-در-مسافرت`, `گیاهان-گلدار-آپارتمانی`) are strictly preserved.
All 50 new articles have 0% slug overlap, 0% primary keyword overlap, and specific long-tail search intent.

---

## Feature Inventory (50 SEO Articles)

| # | Slug | Primary Keyword | Cluster | CategoryEn | Milestone | Search Intent & Angle | Jaliz CTA |
|---|---|---|---|---|---|---|---|
| 1 | `نگهداری-آگلونما` | نگهداری آگلونما | species | plants | M3 | Informational: راهنمای کامل انواع آگلونما برفی، سفید و صورتی و مقاومت به نور کم | `/schedule` |
| 2 | `نگهداری-فیکوس-الاستیکا` | نگهداری فیکوس الاستیکا | species | plants | M3 | Informational: شرایط رشد فیکوس شرابی و بلک، تمیز کردن برگ چرمی و تعویض خاک | `/plants/diagnose` |
| 3 | `نگهداری-فیکوس-لیراتا` | نگهداری فیکوس لیراتا | species | plants | M3 | Problem-Solving: درمان لکه‌های قهوه‌ای برگ ویولونی و رطوبت پایدار | `/schedule` |
| 4 | `نگهداری-شفلرا` | نگهداری شفلرا | species | plants | M3 | Informational: نگهداری گیاه چتری، علت ریزش برگ شفلرا ابلق و سبز | `/plants/diagnose` |
| 5 | `نگهداری-سینگونیوم` | نگهداری سینگونیوم | species | plants | M3 | Informational: گیاه پنجه غازی، رطوبت، قیم خزه‌ای و تکثیر در آب | `/marketplace` |
| 6 | `نگهداری-اسپاتی-فیلوم` | نگهداری اسپاتی فیلوم | species | plants | M3 | Informational: گل صلح، علت بی‌حال شدن و گل ندادن، تصفیه هوا و آبیاری حساس | `/schedule` |
| 7 | `نگهداری-بنجامین` | نگهداری گل بنجامین | species | plants | M3 | Problem-Solving: جلوگیری از ریزش برگ بنجامین آمستل و ابلق در جابجایی | `/plants/diagnose` |
| 8 | `نگهداری-یوکا` | نگهداری گیاه یوکا | species | plants | M3 | Informational: نخل خنجری، خشکی‌دوست، نور مستقیم و جلوگیری از پوسیدگی تنه | `/schedule` |
| 9 | `نگهداری-دیفن-باخیا` | نگهداری دیفن باخیا | species | plants | M3 | Informational: ساقه ضخیم، مراقبت در برابر سوختگی برگ و احتیاط سمیت | `/plants/diagnose` |
| 10 | `نگهداری-کالاتیا` | نگهداری گل کالاتیا | species | plants | M3 | Informational: گیاه دعاگو، حرکات برگ در شب، آب جوشیده سرد و رطوبت بالا | `/schedule` |
| 11 | `نگهداری-کروتون` | نگهداری کروتون | species | plants | M3 | Problem-Solving: حفظ رنگدانه‌های قرمز و زرد برگ و آفت کنه تارعنکبوتی | `/plants/diagnose` |
| 12 | `نگهداری-ارکیده` | نگهداری گل ارکیده | species | plants | M3 | Informational: ارکیده فالانوپسیس، گلدان شفاف، آبیاری غوطه‌وری و گلدهی مجدد | `/schedule` |
| 13 | `نگهداری-پپرومیا` | نگهداری پپرومیا قاشقی | species | plants | M3 | Informational: برگ ضخیم گوشتی، مراقبت کم‌دردسر و حساسیت به خاک باتلاقی | `/marketplace` |
| 14 | `نگهداری-آلوئه-ورا` | نگهداری آلوئه ورا در گلدان | species | plants | M3 | Informational: خاک سبک شنی، آفتاب پشت پنجره و برداشت اصولی ژل | `/schedule` |
| 15 | `نگهداری-نخل-مرداب` | نگهداری نخل مرداب | species | plants | M3 | Informational: پنجه کلاغی، علاقه به آب دائم و قرار دادن گلدان در کاسه آب | `/schedule` |
| 16 | `نگهداری-بنسای` | نگهداری بنسای در خانه | species | plants | M3 | Informational: بنسای جنسینگ و فیکوس، رطوبت خاک، هرس ریشه و نور | `/plants/diagnose` |
| 17 | `درمان-شپشک-آردآلود` | شپشک آردآلود | diagnosis | care | M3 | Problem-Solving: راهنمای ریشه‌کنی توده‌های سفید پنبه‌ای با الکل و صابون حشره‌کش | `/plants/diagnose` |
| 18 | `از-بین-بردن-پشه-گلدان` | پشه سیاه گلدان | diagnosis | care | M3 | Problem-Solving: چرخه زندگی لارو سیارید و خشک نگه داشتن لایه رویی خاک | `/plants/diagnose` |
| 19 | `درمان-کنه-تار-عنکبوتی` | کنه تار عنکبوتی گیاهان | diagnosis | care | M3 | Problem-Solving: رفع غبار و تار ریز پشت برگ‌ها با افزایش رطوبت و کنه‌کش | `/plants/diagnose` |
| 20 | `درمان-پوسیدگی-ریشه` | پوسیدگی ریشه گیاه | diagnosis | care | M3 | Problem-Solving: تشخیص بوی تعفن و ریشه‌های قهوه‌ای لزج، ضدعفونی با قارچ‌کش | `/plants/diagnose` |
| 21 | `درمان-شپشک-سپردار` | شپشک سپردار | diagnosis | care | M3 | Problem-Solving: برطرف کردن برجستگی‌های قهوه‌ای و موم‌مانند چسبیده به ساقه | `/plants/diagnose` |
| 22 | `درمان-تریپس-گیاهان` | تریپس در گیاهان آپارتمانی | diagnosis | care | M3 | Problem-Solving: لکه‌های نقره‌ای براق با نقطه‌های سیاه مدفوعی و روش سمپاشی | `/plants/diagnose` |
| 23 | `علت-لکه-های-قهوه-ای-روی-برگ` | لکه قهوه ای روی برگ گیاه | diagnosis | care | M3 | Problem-Solving: تمایز بین لکه قارچی حلقه‌دار و لکه سوختگی آفتاب یا املاح | `/plants/diagnose` |
| 24 | `علت-لوله-شدن-برگ-گیاهان` | علت لوله شدن برگ گیاه | diagnosis | care | M3 | Problem-Solving: واکنش دفاعی گیاه به تنش گرما، کم‌آبی یا آفت مکنده | `/plants/diagnose` |
| 25 | `درمان-شوک-جابجایی-گیاه` | شوک جابجایی گیاه | diagnosis | care | M3 | Problem-Solving: احیای گیاه تازه خریداری‌شده یا بعد از تغییر مکان و اسباب‌کشی | `/schedule` |
| 26 | `درمان-سفیدک-پودری` | سفیدک پودری گلدان | diagnosis | care | M4 | Problem-Solving: لایه‌های آردمانند قارچی روی برگ و بهبود گردش هوای محیط | `/plants/diagnose` |
| 27 | `کود-آهن-برای-گیاهان-آپارتمانی` | کود آهن برای گیاهان | care | care | M4 | Informational: رفع کلروز و سبز ماندن رگبرگ‌ها همراه با زردی پهنک برگ | `/schedule` |
| 28 | `لامپ-رشد-گیاه` | لامپ رشد گیاه خانگی | care | care | M4 | Informational: مشخصات نور فول اسپکتروم (LED Grow Light)، لوکس و ساعات تابش | `/schedule` |
| 29 | `آبیاری-از-زیرگلدانی` | آبیاری زیرگلدانی | care | care | M4 | Tutorial: تکنیک جذب مویینگی از کف، مزایا برای بنفشه و جلوگیری از پشه | `/schedule` |
| 30 | `بهترین-آب-برای-گیاهان-آپارتمانی` | آب مناسب برای گلدان | care | care | M4 | Informational: مضرات کلر و فلوراید آب لوله‌کشی و روش‌های تصفیه و بیات کردن آب | `/schedule` |
| 31 | `ساخت-جزیره-برای-گیاهان` | ساخت جزیره برای گلدان | care | care | M4 | Tutorial: راهنمای سینی سنگریزه و آب بدون تماس مستقیم کف گلدان برای افزایش رطوبت | `/schedule` |
| 32 | `نگهداری-گیاهان-در-تابستان` | مراقبت از گیاهان در تابستان | care | care | M4 | Season/Care: مدیریت باد کولر گازی، تبخیر سریع خاک و آفتاب سوزان تیر و مرداد | `/schedule` |
| 33 | `کود-فسفر-بالا-ریشه-زایی` | کود ریشه زایی گیاهان | care | care | M4 | Informational: نقش فسفر (P) در تحریک ریشه‌دهی و زمان مصرف بعد از قلمه | `/schedule` |
| 34 | `اسیدیته-و-پی-اچ-خاک-گلدان` | تنظیم پی اچ خاک گلدان | care | care | M4 | Informational: اهمیت pH در جذب عناصر غذایی و اصلاح خاک قلیایی آپارتمانی | `/schedule` |
| 35 | `تکثیر-سانسوریا-از-برگ` | تکثیر سانسوریا با برگ | tutorial | tutorials | M4 | Step-by-Step: برش هشتی برگ، پینه‌بستن، ریشه‌دار کردن در آب و خاک | `/marketplace` |
| 36 | `تکثیر-زامیفولیا-از-برگ` | تکثیر زامیفولیا از برگ | tutorial | tutorials | M4 | Step-by-Step: تشکیل غده (ریزوم) زیر برگچه، بستر کوکوپیت و پرلیت | `/marketplace` |
| 37 | `ساخت-قیم-خزه-ای` | ساخت قیم خزه ای | tutorial | tutorials | M4 | Step-by-Step: آموزش ساخت قیم خزه اسفاگنوم برای ریشه‌های هوایی پتوس و فیلودندرون | `/marketplace` |
| 38 | `کاربرد-لیکا-در-گلدان` | پوکه معدنی برای گلدان | tutorial | tutorials | M4 | Tutorial: ایجاد زهکش کف گلدان، بستر کشت لیکا و سبک‌سازی خاک | `/marketplace` |
| 39 | `ترکیب-خاک-کاکتوس-و-ساکولنت` | خاک مخصوص کاکتوس | tutorial | tutorials | M4 | Tutorial: فرمول خاک ماسه‌ای با زهکش فوق‌العاده سریع بدون پیت‌ماس متراکم | `/marketplace` |
| 40 | `ترکیب-خاک-ارکیده` | خاک مخصوص ارکیده | tutorial | tutorials | M4 | Tutorial: استفاده از پوست درخت (پاین بارک) و زغال بدون ذرات خاک معمولی | `/marketplace` |
| 41 | `تمیز-کردن-و-براق-کردن-برگ-گیاهان` | براق کردن برگ گیاهان | tutorial | tutorials | M4 | Tutorial: روش‌های طبیعی پاکسازی غبار با اسفنج نرم بدون روغن مایع مضر | `/schedule` |
| 42 | `گیاهان-آویز-آپارتمانی` | گیاهان آویز آپارتمانی | plants | plants | M4 | Curated List: پتوس نقره‌ای، سرخس، غوره ای و مرواریدی برای گلدان‌های سقفی | `/marketplace` |
| 43 | `گیاهان-مناسب-اتاق-خواب` | گیاهان مناسب اتاق خواب | plants | plants | M4 | Curated List: گیاهان با تنفس شبانه CAM (تولید اکسیژن شب) مانند سانسوریا | `/schedule` |
| 44 | `گیاهان-برگ-قرمز-و-رنگی` | گیاهان آپارتمانی برگ رنگی | plants | plants | M4 | Curated List: کالاتیا مدالیون، مارانتا، استرومانته و هیپوئستس برای خانه | `/marketplace` |
| 45 | `کاکتوس-های-خانگی-محبوب` | انواع کاکتوس خانگی | plants | plants | M4 | Curated List: کاکتوس اپونتیا، مامیلاریا و ژیمنوکالیسیوم برای پشت پنجره آفتاب‌گیر | `/schedule` |
| 46 | `گیاهان-گوشتخوار-خانگی` | نگهداری گیاه حشره خوار | plants | plants | M4 | Curated List: ونوس مگس‌خوار، ساراسنیا، آب مقطر خالص و خاک فقیر از مواد غذایی | `/marketplace` |
| 47 | `گیاهان-مناسب-حمام-و-دستشویی` | گیاه مناسب حمام | space | plants | M4 | Space: انتخاب گیاهان رطوبت‌دوست مقاوم به نور غیرمستقیم مانند سرخس و اسپاتی | `/schedule` |
| 48 | `گیاهان-مناسب-آشپزخانه` | گیاهان مناسب آشپزخانه | space | plants | M4 | Space: گیاهان مقاوم به چربی و نوسان دمای گاز مانند پوتوس و آلوئه ورا | `/schedule` |
| 49 | `گیاهان-مناسب-میز-کار` | گیاه برای میز کار | space | plants | M4 | Space: گیاهان مینیاتوری رومیزی کم‌جا برای افزایش تمرکز و هوای تمیز | `/schedule` |
| 50 | `ساخت-تراریوم-خانگی` | ساخت تراریوم در خانه | space | tutorials | M4 | Space/Tutorial: باغ شیشه‌ای دربسته، لایه‌های کربن فعال و خزه برای دکوراسیون | `/marketplace` |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Toolchain & Pre-requisite Remediation | Fix 9 pre-existing `tsc` errors in test files, update `blogData.test.ts` to allow bilingual & expansion posts, verify clean `npx tsc --noEmit`. | none | DONE (`tsc` clean, 0 errors) |
| M2 | Automated Validation Infrastructure | Build `scripts/validate-blog.mjs` and `src/lib/__tests__/blogExpansion.test.ts` enforcing all 50 article criteria (R4) and create `TEST_READY.md`. | M1 | DONE (`validate-blog.mjs` 11/11 checks, 19/19 vitests) |
| M3 | Content Production Batch 1 (Articles 1–25) | Implement `src/lib/blogPostsExpansion1.ts` with 25 articles (Species 1–16, Diagnosis 17–25), rich HTML, faqs >= 2, valid internal links, and Jaliz CTAs. | M1 | DONE (25 articles compliant, list formatting resolved) |
| M4 | Content Production Batch 2 (Articles 26–50) | Implement `src/lib/blogPostsExpansion2.ts` with 25 articles (Diagnosis 26, Care 27–34, Tutorial 35–41, Plants 42–46, Space 47–50), rich HTML, faqs >= 2, valid internal links, and Jaliz CTAs. | M1 | DONE (25 articles compliant, exported as `expansionPosts2`) |
| M5 | Full Integration & Final Acceptance Gate | Integrate both batches into `src/lib/blogData.ts`, run validation runner, run vitest, execute `npx tsc --noEmit` (0 errors), run Reviewer, Challenger, and Forensic Auditor verification. | M2, M3, M4 | DONE (104/104 posts, 11/11 validator, 228/228 tests pass) |

---

## Interface Contracts

### `BlogPost` Expansion Contract
All 50 articles in `blogPostsExpansion1.ts` and `blogPostsExpansion2.ts` must export an array of `BlogPost` (or `BlogPostInput` mapped to `BlogPost`) matching:
```typescript
interface BlogPost {
  slug: string              // unique Persian kebab-case string
  lang: "fa"                // strictly "fa"
  title: string             // rich Persian title
  description: string       // max 160 characters
  category: string          // Persian label: "نگهداری" | "معرفی گیاهان" | "آموزش‌های کاربردی"
  categoryEn: string        // "care" | "plants" | "tutorials"
  publishedAt: string       // Persian date, e.g. "۱۵ مهر ۱۴۰۵"
  readTime: string          // e.g. "۱۰ دقیقه"
  author: string            // "سارا گل‌پرور" or "علی سبزواری"
  content: string           // raw HTML, > 1500 chars text, H2, H3, ul/ol, <a> links, CTAs
  icon: string              // "Sprout" | "Droplets" | "Sun" | "Bug" | "Scissors" | "BookOpen" | "Heart" | "Sparkles" | "Leaf"
  gradient: string          // Tailwind gradient class, e.g. "from-emerald-500 to-lime-600"
  keywords: string[]        // >= 4 keywords
  primaryKeyword: string    // unique Persian keyword
  cluster: BlogCluster      // "species" | "diagnosis" | "season" | "space" | "tutorial" | "care" | "plants"
  publishedAtIso: string    // /^\d{4}-\d{2}-\d{2}$/
  alternateSlug: string     // slug string (or mapped self/alternate)
  faqs: BlogFaq[]           // >= 2 faqs with question & answer
}
```

### Internal Linking Rules
- Format: `<a href="/blog/اسلاگ-معتبر">متن لینک</a>`
- Targets: must point only to either the 27 existing Persian slugs or one of the 50 new expansion slugs.
- No dead links or 404 targets allowed.

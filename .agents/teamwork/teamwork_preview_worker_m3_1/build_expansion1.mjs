import fs from "node:fs"
import path from "node:path"
import { articles1To8 } from "./articles_1_to_8.mjs"
import { articles9To16 } from "./articles_9_to_16.mjs"
import { articles17To25 } from "./articles_17_to_25.mjs"

const allArticles = [...articles1To8, ...articles9To16, ...articles17To25]

console.log(`Loaded ${allArticles.length} articles.`)

const requiredInventory = [
  { id: 1, slug: "نگهداری-آگلونما", primaryKeyword: "نگهداری آگلونما", cluster: "species", categoryEn: "plants", cta: "/schedule" },
  { id: 2, slug: "نگهداری-فیکوس-الاستیکا", primaryKeyword: "نگهداری فیکوس الاستیکا", cluster: "species", categoryEn: "plants", cta: "/plants/diagnose" },
  { id: 3, slug: "نگهداری-فیکوس-لیراتا", primaryKeyword: "نگهداری فیکوس لیراتا", cluster: "species", categoryEn: "plants", cta: "/schedule" },
  { id: 4, slug: "نگهداری-شفلرا", primaryKeyword: "نگهداری شفلرا", cluster: "species", categoryEn: "plants", cta: "/plants/diagnose" },
  { id: 5, slug: "نگهداری-سینگونیوم", primaryKeyword: "نگهداری سینگونیوم", cluster: "species", categoryEn: "plants", cta: "/marketplace" },
  { id: 6, slug: "نگهداری-اسپاتی-فیلوم", primaryKeyword: "نگهداری اسپاتی فیلوم", cluster: "species", categoryEn: "plants", cta: "/schedule" },
  { id: 7, slug: "نگهداری-بنجامین", primaryKeyword: "نگهداری گل بنجامین", cluster: "species", categoryEn: "plants", cta: "/plants/diagnose" },
  { id: 8, slug: "نگهداری-یوکا", primaryKeyword: "نگهداری گیاه یوکا", cluster: "species", categoryEn: "plants", cta: "/schedule" },
  { id: 9, slug: "نگهداری-دیفن-باخیا", primaryKeyword: "نگهداری دیفن باخیا", cluster: "species", categoryEn: "plants", cta: "/plants/diagnose" },
  { id: 10, slug: "نگهداری-کالاتیا", primaryKeyword: "نگهداری گل کالاتیا", cluster: "species", categoryEn: "plants", cta: "/schedule" },
  { id: 11, slug: "نگهداری-کروتون", primaryKeyword: "نگهداری کروتون", cluster: "species", categoryEn: "plants", cta: "/plants/diagnose" },
  { id: 12, slug: "نگهداری-ارکیده", primaryKeyword: "نگهداری گل ارکیده", cluster: "species", categoryEn: "plants", cta: "/schedule" },
  { id: 13, slug: "نگهداری-پپرومیا", primaryKeyword: "نگهداری پپرومیا قاشقی", cluster: "species", categoryEn: "plants", cta: "/marketplace" },
  { id: 14, slug: "نگهداری-آلوئه-ورا", primaryKeyword: "نگهداری آلوئه ورا در گلدان", cluster: "species", categoryEn: "plants", cta: "/schedule" },
  { id: 15, slug: "نگهداری-نخل-مرداب", primaryKeyword: "نگهداری نخل مرداب", cluster: "species", categoryEn: "plants", cta: "/schedule" },
  { id: 16, slug: "نگهداری-بنسای", primaryKeyword: "نگهداری بنسای در خانه", cluster: "species", categoryEn: "plants", cta: "/plants/diagnose" },
  { id: 17, slug: "درمان-شپشک-آردآلود", primaryKeyword: "شپشک آردآلود", cluster: "diagnosis", categoryEn: "care", cta: "/plants/diagnose" },
  { id: 18, slug: "از-بین-بردن-پشه-گلدان", primaryKeyword: "پشه سیاه گلدان", cluster: "diagnosis", categoryEn: "care", cta: "/plants/diagnose" },
  { id: 19, slug: "درمان-کنه-تار-عنکبوتی", primaryKeyword: "کنه تار عنکبوتی گیاهان", cluster: "diagnosis", categoryEn: "care", cta: "/plants/diagnose" },
  { id: 20, slug: "درمان-پوسیدگی-ریشه", primaryKeyword: "پوسیدگی ریشه گیاه", cluster: "diagnosis", categoryEn: "care", cta: "/plants/diagnose" },
  { id: 21, slug: "درمان-شپشک-سپردار", primaryKeyword: "شپشک سپردار", cluster: "diagnosis", categoryEn: "care", cta: "/plants/diagnose" },
  { id: 22, slug: "درمان-تریپس-گیاهان", primaryKeyword: "تریپس در گیاهان آپارتمانی", cluster: "diagnosis", categoryEn: "care", cta: "/plants/diagnose" },
  { id: 23, slug: "علت-لکه-های-قهوه-ای-روی-برگ", primaryKeyword: "لکه قهوه ای روی برگ گیاه", cluster: "diagnosis", categoryEn: "care", cta: "/plants/diagnose" },
  { id: 24, slug: "علت-لوله-شدن-برگ-گیاهان", primaryKeyword: "علت لوله شدن برگ گیاه", cluster: "diagnosis", categoryEn: "care", cta: "/plants/diagnose" },
  { id: 25, slug: "درمان-شوک-جابجایی-گیاه", primaryKeyword: "شوک جابجایی گیاه", cluster: "diagnosis", categoryEn: "care", cta: "/schedule" },
]

const validSlugs = new Set([
  // 27 Existing legacy Persian slugs
  "راهنمای-آبیاری-گیاهان-آپارتمانی",
  "گیاهان-آپارتمانی-مقاوم-برای-تازه-کارها",
  "راهنمای-تعویض-گلدان-و-خاک",
  "راهنمای-تکثیر-گیاهان-در-آب",
  "راهنمای-هیدروپونیک-به-زبان-ساده",
  "علت-زرد-شدن-برگ-گیاهان",
  "گیاهان-آپارتمانی-نور-کم",
  "راهنمای-رطوبت-گیاهان-آپارتمانی",
  "راهنمای-کوددهی-گیاهان-آپارتمانی",
  "راهنمای-نور-گیاهان-آپارتمانی",
  "آفات-رایج-گیاهان-آپارتمانی",
  "گیاهان-بی-خطر-برای-حیوانات-خانگی",
  "مراقبت-زمستانی-گیاهان-آپارتمانی",
  "انتخاب-خاک-مناسب-گیاهان-آپارتمانی",
  "گیاهان-تصفیه-کننده-هوا",
  "علت-قهوه-ای-شدن-نوک-برگ",
  "راهنمای-هرس-گیاهان-آپارتمانی",
  "نگهداری-سانسوریا",
  "نگهداری-پتوس",
  "نگهداری-زامیفولیا",
  "نگهداری-برگ-انجیری",
  "گیاهان-مناسب-بالکن",
  "کاشت-ریحان-و-سبزی-در-گلدان",
  "قارچ-سفید-روی-خاک-گلدان",
  "انتخاب-گلدان-سفالی-یا-پلاستیکی",
  "نگهداری-گیاه-در-مسافرت",
  "گیاهان-گلدار-آپارتمانی",
  // 50 Expansion slugs
  "نگهداری-آگلونما", "نگهداری-فیکوس-الاستیکا", "نگهداری-فیکوس-لیراتا", "نگهداری-شفلرا",
  "نگهداری-سینگونیوم", "نگهداری-اسپاتی-فیلوم", "نگهداری-بنجامین", "نگهداری-یوکا",
  "نگهداری-دیفن-باخیا", "نگهداری-کالاتیا", "نگهداری-کروتون", "نگهداری-ارکیده",
  "نگهداری-پپرومیا", "نگهداری-آلوئه-ورا", "نگهداری-نخل-مرداب", "نگهداری-بنسای",
  "درمان-شپشک-آردآلود", "از-بین-بردن-پشه-گلدان", "درمان-کنه-تار-عنکبوتی", "درمان-پوسیدگی-ریشه",
  "درمان-شپشک-سپردار", "درمان-تریپس-گیاهان", "علت-لکه-های-قهوه-ای-روی-برگ", "علت-لوله-شدن-برگ-گیاهان",
  "درمان-شوک-جابجایی-گیاه", "درمان-سفیدک-پودری", "کود-آهن-برای-گیاهان-آپارتمانی", "لامپ-رشد-گیاه",
  "آبیاری-از-زیرگلدانی", "بهترین-آب-برای-گیاهان-آپارتمانی", "ساخت-جزیره-برای-گیاهان", "نگهداری-گیاهان-در-تابستان",
  "کود-فسفر-بالا-ریشه-زایی", "اسیدیته-و-پی-اچ-خاک-گلدان", "تکثیر-سانسوریا-از-برگ", "تکثیر-زامیفولیا-از-برگ",
  "ساخت-قیم-خزه-ای", "کاربرد-لیکا-در-گلدان", "ترکیب-خاک-کاکتوس-و-ساکولنت", "ترکیب-خاک-ارکیده",
  "تمیز-کردن-و-براق-کردن-برگ-گیاهان", "گیاهان-آویز-آپارتمانی", "گیاهان-مناسب-اتاق-خواب", "گیاهان-برگ-قرمز-و-رنگی",
  "کاکتوس-های-خانگی-محبوب", "گیاهان-گوشتخوار-خانگی", "گیاهان-مناسب-حمام-و-دستشویی", "گیاهان-مناسب-آشپزخانه",
  "گیاهان-مناسب-میز-کار", "ساخت-تراریوم-خانگی"
])

let errors = []

if (allArticles.length !== 25) {
  errors.push(`Expected 25 articles, got ${allArticles.length}`)
}

for (let i = 0; i < requiredInventory.length; i++) {
  const req = requiredInventory[i]
  const post = allArticles[i]
  if (!post) {
    errors.push(`Missing article index ${i}`)
    continue
  }
  if (post.slug !== req.slug) {
    errors.push(`[#${i + 1}] slug mismatch: expected ${req.slug}, got ${post.slug}`)
  }
  if (post.primaryKeyword !== req.primaryKeyword) {
    errors.push(`[#${i + 1}] primaryKeyword mismatch: expected ${req.primaryKeyword}, got ${post.primaryKeyword}`)
  }
  if (post.cluster !== req.cluster) {
    errors.push(`[#${i + 1}] cluster mismatch: expected ${req.cluster}, got ${post.cluster}`)
  }
  if (post.categoryEn !== req.categoryEn) {
    errors.push(`[#${i + 1}] categoryEn mismatch: expected ${req.categoryEn}, got ${post.categoryEn}`)
  }
  if (post.lang !== "fa") {
    errors.push(`[#${i + 1}] lang must be 'fa'`)
  }
  if (post.description.length > 160) {
    errors.push(`[#${i + 1} ${post.slug}] description too long: ${post.description.length} chars (max 160)`)
  }
  if (!post.faqs || post.faqs.length < 2) {
    errors.push(`[#${i + 1} ${post.slug}] FAQs must be >= 2, got ${post.faqs ? post.faqs.length : 0}`)
  }
  for (const faq of post.faqs || []) {
    if (!faq.question || !faq.answer) {
      errors.push(`[#${i + 1} ${post.slug}] invalid FAQ item`)
    }
  }

  // Clean text length test
  const cleanText = post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  if (cleanText.length <= 1500) {
    errors.push(`[#${i + 1} ${post.slug}] clean text length ${cleanText.length} <= 1500`)
  }

  // Structured tags check (h2 and ul/ol)
  if (!/<h2[^>]*>/i.test(post.content)) {
    errors.push(`[#${i + 1} ${post.slug}] missing <h2> tag`)
  }
  if (!/<(ul|ol)[^>]*>/i.test(post.content)) {
    errors.push(`[#${i + 1} ${post.slug}] missing <ul> or <ol> tag`)
  }

  // Internal link check
  const linkMatches = [...post.content.matchAll(/href="\/blog\/([^"]+)"/g)]
  if (linkMatches.length === 0) {
    errors.push(`[#${i + 1} ${post.slug}] has no internal links`)
  }
  for (const match of linkMatches) {
    const targetSlug = decodeURIComponent(match[1])
    if (!validSlugs.has(targetSlug)) {
      errors.push(`[#${i + 1} ${post.slug}] invalid internal link target: /blog/${targetSlug}`)
    }
  }

  // CTA check
  if (!post.content.includes(req.cta)) {
    errors.push(`[#${i + 1} ${post.slug}] missing required CTA link: ${req.cta}`)
  }
}

if (errors.length > 0) {
  console.error("Validation failed with errors:")
  errors.forEach(e => console.error(" - " + e))
  process.exit(1)
}

console.log("All 25 articles validated successfully!")

// Now serialize to TypeScript
const fileHeader = `import type { BlogPost } from "./blogTopics"

/**
 * Expansion Blog Posts — Batch 1 (Articles 1–25)
 * Topics: Species (1–16) and Diagnosis (17–25)
 * Conforms to BlogPost interface with full SEO metadata, FAQs, and Jaliz CTAs.
 */
export const expansionPosts1: BlogPost[] = ${JSON.stringify(allArticles, null, 2)}
`

const targetPath = path.resolve("/Users/sotoon/personal/jaliz/src/lib/blogPostsExpansion1.ts")
fs.writeFileSync(targetPath, fileHeader, "utf-8")
console.log(`Successfully written to ${targetPath}`)

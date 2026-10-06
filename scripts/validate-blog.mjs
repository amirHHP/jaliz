#!/usr/bin/env node

/**
 * Jaliz Blog Automated Validation Runner
 *
 * Enforces all blog quality, SEO, schema, linking, and anti-cannibalization
 * acceptance criteria defined in ORIGINAL_REQUEST.md and PROJECT.md.
 *
 * Usage:
 *   node scripts/validate-blog.mjs                  # Strict validation (exit 1 if < 50 expansion posts)
 *   node scripts/validate-blog.mjs --allow-partial  # Validates populated posts (warns on count)
 *   node scripts/validate-blog.mjs --json           # Outputs JSON report
 *   node scripts/validate-blog.mjs --verbose        # Detailed diagnostic output
 */

import createJiti from "jiti"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const args = new Set(process.argv.slice(2))
const allowPartial = args.has("--allow-partial") || args.has("-p")
const isJson = args.has("--json")
const isVerbose = args.has("--verbose") || args.has("-v")

if (args.has("--help") || args.has("-h")) {
  console.log(`
Jaliz Blog Expansion Validator
===============================
Usage: node scripts/validate-blog.mjs [options]

Options:
  --allow-partial, -p   Allow incomplete expansion count (< 50) without failing exit code.
  --json                Output results in JSON format.
  --verbose, -v         Display detailed logs for each article.
  --help, -h            Show this help message.
`)
  process.exit(0)
}

// Load blog data via jiti
let blogData
try {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const projectRoot = path.resolve(currentDir, "..")
  const blogDataPath = path.resolve(projectRoot, "src/lib/blogData.ts")
  const jiti = createJiti(blogDataPath)
  blogData = jiti(blogDataPath)
} catch (err) {
  console.error("FATAL: Failed to load src/lib/blogData.ts:", err.message)
  process.exit(1)
}

const {
  blogPosts = [],
  expansionPosts1 = [],
  expansionPosts2 = [],
} = blogData

// Collect all expansion posts
const expansionPosts = [...expansionPosts1, ...expansionPosts2]
const legacyPosts = blogPosts.filter(
  (post) => !expansionPosts.some((exp) => exp.slug === post.slug)
)
const persianLegacyPosts = legacyPosts.filter((post) => post.lang === "fa")
const persianAllPosts = blogPosts.filter((post) => post.lang === "fa")

const ALLOWED_CATEGORIES_EN = new Set(["care", "plants", "tutorials"])
const ALLOWED_CLUSTERS = new Set([
  "species",
  "diagnosis",
  "season",
  "space",
  "tutorial",
  "care",
  "plants",
])
const JALIZ_CTA_TARGETS = ["/plants/diagnose", "/schedule", "/marketplace"]

// Normalization helper for Persian anti-cannibalization checks
function normalizePersianText(text = "") {
  return text
    .replace(/[\u200C\u200B\s]+/g, " ") // normalize half-space / zero-width space / multi-space
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[ة]/g, "ه")
    .trim()
    .toLowerCase()
}

// Strip HTML tags and collapse whitespace to count actual readable text length
function stripHtml(html = "") {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Results registry
const errors = []
const warnings = []
const stats = {
  totalBlogPosts: blogPosts.length,
  legacyPostsCount: legacyPosts.length,
  persianLegacyPostsCount: persianLegacyPosts.length,
  expansionPostsCount: expansionPosts.length,
  expansionBatch1Count: expansionPosts1.length,
  expansionBatch2Count: expansionPosts2.length,
  persianTotalPostsCount: persianAllPosts.length,
  englishTotalPostsCount: blogPosts.filter((p) => p.lang === "en").length,
  totalInternalLinks: 0,
  brokenInternalLinks: 0,
  selfReferentialLinks: 0,
  jalizCtaCount: 0,
  checksRun: 0,
  checksPassed: 0,
}

function recordError(category, slug, message) {
  errors.push({ category, slug, message })
}

function recordWarning(category, slug, message) {
  warnings.push({ category, slug, message })
}

/* ==========================================================================
 * CHECK 1: ARTICLE COUNT & INVENTORY (R1, R4)
 * ========================================================================== */
stats.checksRun++
const EXPECTED_EXPANSION_COUNT = 50
const EXPECTED_TOTAL_COUNT = 104

if (expansionPosts.length === EXPECTED_EXPANSION_COUNT) {
  stats.checksPassed++
} else {
  const msg = `Found ${expansionPosts.length} expansion articles (Batch 1: ${expansionPosts1.length}, Batch 2: ${expansionPosts2.length}); expected ${EXPECTED_EXPANSION_COUNT}. Total blog posts: ${blogPosts.length} (expected ${EXPECTED_TOTAL_COUNT}).`
  if (allowPartial) {
    recordWarning("ArticleCount", "GLOBAL", msg)
    stats.checksPassed++
  } else {
    recordError("ArticleCount", "GLOBAL", msg)
  }
}

/* ==========================================================================
 * CHECK 2: SLUG VALIDITY & UNIQUENESS (R1, R3)
 * ========================================================================== */
stats.checksRun++
let slugCheckFailed = false
const allSlugs = new Set()
const duplicateSlugs = new Set()

for (const post of blogPosts) {
  if (allSlugs.has(post.slug)) {
    duplicateSlugs.add(post.slug)
  }
  allSlugs.add(post.slug)
}

if (duplicateSlugs.size > 0) {
  slugCheckFailed = true
  recordError(
    "SlugCollision",
    "GLOBAL",
    `Found duplicate slugs in blogPosts: ${Array.from(duplicateSlugs).join(", ")}`
  )
}

// Persian URL slug format validation for expansion posts
const PERSIAN_SLUG_REGEX = /^[\u0600-\u06FF0-9a-zA-Z]+(-[\u0600-\u06FF0-9a-zA-Z]+)*$/

for (const post of expansionPosts) {
  if (!post.slug || typeof post.slug !== "string") {
    slugCheckFailed = true
    recordError("SlugFormat", post.slug || "UNKNOWN", "Slug is missing or not a string.")
    continue
  }
  if (!PERSIAN_SLUG_REGEX.test(post.slug)) {
    slugCheckFailed = true
    recordError(
      "SlugFormat",
      post.slug,
      `Slug does not match Persian kebab-case format (no spaces, double hyphens, or leading/trailing hyphens allowed): "${post.slug}"`
    )
  }
  // Check collision with legacy Persian posts
  if (persianLegacyPosts.some((legacy) => legacy.slug === post.slug)) {
    slugCheckFailed = true
    recordError(
      "SlugCollision",
      post.slug,
      `Expansion slug collides with existing legacy Persian slug "${post.slug}".`
    )
  }
}

if (!slugCheckFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 3: ANTI-CANNIBALIZATION & PRIMARY KEYWORDS (R1, R4)
 * ========================================================================== */
stats.checksRun++
let antiCannibalizationFailed = false
const normalizedLegacyKeywords = new Map()

for (const post of persianLegacyPosts) {
  const norm = normalizePersianText(post.primaryKeyword)
  normalizedLegacyKeywords.set(norm, post.slug)
}

const seenExpansionKeywords = new Map()

for (const post of expansionPosts) {
  if (!post.primaryKeyword || typeof post.primaryKeyword !== "string" || !post.primaryKeyword.trim()) {
    antiCannibalizationFailed = true
    recordError(
      "PrimaryKeyword",
      post.slug,
      "primaryKeyword is missing or empty."
    )
    continue
  }

  const norm = normalizePersianText(post.primaryKeyword)

  // Check collision with legacy Persian keywords
  if (normalizedLegacyKeywords.has(norm)) {
    antiCannibalizationFailed = true
    const legacySlug = normalizedLegacyKeywords.get(norm)
    recordError(
      "KeywordCannibalization",
      post.slug,
      `Primary keyword "${post.primaryKeyword}" collides with legacy article "${legacySlug}".`
    )
  }

  // Check collision among expansion articles
  if (seenExpansionKeywords.has(norm)) {
    antiCannibalizationFailed = true
    const prevSlug = seenExpansionKeywords.get(norm)
    recordError(
      "KeywordCannibalization",
      post.slug,
      `Primary keyword "${post.primaryKeyword}" is duplicated between "${prevSlug}" and "${post.slug}".`
    )
  } else {
    seenExpansionKeywords.set(norm, post.slug)
  }
}

if (!antiCannibalizationFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 4: META DESCRIPTION LENGTH & INTEGRITY (R2)
 * ========================================================================== */
stats.checksRun++
let metaDescFailed = false

for (const post of expansionPosts) {
  const desc = (post.description || "").trim()
  if (!desc) {
    metaDescFailed = true
    recordError("MetaDescription", post.slug, "Description is missing or empty.")
    continue
  }
  if (desc.length > 160) {
    metaDescFailed = true
    recordError(
      "MetaDescription",
      post.slug,
      `Description exceeds 160 characters (actual: ${desc.length} chars): "${desc.slice(0, 60)}..."`
    )
  }
  if (desc.length < 20) {
    metaDescFailed = true
    recordError(
      "MetaDescription",
      post.slug,
      `Description is too short (< 20 characters): "${desc}"`
    )
  }
}

if (!metaDescFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 5: CATEGORY & TOPIC CLUSTER SCHEMA (R2, R3)
 * ========================================================================== */
stats.checksRun++
let categoryClusterFailed = false

for (const post of expansionPosts) {
  if (!ALLOWED_CATEGORIES_EN.has(post.categoryEn)) {
    categoryClusterFailed = true
    recordError(
      "CategoryEn",
      post.slug,
      `Invalid categoryEn "${post.categoryEn}". Must be strictly "care" | "plants" | "tutorials".`
    )
  }
  if (!ALLOWED_CLUSTERS.has(post.cluster)) {
    categoryClusterFailed = true
    recordError(
      "Cluster",
      post.slug,
      `Invalid cluster "${post.cluster}". Must be one of: ${Array.from(ALLOWED_CLUSTERS).join(", ")}.`
    )
  }
  if (!post.category || typeof post.category !== "string" || !post.category.trim()) {
    categoryClusterFailed = true
    recordError("Category", post.slug, "Persian category string is missing or empty.")
  }
}

if (!categoryClusterFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 6: READING TIME FORMAT (R2)
 * ========================================================================== */
stats.checksRun++
let readTimeFailed = false

for (const post of expansionPosts) {
  if (!post.readTime || typeof post.readTime !== "string") {
    readTimeFailed = true
    recordError("ReadTime", post.slug, "readTime is missing or not a string.")
    continue
  }
  if (!post.readTime.includes("دقیقه")) {
    readTimeFailed = true
    recordError(
      "ReadTime",
      post.slug,
      `readTime should be a Persian string containing "دقیقه" (received: "${post.readTime}").`
    )
  }
}

if (!readTimeFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 7: KEYWORDS DIVERSITY & ARRAY SIZE (R2)
 * ========================================================================== */
stats.checksRun++
let keywordsFailed = false

for (const post of expansionPosts) {
  if (!Array.isArray(post.keywords)) {
    keywordsFailed = true
    recordError("Keywords", post.slug, "keywords must be an Array.")
    continue
  }
  if (post.keywords.length < 4) {
    keywordsFailed = true
    recordError(
      "Keywords",
      post.slug,
      `keywords array has ${post.keywords.length} items (minimum required: 4).`
    )
  }
  for (const kw of post.keywords) {
    if (typeof kw !== "string" || !kw.trim()) {
      keywordsFailed = true
      recordError("Keywords", post.slug, "keywords array contains empty or non-string entry.")
    }
  }
}

if (!keywordsFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 8: CONTENT QUALITY, HEADINGS, LISTS & JALIZ CTAS (R2, R3)
 * ========================================================================== */
stats.checksRun++
let contentQualityFailed = false

for (const post of expansionPosts) {
  const content = post.content || ""
  const strippedText = stripHtml(content)

  if (strippedText.length <= 1500) {
    contentQualityFailed = true
    recordError(
      "ContentLength",
      post.slug,
      `Stripped content length is ${strippedText.length} characters (minimum required: > 1500 chars).`
    )
  }

  // Heading check: must contain H2
  if (!/<h2[^>]*>/i.test(content)) {
    contentQualityFailed = true
    recordError("ContentHeadings", post.slug, "Content must contain at least one <h2> tag.")
  }

  // List check: must contain <ul> or <ol>
  if (!/<(ul|ol)[^>]*>/i.test(content)) {
    contentQualityFailed = true
    recordError("ContentStructure", post.slug, "Content must contain structured lists (<ul> or <ol>).")
  }

  // Jaliz CTA check
  const hasJalizCta = JALIZ_CTA_TARGETS.some((target) =>
    content.includes(`href="${target}"`) ||
    content.includes(`href='${target}'`) ||
    content.includes(`href="${target}/"`) ||
    content.includes(`href='${target}/'`)
  )

  if (hasJalizCta) {
    stats.jalizCtaCount++
  } else {
    contentQualityFailed = true
    recordError(
      "JalizCTA",
      post.slug,
      `Content is missing natural Jaliz service CTA link (${JALIZ_CTA_TARGETS.join(" | ")}).`
    )
  }
}

if (!contentQualityFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 9: FAQS SCHEMA QUALITY (R2)
 * ========================================================================== */
stats.checksRun++
let faqsFailed = false

for (const post of expansionPosts) {
  if (!Array.isArray(post.faqs)) {
    faqsFailed = true
    recordError("FAQs", post.slug, "faqs field must be an Array.")
    continue
  }
  if (post.faqs.length < 2) {
    faqsFailed = true
    recordError(
      "FAQs",
      post.slug,
      `faqs array contains ${post.faqs.length} items (minimum required: 2).`
    )
    continue
  }
  post.faqs.forEach((faq, idx) => {
    if (!faq.question || typeof faq.question !== "string" || faq.question.trim().length < 5) {
      faqsFailed = true
      recordError("FAQs", post.slug, `FAQ #${idx + 1} question is empty or too short.`)
    }
    if (!faq.answer || typeof faq.answer !== "string" || faq.answer.trim().length < 10) {
      faqsFailed = true
      recordError("FAQs", post.slug, `FAQ #${idx + 1} answer is empty or too short.`)
    }
  })
}

if (!faqsFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 10: INTERNAL LINKING NETWORK INTEGRITY (R3, R4)
 * ========================================================================== */
stats.checksRun++
let linkingFailed = false
const blogSlugSet = new Set(blogPosts.map((p) => p.slug))

// Extract and check every <a href="/blog/..."> in content across all articles
const internalLinkRegex = /href=["']\/blog\/([^"'#?]+)["']/g

for (const post of blogPosts) {
  const content = post.content || ""
  let match
  internalLinkRegex.lastIndex = 0

  while ((match = internalLinkRegex.exec(content)) !== null) {
    stats.totalInternalLinks++
    const rawTarget = match[1]
    let decodedTarget = rawTarget
    try {
      decodedTarget = decodeURIComponent(rawTarget)
    } catch {
      // ignore uri decode error
    }

    const isValid = blogSlugSet.has(rawTarget) || blogSlugSet.has(decodedTarget)
    if (!isValid) {
      stats.brokenInternalLinks++
      linkingFailed = true
      recordError(
        "BrokenInternalLink",
        post.slug,
        `Points to non-existent blog slug "/blog/${decodedTarget}".`
      )
    }

    if (decodedTarget === post.slug || rawTarget === post.slug) {
      stats.selfReferentialLinks++
      recordWarning(
        "SelfReferentialLink",
        post.slug,
        `Article links to itself via "/blog/${decodedTarget}".`
      )
    }
  }
}

if (!linkingFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * CHECK 11: GENERAL METADATA & ISO DATE INTEGRITY
 * ========================================================================== */
stats.checksRun++
let metadataFailed = false

for (const post of expansionPosts) {
  if (post.lang !== "fa") {
    metadataFailed = true
    recordError("Language", post.slug, `lang must be "fa" (received: "${post.lang}").`)
  }
  if (!post.publishedAtIso || !/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAtIso)) {
    metadataFailed = true
    recordError(
      "PublishedAtIso",
      post.slug,
      `publishedAtIso must match YYYY-MM-DD format (received: "${post.publishedAtIso}").`
    )
  }
  if (!post.title || typeof post.title !== "string" || !post.title.trim()) {
    metadataFailed = true
    recordError("Title", post.slug, "title is missing or empty.")
  }
  if (!post.icon || typeof post.icon !== "string") {
    metadataFailed = true
    recordError("Icon", post.slug, "icon is missing or empty.")
  }
  if (!post.gradient || typeof post.gradient !== "string") {
    metadataFailed = true
    recordError("Gradient", post.slug, "gradient is missing or empty.")
  }
}

if (!metadataFailed) {
  stats.checksPassed++
}

/* ==========================================================================
 * OUTPUT FORMATTING & EXIT CODE
 * ========================================================================== */
const isSuccess = errors.length === 0

if (isJson) {
  console.log(
    JSON.stringify(
      {
        success: isSuccess,
        stats,
        errors,
        warnings,
      },
      null,
      2
    )
  )
  process.exit(isSuccess ? 0 : 1)
}

// Pretty CLI Console Output
const green = (s) => `\x1b[32m${s}\x1b[0m`
const red = (s) => `\x1b[31m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const cyan = (s) => `\x1b[36m${s}\x1b[0m`
const bold = (s) => `\x1b[1m${s}\x1b[0m`

console.log(bold("\n🌱 Jaliz Blog Expansion Quality & SEO Validator"))
console.log("=".repeat(56))

console.log(
  `\n📊 ${bold("Content Inventory:")}`
)
console.log(`   - Total Blog Posts:          ${cyan(stats.totalBlogPosts)} / ${EXPECTED_TOTAL_COUNT}`)
console.log(`   - Legacy Posts (Persian):    ${cyan(stats.persianLegacyPostsCount)} / 27`)
console.log(`   - Legacy Posts (English):    ${cyan(stats.legacyPostsCount - stats.persianLegacyPostsCount)} / 27`)
console.log(`   - Expansion Batch 1 (M3):    ${cyan(stats.expansionBatch1Count)} / 25`)
console.log(`   - Expansion Batch 2 (M4):    ${cyan(stats.expansionBatch2Count)} / 25`)
console.log(`   - Total Expansion Posts:     ${cyan(stats.expansionPostsCount)} / 50`)

console.log(`\n🔗 ${bold("Linking & CTAs:")}`)
console.log(`   - Total Internal Links:      ${cyan(stats.totalInternalLinks)}`)
console.log(
  `   - Broken Internal Links:     ${stats.brokenInternalLinks === 0 ? green(0) : red(stats.brokenInternalLinks)}`
)
console.log(`   - Jaliz CTAs in Expansion:   ${cyan(stats.jalizCtaCount)} / ${stats.expansionPostsCount}`)

console.log(`\n🛡️  ${bold("Validation Checks Summary:")}`)
console.log(`   - Checks Run:                ${stats.checksRun}`)
console.log(
  `   - Checks Passed:             ${stats.checksPassed === stats.checksRun ? green(stats.checksPassed) : yellow(stats.checksPassed)} / ${stats.checksRun}`
)

if (warnings.length > 0) {
  console.log(`\n⚠️  ${yellow(bold(`Warnings (${warnings.length}):`))}`)
  for (const w of warnings) {
    console.log(`   [${yellow(w.category)}] ${w.slug}: ${w.message}`)
  }
}

if (errors.length > 0) {
  console.log(`\n❌ ${red(bold(`Errors (${errors.length}):`))}`)
  const groupedErrors = {}
  for (const e of errors) {
    groupedErrors[e.category] = groupedErrors[e.category] || []
    groupedErrors[e.category].push(e)
  }

  for (const [cat, errList] of Object.entries(groupedErrors)) {
    console.log(`\n   ${bold(red(`• ${cat} (${errList.length}):`))}`)
    for (const err of errList.slice(0, 10)) {
      console.log(`     - [${err.slug}]: ${err.message}`)
    }
    if (errList.length > 10) {
      console.log(`     ... and ${errList.length - 10} more`)
    }
  }
}

console.log("\n" + "=".repeat(56))

if (isSuccess) {
  console.log(green(bold("🎉 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY! (Exit Code 0)\n")))
  process.exit(0)
} else {
  console.log(red(bold(`💥 VALIDATION FAILED WITH ${errors.length} ERROR(S). (Exit Code 1)\n`)))
  process.exit(1)
}

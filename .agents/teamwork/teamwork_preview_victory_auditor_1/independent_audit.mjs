import createJiti from "jiti"
import path from "node:path"
import process from "node:process"

const projectRoot = "/Users/sotoon/personal/jaliz"
const blogDataPath = path.resolve(projectRoot, "src/lib/blogData.ts")
const jiti = createJiti(blogDataPath)
const blogData = jiti(blogDataPath)

const {
  blogPosts = [],
  expansionPosts1 = [],
  expansionPosts2 = [],
} = blogData

console.log("=== INDEPENDENT AUDITOR DEEP FORENSIC CHECK ===")
console.log(`Total blogPosts: ${blogPosts.length}`)
console.log(`expansionPosts1: ${expansionPosts1.length}`)
console.log(`expansionPosts2: ${expansionPosts2.length}`)

const expansionPosts = [...expansionPosts1, ...expansionPosts2]
console.log(`Total expansion posts: ${expansionPosts.length}`)

const legacyPosts = blogPosts.filter(p => !expansionPosts.some(e => e.slug === p.slug))
const legacyPersian = legacyPosts.filter(p => p.lang === "fa")
console.log(`Legacy posts: ${legacyPosts.length} (${legacyPersian.length} Persian)`)

let passed = true
const issues = []

// 1. Check article count
if (expansionPosts.length !== 50) {
  issues.push(`Expected 50 expansion posts, found ${expansionPosts.length}`)
  passed = false
}

// 2. Check slug uniqueness
const slugMap = new Map()
for (const p of blogPosts) {
  if (slugMap.has(p.slug)) {
    issues.push(`Duplicate slug across blogPosts: ${p.slug}`)
    passed = false
  }
  slugMap.set(p.slug, p)
}

// 3. Check primary keywords
const kwMap = new Map()
for (const p of blogPosts.filter(p => p.lang === "fa")) {
  const normKw = (p.primaryKeyword || "").replace(/[\s\u200c]+/g, " ").trim().toLowerCase()
  if (kwMap.has(normKw)) {
    issues.push(`Duplicate Persian primary keyword: "${p.primaryKeyword}" between "${kwMap.get(normKw)}" and "${p.slug}"`)
    passed = false
  }
  kwMap.set(normKw, p.slug)
}

// 4. Content length, word count, description length, FAQs, lists, headings
let minTextLen = Infinity
let maxTextLen = -Infinity
let totalWords = 0
let minWords = Infinity
let maxWords = -Infinity

const paragraphSet = new Map() // check duplicate paragraphs across articles

for (const [idx, p] of expansionPosts.entries()) {
  const num = idx + 1
  // Description <= 160
  const descLen = (p.description || "").trim().length
  if (descLen === 0 || descLen > 160) {
    issues.push(`[#${num} ${p.slug}] Description length violation: ${descLen} chars`)
    passed = false
  }

  // Stripped text
  const text = (p.content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  const textLen = text.length
  const words = text.split(/\s+/).filter(Boolean).length
  totalWords += words
  if (textLen < minTextLen) minTextLen = textLen
  if (textLen > maxTextLen) maxTextLen = textLen
  if (words < minWords) minWords = words
  if (words > maxWords) maxWords = words

  if (textLen <= 1500) {
    issues.push(`[#${num} ${p.slug}] Text too short: ${textLen} chars`)
    passed = false
  }

  // Headings
  const h2Count = (p.content.match(/<h2[^>]*>/gi) || []).length
  if (h2Count < 1) {
    issues.push(`[#${num} ${p.slug}] Missing <h2> tags`)
    passed = false
  }

  // Lists
  const hasList = /<(ul|ol)[^>]*>/i.test(p.content)
  if (!hasList) {
    issues.push(`[#${num} ${p.slug}] Missing <ul> or <ol> list`)
    passed = false
  }

  // Jaliz CTA
  const hasCta = ["/plants/diagnose", "/schedule", "/marketplace"].some(c => p.content.includes(c))
  if (!hasCta) {
    issues.push(`[#${num} ${p.slug}] Missing Jaliz CTA`)
    passed = false
  }

  // FAQs
  if (!Array.isArray(p.faqs) || p.faqs.length < 2) {
    issues.push(`[#${num} ${p.slug}] Insufficient FAQs: ${p.faqs?.length || 0}`)
    passed = false
  } else {
    for (const [fIdx, faq] of p.faqs.entries()) {
      if (!faq.question || faq.question.trim().length < 5) {
        issues.push(`[#${num} ${p.slug}] FAQ #${fIdx + 1} question too short`)
        passed = false
      }
      if (!faq.answer || faq.answer.trim().length < 10) {
        issues.push(`[#${num} ${p.slug}] FAQ #${fIdx + 1} answer too short`)
        passed = false
      }
    }
  }

  // Extract paragraphs for duplicate detection
  const pMatches = p.content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []
  for (const rawP of pMatches) {
    const cleanP = rawP.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    if (cleanP.length > 80) { // check substantial paragraphs
      if (paragraphSet.has(cleanP)) {
        issues.push(`[#${num} ${p.slug}] Plagiarism/Duplicate paragraph shared with "${paragraphSet.get(cleanP)}"`)
        passed = false
      } else {
        paragraphSet.set(cleanP, p.slug)
      }
    }
  }
}

// 5. Internal link validation
let totalLinks = 0
let brokenLinks = 0
const linkRegex = /href=["']\/blog\/([^"'#?]+)["']/g
for (const p of blogPosts) {
  let m
  linkRegex.lastIndex = 0
  while ((m = linkRegex.exec(p.content || "")) !== null) {
    totalLinks++
    const rawTarget = m[1]
    let decoded = rawTarget
    try { decoded = decodeURIComponent(rawTarget) } catch {}
    if (!slugMap.has(rawTarget) && !slugMap.has(decoded)) {
      brokenLinks++
      issues.push(`[${p.slug}] Broken internal link to: "${decoded}"`)
      passed = false
    }
  }
}

console.log("\n--- AUDIT METRICS ---")
console.log(`Min stripped text length: ${minTextLen} chars`)
console.log(`Max stripped text length: ${maxTextLen} chars`)
console.log(`Average words per article: ${Math.round(totalWords / 50)} words`)
console.log(`Min words: ${minWords}, Max words: ${maxWords}`)
console.log(`Total internal blog links checked: ${totalLinks}`)
console.log(`Broken internal links: ${brokenLinks}`)
console.log(`Unique substantial paragraphs checked: ${paragraphSet.size}`)

if (issues.length > 0) {
  console.log(`\n❌ FOUND ${issues.length} AUDIT ISSUES:`)
  issues.forEach(i => console.log(` - ${i}`))
  process.exit(1)
} else {
  console.log("\n✅ ALL FORENSIC INTEGRITY CHECKS PASSED WITH ZERO ISSUES!")
  process.exit(0)
}

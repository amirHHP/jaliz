/**
 * HowTo Schema Engine for Jaliz Tutorial Blog Articles
 * Generates Schema.org HowTo JSON-LD rich snippet structures for search engines.
 */

import type { BlogPost } from "./blogTopics"

export interface HowToStepSchema {
  "@type": "HowToStep"
  name: string
  text: string
  position: number
  url?: string
}

export interface HowToSupplySchema {
  "@type": "HowToSupply"
  name: string
}

export interface HowToToolSchema {
  "@type": "HowToTool"
  name: string
}

export interface HowToSchema {
  "@type": "HowTo"
  name: string
  description: string
  inLanguage: string
  step: HowToStepSchema[]
  supply?: HowToSupplySchema[]
  tool?: HowToToolSchema[]
}

/**
 * Strips HTML tags, decodes common entities, and normalizes whitespaces.
 */
function stripHtml(html: string): string {
  if (!html) return ""
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Detects whether a blog article is a practical tutorial/HowTo guide.
 */
export function isTutorialPost(post: BlogPost): boolean {
  if (!post) return false

  // 1. Explicit cluster matching
  if (post.cluster === "tutorial") return true

  // 2. Category matching
  const catFa = (post.category || "").trim()
  const catEn = (post.categoryEn || "").trim().toLowerCase()
  if (
    catFa === "آموزش‌های کاربردی" ||
    catFa === "آموزش‌ها" ||
    catFa === "آموزش" ||
    catEn === "tutorials" ||
    catEn === "tutorial"
  ) {
    return true
  }

  // 3. Slug patterns for step-by-step guides
  const slug = (post.slug || "").toLowerCase()
  const tutorialSlugPrefixes = [
    "تکثیر-",
    "ساخت-",
    "آموزش-",
    "ترکیب-خاک-",
    "کاربرد-لیکا-",
    "تمیز-کردن-",
    "قلمه-",
  ]
  if (tutorialSlugPrefixes.some((prefix) => slug.startsWith(prefix))) {
    return true
  }
  if (
    slug.includes("تعویض-گلدان") ||
    slug.includes("تکثیر-در-آب") ||
    slug.includes("ریشه-دار-کردن") ||
    slug.includes("ساخت-قیم") ||
    slug.includes("قلمه-زدن")
  ) {
    return true
  }

  // 4. Title hooks
  const title = post.title || ""
  const tutorialTitleKeywords = [
    "آموزش",
    "نحوه ",
    "چگونه ",
    "قدم‌به‌قدم",
    "قدم به قدم",
    "گام‌به‌گام",
    "گام به گام",
    "مراحل ",
    "راهنمای تکثیر",
    "راهنمای ساخت",
    "تعویض خاک و گلدان",
    "تکثیر با برگ",
    "تکثیر در آب",
    "ساخت قیم",
  ]
  if (tutorialTitleKeywords.some((kw) => title.includes(kw))) {
    return true
  }

  // 5. Content analysis: presence of step lists and practical indicators
  const content = post.content || ""
  const hasStepIndicators =
    content.includes("مراحل قدم‌به‌قدم") ||
    content.includes("مراحل گام‌به‌گام") ||
    content.includes("مرحله اول") ||
    content.includes("روش اول:") ||
    content.includes("گام اول")
  if (
    hasStepIndicators &&
    (content.includes("<ol") || (post.keywords && post.keywords.some((k) => k.includes("آموزش") || k.includes("تکثیر"))))
  ) {
    return true
  }

  return false
}

/**
 * Extracts supplies and tools mentioned in "لوازم مورد نیاز" or "ابزار" sections.
 */
function extractToolsAndSupplies(content: string): {
  supplies: HowToSupplySchema[]
  tools: HowToToolSchema[]
} {
  const supplies: HowToSupplySchema[] = []
  const tools: HowToToolSchema[] = []

  // Match sections like <h2>لوازم مورد نیاز...</h2>...<ul>...</ul>
  const supplySectionRegex =
    /<h[2-4][^>]*>([^<]*(?:لوازم|ابزار|وسایل|تجهیزات|مواد مورد نیاز)[^<]*)<\/h[2-4]>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i
  const sectionMatch = supplySectionRegex.exec(content)

  if (sectionMatch && sectionMatch[2]) {
    const listHtml = sectionMatch[2]
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let liMatch: RegExpExecArray | null

    while ((liMatch = liRegex.exec(listHtml)) !== null) {
      const rawText = stripHtml(liMatch[1])
      if (!rawText || rawText.length < 2) continue

      // Clean leading qualifiers, parentheses or dashes
      const cleanName = rawText.replace(/^[-•\d.]+\s*/, "").trim()
      if (!cleanName) continue

      const toolKeywords = [
        "چاقو",
        "کاتر",
        "قیچی",
        "بیلچه",
        "آب‌پاش",
        "آبپاش",
        "دستکش",
        "گلدان",
        "قیم",
        "شیشه",
        "لیوان",
        "ظرف",
        "کارد",
        "دستمال",
        "اسپری",
        "توری",
      ]
      const isTool = toolKeywords.some((kw) => cleanName.toLowerCase().includes(kw))

      if (isTool) {
        if (!tools.some((t) => t.name === cleanName)) {
          tools.push({ "@type": "HowToTool", name: cleanName })
        }
      } else {
        if (!supplies.some((s) => s.name === cleanName)) {
          supplies.push({ "@type": "HowToSupply", name: cleanName })
        }
      }
    }
  }

  return { supplies, tools }
}

/**
 * Extracts procedural steps from tutorial content.
 * Checks for ordered lists (<ol>), step-labeled headings, or prominent section headings.
 */
function extractHowToSteps(content: string, canonicalUrl: string): HowToStepSchema[] {
  const steps: HowToStepSchema[] = []

  // Strategy 1: Look for explicit ordered lists (<ol><li>...</li></ol>)
  const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi
  let olMatch: RegExpExecArray | null

  while ((olMatch = olRegex.exec(content)) !== null) {
    const olContent = olMatch[1]
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let liMatch: RegExpExecArray | null

    while ((liMatch = liRegex.exec(olContent)) !== null) {
      const rawLi = liMatch[1]
      let stepName = ""
      const stepText = stripHtml(rawLi)

      // Check if step begins with bold title: <strong>Title:</strong> Description
      const strongMatch = /<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/.exec(rawLi)
      if (strongMatch && strongMatch[1]) {
        stepName = stripHtml(strongMatch[1]).replace(/[:\-–—.]+$/, "").trim()
      }

      // If no explicit bold title, extract first clause / sentence as name
      if (!stepName) {
        const sentenceEnd = stepText.indexOf(":") !== -1 ? stepText.indexOf(":") : stepText.indexOf("؛")
        if (sentenceEnd > 0 && sentenceEnd < 60) {
          stepName = stepText.slice(0, sentenceEnd).trim()
        } else {
          stepName = `مرحله ${steps.length + 1}`
        }
      }

      if (stepText.length >= 10) {
        const position = steps.length + 1
        steps.push({
          "@type": "HowToStep",
          name: stepName,
          text: stepText,
          position,
          url: canonicalUrl ? `${canonicalUrl}#step-${position}` : undefined,
        })
      }
    }
  }

  if (steps.length >= 2) {
    return steps
  }

  // Strategy 2: If no <ol> exists, parse <h2> headings and their immediate following paragraphs
  const sectionRegex =
    /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi
  let secMatch: RegExpExecArray | null

  while ((secMatch = sectionRegex.exec(content)) !== null) {
    const headingRaw = secMatch[1]
    const bodyRaw = secMatch[2]
    const heading = stripHtml(headingRaw).replace(/[:\-–—.]+$/, "").trim()

    // Filter out non-step headings (FAQs, introductions, shopping CTAs)
    const isExcluded =
      /سوالات|پرسش|خرید|بازارچه|تقویم|ثبت در|مقدمه|آشنایی با|نشانه‌ها|علت|نکات مهم و جمع‌بندی/i.test(
        heading,
      )

    if (isExcluded) continue

    // Extract text from paragraphs in this section
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi
    const paragraphs: string[] = []
    let pMatch: RegExpExecArray | null
    while ((pMatch = pRegex.exec(bodyRaw)) !== null) {
      const pText = stripHtml(pMatch[1])
      if (pText.length > 20) {
        paragraphs.push(pText)
      }
    }

    // Also check for sub-list items in this section
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    const listItems: string[] = []
    let lMatch: RegExpExecArray | null
    while ((lMatch = liRegex.exec(bodyRaw)) !== null) {
      const lText = stripHtml(lMatch[1])
      if (lText.length > 15) {
        listItems.push(lText)
      }
    }

    const fullStepText =
      paragraphs.length > 0
        ? paragraphs.join(" ")
        : listItems.length > 0
          ? listItems.join(" ")
          : stripHtml(bodyRaw)

    if (fullStepText.length >= 20) {
      const position = steps.length + 1
      steps.push({
        "@type": "HowToStep",
        name: heading,
        text: fullStepText,
        position,
        url: canonicalUrl ? `${canonicalUrl}#step-${position}` : undefined,
      })
    }
  }

  return steps
}

/**
 * Generates a valid Schema.org HowTo JSON-LD structure for a blog article.
 * Returns null safely if the article is not a tutorial or if steps cannot be determined.
 */
export function generateHowToSchema(
  post: BlogPost,
  canonicalUrl: string,
): HowToSchema | null {
  try {
    if (!post || !isTutorialPost(post)) {
      return null
    }

    const steps = extractHowToSteps(post.content || "", canonicalUrl)
    if (!steps || steps.length === 0) {
      return null
    }

    const { supplies, tools } = extractToolsAndSupplies(post.content || "")
    const inLanguage = post.lang === "fa" ? "fa-IR" : "en-US"

    const schema: HowToSchema = {
      "@type": "HowTo",
      name: post.title,
      description: post.description,
      inLanguage,
      step: steps,
    }

    if (supplies && supplies.length > 0) {
      schema.supply = supplies
    }

    if (tools && tools.length > 0) {
      schema.tool = tools
    }

    return schema
  } catch {
    // Fail gracefully without breaking non-tutorial or ill-formed articles
    return null
  }
}

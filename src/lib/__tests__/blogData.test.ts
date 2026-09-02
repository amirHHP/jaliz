import { describe, expect, it } from "vitest"
import { blogPosts } from "../blogData"
import { newBlogPosts } from "../blogPostsNew"
import { seoBlogPosts } from "../blogPostsSeo"
import { getRelatedPosts, listPrimaryKeywords } from "../blogTopics"

describe("blogPosts", () => {
  it("has unique slugs", () => {
    const slugs = blogPosts.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("gives every post required SEO fields and a supported category", () => {
    const categories = new Set(["care", "plants", "tutorials"])
    const clusters = new Set([
      "species",
      "diagnosis",
      "season",
      "space",
      "tutorial",
      "care",
      "plants",
    ])
    for (const post of blogPosts) {
      expect(post.title.length).toBeGreaterThan(0)
      expect(post.description.length).toBeGreaterThan(0)
      expect(post.content.length).toBeGreaterThan(0)
      expect(post.keywords.length).toBeGreaterThan(0)
      expect(post.primaryKeyword.length).toBeGreaterThan(0)
      expect(post.publishedAtIso).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.faqs.length).toBeGreaterThan(0)
      expect(categories.has(post.categoryEn)).toBe(true)
      expect(clusters.has(post.cluster)).toBe(true)
      expect(["fa", "en"]).toContain(post.lang)
    }
  })

  it("keeps primary keywords unique within each language", () => {
    for (const lang of ["fa", "en"] as const) {
      const keywords = listPrimaryKeywords(blogPosts, lang)
      expect(new Set(keywords).size).toBe(keywords.length)
    }
  })

  it("pairs every post with an alternate-language slug", () => {
    const bySlug = new Map(blogPosts.map((post) => [post.slug, post]))
    for (const post of blogPosts) {
      const alternate = bySlug.get(post.alternateSlug)
      expect(alternate).toBeDefined()
      expect(alternate?.lang).not.toBe(post.lang)
      expect(alternate?.alternateSlug).toBe(post.slug)
      expect(alternate?.cluster).toBe(post.cluster)
    }
  })

  it("keeps the prior ten bilingual pairs", () => {
    expect(newBlogPosts).toHaveLength(20)
    expect(newBlogPosts.filter((post) => post.lang === "fa")).toHaveLength(10)
    expect(newBlogPosts.filter((post) => post.lang === "en")).toHaveLength(10)
  })

  it("ranks related posts by cluster before category", () => {
    const post = blogPosts.find((item) => item.slug === "علت-زرد-شدن-برگ-گیاهان")
    expect(post).toBeDefined()
    const related = getRelatedPosts(post!, blogPosts, 2)
    expect(related).toHaveLength(2)
    expect(related.every((item) => item.lang === "fa")).toBe(true)
    expect(related.some((item) => item.cluster === post!.cluster)).toBe(true)
  })

  it("adds ten new long bilingual article pairs", () => {
    expect(seoBlogPosts).toHaveLength(20)
    expect(seoBlogPosts.filter((post) => post.lang === "fa")).toHaveLength(10)
    expect(seoBlogPosts.filter((post) => post.lang === "en")).toHaveLength(10)
    for (const post of seoBlogPosts.filter((item) => item.lang === "fa")) {
      const text = post.content.replace(/<[^>]+>/g, "")
      expect(text.length, post.slug).toBeGreaterThan(1500)
    }
  })
})

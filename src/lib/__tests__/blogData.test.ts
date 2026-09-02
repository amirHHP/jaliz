import { describe, expect, it } from "vitest"
import { blogPosts } from "../blogData"
import { newBlogPosts } from "../blogPostsNew"

describe("blogPosts", () => {
  it("has unique slugs", () => {
    const slugs = blogPosts.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("gives every post required fields and a supported category", () => {
    const categories = new Set(["care", "plants", "tutorials"])
    for (const post of blogPosts) {
      expect(post.title.length).toBeGreaterThan(0)
      expect(post.description.length).toBeGreaterThan(0)
      expect(post.content.length).toBeGreaterThan(0)
      expect(post.keywords.length).toBeGreaterThan(0)
      expect(categories.has(post.categoryEn)).toBe(true)
      expect(["fa", "en"]).toContain(post.lang)
    }
  })

  it("adds ten new bilingual article pairs", () => {
    expect(newBlogPosts).toHaveLength(20)
    expect(newBlogPosts.filter((post) => post.lang === "fa")).toHaveLength(10)
    expect(newBlogPosts.filter((post) => post.lang === "en")).toHaveLength(10)
  })
})

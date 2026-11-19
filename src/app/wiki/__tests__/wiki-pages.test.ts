import { describe, expect, it } from "vitest"
import { getAllWikiPlants } from "@/lib/wikiData"
import { getCanonicalSiteUrl } from "@/lib/siteUrl"
import {
  generateStaticParams,
  generateMetadata,
} from "@/app/wiki/[slug]/page"

describe("Milestone 2: Programmatic Wiki Pages & Schemas", () => {
  const SITE_URL = getCanonicalSiteUrl()

  describe("generateStaticParams()", () => {
    it("generates static route parameters for all wiki plants", async () => {
      const params = await generateStaticParams()
      const allPlants = getAllWikiPlants()
      expect(params.length).toBe(allPlants.length)
      expect(params.length).toBeGreaterThanOrEqual(12)

      const slugs = params.map((p) => p.slug)
      for (const plant of allPlants) {
        expect(slugs).toContain(plant.slug)
      }
    })
  })

  describe("generateMetadata()", () => {
    it("generates rich Persian SEO metadata for valid plant slug", async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ slug: "سانسوریا" }),
      })

      expect(meta.title).toContain("سانسوریا")
      expect(meta.title).toContain("جالیز")
      expect(meta.description).toBeDefined()
      expect(typeof meta.description).toBe("string")
      expect(meta.description?.length).toBeGreaterThan(20)

      expect(meta.alternates?.canonical).toBe(
        `${SITE_URL}/wiki/${encodeURIComponent("سانسوریا")}`
      )
      expect(meta.openGraph?.title).toContain("سانسوریا")
      const og = meta.openGraph
      if (og && "type" in og) {
        expect(og.type).toBe("article")
      }
      expect(meta.openGraph?.locale).toBe("fa_IR")
    })

    it("handles URL-encoded slug parameters in generateMetadata", async () => {
      const encodedSlug = encodeURIComponent("پتوس")
      const meta = await generateMetadata({
        params: Promise.resolve({ slug: encodedSlug }),
      })

      expect(meta.title).toContain("پتوس")
      expect(meta.alternates?.canonical).toBe(`${SITE_URL}/wiki/${encodedSlug}`)
    })

    it("returns fallback title when plant slug is unknown", async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ slug: "unknown-cactus-species-xyz" }),
      })

      expect(meta.title).toContain("یافت نشد")
    })
  })

  describe("CTA Links & Parameters Verification", () => {
    it("verifies proper URL encoding and parameter bindings for all plants", () => {
      const plants = getAllWikiPlants()
      for (const plant of plants) {
        const addGardenHref = `/plants/new?name=${encodeURIComponent(
          plant.nameFa
        )}&interval=${plant.care.watering.defaultIntervalDays}&light=${encodeURIComponent(
          plant.care.light.level
        )}`
        const marketplaceHref = `/marketplace?query=${encodeURIComponent(
          plant.nameFa
        )}`
        const diagnoseHref = `/plants/diagnose`

        expect(addGardenHref).toContain("/plants/new?name=")
        expect(addGardenHref).toContain(`interval=${plant.care.watering.defaultIntervalDays}`)
        expect(addGardenHref).toContain("light=")
        expect(marketplaceHref).toContain("/marketplace?query=")
        expect(diagnoseHref).toBe("/plants/diagnose")
      }
    })
  })
})

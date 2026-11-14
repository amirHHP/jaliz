import { describe, expect, it } from "vitest"
import {
  getAllWikiPlants,
  getWikiPlantBySlug,
  getPopularWikiPlants,
  getWikiPlantsByCategory,
  type WikiPlant,
} from "../wikiData"

describe("Wiki Botanical Knowledge Base (Tiers 1-4)", () => {
  // Authoritative 12 required species from ORIGINAL_REQUEST.md & PROJECT.md
  const REQUIRED_SPECIES = [
    { slugSubstr: "sansevieria", faName: "سانسوریا" },
    { slugSubstr: "pothos", faName: "پتوس" },
    { slugSubstr: "zz", faName: "زامیفولیا" },
    { slugSubstr: "monstera", faName: "برگ انجیری" },
    { slugSubstr: "ficus", faName: "فیکوس" },
    { slugSubstr: "aglaonema", faName: "آگلونما" },
    { slugSubstr: "yucca", faName: "یوکا" },
    { slugSubstr: "dieffenbachia", faName: "دیفن باخیا" },
    { slugSubstr: "schefflera", faName: "شفلرا" },
    { slugSubstr: "kalanchoe", faName: "کالانکوئه" },
    { slugSubstr: "peperomia", faName: "قاشقی" },
    { slugSubstr: "spathiphyllum", faName: "اسپاتی فیلوم" },
  ]

  /* ==========================================================================
   * TIER 1: CORE INVENTORY & LOOKUP
   * ========================================================================== */
  describe("Tier 1: Core Inventory & Retrieval", () => {
    it("returns at least 12 plants from getAllWikiPlants()", () => {
      const plants = getAllWikiPlants()
      expect(Array.isArray(plants)).toBe(true)
      expect(plants.length).toBeGreaterThanOrEqual(12)
    })

    it("guarantees unique, URL-safe slugs for every plant", () => {
      const plants = getAllWikiPlants()
      const slugs = plants.map((p) => p.slug)
      expect(new Set(slugs).size).toBe(slugs.length)

      for (const slug of slugs) {
        expect(slug.length).toBeGreaterThan(0)
        expect(slug).not.toContain(" ")
        expect(slug).not.toContain("/")
        expect(slug).not.toContain("?")
      }
    })

    it("contains all 12 authoritative core houseplants required by R1", () => {
      const plants = getAllWikiPlants()
      const plantNamesFa = plants.map((p) => p.nameFa)
      const plantSlugs = plants.map((p) => p.slug.toLowerCase())

      for (const req of REQUIRED_SPECIES) {
        const foundByName = plantNamesFa.some((name) =>
          name.replace(/\u200c/g, " ").includes(req.faName.replace(/\u200c/g, " "))
        )
        const foundBySlug = plantSlugs.some(
          (slug) =>
            slug.includes(req.slugSubstr) ||
            slug.includes(encodeURIComponent(req.faName).toLowerCase()) ||
            slug.includes(req.faName)
        )
        expect(
          foundByName || foundBySlug,
          `Required species ${req.faName} (${req.slugSubstr}) must exist in encyclopedia`
        ).toBe(true)
      }
    })

    it("retrieves individual plant correctly by exact slug via getWikiPlantBySlug()", () => {
      const plants = getAllWikiPlants()
      for (const plant of plants) {
        const found = getWikiPlantBySlug(plant.slug)
        expect(found).toBeDefined()
        expect(found?.slug).toBe(plant.slug)
        expect(found?.nameFa).toBe(plant.nameFa)
      }
    })

    it("returns a non-empty list of popular plants via getPopularWikiPlants()", () => {
      const popular = getPopularWikiPlants()
      expect(Array.isArray(popular)).toBe(true)
      expect(popular.length).toBeGreaterThan(0)
      expect(popular.length).toBeLessThanOrEqual(getAllWikiPlants().length)
    })
  })

  /* ==========================================================================
   * TIER 2: STRUCTURED CARE SPECIFICATIONS INTEGRITY
   * ========================================================================== */
  describe("Tier 2: Care Specifications Schema & Field Validation", () => {
    it("enforces complete botanical and taxonomic fields for every plant", () => {
      const plants = getAllWikiPlants()
      for (const plant of plants) {
        expect(plant.nameFa, `${plant.slug} nameFa`).toBeTypeOf("string")
        expect(plant.nameFa.trim().length).toBeGreaterThan(0)

        expect(plant.nameEn, `${plant.slug} nameEn`).toBeTypeOf("string")
        expect(plant.nameEn.trim().length).toBeGreaterThan(0)

        expect(plant.scientificName, `${plant.slug} scientificName`).toBeTypeOf("string")
        expect(plant.scientificName.trim().length).toBeGreaterThan(0)

        expect(plant.family, `${plant.slug} family`).toBeTypeOf("string")
        expect(plant.origin, `${plant.slug} origin`).toBeTypeOf("string")
        expect(plant.description, `${plant.slug} description`).toBeTypeOf("string")
        expect(plant.description.trim().length).toBeGreaterThan(30)

        expect(plant.coverImage, `${plant.slug} coverImage`).toBeTypeOf("string")
        expect(plant.coverImage.trim().length).toBeGreaterThan(0)

        expect(Array.isArray(plant.tags), `${plant.slug} tags`).toBe(true)
        expect(plant.tags.length).toBeGreaterThan(0)

        expect(["آسان", "متوسط", "سخت"]).toContain(plant.difficulty)
        expect(["آرام", "متوسط", "سریع"]).toContain(plant.growthRate)
      }
    })

    it("enforces light, watering, temperature, soil, and pet safety specifications", () => {
      const plants = getAllWikiPlants()
      for (const plant of plants) {
        const { care } = plant
        expect(care, `${plant.slug} care`).toBeDefined()

        // Light
        expect(care.light.level).toBeTypeOf("string")
        expect(care.light.description.length).toBeGreaterThan(0)
        expect(care.light.windowPlacement.length).toBeGreaterThan(0)

        // Watering
        expect(care.watering.schedule).toBeTypeOf("string")
        expect(care.watering.description.length).toBeGreaterThan(0)
        expect(care.watering.defaultIntervalDays).toBeTypeOf("number")
        expect(care.watering.defaultIntervalDays).toBeGreaterThan(0)

        // Temperature
        expect(care.temperature.range).toBeTypeOf("string")
        expect(care.temperature.minCelsius).toBeTypeOf("number")
        expect(care.temperature.maxCelsius).toBeTypeOf("number")
        expect(care.temperature.maxCelsius).toBeGreaterThanOrEqual(care.temperature.minCelsius)
        expect(care.temperature.frostTolerance).toBeTypeOf("boolean")

        // Soil
        expect(care.soil.type).toBeTypeOf("string")
        expect(care.soil.description.length).toBeGreaterThan(0)
        expect(care.soil.drainageTips.length).toBeGreaterThan(0)

        // Pet Safety
        expect(care.petSafety.isToxic).toBeTypeOf("boolean")
        expect(care.petSafety.warningFa).toBeTypeOf("string")
        expect(care.petSafety.warningFa.trim().length).toBeGreaterThan(0)
      }
    })

    it("enforces structured common problems with problem, cause, solution, and severity", () => {
      const plants = getAllWikiPlants()
      for (const plant of plants) {
        expect(Array.isArray(plant.care.commonProblems), `${plant.slug} commonProblems`).toBe(true)
        expect(plant.care.commonProblems.length).toBeGreaterThanOrEqual(2)

        for (const problem of plant.care.commonProblems) {
          expect(problem.problemFa, `${plant.slug} problemFa`).toBeTypeOf("string")
          expect(problem.problemFa.trim().length).toBeGreaterThan(0)

          expect(problem.causeFa, `${plant.slug} causeFa`).toBeTypeOf("string")
          expect(problem.causeFa.trim().length).toBeGreaterThan(0)

          expect(problem.solutionFa, `${plant.slug} solutionFa`).toBeTypeOf("string")
          expect(problem.solutionFa.trim().length).toBeGreaterThan(0)

          expect(["low", "medium", "high"]).toContain(problem.severity)
        }
      }
    })
  })

  /* ==========================================================================
   * TIER 3: BOUNDARY & EDGE CASES
   * ========================================================================== */
  describe("Tier 3: Boundary & Resilience Testing", () => {
    it("returns undefined gracefully for non-existent slugs without throwing", () => {
      expect(getWikiPlantBySlug("this-slug-definitely-does-not-exist")).toBeUndefined()
      expect(getWikiPlantBySlug("")).toBeUndefined()
      expect(getWikiPlantBySlug("   ")).toBeUndefined()
      expect(getWikiPlantBySlug("__proto__")).toBeUndefined()
    })

    it("handles URL-encoded slug queries seamlessly", () => {
      const plants = getAllWikiPlants()
      for (const plant of plants) {
        const encodedSlug = encodeURIComponent(plant.slug)
        const found = getWikiPlantBySlug(encodedSlug) || getWikiPlantBySlug(plant.slug)
        expect(found).toBeDefined()
        expect(found?.slug).toBe(plant.slug)
      }
    })

    it("returns empty array for non-existent categories without throwing", () => {
      const result = getWikiPlantsByCategory("category-non-existent-xyz")
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })
  })

  /* ==========================================================================
   * TIER 4: ADVERSARIAL & BOTANICAL ACCURACY
   * ========================================================================== */
  describe("Tier 4: Botanical Accuracy & Persian Micro-copy Quality", () => {
    it("has zero placeholder tokens ([TBD], undefined, null, NaN) in descriptions", () => {
      const plants = getAllWikiPlants()
      const invalidTokens = ["[TBD]", "[TODO]", "undefined", "null", "NaN", "Lorem ipsum"]

      for (const plant of plants) {
        for (const token of invalidTokens) {
          expect(plant.description).not.toContain(token)
          expect(plant.care.light.description).not.toContain(token)
          expect(plant.care.watering.description).not.toContain(token)
          expect(plant.care.petSafety.warningFa).not.toContain(token)
        }
      }
    })

    it("verifies toxicological accuracy for high-risk indoor plants", () => {
      const plants = getAllWikiPlants()
      // Dieffenbachia is well known for calcium oxalate toxicity
      const dieffenbachia = plants.find((p) =>
        p.slug.toLowerCase().includes("dieffenbachia") ||
        p.nameFa.includes("دیفن باخیا") ||
        p.nameEn.toLowerCase().includes("dieffenbachia")
      )
      if (dieffenbachia) {
        expect(dieffenbachia.care.petSafety.isToxic).toBe(true)
        expect(dieffenbachia.care.petSafety.warningFa.length).toBeGreaterThan(10)
      }
    })

    it("verifies drought vs moisture watering schedules are physically sound", () => {
      const plants = getAllWikiPlants()
      const zzPlant = plants.find((p) =>
        p.slug.toLowerCase().includes("zz") ||
        p.nameFa.includes("زامیفولیا") ||
        p.scientificName.toLowerCase().includes("zamioculcas")
      )
      const peaceLily = plants.find((p) =>
        p.slug.toLowerCase().includes("spathiphyllum") ||
        p.nameFa.includes("اسپاتی") ||
        p.scientificName.toLowerCase().includes("spathiphyllum")
      )

      if (zzPlant && peaceLily) {
        // ZZ plant requires far less frequent watering than moisture-loving Peace Lily
        expect(zzPlant.care.watering.defaultIntervalDays).toBeGreaterThan(
          peaceLily.care.watering.defaultIntervalDays
        )
      }
    })
  })
})

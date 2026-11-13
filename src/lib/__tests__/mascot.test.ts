import { describe, expect, it } from "vitest"
import {
  getMascotDialogue,
  resolveMascotState,
  type MascotContext,
} from "../mascot-dialogue"

describe("mascot-dialogue", () => {
  describe("Tier 1: State Resolution — Thirsty", () => {
    it("returns 'thirsty' when plants need water during daytime and routine not done", () => {
      const ctx: MascotContext = {
        totalPlants: 4,
        plantsToWaterCount: 2,
        isDoneToday: false,
        streakDays: 3,
        currentHour: 11, // daytime
      }
      expect(resolveMascotState(ctx)).toBe("thirsty")
    })

    it("prioritizes 'thirsty' over active streak during the day", () => {
      const ctx: MascotContext = {
        totalPlants: 5,
        plantsToWaterCount: 1,
        isDoneToday: false,
        streakDays: 14,
        currentHour: 14,
      }
      expect(resolveMascotState(ctx)).toBe("thirsty")
    })
  })

  describe("Tier 2: State Resolution — Celebrating", () => {
    it("returns 'celebrating' when isDoneToday is true", () => {
      const ctx: MascotContext = {
        totalPlants: 3,
        plantsToWaterCount: 0,
        isDoneToday: true,
        streakDays: 4,
        currentHour: 15,
      }
      expect(resolveMascotState(ctx)).toBe("celebrating")
    })

    it("returns 'celebrating' even if some plantsToWaterCount was not yet reset", () => {
      const ctx: MascotContext = {
        totalPlants: 3,
        plantsToWaterCount: 1,
        isDoneToday: true, // User marked done
        streakDays: 5,
        currentHour: 16,
      }
      expect(resolveMascotState(ctx)).toBe("celebrating")
    })
  })

  describe("Tier 3: State Resolution — Thriving", () => {
    it("returns 'thriving' when all plants are hydrated and not yet marked done", () => {
      const ctx: MascotContext = {
        totalPlants: 4,
        plantsToWaterCount: 0,
        isDoneToday: false,
        streakDays: 1,
        currentHour: 10,
      }
      expect(resolveMascotState(ctx)).toBe("thriving")
    })
  })

  describe("Tier 4: State Resolution — Resting & Hour Boundaries", () => {
    it("returns 'resting' when totalPlants is 0", () => {
      const ctx: MascotContext = {
        totalPlants: 0,
        plantsToWaterCount: 0,
        isDoneToday: false,
        streakDays: 0,
        currentHour: 12,
      }
      expect(resolveMascotState(ctx)).toBe("resting")
    })

    it("returns 'resting' during late night hours (hour >= 20)", () => {
      expect(
        resolveMascotState({
          totalPlants: 3,
          plantsToWaterCount: 1,
          isDoneToday: false,
          streakDays: 2,
          currentHour: 20, // 8 PM
        })
      ).toBe("resting")

      expect(
        resolveMascotState({
          totalPlants: 3,
          plantsToWaterCount: 0,
          isDoneToday: true,
          streakDays: 2,
          currentHour: 23, // 11 PM
        })
      ).toBe("resting")
    })

    it("returns 'resting' during early morning night hours (hour < 5)", () => {
      expect(
        resolveMascotState({
          totalPlants: 3,
          plantsToWaterCount: 1,
          isDoneToday: false,
          streakDays: 2,
          currentHour: 0, // Midnight
        })
      ).toBe("resting")

      expect(
        resolveMascotState({
          totalPlants: 3,
          plantsToWaterCount: 1,
          isDoneToday: false,
          streakDays: 2,
          currentHour: 4, // 4 AM
        })
      ).toBe("resting")
    })

    it("wakes up at 5 AM into active daytime state", () => {
      expect(
        resolveMascotState({
          totalPlants: 3,
          plantsToWaterCount: 1,
          isDoneToday: false,
          streakDays: 2,
          currentHour: 5, // 5 AM
        })
      ).toBe("thirsty")
    })

    it("stays awake at 19:00 (7 PM) before night cutoff", () => {
      expect(
        resolveMascotState({
          totalPlants: 3,
          plantsToWaterCount: 0,
          isDoneToday: false,
          streakDays: 2,
          currentHour: 19, // 7 PM
        })
      ).toBe("thriving")
    })

    it("defaults currentHour to system hour when omitted", () => {
      const ctx: MascotContext = {
        totalPlants: 3,
        plantsToWaterCount: 0,
        isDoneToday: false,
        streakDays: 1,
      }
      const state = resolveMascotState(ctx)
      expect(["thriving", "resting", "thirsty", "celebrating"]).toContain(state)
    })
  })

  describe("Tier 5: Dialogue Text Generation", () => {
    it("generates contextual Persian dialogue when plants are thirsty", () => {
      const ctx: MascotContext = {
        totalPlants: 3,
        plantsToWaterCount: 2,
        isDoneToday: false,
        streakDays: 2,
        firstThirstyPlantName: "پوتوس",
      }
      const dialogue = getMascotDialogue(ctx, "fa")
      expect(dialogue.length).toBeGreaterThan(0)
      // Dialogue should mention watering, thirst, or the plant name
      const hasThirstKeyword = /آب|تشنه|نیاز|پوتوس/.test(dialogue)
      expect(hasThirstKeyword).toBe(true)
    })

    it("generates celebratory dialogue when isDoneToday is true", () => {
      const ctx: MascotContext = {
        totalPlants: 4,
        plantsToWaterCount: 0,
        isDoneToday: true,
        streakDays: 5,
      }
      const dialogue = getMascotDialogue(ctx, "fa")
      expect(dialogue.length).toBeGreaterThan(0)
      const hasCelebrationKeyword = /آفرین|تبریک|عالی|شاداب|انجام/.test(dialogue)
      expect(hasCelebrationKeyword).toBe(true)
    })

    it("generates encouraging dialogue when all plants are thriving", () => {
      const ctx: MascotContext = {
        totalPlants: 4,
        plantsToWaterCount: 0,
        isDoneToday: false,
        streakDays: 3,
      }
      const dialogue = getMascotDialogue(ctx, "fa")
      expect(dialogue.length).toBeGreaterThan(0)
      const hasThrivingKeyword = /شاداب|خوشحال|سرحال|عالی|طراوت/.test(dialogue)
      expect(hasThrivingKeyword).toBe(true)
    })

    it("generates welcoming dialogue when garden is empty (0 plants)", () => {
      const ctx: MascotContext = {
        totalPlants: 0,
        plantsToWaterCount: 0,
        isDoneToday: false,
        streakDays: 0,
      }
      const dialogue = getMascotDialogue(ctx, "fa")
      expect(dialogue.length).toBeGreaterThan(0)
      const hasEmptyKeyword = /گیاه|اولین|باغچه|اضافه/.test(dialogue)
      expect(hasEmptyKeyword).toBe(true)
    })

    it("mentions user name when provided", () => {
      const ctx: MascotContext = {
        totalPlants: 2,
        plantsToWaterCount: 1,
        isDoneToday: false,
        streakDays: 1,
        userName: "سارا",
      }
      const dialogue = getMascotDialogue(ctx, "fa")
      expect(dialogue).toContain("سارا")
    })

    it("supports English language output when requested", () => {
      const ctx: MascotContext = {
        totalPlants: 3,
        plantsToWaterCount: 1,
        isDoneToday: false,
        streakDays: 2,
      }
      const dialogueEn = getMascotDialogue(ctx, "en")
      expect(dialogueEn.length).toBeGreaterThan(0)
      // Checks for basic English characters
      expect(/[a-zA-Z]/.test(dialogueEn)).toBe(true)
    })

    it("never includes the raw string 'undefined' or 'null' in dialogue text", () => {
      const ctx: MascotContext = {
        totalPlants: 1,
        plantsToWaterCount: 1,
        isDoneToday: false,
        streakDays: 0,
        userName: undefined,
        firstThirstyPlantName: undefined,
      }
      const dialogue = getMascotDialogue(ctx)
      expect(dialogue).not.toContain("undefined")
      expect(dialogue).not.toContain("null")
    })
  })
})

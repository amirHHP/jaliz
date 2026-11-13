# Project: Jaliz Plant Care & Schedule Gamification Redesign

## Architecture
- **Framework**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5, Vitest.
- **Scope**: Redesign `/schedule` page (`src/app/schedule/page.tsx`, `src/components/Dashboard.tsx`, `src/components/WateringSchedule.tsx`, `src/components/WeatherAdvice.tsx`) into a Duolingo-inspired gamified care experience.
- **Key Modules**:
  - `src/lib/daily-advice-cache.ts`: Per-user per-calendar-day advice caching (`jaliz_daily_advice_${userId}`).
  - `src/lib/mascot-dialogue.ts`: State machine and contextual Persian dialogue generator for the companion mascot.
  - `src/lib/care-tasks.ts`: Task categorization logic (Overdue, Today, Upcoming) and progress calculation.
  - `src/lib/gamification.ts`: Streak derivation from `WateringLog`, XP point awarding, gardener level progression.
  - `src/components/mascot/`: Vector SVG companion mascot (`PlantMascot.tsx`), RTL speech bubble (`MascotSpeechBubble.tsx`), and hero companion card (`MascotCompanion.tsx`).
  - `src/components/schedule/`: Gamification status bar (`GamificationBar.tsx`), individual plant task cards (`CareTaskCard.tsx`), and celebration overlay.
  - `src/components/WeatherAdvice.tsx`: Automated fetching on mount, seamless daily cache lookup, error fallbacks.
  - `src/components/Dashboard.tsx`: Hero companion presentation, Duolingo aesthetic, preserved subscription gating paywall.

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Automated Daily Advice Caching | `src/lib/daily-advice-cache.ts` caching advice per user per calendar day (`toLocalDateString()`) with invalidation on day turnover | M2 | R3 |
| 2 | Mascot State & Dialogue Engine | `src/lib/mascot-dialogue.ts` mapping plant health/task status to 4 visual states (thriving, thirsty, celebrating, resting) & contextual Persian messages | M2 | R2 |
| 3 | Care Task Segmentation & Progress | `src/lib/care-tasks.ts` partitioning user plants into Overdue, Today, and Upcoming, plus completion percentage | M2 | R1 |
| 4 | Streak & XP Gamification Mechanics | `src/lib/gamification.ts` & `getWateringStreakAction()` calculating consecutive care streaks from `WateringLog`, XP rewards, and gardener levels | M2 | R1 |
| 5 | Vector SVG Plant Mascot Component | `src/components/mascot/PlantMascot.tsx` pure SVG character with distinct visual states (happy, droopy leaves/tear, sunglasses/confetti, resting) | M3 | R2 |
| 6 | Direction-Aware Mascot Speech Bubble | `src/components/mascot/MascotSpeechBubble.tsx` RTL-styled Duolingo speech bubble displaying dynamic contextual messages | M3 | R2 |
| 7 | Mascot Hero Companion Card | `src/components/mascot/MascotCompanion.tsx` top hero card displaying mascot, speech bubble, quick care status, and tap interactions | M3 | R2 |
| 8 | Gamified Care Status Bar | `src/components/schedule/GamificationBar.tsx` featuring streak flame (🔥), XP count, gardener level badge, and circular progress ring | M3 | R1 |
| 9 | Segmented Care Task List & Cards | `src/components/WateringSchedule.tsx` & `CareTaskCard.tsx` with Overdue/Today/Upcoming sections, individual plant checkoff, and batch "Water All" | M3 | R1 |
| 10 | Task Completion Visual Feedback | Animated celebration modal, confetti bursts, and instant visual checkmark feedback upon completing daily watering tasks | M3 | R1 |
| 11 | Automated Page-Load Advice Fetching | `src/components/WeatherAdvice.tsx` auto-loads advice on mount for subscribed users without manual button clicks | M3 | R3 |
| 12 | Preservation of Subscription Paywall | `src/components/Dashboard.tsx` ensures unsubscribed users see the locked paywall preview (99k Toman/mo) while subscribed users get full gamified experience | M3 | R4 |
| 13 | Comprehensive Opaque-Box Test Suite | Unit test suites for caching, dialogue engine, care tasks, and gamification in `src/lib/__tests__/` (Tier 1-4) | M1 | AC |
| 14 | Build & Test Regression Verification | Full `npm test` (all tests passing) and `npm run build` passing with 0 errors | M4 | AC |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Automated Test Suite Infrastructure | Create test suites `daily-advice-cache.test.ts`, `mascot.test.ts`, `care-tasks.test.ts`, `gamification.test.ts`, create `TEST_INFRA.md` & `TEST_READY.md`. | none | DONE (70 tests in 4 suites, TEST_READY.md) |
| M2 | Core Gamification, Dialogue & Caching Logic | Implement `daily-advice-cache.ts`, `mascot-dialogue.ts`, `care-tasks.ts`, `gamification.ts`, and `getWateringStreakAction`. Verify M1 tests pass. | M1 | DONE (70/70 M1 tests, 342/342 full tests) |
| M3 | Gamified UI, Mascot Components & Integration | Implement `PlantMascot.tsx`, `MascotSpeechBubble.tsx`, `MascotCompanion.tsx`, `GamificationBar.tsx`, `CareTaskCard.tsx`, update `WateringSchedule.tsx`, `WeatherAdvice.tsx`, and `Dashboard.tsx`. | M2 | DONE (8 components integrated, build clean) |
| M4 | Full Verification, Review, Challenge & Audit | Run all test suites, TypeScript check, build check, 2 Reviewers, 2 Challengers, Forensic Auditor gate check. | M3 | DONE (Gate Iteration 2 PASS: 451/451 tests pass, tsc 0 errors, Reviewers APPROVE, Challengers APPROVE, Auditor CLEAN) |

## Code Layout
- `src/lib/daily-advice-cache.ts` — Per-user calendar-day advice cache helpers.
- `src/lib/mascot-dialogue.ts` — Mascot emotional state resolution & Persian micro-copy generator.
- `src/lib/care-tasks.ts` — Plant care task partitioner (Overdue, Today, Upcoming) and progress calculator.
- `src/lib/gamification.ts` — Streak, XP rewards, and gardener level progression.
- `src/app/actions/plants.ts` — Server action additions for `getWateringStreakAction`.
- `src/components/mascot/PlantMascot.tsx` — Vector SVG mascot component.
- `src/components/mascot/MascotSpeechBubble.tsx` — RTL contextual speech bubble.
- `src/components/mascot/MascotCompanion.tsx` — Hero companion card for `/schedule`.
- `src/components/schedule/GamificationBar.tsx` — Streak, XP, and circular progress bar.
- `src/components/schedule/CareTaskCard.tsx` — Interactive per-plant task card.
- `src/components/WateringSchedule.tsx` — Redesigned segmented schedule list.
- `src/components/WeatherAdvice.tsx` — Automated advice card with daily caching.
- `src/components/Dashboard.tsx` — Integrated gamified dashboard layout with preserved paywall.
- `src/lib/__tests__/daily-advice-cache.test.ts` — Unit test suite for advice caching.
- `src/lib/__tests__/mascot.test.ts` — Unit test suite for mascot states and dialogue.
- `src/lib/__tests__/care-tasks.test.ts` — Unit test suite for task partitioning.
- `src/lib/__tests__/gamification.test.ts` — Unit test suite for streak, XP, and levels.

## Interface Contracts

### 1. `src/lib/daily-advice-cache.ts`
```ts
export interface DailyAdviceCacheEntry {
  userId: string
  date: string // YYYY-MM-DD from toLocalDateString()
  advice: string
  fetchedAt: number
}
export function getDailyAdviceCacheKey(userId: string): string
export function getCachedDailyAdvice(userId: string, todayDate?: string, storage?: Pick<Storage, "getItem"> | null): string | null
export function setCachedDailyAdvice(userId: string, advice: string, todayDate?: string, storage?: Pick<Storage, "setItem"> | null): void
export function clearDailyAdviceCache(userId: string, storage?: Pick<Storage, "removeItem"> | null): void
```

### 2. `src/lib/mascot-dialogue.ts`
```ts
export type MascotState = "thriving" | "thirsty" | "celebrating" | "resting"

export interface MascotContext {
  totalPlants: number
  plantsToWaterCount: number
  isDoneToday: boolean
  streakDays: number
  userName?: string
  firstThirstyPlantName?: string
  currentHour?: number
}

export function resolveMascotState(ctx: MascotContext): MascotState
export function getMascotDialogue(ctx: MascotContext, language?: "fa" | "en"): string
```

### 3. `src/lib/care-tasks.ts`
```ts
export type TaskCategory = "overdue" | "today" | "upcoming"

export interface CareTaskItem {
  plant: Plant
  category: TaskCategory
  dueDays: number // negative = overdue, 0 = today, positive = upcoming
  formattedDueText: string
}

export interface CareTasksPartition {
  overdue: CareTaskItem[]
  today: CareTaskItem[]
  upcoming: CareTaskItem[]
  totalDueToday: number // overdue + today
  completedCount: number
  completionPercentage: number
}

export function partitionCareTasks(plants: Plant[], isDoneToday?: boolean, now?: Date): CareTasksPartition
```

### 4. `src/lib/gamification.ts`
```ts
export interface GardenerLevel {
  level: number
  titleFa: string
  titleEn: string
  minXp: number
  maxXp: number
}

export function calculateWateringStreak(logDates: (string | Date)[], now?: Date): number
export function calculateGardenerLevel(xp: number): GardenerLevel
export function getXpForAction(action: "water_plant" | "daily_complete" | "streak_milestone"): number
```

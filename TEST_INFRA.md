# Jaliz Plant Care & Gamification — Testing Infrastructure (Milestone M1)

This document details the automated testing infrastructure created for the **Jaliz Plant Care & Schedule Gamification Redesign** (`/schedule`), satisfying user requirements **R1–R4** and interface contracts established in `PROJECT.md § Interface Contracts`.

---

## 1. Architectural Overview

The test infrastructure establishes opaque-box, contract-driven unit test suites under `src/lib/__tests__/` to support test-driven development (TDD) across all gamification, mascot dialogue, task partitioning, and AI advice caching modules.

```
┌────────────────────────────────────────────────────────────────────────┐
│               Jaliz Gamified Care Testing Infrastructure               │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Module Test Suite                │ Scope & Interface Contract          │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 1. `daily-advice-cache.test.ts`  │ Advice caching, date invalidation,  │
│    (17 unit tests)               │ user isolation, SSR/null resilience │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 2. `mascot.test.ts`              │ Emotional state engine, hour cutoffs│
│    (18 unit tests)               │ Persian/English contextual dialogue │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 3. `care-tasks.test.ts`          │ Task partitioning (overdue, today,  │
│    (15 unit tests)               │ upcoming), progress %, due text     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 4. `gamification.test.ts`        │ Consecutive care streaks, gaps,     │
│    (20 unit tests)               │ gardener levels (1-5), XP rewards   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

Total: **70 comprehensive test cases** covering Tiers 1 through 5.

---

## 2. Test Suites Specification

### 1. Daily Advice Cache (`src/lib/__tests__/daily-advice-cache.test.ts`)
- **Target Module**: `src/lib/daily-advice-cache.ts`
- **Tiers Covered**:
  - **Tier 1 (Key Naming & Storage)**: Validates `jaliz_daily_advice_${userId}` key structure and JSON payload schema (`userId`, `date`, `advice`, `fetchedAt`).
  - **Tier 2 (Date Boundary & Invalidation)**: Verifies cache hit on matching calendar date (`today`), cache miss/invalidation when advancing to next calendar day (`todayDate !== cachedDate`), and default fallback to local date (`toLocalDateString()`).
  - **Tier 3 (User Isolation)**: Ensures User A's advice never leaks to User B; cache clearing for User A does not disturb User B's cache.
  - **Tier 4 (Resilience & SSR Safety)**: Validates graceful `null` return on corrupted JSON, non-object primitives, missing properties, mismatched userId, storage quota exceptions (`QuotaExceededError`), and `null`/undefined storage in SSR contexts without throwing.

### 2. Mascot State & Dialogue (`src/lib/__tests__/mascot.test.ts`)
- **Target Module**: `src/lib/mascot-dialogue.ts`
- **Tiers Covered**:
  - **Tier 1 (Thirsty State)**: Resolves `"thirsty"` when `plantsToWaterCount > 0 && !isDoneToday` during active daytime hours.
  - **Tier 2 (Celebrating State)**: Resolves `"celebrating"` when `isDoneToday === true`.
  - **Tier 3 (Thriving State)**: Resolves `"thriving"` when all plants are hydrated (`totalPlants > 0 && plantsToWaterCount === 0`).
  - **Tier 4 (Resting State & Hour Boundaries)**: Resolves `"resting"` when `totalPlants === 0` or during night hours (`hour >= 20 || hour < 5`). Validates hour boundaries (0, 4, 5, 19, 20, 23) and default system hour.
  - **Tier 5 (Persian/English Micro-copy)**: Generates encouraging Persian micro-copy for thirsty plants (with plant name injection), celebrated completion, thriving garden, empty garden, and streak milestones. Enforces 0% `undefined`/`null` leakage and validates English output mode.

### 3. Care Tasks Partitioning (`src/lib/__tests__/care-tasks.test.ts`)
- **Target Module**: `src/lib/care-tasks.ts`
- **Tiers Covered**:
  - **Tier 1 (Partitioning Structure)**: Partitions plant collections into `overdue`, `today`, and `upcoming` buckets. Handles empty plant collections with 100% completion.
  - **Tier 2 (Boundary Calculations & Formatted Text)**: Calculates exact `dueDays` offsets (`-2` overdue, `0` today, `+3` upcoming) and formatted localized strings ("امروز", "۲ روز تاخیر", "۳ روز دیگر"). Falls back to `lastWatered + wateringInterval` when `nextWateringDate` is absent.
  - **Tier 3 (Progress Percentage)**: Accurately computes `totalDueToday`, `completedCount` (based on `lastWatered` matching today), and `completionPercentage`. Enforces 100% completion when `isDoneToday === true` and rounds fractional percentages to nearest integer.
  - **Sorting Order**: Validates that overdue items are sorted with most overdue first, and upcoming items are sorted soonest first.

### 4. Gamification Mechanics (`src/lib/__tests__/gamification.test.ts`)
- **Target Module**: `src/lib/gamification.ts`
- **Tiers Covered**:
  - **Tier 1 (Consecutive Day Calculation)**: Calculates streaks from date arrays (`string` | `Date`), supports unsorted arrays, and deduplicates multiple logs on the same calendar day.
  - **Tier 2 (Streak Continuity / Pending Today)**: Preserves active streak when today is not yet logged, but yesterday was logged (streak remains intact, waiting for today's routine).
  - **Tier 3 (Streak Break)**: Enforces reset to 0 when a gap of 2 or more days occurs. Ignores invalid date strings gracefully.
  - **Tier 4 (Gardener Levels)**: Maps XP to levels:
    - Level 1: `Sprout` / `جوانه` (0–99 XP)
    - Level 2: `Seedling` / `نهال` (100–249 XP)
    - Level 3: `Green Bush` / `بوته سبز` (250–499 XP)
    - Level 4: `Specialist` / `متخصص` (500–999 XP)
    - Level 5: `Master` / `استاد باغبان` (1000+ XP)
    - Clamps negative XP safely to Level 1.
  - **Tier 5 (XP Rewards)**:
    - `water_plant`: 10 XP
    - `daily_complete`: 25 XP
    - `streak_milestone`: 50 XP

---

## 3. Verification & Execution Commands

```bash
# 1. Run all 4 new gamification test suites
npx vitest run src/lib/__tests__/daily-advice-cache.test.ts src/lib/__tests__/mascot.test.ts src/lib/__tests__/care-tasks.test.ts src/lib/__tests__/gamification.test.ts

# 2. Run individual test suites
npx vitest run src/lib/__tests__/daily-advice-cache.test.ts
npx vitest run src/lib/__tests__/mascot.test.ts
npx vitest run src/lib/__tests__/care-tasks.test.ts
npx vitest run src/lib/__tests__/gamification.test.ts

# 3. Run full regression test suite (38 test files, 342 tests)
npm test

# 4. Verify TypeScript type safety
npx tsc --noEmit
```

---

## 4. TDD Lifecycle & Progressive Readiness

- **Milestone M1 (Current)**:
  - All 4 test suites created (70 tests total).
  - Type-safe placeholder stubs in `src/lib/` created conforming to `PROJECT.md § Interface Contracts`.
  - Tests compile with 0 TypeScript errors (`npx tsc --noEmit` passes).
  - Test suites execute in Vitest and fail as expected (RED state) on unimplemented placeholder stubs.
  - Existing 34 test files (272 tests) pass 100% without regression.
- **Milestone M2 (Downstream Implementation)**:
  - The implementation agent implements the core logic in:
    - `src/lib/daily-advice-cache.ts`
    - `src/lib/mascot-dialogue.ts`
    - `src/lib/care-tasks.ts`
    - `src/lib/gamification.ts`
    - `getWateringStreakAction` in `src/app/actions/plants.ts`
  - All 70 tests in the M1 suite transition to GREEN (100% passing).

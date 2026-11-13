# TEST READY — Milestone M1: Automated Test Suite Infrastructure

**Timestamp**: 2026-11-13T05:24:00Z  
**Agent**: Test Writer (`teamwork_test_writer_m1_1`)  
**Status**: READY FOR DOWNSTREAM IMPLEMENTATION (Milestone M2)

---

## 1. Overview & Verification Readiness

The automated test suite infrastructure for the **Jaliz Plant Care & Schedule Gamification Redesign** has been fully authored, type-checked, and verified against Vitest. The test suites are comprehensive, opaque-box, requirement-driven, and strictly adhere to the Interface Contracts established in `PROJECT.md § Interface Contracts`.

Downstream engineers implementing **Milestone M2** can now write the core logic in `src/lib/` and immediately verify their implementations against these authoritative test suites.

---

## 2. Test Artifacts Delivered

| Test File | Target Module | Tests | Tiers Covered |
|-----------|---------------|-------|---------------|
| `src/lib/__tests__/daily-advice-cache.test.ts` | `src/lib/daily-advice-cache.ts` | 17 | Tiers 1, 2, 3, 4 |
| `src/lib/__tests__/mascot.test.ts` | `src/lib/mascot-dialogue.ts` | 18 | Tiers 1, 2, 3, 4, 5 |
| `src/lib/__tests__/care-tasks.test.ts` | `src/lib/care-tasks.ts` | 15 | Tiers 1, 2, 3 |
| `src/lib/__tests__/gamification.test.ts` | `src/lib/gamification.ts` | 20 | Tiers 1, 2, 3, 4, 5 |
| **Total** | | **70** | |

### Type-Safe Placeholder Stubs Created
- `src/lib/daily-advice-cache.ts`
- `src/lib/mascot-dialogue.ts`
- `src/lib/care-tasks.ts`
- `src/lib/gamification.ts`

---

## 3. Coverage Matrix

### A. Daily Advice Cache (`daily-advice-cache.test.ts`)
- [x] **Tier 1 (Key Naming & Storage)**: Validates `jaliz_daily_advice_${userId}` key format, JSON metadata payload (`userId`, `date`, `advice`, `fetchedAt`).
- [x] **Tier 2 (Date Boundary & Invalidation)**: Cache hit on same date, cache miss/invalidation when date advances to next calendar day, fallback to `toLocalDateString()`.
- [x] **Tier 3 (User Isolation)**: User A cannot read User B's cache; clearing User A leaves User B intact.
- [x] **Tier 4 (Error Resilience & SSR)**: Safe `null` return on corrupted non-JSON strings, non-object primitives, missing required keys, mismatched userId, quota/security exceptions, and SSR null storage without throwing.

### B. Mascot State & Dialogue (`mascot.test.ts`)
- [x] **Tier 1 (Thirsty State)**: Resolves `"thirsty"` when `plantsToWaterCount > 0 && !isDoneToday` during day hours.
- [x] **Tier 2 (Celebrating State)**: Resolves `"celebrating"` when `isDoneToday === true`.
- [x] **Tier 3 (Thriving State)**: Resolves `"thriving"` when `totalPlants > 0 && plantsToWaterCount === 0`.
- [x] **Tier 4 (Resting State & Hours)**: Resolves `"resting"` when `totalPlants === 0` or during night hours (`hour >= 20 || hour < 5`). Validates boundary hours (0, 4, 5, 19, 20, 23) and default system hour.
- [x] **Tier 5 (Dialogue Text)**: Generates contextual Persian messages for thirsty plants (with plant name injection), celebrated completion, thriving garden, empty garden, and streak milestones. Enforces 0% `undefined`/`null` leakage and validates English output option.

### C. Care Tasks Partitioning (`care-tasks.test.ts`)
- [x] **Tier 1 (Task Partitioning)**: Buckets plants into `overdue`, `today`, and `upcoming`. Handles empty array with 100% completion.
- [x] **Tier 2 (Boundary Testing)**: Exact `dueDays` calculation (`-2` overdue, `0` today, `+3` upcoming) and localized formatted text ("امروز", "۲ روز تاخیر", "۳ روز دیگر"). Fallback to `lastWatered + wateringInterval`.
- [x] **Tier 3 (Progress Percentage)**: Accurately calculates `totalDueToday`, `completedCount`, and `completionPercentage` (e.g. 2 of 4 = 50%, all done or `isDoneToday === true` = 100%, 1 of 3 = 33%).
- [x] **Sorting**: Validates sorting of overdue tasks (most overdue first) and upcoming tasks (soonest first).

### D. Gamification Mechanics (`gamification.test.ts`)
- [x] **Tier 1 (Consecutive Day Calculation)**: Calculates consecutive day streaks from dates (`string` | `Date`), handles unsorted dates, deduplicates multiple logs on same day.
- [x] **Tier 2 (Streak Continuity)**: Preserves active streak when today is not yet logged, but yesterday was logged (streak remains intact, pending today).
- [x] **Tier 3 (Streak Break)**: Gap of 2 or more days resets streak to 0. Ignores invalid date strings.
- [x] **Tier 4 (Gardener Levels)**: Maps XP to levels:
  - Level 1: `Sprout` / `جوانه` (0–99 XP)
  - Level 2: `Seedling` / `نهال` (100–249 XP)
  - Level 3: `Green Bush` / `بوته سبز` (250–499 XP)
  - Level 4: `Specialist` / `متخصص` (500–999 XP)
  - Level 5: `Master` / `استاد باغبان` (1000+ XP)
  - Clamps negative XP to Level 1.
- [x] **Tier 5 (XP Rewards)**:
  - `water_plant`: 10 XP
  - `daily_complete`: 25 XP
  - `streak_milestone`: 50 XP

---

## 4. Verification Results

### A. TypeScript Type-Checking
```bash
$ npx tsc --noEmit
# Exit Code: 0 (Zero TypeScript errors)
```

### B. Vitest Execution on New Suites
```bash
$ npx vitest run src/lib/__tests__/daily-advice-cache.test.ts src/lib/__tests__/mascot.test.ts src/lib/__tests__/care-tasks.test.ts src/lib/__tests__/gamification.test.ts

Test Files  4 failed (4)
     Tests  70 failed (70)
```
*Note: All 70 tests fail with `Error: Not implemented` on the placeholder stubs, confirming non-facade, real test execution.*

### C. Baseline Regression Check
```bash
$ npm test
Test Files  4 failed | 34 passed (38)
     Tests  70 failed | 272 passed (342)
```
*Existing 34 test files (272 tests) pass 100% without regression.*

---

## 5. Instructions for Milestone M2 Implementation Agent

1. Implement business logic inside:
   - `src/lib/daily-advice-cache.ts`
   - `src/lib/mascot-dialogue.ts`
   - `src/lib/care-tasks.ts`
   - `src/lib/gamification.ts`
   - `getWateringStreakAction` in `src/app/actions/plants.ts`
2. Run validation command:
   ```bash
   npx vitest run src/lib/__tests__/daily-advice-cache.test.ts src/lib/__tests__/mascot.test.ts src/lib/__tests__/care-tasks.test.ts src/lib/__tests__/gamification.test.ts
   ```
3. When all 70 tests pass (GREEN), run full repository test suite:
   ```bash
   npm test
   ```
   All 38 test files (342 tests) must pass with Exit Code 0.

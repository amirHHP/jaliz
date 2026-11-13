# Dispatch for Test Writer: Milestone 1 Test Suite Infrastructure

- Agent ID: test_writer_m1_1
- Archetype: teamwork_test_writer
- Role: Test Infrastructure Specialist (E2E Testing Track)
- Working Directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_m1_1

## Objective
Read `/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md` and `/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md`.
Your role is to author comprehensive, opaque-box, requirement-driven test suites in `src/lib/__tests__/` based on the user requirements (R1, R2, R3, R4) and the Interface Contracts in `PROJECT.md § Interface Contracts`:

1. `src/lib/__tests__/daily-advice-cache.test.ts`:
   - Tier 1: get/set cache for user, key naming `jaliz_daily_advice_${userId}`.
   - Tier 2: Date boundary testing: cache hit when `date === today`, cache miss/invalidation when date advances to next calendar day.
   - Tier 3: User isolation: verify user A cannot access user B's cached advice.
   - Tier 4: Error resilience: corrupted JSON string in storage, null storage (SSR), empty advice string handling, clear cache method.
2. `src/lib/__tests__/mascot.test.ts`:
   - Tier 1: State resolution: `resolveMascotState()` returns `"thirsty"` when `plantsToWaterCount > 0 && !isDoneToday`.
   - Tier 2: State resolution: returns `"celebrating"` when `isDoneToday === true`.
   - Tier 3: State resolution: returns `"thriving"` when `totalPlants > 0 && plantsToWaterCount === 0`.
   - Tier 4: State resolution: returns `"resting"` when `totalPlants === 0` or during night hours (`hour >= 20 || hour < 5`).
   - Tier 5: Dialogue text generation: `getMascotDialogue()` produces contextual Persian messages for thirsty plants, all hydrated, celebrating completed, streak milestones, and empty garden.
3. `src/lib/__tests__/care-tasks.test.ts`:
   - Tier 1: Task partitioning: `partitionCareTasks(plants)` correctly buckets plants into `overdue`, `today`, and `upcoming`.
   - Tier 2: Boundary testing: plant due today (`diffDays === 0`), plant overdue by 2 days (`diffDays === -2`), plant upcoming in 3 days (`diffDays === 3`).
   - Tier 3: Progress percentage: when 2 of 4 due tasks are completed, `completionPercentage === 50`. When all completed or `isDoneToday === true`, `completionPercentage === 100`.
4. `src/lib/__tests__/gamification.test.ts`:
   - Tier 1: Streak calculation: consecutive days in `WateringLog` dates (e.g. [today, yesterday, 2 days ago] = 3-day streak).
   - Tier 2: Streak continuity: today not yet logged, but yesterday logged = streak is preserved and active (pending today).
   - Tier 3: Streak break: gap of 2 or more days resets streak to 0.
   - Tier 4: Gardener level: calculation of level from XP (Sprout, Seedling, Green Bush, Specialist, Master).
   - Tier 5: XP rewards: per-plant watered (10 XP), daily completion bonus (25 XP), streak milestone bonus (50 XP).
5. Generate `TEST_INFRA.md` and `TEST_READY.md` at project root summarizing all test suites, commands to run (`npm test`), and coverage matrix across Tiers 1-4.

## Constraints
- You do NOT modify implementation code — only test files and test metadata.
- Remember Vitest runs in Node environment (`src/**/__tests__/**/*.test.ts`). Use dependency-injected mock storage (like `memoryStorage()` from existing tests) for localStorage simulation.
- Verify tests can be run with `npm test`. (Since implementation files in `src/lib/` may not exist yet, you can create minimal type-safe placeholder stubs in `src/lib/` or verify module imports conform strictly to `PROJECT.md § Interface Contracts`).

## Deliverables
- Write `TEST_INFRA.md` and `TEST_READY.md` at project root.
- Write handoff report to `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_m1_1/handoff.md`.
- Report back when finished.


## 2026-11-13T05:14:16Z
You are test_writer_m1_1, a teamwork_test_writer subagent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_m1_1
Read your dispatch instructions in:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_m1_1/DISPATCH.md
MANDATORY: Read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md and /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md before starting work.
Your task is to write comprehensive opaque-box test suites in `src/lib/__tests__/`:
- `src/lib/__tests__/daily-advice-cache.test.ts`
- `src/lib/__tests__/mascot.test.ts`
- `src/lib/__tests__/care-tasks.test.ts`
- `src/lib/__tests__/gamification.test.ts`
Conforming to Interface Contracts in `PROJECT.md § Interface Contracts`.
Create `TEST_INFRA.md` and `TEST_READY.md` at project root.
Document your results in:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_test_writer_m1_1/handoff.md
Notify the orchestrator via send_message when complete.

# BRIEFING — 2026-11-13T05:37:30Z

## Mission
Implement core gamification, mascot dialogue, daily advice cache, care tasks partitioning, and getWateringStreakAction for Milestone 2.

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa, specialist
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m2_1
- Original parent: c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413
- Milestone: milestone_2

## 🔒 Key Constraints
- DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task.
- Only edit files in exclusive write ownership: `src/lib/daily-advice-cache.ts`, `src/lib/mascot-dialogue.ts`, `src/lib/care-tasks.ts`, `src/lib/gamification.ts`, `src/app/actions/plants.ts`.
- All vitest tests and tsc must pass with 0 regressions.

## Current Parent
- Conversation ID: c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413
- Updated: 2026-11-13T05:26:17Z

## Task Summary
- **What to build**: Implement `daily-advice-cache.ts`, `mascot-dialogue.ts`, `care-tasks.ts`, `gamification.ts`, and `getWateringStreakAction` in `src/app/actions/plants.ts`.
- **Success criteria**: 70 tests in the 4 target test suites pass, all 342 project tests pass, tsc --noEmit passes.
- **Interface contracts**: `/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md`
- **Code layout**: `src/lib` and `src/app/actions`

## Key Decisions Made
- `daily-advice-cache.ts`: Robust error-resilient storage access using `resolveStorage` with full try/catch wrapping, JSON validation against schema and userId/date match.
- `mascot-dialogue.ts`: Clean state machine prioritizing night resting hours (<5, >=20) and empty gardens, then celebrating if isDoneToday, then thirsty if count > 0, then thriving. Bilingual Persian/English micro-copy with zero null/undefined leakage.
- `care-tasks.ts`: UTC midnight math for exact day-difference calculations immune to local timezone drift. Persian digit formatting for relative due text. Accurate 100% completion handling for empty/completed states.
- `gamification.ts`: Deduplicated date sets supporting Date objects, local strings, and ISO strings. Backward day walk with active streak protection when today is pending. 5-tier gardener levels with negative XP clamping.
- `plants.ts`: Added `getWateringStreakAction` server action backed by Prisma `wateringLog.findMany`.

## Artifact Index
- `DISPATCH.md` — Task dispatch and instructions
- `progress.md` — Liveness heartbeat and task execution log
- `handoff.md` — Final completion handoff report

## Change Tracker
- **Files modified**:
  - `src/lib/daily-advice-cache.ts` — Per-user calendar-day storage caching and invalidation logic
  - `src/lib/mascot-dialogue.ts` — Mascot state resolution and Persian/English dialogue micro-copy
  - `src/lib/care-tasks.ts` — Plant care task partitioner (Overdue, Today, Upcoming) and progress calculator
  - `src/lib/gamification.ts` — Consecutive care streak calculator, gardener level evaluator, XP rewards
  - `src/app/actions/plants.ts` — Exported `getWateringStreakAction` server action
- **Build status**: PASS (`tsc --noEmit` exit code 0)
- **Pending issues**: none

## Quality Status
- **Build/test result**: PASS (70/70 target tests passing, 342/342 repository tests passing, 0 failures)
- **Lint status**: clean
- **Tests added/modified**: 0 (all 70 tests pre-authored in M1 now 100% GREEN)

## Loaded Skills
- None

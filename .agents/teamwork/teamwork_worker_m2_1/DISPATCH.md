# Dispatch for Worker M2: Core Gamification, Dialogue & Caching Logic

- Agent ID: worker_m2_1
- Archetype: teamwork_worker
- Role: Core Logic & Services Engineer
- Working Directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m2_1

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Read:
- `/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md`
- `/Users/sotoon/personal/jaliz/TEST_READY.md`

Your job is to implement genuine, production-grade business logic in:
1. `src/lib/daily-advice-cache.ts`:
   - Implement `getDailyAdviceCacheKey`, `getCachedDailyAdvice`, `setCachedDailyAdvice`, `clearDailyAdviceCache`.
   - Store entries as `{ userId, date: YYYY-MM-DD, advice, fetchedAt }`.
   - Use `toLocalDateString()` from `src/lib/relative-date.ts`.
   - Safely handle JSON parse errors, storage quota errors, and SSR null storage.
2. `src/lib/mascot-dialogue.ts`:
   - Implement `resolveMascotState`:
     - `"resting"` if `totalPlants === 0` or if `hour >= 20 || hour < 5` (defaults to current system hour).
     - `"celebrating"` if `isDoneToday === true`.
     - `"thirsty"` if `plantsToWaterCount > 0`.
     - `"thriving"` if `totalPlants > 0 && plantsToWaterCount === 0`.
   - Implement `getMascotDialogue`:
     - Contextual Persian dialogue strings with warmth and personality (Duolingo style).
     - Inject `userName` or fallback, inject `firstThirstyPlantName` or plant count.
     - Support English option (`language === "en"`).
     - Ensure 0% undefined/null string concatenation.
3. `src/lib/care-tasks.ts`:
   - Implement `partitionCareTasks(plants, isDoneToday, now)`:
     - Partition plants into `overdue` (diffDays < 0 or past threshold), `today` (diffDays === 0 or needs water), and `upcoming` (diffDays > 0).
     - Sort overdue by most overdue first (ascending dueDays).
     - Sort upcoming by soonest first (ascending dueDays).
     - Calculate `totalDueToday = overdue.length + today.length`.
     - Calculate `completedCount` and `completionPercentage` (100% if `isDoneToday === true` or all due watered).
     - Include human-readable Persian `formattedDueText` ("امروز", "۲ روز تاخیر", "۳ روز دیگر").
4. `src/lib/gamification.ts`:
   - Implement `calculateWateringStreak(logDates, now)`:
     - Sort dates, deduplicate days in local timezone.
     - Count consecutive days backwards from today.
     - If today is not logged but yesterday is logged, streak is preserved (active, pending today).
     - If 2+ day gap, streak resets to 0.
   - Implement `calculateGardenerLevel(xp)`:
     - Level 1: `Sprout` / `جوانه` (0–99 XP)
     - Level 2: `Seedling` / `نهال` (100–249 XP)
     - Level 3: `Green Bush` / `بوته سبز` (250–499 XP)
     - Level 4: `Specialist` / `متخصص` (500–999 XP)
     - Level 5: `Master` / `استاد باغبان` (1000+ XP)
   - Implement `getXpForAction`:
     - `"water_plant"`: 10 XP
     - `"daily_complete"`: 25 XP
     - `"streak_milestone"`: 50 XP
5. `src/app/actions/plants.ts`:
   - Export `getWateringStreakAction()`:
     - Query `prisma.wateringLog.findMany({ where: { userId }, select: { logDate: true } })`.
     - Call `calculateWateringStreak(logs.map(l => l.logDate))`.
     - Return `{ streak: number }`.

## Exclusive Write Ownership
You exclusively own and may edit:
- `src/lib/daily-advice-cache.ts`
- `src/lib/mascot-dialogue.ts`
- `src/lib/care-tasks.ts`
- `src/lib/gamification.ts`
- `src/app/actions/plants.ts`

## Verification Requirements
You MUST run the following commands and report exact output:
1. `npx vitest run src/lib/__tests__/daily-advice-cache.test.ts src/lib/__tests__/mascot.test.ts src/lib/__tests__/care-tasks.test.ts src/lib/__tests__/gamification.test.ts` (all 70 tests must pass).
2. `npm test` (all 342 tests in repository must pass with 0 regressions).
3. `npx tsc --noEmit` (0 TypeScript errors).

## Deliverables
Write your completion report to `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m2_1/handoff.md`.
Report back when finished.


## 2026-11-13T05:26:17Z
[Message] timestamp=2026-11-13T05:26:17Z sender=c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413 priority=MESSAGE_PRIORITY_HIGH content=You are worker_m2_1, a teamwork_worker subagent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m2_1
Read your dispatch instructions in:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m2_1/DISPATCH.md
MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY: Read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md, /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md, and /Users/sotoon/personal/jaliz/TEST_READY.md before starting work.

Implement:
1. `src/lib/daily-advice-cache.ts`
2. `src/lib/mascot-dialogue.ts`
3. `src/lib/care-tasks.ts`
4. `src/lib/gamification.ts`
5. `getWateringStreakAction` in `src/app/actions/plants.ts`

Run:
- `npx vitest run src/lib/__tests__/daily-advice-cache.test.ts src/lib/__tests__/mascot.test.ts src/lib/__tests__/care-tasks.test.ts src/lib/__tests__/gamification.test.ts`
- `npm test`
- `npx tsc --noEmit`
Document commands and results in:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m2_1/handoff.md
Notify the orchestrator via send_message when complete.

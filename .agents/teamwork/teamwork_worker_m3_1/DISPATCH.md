# Dispatch for Worker M3: Gamified UI, Mascot Components & Integration

- Agent ID: worker_m3_1
- Archetype: teamwork_worker
- Role: Frontend UI & Gamification Engineer
- Working Directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Read:
- `/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md`
- `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_1/handoff.md`
- `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/handoff.md`
- `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3/handoff.md`

Your task is to implement the gamified UI, plant companion mascot, automated daily advice with calendar-day caching, and preserve subscription gating:

1. **Vector SVG Mascot (`src/components/mascot/PlantMascot.tsx`)**:
   - Pure React vector SVG character ("برگچه" / Bargcheh) with zero external dependencies.
   - 4 Dynamic Visual States:
     - `thriving`: Upright emerald crown leaves, sparkling eyes, rosy cheeks, gentle floating bounce.
     - `thirsty`: Drooping leaves along the pot, pleading eyes, pulsing blue teardrop.
     - `celebrating`: Cool sunglasses (`😎`), star bursts, colorful confetti dots, victory celebration bounce.
     - `resting`: Closed peaceful curved eyes, calm breathing scale.
   - Props: `state: MascotState`, `size?: number`, `className?: string`.
2. **RTL Mascot Speech Bubble (`src/components/mascot/MascotSpeechBubble.tsx`)**:
   - Duolingo-style bubble with directional tail pointing toward mascot in RTL/LTR.
   - High contrast, rounded-3xl, shadow-md, responsive Persian typography.
   - Props: `message: string`, `state?: MascotState`, `className?: string`, `onTap?: () => void`.
3. **Hero Companion Card (`src/components/mascot/MascotCompanion.tsx`)**:
   - Placed at the top of `/schedule` (in `Dashboard.tsx`).
   - Gathers plant count, plants needing water, streak, and completion status.
   - Computes state and dialogue via `resolveMascotState` and `getMascotDialogue`.
   - Supports tap interaction cycling friendly garden quotes.
4. **Gamification Status Bar (`src/components/schedule/GamificationBar.tsx`)**:
   - Shows streak flame (`🔥 {streak} روز`), XP badge, gardener level badge (`titleFa`), and circular progress ring showing today's % care completed.
5. **Interactive Care Task Card (`src/components/schedule/CareTaskCard.tsx`)**:
   - Card showing plant thumbnail/icon, name, location/pot info, relative due tag ("امروز", "۲ روز تاخیر", "فردا"), and an animated water check button.
6. **Redesign `src/components/WateringSchedule.tsx`**:
   - Uses `partitionCareTasks(plants, isDoneToday)` from `@/lib/care-tasks`.
   - Renders `GamificationBar` at the top.
   - Partitions into:
     - 🚨 **Overdue**: Urgent alert cards.
     - 💧 **Today**: Interactive task checklist with per-plant water check button and batch "آبیاری همه".
     - 🌱 **Upcoming**: Expandable forecast calendar.
   - Individual watering check calls `updatePlantsLastWateredAction([plantId], today)` and awards XP with instant visual feedback.
   - Celebration modal / confetti overlay when all due tasks are completed.
7. **Update `src/components/WeatherAdvice.tsx`**:
   - Automatically fetch advice on mount if user is subscribed (`subscribed === true`) and no advice is cached for today.
   - Check `getCachedDailyAdvice(user.id)` on load. If cached, immediately display advice with 0 loading spinner and 0 API requests.
   - When advice is fetched, store via `setCachedDailyAdvice(user.id, text)`.
   - Duolingo-style card aesthetic with friendly mascot tip header and optional subtle refresh button.
8. **Update `src/components/Dashboard.tsx`**:
   - Place `MascotCompanion` at the top hero section.
   - Render `WateringSchedule` and `WeatherAdvice` in the unlocked container.
   - Strictly preserve subscription gating: if `!subscribed`, show the blurred locked preview and paywall modal (99,000 Tomans/month with checkout button).

## Exclusive Write Ownership
You exclusively own and may edit:
- `src/components/mascot/PlantMascot.tsx`
- `src/components/mascot/MascotSpeechBubble.tsx`
- `src/components/mascot/MascotCompanion.tsx`
- `src/components/schedule/GamificationBar.tsx`
- `src/components/schedule/CareTaskCard.tsx`
- `src/components/WateringSchedule.tsx`
- `src/components/WeatherAdvice.tsx`
- `src/components/Dashboard.tsx`

## Verification Requirements
You MUST run the following commands and document their output in your handoff:
1. `npm test` (all 38 test suites, 342 tests must pass with 0 errors).
2. `npx tsc --noEmit` (0 TypeScript errors).
3. `npm run build` (Next.js production build must compile and bundle cleanly with 0 errors).

## Deliverables
Write your handoff report to:
`/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1/handoff.md`
Notify the orchestrator via send_message when complete.


## 2026-11-13T05:39:22Z
You are worker_m3_1, a teamwork_worker subagent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1
Read your dispatch instructions in:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1/DISPATCH.md
MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY: Read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md, /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md, and the three survey handoff reports before starting work.

Implement:
1. `src/components/mascot/PlantMascot.tsx`
2. `src/components/mascot/MascotSpeechBubble.tsx`
3. `src/components/mascot/MascotCompanion.tsx`
4. `src/components/schedule/GamificationBar.tsx`
5. `src/components/schedule/CareTaskCard.tsx`
6. `src/components/WateringSchedule.tsx`
7. `src/components/WeatherAdvice.tsx`
8. `src/components/Dashboard.tsx`

Run:
- `npm test`
- `npx tsc --noEmit`
- `npm run build`
Document commands and results in:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_worker_m3_1/handoff.md
Notify the orchestrator via send_message when complete.

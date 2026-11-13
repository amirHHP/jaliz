# Dispatch for Forensic Auditor: Integrity & Authenticity Forensics

- Agent ID: auditor_m4_1
- Archetype: teamwork_auditor
- Role: Forensic Integrity Auditor
- Working Directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_auditor_m4_1

## Objective
Read:
- `/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md`
- `/Users/sotoon/personal/jaliz/TEST_READY.md`

Perform deep forensic integrity verification on all new and modified source code:
1. **Hardcoding & Cheating Checks**:
   - Inspect `src/lib/daily-advice-cache.ts`, `src/lib/mascot-dialogue.ts`, `src/lib/care-tasks.ts`, `src/lib/gamification.ts`, `src/app/actions/plants.ts`.
   - Ensure NO hardcoded test results, expected test strings, or dummy if-conditions specifically tailoring to test inputs.
   - Verify all logic is generic, robust, and authentic.
2. **Facade & Dummy Checks**:
   - Inspect `PlantMascot.tsx`: verify genuine, full vector SVG elements with dynamic visual changes (not placeholder divs or empty SVGs).
   - Inspect `MascotSpeechBubble.tsx`, `MascotCompanion.tsx`, `GamificationBar.tsx`, `CareTaskCard.tsx`.
   - Inspect `WateringSchedule.tsx`, `WeatherAdvice.tsx`, `Dashboard.tsx`.
3. **Requirement Fidelity**:
   - R1: Genuine Duolingo gamification (streak, XP, level, progress ring, segmented tasks, celebration).
   - R2: Expressive plant mascot companion with 4 states and contextual Persian speech bubbles.
   - R3: Automated daily advice with genuine calendar caching per user per day.
   - R4: Strict preservation of subscription paywall gating.
4. Run independent verification commands:
   - `npm test`
   - `npx tsc --noEmit`
   - `npm run build`

## Verdict Requirement
Your handoff report MUST end with a clear, unambiguous forensic verdict:
`Verdict: CLEAN` or `Verdict: INTEGRITY VIOLATION` (with exact line references, diffs, and evidence).
Write report to: `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_auditor_m4_1/handoff.md`.
Notify orchestrator via send_message.


## 2026-11-13T05:57:12Z
You are auditor_m4_1, a teamwork_auditor subagent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_auditor_m4_1
Read your dispatch instructions in:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_auditor_m4_1/DISPATCH.md
MANDATORY: Read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md and /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md before starting work.
Perform deep forensic integrity verification on all new and modified code:
- Check for hardcoded test results or expected strings tailored to tests.
- Check for dummy or facade implementations.
- Verify vector SVG rendering authenticity in PlantMascot.tsx.
- Check genuine calendar-day caching and genuine subscription gating.
- Run tests and build (`npm test`, `npx tsc --noEmit`, `npm run build`).
Write your report with explicit verdict (`Verdict: CLEAN` or `Verdict: INTEGRITY VIOLATION`) to:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_auditor_m4_1/handoff.md
Notify orchestrator via send_message when complete.

# Dispatch for Challenger 2: Adversarial Task Partitioning & Streak Verification

- Agent ID: challenger_m4_2
- Archetype: teamwork_challenger
- Role: Adversarial Task & Gamification Verifier
- Working Directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_challenger_m4_2

## Objective
Read:
- `/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md`
- `/Users/sotoon/personal/jaliz/TEST_READY.md`

Empirically test and adversarially probe:
1. Care Tasks Partitioning (`src/lib/care-tasks.ts`):
   - Missing `nextWateringDate` fallback to `lastWatered + wateringInterval`.
   - Plants overdue by many days (e.g. -30 days) and plants due far in the future (+60 days).
   - Empty plant arrays, 1 plant, 100 plants.
   - Progress percentage calculations with zero due tasks vs partial vs all complete.
2. Streak & Gamification Mechanics (`src/lib/gamification.ts`):
   - Out-of-order date logs, duplicate logs on the same date.
   - Leap day boundaries (Feb 28 / Feb 29 / Mar 1) and year turnover (Dec 31 / Jan 1).
   - Streak continuity: today unlogged, yesterday logged -> streak preserved.
   - Streak break: 2-day gap -> streak reset to 0.
   - Negative XP values clamped to Level 1.
3. Subscription Gating Adversarial Check:
   - Verify unauthenticated and unsubscribed paths in `src/app/schedule/page.tsx` and `src/components/Dashboard.tsx`.
   - Verify no advice leak or mascot data leak to paywall preview.

## Verdict Requirement
Your handoff report MUST end with a clear, unambiguous verdict:
`Verdict: APPROVE` or `Verdict: REQUEST_CHANGES` (with exact line references and reproduction steps).
Write report to: `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_challenger_m4_2/handoff.md`.
Notify orchestrator via send_message.


## 2026-11-13T05:56:50Z
You are challenger_m4_2, a teamwork_challenger subagent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_challenger_m4_2
Read your dispatch instructions in:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_challenger_m4_2/DISPATCH.md
MANDATORY: Read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md and /Users/sotoon/personal/jaliz/.agents/teamwork/orchestrator/PROJECT.md before starting work.
Empirically stress test task partitioning (missing dates, large day offsets, sorting, progress percentage), streak mechanics (out of order, duplicate logs, leap days, streak continuity/breaks, negative XP clamping), and subscription gating.
Write your report with explicit verdict (`Verdict: APPROVE` or `Verdict: REQUEST_CHANGES`) to:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_challenger_m4_2/handoff.md
Notify orchestrator via send_message when complete.

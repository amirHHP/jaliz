# BRIEFING — 2026-11-13T05:13:00Z

## Mission
Investigate Jaliz UI architecture and design a Duolingo-inspired Vector SVG/CSS Plant Mascot Companion with dynamic visual states, contextual Persian speech bubbles, and responsive /schedule placement.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: Codebase Researcher (Mascot & Visual States)
- Working directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2
- Original parent: c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413
- Milestone: Survey & Mascot Design Specification

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Design vector SVG/CSS plant companion mascot with dynamic visual states (Thriving, Thirsty, Celebrating, Resting)
- Design dynamic speech bubble system with contextual Persian messages
- Investigate placement & responsive layout in /schedule
- Adhere to Duolingo-style gamification aesthetics

## Current Parent
- Conversation ID: c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413
- Updated: 2026-11-13T05:10:48Z

## Investigation State
- **Explored paths**: `src/app/schedule/page.tsx`, `src/components/Dashboard.tsx`, `src/components/WateringSchedule.tsx`, `src/components/WeatherAdvice.tsx`, `src/components/BottomNav.tsx`, `src/components/PlantsProvider.tsx`, `src/lib/watering.ts`, `src/app/actions/plants.ts`, `prisma/schema.prisma`, `src/app/globals.css`.
- **Key findings**:
  1. Mascot character concept named "برگچه" (Bargcheh) designed as a potted lively sprout with 4 dynamic vector SVG states: Thriving, Thirsty, Celebrating (with cool sunglasses/confetti), and Resting.
  2. Pure React vector SVG architecture using Tailwind v4 palette (`emerald`, `teal`, terracotta pot), scalable at any size with 0 external dependencies.
  3. Dynamic Persian speech bubble engine with context-driven micro-copy: zero plants, thirsty plants, celebration after watering, streak achievements, and friendly tips.
  4. Best placement is as a Hero Companion Card on `/schedule` right above `WateringSchedule`, replacing the plain text welcome banner for subscribed users.
  5. Subscription gating (R4) cleanly preserved: full mascot companion unlocks for active subscribers, non-subscribers view the paywall preview card.
  6. Streak logic directly computable from existing `WateringLog` table in SQLite/LibSQL without schema migrations.
- **Unexplored areas**: None. Ready for handoff synthesis.

## Key Decisions Made
- Mascot component modularized into `PlantMascot.tsx` (visuals), `MascotSpeechBubble.tsx` (RTL bubble), `MascotCompanion.tsx` (composite), and `src/lib/mascot-dialogue.ts` (testable pure dialogue engine).
- Sunglasses accessory (`😎`) selected as the signature Duolingo-style celebratory flair for task completion.

## Artifact Index
- /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/DISPATCH.md — Dispatch instructions & check-ins
- /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/BRIEFING.md — Working memory
- /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/progress.md — Progress tracking
- /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/handoff.md — Final handoff report

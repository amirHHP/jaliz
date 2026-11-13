# Dispatch for Explorer 3: Automated Daily AI Advice, Caching & Subscription Gating

- Agent ID: explorer_survey_3
- Archetype: teamwork_explorer
- Role: Codebase Researcher (Advice & Subscription Logic)
- Working Directory: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3

## Objective
Read `/Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md` and investigate the codebase for requirements R3 & R4:
1. `src/components/WeatherAdvice.tsx` and related services/APIs:
   - How weather data and AI care advice are currently fetched.
   - The manual consultation button ("مشاوره") and how the API request is made.
   - Any API keys, mock endpoints, or Gemini/OpenAI integrations in `src/lib/` or `src/app/api/`.
2. Automated fetching on page load:
   - How to trigger advice fetching automatically on mounting without user button clicks.
   - Loading states, error fallbacks, skeleton screens.
3. Daily Caching Mechanism:
   - Caching per user per calendar day (e.g. Tehran timezone or local date `YYYY-MM-DD`).
   - Storage strategy (localStorage key naming, structure containing timestamp/date, user ID, cached advice).
   - Invalidation logic: ensuring subsequent visits on the same day use cached advice without re-calling the API, while a new day triggers a fresh fetch.
4. Subscription Gating (R4):
   - How subscription state is checked (e.g. `useSubscription`, `useAuth`, `isSubscribed`, premium feature flags).
   - How the locked paywall preview is currently rendered for non-subscribed users.
   - How to strictly preserve paywall gating for non-subscribers while giving full automated advice & mascot insights to subscribers.
5. Identify existing tests touching WeatherAdvice, subscription gating, or advice APIs.

## Deliverables
Write your comprehensive analysis to `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3/handoff.md`.
Report back when finished.


## 2026-11-13T05:00:24Z
You are explorer_survey_3, a teamwork_explorer subagent.
Your working directory is: /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3
Read your dispatch instructions in /Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3/DISPATCH.md.
MANDATORY: You MUST read /Users/sotoon/personal/jaliz/.agents/teamwork/ORIGINAL_REQUEST.md before starting work.
Focus on:
1. Automated daily AI advice (R3): examine `src/components/WeatherAdvice.tsx`, current manual "مشاوره" button and fetch flows.
2. Auto-fetch on page load without manual clicks, error handling, and loading states.
3. Daily caching: per user per calendar day (localStorage or state), cache key design, invalidation on new calendar day.
4. Subscription gating (R4): how active vs non-subscribed users are handled, paywall preview preservation, and ensuring subscribers get full access while non-subscribers see paywall.
5. Identify existing tests touching advice or subscription.
Write your complete structured handoff report to:
/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3/handoff.md
When done, notify your orchestrator via send_message.

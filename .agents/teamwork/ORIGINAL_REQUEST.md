# Original User Request

## Initial Request — 2026-11-13T04:57:18Z

Redesign the Jaliz plant irrigation and care page (`/schedule`) into a dynamic, motivating, and gamified experience inspired by Duolingo, featuring an expressive mascot companion and automatic daily AI advice for production use.

Integrity mode: development

## Requirements

### R1. Gamified Duolingo-Style Irrigation & Care Experience
Redesign the `/schedule` view (rendered via `src/components/Dashboard.tsx`, `src/components/WateringSchedule.tsx`, and `src/components/WeatherAdvice.tsx`) with an inviting, gamified, and vibrant aesthetic that motivates users to open the app and tend to their plants daily.

### R2. Expressive Mascot Plant Companion
Implement a plant companion mascot with dynamic visual states (e.g., thriving, thirsty/needs attention, celebrating) rendered via vector SVG / CSS styling directly in project components. The mascot must present contextual, encouraging, and informative speech bubbles and messages regarding the user's plants and upcoming watering tasks.

### R3. Automated Daily AI Advice with Daily Caching
Automatically fetch and display daily plant care / weather advice on page load without requiring the user to press a manual consultation button ("مشاوره"). Advice results must be cached per user per calendar day (e.g. in local storage or application state) to prevent redundant API calls and unnecessary costs on subsequent visits during the same day.

### R4. Preservation of Subscription Gating
Preserve existing subscription gating logic: active subscribers enjoy full automated advice and gamified companion insights, while unsubscribed users see the locked paywall preview as established.

## Acceptance Criteria

### Gamified Page UI
- [ ] The `/schedule` page reflects a gamified, welcoming design inspired by Duolingo that showcases daily plant care tasks.
- [ ] Task completion and care status updates provide clear visual feedback.

### Mascot Companion
- [ ] Mascot is rendered via vector SVG/CSS components across multiple expressive states corresponding to plant care status.
- [ ] Speech bubbles display contextual messages reflecting the health, schedule, or pending tasks of the user's plants.

### Automated Advice & Caching
- [ ] AI advice loads automatically upon navigating to the care/irrigation page without manual button clicks.
- [ ] When advice has already been fetched for the current calendar day, opening or reloading the page uses the cached advice rather than re-requesting from the API.

### Subscription Rules
- [ ] Non-subscribed users are presented with the locked paywall preview for premium care features.
- [ ] Subscribed users have full access to automated daily advice and mascot insights.

### Build & Verification
- [ ] Application builds without TypeScript or bundling errors (`npm run build`).
- [ ] Existing automated test suites pass without regression.

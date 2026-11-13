# Comprehensive Survey Report: Schedule UI, Care Tasks & Gamified Experience

- **Author**: `explorer_survey_1` (`teamwork_explorer`)
- **Recipient**: `orchestrator` (`c1c9a3e8-15d3-43cc-ad22-0cfdbfe15413`)
- **Scope**: Codebase Survey on `/schedule` routing, component structure, plant care state, task lists (overdue, today, upcoming), task completion handlers, Duolingo-style gamification, and test inventory.

---

## 1. Observation

### 1.1 Routing and Component Structure for `/schedule`

#### A. Entry Point: `src/app/schedule/page.tsx`
- **Location**: `src/app/schedule/page.tsx:1-30`
- **Behavior**:
  - Declares `"use client"`.
  - Checks session via `const { status } = useAuth()` (`src/components/AuthProvider.tsx`).
  - If `status === "unauthenticated"`, invokes `router.replace("/login?redirect=/schedule")` (lines 14–18).
  - Renders a centered spinning loader (`<Loader2 className="h-6 w-6 animate-spin text-emerald-600" />`) while `status === "loading"` or `"unauthenticated"` (lines 20–26).
  - On `"authenticated"`, renders `<Dashboard />` (line 28).

#### B. Dashboard Container: `src/components/Dashboard.tsx`
- **Location**: `src/components/Dashboard.tsx:24-222`
- **Component Breakdown**:
  - **Header**: Imports and renders `<Header />` (`src/components/Header.tsx:93`).
  - **Greeting & Localization**:
    - Lines 73–85: Computes dynamic time-based greeting key (`morning_greeting`, `afternoon_greeting`, `evening_greeting`, `night_greeting`) after mounting to prevent SSR hydration mismatches.
    - Lines 87–90: Injects the user's first name (`user?.fullName?.trim().split(/\s+/)[0]`) into the localized greeting string.
  - **Banner Messages**:
    - Lines 33–45: Inspects URL search parameters (`?subscribed=1`, `?payment=cancelled`, `?payment=failed`) to display status alerts.
  - **Subscription Gating**:
    - Line 27: `const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)`.
    - Lines 109–211: When `!subscribed`, displays a blurred locked preview of `WateringSchedule` and `WeatherAdvice` underneath a lock modal card prompting the user to buy a monthly subscription at `SUBSCRIPTION_PRICE_TOMAN` (99,000 Tomans) via `handleBuySubscription()` -> `createSubscriptionPaymentAction()`.
    - Lines 212–218: When `subscribed`, renders:
      ```tsx
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
        <WateringSchedule />
        <WeatherAdvice />
      </div>
      ```

#### C. Navigation Context
- **Desktop Navigation**: `src/components/Header.tsx:43, 165–193`:
  - `NAV_LINKS` contains `{ href: "/schedule", key: "schedule", authRequired: true }`.
  - Prefetch is disabled on `/schedule` (line 52) to avoid unnecessary origin hits.
- **Mobile Navigation**: `src/components/BottomNav.tsx:47–52`:
  - Tab configuration: `{ name: t("nav_schedule"), href: "/schedule", icon: CalendarDays, active: Boolean(pathname?.startsWith("/schedule")) }`.

---

### 1.2 Plant Care State Management & Task Lists

#### A. Database Schema (`prisma/schema.prisma`)
- **`UserPlant` model (`prisma/schema.prisma:69–96`)**:
  - Fields: `id`, `userId`, `name`, `type`, `locationType` ("Indoor"|"Outdoor"), `lightExposure` ("Low Light"|"Partial Shade"|"Bright Indirect"|"Full Sun"), `potType` ("Terracotta"|"Plastic"|"Ceramic"|"Metal"|"Other"), `growingMedium` ("Soil"|"Water"), `hasDrainage` (Boolean), `lastWatered` (DateTime?), `nextWateringDate` (DateTime?), `wateringInterval` (Int, default 7), `recentlyReplanted` (Boolean?), `lastSoilChange` (DateTime?), `health` (String, default "Excellent"), `image` (String?), `careTips` (String?), `wateringTips` (String?).
  - Indexed on `[userId]` and `[nextWateringDate]`.
- **`WateringLog` model (`prisma/schema.prisma:112–119`)**:
  - Fields: `id`, `userId`, `logDate` (DateTime).
  - Unique constraint: `@@unique([userId, logDate])`. Records daily watering completion per user.
- **`PlantStatusLog` model (`prisma/schema.prisma:98–110`)**:
  - Fields: `id`, `plantId`, `status`, `health`, `aiAdvice`, `image`, `createdAt`.

#### B. Client State Provider: `src/components/PlantsProvider.tsx`
- Holds in-memory array `plants: Plant[]`.
- `fetchPlants` (lines 107–127) calls `getUserPlantsAction()` (`src/app/actions/plants.ts`) and maps Prisma rows via `dbRowToPlant` (lines 53–75).
- Listens to window custom event `"jaliz:plants-updated"` (lines 146–154) to refresh silently when plants change across modal updates or new plant registrations.
- Provides CRUD operations: `refreshPlants()`, `createPlant()`, `updatePlant()`, `deletePlant()`.

#### C. Current Task Calculation & Execution: `src/components/WateringSchedule.tsx`
- **Date Handling**:
  - Line 23: `const today = new Date().toISOString().split("T")[0]`.
- **Watering Due Heuristic (`src/lib/watering.ts:14–28`)**:
  ```ts
  export function plantNeedsWater(plant: WateringNeedInput, now: Date = new Date()): boolean {
    if (plant.nextWateringDate) {
      return new Date(plant.nextWateringDate) <= now
    }
    const lastWateredMs = plant.lastWatered ? new Date(plant.lastWatered).getTime() : NaN
    if (Number.isNaN(lastWateredMs)) return false
    const daysAgo = Math.floor((now.getTime() - lastWateredMs) / (1000 * 3600 * 24))
    let threshold = 7
    if (plant.locationType === "Outdoor") threshold -= 2
    if (plant.potType === "Terracotta") threshold -= 1
    if (plant.potType === "Plastic") threshold += 1
    if (plant.lightExposure === "Full Sun") threshold -= 2
    if (plant.lightExposure === "Low Light") threshold += 2
    return daysAgo >= Math.max(1, threshold)
  }
  ```
- **Task Partitioning in Current UI**:
  - Lines 44–47:
    - `const plantsToWater = plants.filter(needsWater)`
    - `const plantsSkip = plants.filter((p) => !needsWater(p))`
- **Task Completion Handler**:
  - Lines 49–63 (`handleMarkAllDone`):
    ```ts
    const handleMarkAllDone = async () => {
      if (!user) return
      try {
        const ids = plantsToWater.map((p) => p.id)
        if (ids.length > 0) {
          await updatePlantsLastWateredAction(ids, today)
        }
        await markWateringDoneAction(today)
        await refreshPlants()
        await loadData()
        setIsDone(true)
      } catch (e) {
        console.error(e)
      }
    }
    ```
- **Current Limitations Observed**:
  1. **Binary Grouping Only**: Plants needing water are merged into a single `plantsToWater` array. Overdue plants (e.g. 3 days late) are not distinguished from plants due today.
  2. **Upcoming Plants are Hidden**: Non-due plants are rendered only as static pill chips ("شاداب و بی‌نیاز:"). The user cannot see upcoming care dates (e.g., "Tomorrow", "In 3 days").
  3. **No Individual Task Completion**: The UI only provides a single bulk button ("آبیاری انجام شد"). A user cannot check off individual plants as they water them one by one.
  4. **Backend Readiness**: The server action `updatePlantsLastWateredAction(plantIds: string[], dateStr: string)` in `src/app/actions/plants.ts:54–87` already takes `plantIds: string[]`. When passed `[singlePlantId]`, it updates that single plant and recalculates `nextWateringDate` based on `wateringInterval` via a transaction. Thus, individual completion is fully supported by the backend without database migrations.

---

### 1.3 Weather Advice & Automatic Daily Fetching

#### A. Current Weather Advice: `src/components/WeatherAdvice.tsx`
- **Location**: `src/components/WeatherAdvice.tsx:13–126`
- **Current Execution**:
  - Checks `isSubscriptionActive(user?.subscriptionExpiresAt)`.
  - Reads location from `localStorage.getItem("jaliz-location")` or defaults to `"تهران، ایران"`.
  - **Manual Trigger Only**: Currently requires clicking a button `<Button onClick={fetchAdvice} disabled={loading}>{loading ? t("generating_btn") : t("generate_btn")}</Button>` (lines 116–123).
  - Fetches plant data via `getUserPlantsAction()`, then calls `getWeatherAdviceAction(...)` (`src/app/actions/ai.ts:300–433`).
- **Gating**:
  - Subscribed users only: `getWeatherAdviceAction` checks `userHasActiveSubscription(userId)` on the server (lines 300–307).

---

### 1.4 Existing Tests

The following existing automated tests directly or indirectly cover schedule, watering, plants, and AI advice:
1. `src/lib/__tests__/watering.test.ts` (71 lines, 7 unit tests):
   - Tests `plantNeedsWater` with `nextWateringDate` due vs future.
   - Tests 7-day default fallback.
   - Tests environmental threshold adjustments (Outdoor, Terracotta, Full Sun, Low Light).
   - Tests 1-day minimum floor.
   - Tests invalid/missing `lastWatered`.
2. `src/lib/__tests__/watering-notification.test.ts` (117 lines, 6 tests):
   - Tests `formatWateringNotification` for Persian and English (empty, 1 plant, 2-3 plants, 4+ plants).
   - Tests `shouldTriggerDailyWateringNotification` daily throttling.
   - Tests `checkAndDispatchWateringNotification` execution logic.
3. `src/lib/__tests__/plants-cache.test.ts` (97 lines, 3 tests):
   - Tests `dbRowToPlant` model conversion, fallbacks, and date parsing.
4. `src/lib/__tests__/relative-date.test.ts` (81 lines):
   - Tests relative date conversions (`toLocalDateString`, `dateStringDaysAgo`, etc.).
5. `src/app/actions/__tests__/plants-settings-perf.test.ts` (99 lines):
   - Tests `updatePlantsLastWateredAction` input validation and single batched transaction execution.
6. `src/lib/__tests__/subscription.test.ts` (41 lines):
   - Tests subscription prices (99,000 Tomans / 990,000 Rials), expiration checks, and duration stacking.
7. `src/app/actions/__tests__/ai.test.ts` (65 lines):
   - Tests TokenBazaar/Gemini model fetch and fallback.

**Test Gap**: There are currently **no component-level tests** for `Dashboard.tsx`, `WateringSchedule.tsx`, or `WeatherAdvice.tsx`. Tests are purely Vitest functions for `src/lib/` and Server Actions.

---

## 2. Logic Chain

### 2.1 Why the Current `/schedule` View Needs Architecture Decomposition
- **Observation 1.1.B & 1.2.C**: `Dashboard.tsx` and `WateringSchedule.tsx` are monolithic. `WateringSchedule.tsx` handles data fetching, push notifications, task filtering, bulk completion, and UI rendering inside a single 190-line file.
- **Deduction**: Redesigning this page into a Duolingo-style gamified experience requires breaking down `/schedule` into modular components:
  1. `CareHeader` / `GamifiedStatusBar` (streak flame, XP count, gardener level, daily progress ring).
  2. `MascotCompanion` (SVG plant companion with speech bubble, emotional states: thirsty, happy, celebrating, sleeping).
  3. `CareTaskList` (organized into Overdue, Today, and Upcoming sections).
  4. `CareTaskCard` (per-plant card with plant thumbnail, status, due tag, and individual "Water" check button).
  5. `DailyAdviceCard` (automatic fetching, daily calendar cache, weather insight).
  6. `CelebrationModal` / `ConfettiOverlay` (visual rewarding when daily goals are reached).

### 2.2 Task Categorization Logic: Overdue, Today, and Upcoming
- **Observation 1.2.B & `MyPlantsDashboard.tsx:205-228`**: In `MyPlantsDashboard`, the relative due time is calculated as:
  ```ts
  const diffTime = new Date(plant.nextWateringDate).getTime() - Date.now()
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24))
  ```
- **Deduction**: We can define a deterministic task categorizer utility `getPlantCareCategory(plant: Plant, now: Date = new Date())`:
  - **Overdue (`overdue`)**: `diffDays < 0` OR (`!plant.nextWateringDate` and `plantNeedsWater(plant, now)` and last watered > threshold). These plants need urgent attention.
  - **Today (`today`)**: `diffDays === 0` OR (`plantNeedsWater(plant, now)` and not overdue). Tasks scheduled for today.
  - **Upcoming (`upcoming`)**: `diffDays > 0` (e.g. tomorrow, 2 days, 3-7 days). Plants that do not need water today, grouped by future due date.
- **Benefit**: This transforms the passive "Skip" list into an actionable calendar schedule, motivating users to check back daily.

### 2.3 Individual and Bulk Task Completion Flow
- **Observation 1.2.C**: Currently, clicking "آبیاری انجام شد" calls `updatePlantsLastWateredAction(allIds, today)` and `markWateringDoneAction(today)`.
- **Deduction**:
  - When an individual plant card is checked off:
    1. Optimistically update local plant state in `PlantsProvider` or local view state.
    2. Call `await updatePlantsLastWateredAction([plant.id], today)`.
    3. Award XP (e.g. +10 XP) with a floating celebratory animation.
    4. If all tasks for "Today" and "Overdue" are now complete:
       - Call `await markWateringDoneAction(today)` to persist the daily log for streak tracking.
       - Trigger the Duolingo-style celebration burst (confetti, mascot celebration state).
  - Bulk action ("آبیاری همه" / "Water All"):
    - Keep this option available at the top/bottom of the Today list for power users with many plants.

### 2.4 Streak and XP Mechanics Grounded in Existing Models
- **Observation 1.2.A**: The `WateringLog` model stores `(userId, logDate)` with a unique constraint.
- **Deduction**:
  - We can calculate the user's active streak directly from their `WateringLog` history!
  - If a user has a log today (`today`), current streak = consecutive days counting backward from today. If no log today yet, check if there was a log yesterday (`yesterday`): if yes, the streak is alive and pending today's completion. If no log yesterday and none today, streak = 0.
  - Streak can also be stored/cached locally (`localStorage.getItem("jaliz_user_streak")`) with synchronization from backend logs.
  - XP can be tracked:
    - Base: `10 XP` per plant watered.
    - Daily Completion Bonus: `+25 XP` when all due tasks are completed for the day.
    - Streak Milestone Bonus: `+50 XP` for every 7-day streak milestone.
  - Levels:
    - Level 1 (جوانه / Sprout): 0–50 XP
    - Level 2 (برگچه / Seedling): 51–150 XP
    - Level 3 (بوته سبز / Green Bush): 151–350 XP
    - Level 4 (گیاه‌شناس / Plant Specialist): 351–700 XP
    - Level 5 (استاد جالیز / Jaliz Master): 700+ XP

### 2.5 Automated AI Advice with Calendar-Day Caching
- **Observation 1.3.A**: Currently, `WeatherAdvice.tsx` requires manual button click and has no caching.
- **Deduction**:
  - To fulfill Requirement R3:
    1. On component mount (inside `useEffect` when `subscribed === true`), check `localStorage.getItem("jaliz_daily_advice_cache")`.
    2. The cache structure: `{ date: "YYYY-MM-DD", userId: string, advice: string, location: string }`.
    3. If `cache.date === todayLocalString` and `cache.userId === user.id`, immediately populate the advice state from cache without making network requests.
    4. If cache is missing or stale:
       - Automatically call `getWeatherAdviceAction(...)`.
       - On success, save `{ date: todayLocalString, userId: user.id, advice: response.advice, location: userLocation }` to `localStorage`.
    5. Mascot companion can ingest the first sentence / key warning of the advice and display it as an interactive speech bubble!

---

## 3. Caveats

1. **Local vs UTC Date Boundaries**:
   - `new Date().toISOString().split("T")[0]` evaluates in UTC. In Iran (UTC+03:30), after 8:30 PM local time (20:30), UTC rolls over to the next day, which can cause date desync if mixed.
   - Recommendation: Use `src/lib/relative-date.ts:toLocalDateString(new Date())` or `now.toLocaleDateString("en-CA")` (as used in `watering-notification.ts:192`) consistently across the frontend and server actions.
2. **Offline / Network Resilience**:
   - XP and streaks are gamification drivers. If the user marks a plant offline, optimistic updates should reflect immediately so the user experience feels instant (like Duolingo).
3. **Mascot Styling without Heavy External Dependencies**:
   - Per Ponytail philosophy and project guidelines, the mascot should be lightweight SVG and Tailwind CSS animations rather than adding heavy 3D or Lottie animation runtimes.
4. **Subscription Paywall Integrity**:
   - Gamified features (XP, mascot speech bubbles, daily advice) must not leak to non-subscribers in a way that bypasses paywall rules (R4). Non-subscribers should see a motivating teaser of the gamified interface (e.g. blurred mascot saying "با فعال‌سازی اشتراک، همراه هر روز گیاهانت هستم! 🌱").

---

## 4. Conclusion

1. **Architecture Ready**: The codebase cleanly separates auth (`AuthProvider`), plant collection (`PlantsProvider`), subscription gating (`isSubscriptionActive`), and server actions (`updatePlantsLastWateredAction`, `markWateringDoneAction`, `getWeatherAdviceAction`).
2. **Backend Requires No Schema Migration**:
   - `updatePlantsLastWateredAction` already accepts `plantIds: string[]`, enabling both individual and batch task completions.
   - `WateringLog` already tracks daily completion dates, enabling streak computation.
3. **Core Redesign Strategy for `/schedule`**:
   - Replace the static layout in `src/components/WateringSchedule.tsx` with a Duolingo-style Care Experience:
     - **Top Gamification Bar**: Streak counter (🔥), XP and Level badge, Circular Progress Ring (% of today's tasks completed).
     - **Plant Mascot Companion**: Placed beside or above the task list, displaying contextual speech bubbles ("امروز ۳ تا از دوست‌هام تشنه‌ان! 💧").
     - **Categorized Task Cards**:
       - 🚨 **Overdue**: Urgent alert cards with red/amber badges.
       - 💧 **Today**: Interactive cards with animated check buttons.
       - 🌱 **Upcoming**: Collapsible or grouped forecast cards for tomorrow and next week.
     - **Automatic Cached Advice**: Seamless card beneath tasks that auto-loads with local calendar-day caching.
     - **Celebration Feedback**: Confetti and modal on daily task completion.
4. **Testing Plan**:
   - Create unit tests for task categorization (`src/lib/__tests__/care-tasks.test.ts`).
   - Create unit tests for streak and XP calculation (`src/lib/__tests__/gamification.test.ts`).
   - Create unit tests for daily advice caching (`src/lib/__tests__/daily-advice-cache.test.ts`).

---

## 5. Verification Method

To independently verify the observations and conclusions in this report:

1. **Verify Route & Component Files**:
   - `view_file` on `src/app/schedule/page.tsx` (lines 1–30) — confirms redirect and rendering of `Dashboard`.
   - `view_file` on `src/components/Dashboard.tsx` (lines 24–222) — confirms subscription gating and `WateringSchedule` + `WeatherAdvice` inclusion.
   - `view_file` on `src/components/WateringSchedule.tsx` (lines 44–68) — confirms existing binary filter (`plantsToWater` vs `plantsSkip`) and bulk-only completion.
   - `view_file` on `src/components/WeatherAdvice.tsx` (lines 116–123) — confirms manual consultation button and absence of auto-fetching or daily cache.
2. **Verify Server Actions & Backend Capabilities**:
   - `view_file` on `src/app/actions/plants.ts` (lines 54–87) — confirms `updatePlantsLastWateredAction` accepts `plantIds: string[]` and runs a single atomic transaction.
   - `view_file` on `prisma/schema.prisma` (lines 112–119) — confirms `WateringLog` model with `userId_logDate` unique index.
3. **Verify Existing Tests**:
   - Run `npx vitest run src/lib/__tests__/watering.test.ts`
   - Run `npx vitest run src/lib/__tests__/watering-notification.test.ts`
   - Run `npx vitest run src/lib/__tests__/subscription.test.ts`
   - Confirm all pass without regressions.
4. **Invalidation Conditions**:
   - If `updatePlantsLastWateredAction` were restricted to all-or-nothing updating, backend action changes would be required (invalidated: it takes `plantIds: string[]`).
   - If `WateringLog` did not exist, a new schema migration would be required for streaks (invalidated: `WateringLog` already exists).

# Handoff Report: Expressive Plant Mascot Companion & Contextual Speech Engine (R2)

**Agent ID**: `explorer_survey_2`  
**Role**: Codebase Researcher (Mascot & Visual States)  
**Target File**: `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_2/handoff.md`  
**Date**: 2026-11-13  

---

## 1. Observation

### 1.1 Existing `/schedule` Architecture & Components
- **`src/app/schedule/page.tsx`** (lines 10–29):
  - Enforces client-side authentication check (`useAuth()`), redirecting unauthenticated users to `/login?redirect=/schedule`.
  - Directly renders `<Dashboard />` without passing props.
- **`src/components/Dashboard.tsx`**:
  - Line 27: Checks subscription status via `isSubscriptionActive(user?.subscriptionExpiresAt)`.
  - Lines 95–101: Renders a static welcome title and description:
    ```tsx
    <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
        {welcomeTitle}
      </h1>
      <p className="text-slate-600 text-lg max-w-2xl">{t("welcome_desc")}</p>
    </section>
    ```
  - Lines 109–211: If `!subscribed`, renders a blurred preview of `<WateringSchedule />` and `<WeatherAdvice />` overlaid with a locked subscription paywall card (`SUBSCRIPTION_PRICE_TOMAN = 99,000`).
  - Lines 212–218: If `subscribed`, renders:
    ```tsx
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
      <WateringSchedule />
      <WeatherAdvice />
    </div>
    ```
- **`src/components/WateringSchedule.tsx`**:
  - Lines 17–18: Consumes `plants` and `refreshPlants` from `usePlants()`.
  - Lines 44–48: Computes watering needs using `plantNeedsWater(plant)` from `src/lib/watering.ts`.
    ```tsx
    const plantsToWater = plants.filter(needsWater)
    const plantsSkip = plants.filter((p) => !needsWater(p))
    ```
  - Lines 26–34: Checks if watering was completed today via `getWateringLogAction(today)`.
  - Lines 49–63: `handleMarkAllDone` updates all `plantsToWater` via `updatePlantsLastWateredAction(ids, today)`, marks watering done in the DB via `markWateringDoneAction(today)`, re-fetches plants, and sets `isDone(true)`.
  - Line 40: Returns `null` if user is not subscribed.

### 1.2 Layout, Safe Area & Styling Conventions
- **`src/components/BottomNav.tsx`** (lines 77–128):
  - Fixed mobile bottom navigation bar: `fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border md:hidden pb-safe`.
  - Occupies 64px (`h-16`) at the bottom of the viewport on mobile devices.
  - `Dashboard.tsx` accommodates this with `pb-20 md:pb-12`.
- **`src/app/globals.css`** (lines 15–54, 99–102):
  - Tailwind CSS v4 design system with custom forest-green palette:
    - Primary emerald tones: `emerald-500` (`#2e7462`), `emerald-600` (`#1f5f4e`), `emerald-700` (`#184b3d`), `emerald-800` (`#12382e`).
    - Complementary teal tones: `teal-50` (`#ecf3f2`), `teal-200` (`#a3c9c3`), `teal-600` (`#1d5b52`).
    - Light / dark surfaces: `surface-card` (`rounded-xl border border-border bg-card shadow-sm`).
    - Font configuration: `html[lang="fa"]` sets font to Vazirmatn (`--font-vazirmatn`).
    - RTL handling: logical properties (`ms-*`, `me-*`, `rtl:ml-*`, `dir="rtl"`).

### 1.3 Database & Streak Primitives
- **`prisma/schema.prisma`** (lines 112–119):
  - `WateringLog` model:
    ```prisma
    model WateringLog {
      id       String   @id @default(uuid())
      userId   String
      user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      logDate  DateTime

      @@unique([userId, logDate])
    }
    ```
  - Each completion creates a unique record for `(userId, logDate)`.
  - There is currently no streak calculator in `src/` (searching for `"streak"` returned 0 matches), but all required data already exists in `WateringLog`.

---

## 2. Logic Chain

### 2.1 Mascot Identity & Character Design Concept
1. **Inspiration**: Duolingo’s Duo is instantly recognizable because of its bold vector silhouette, large emotive facial expressions, and playful attitude (from cheering with sunglasses to crying tears of urgency).
2. **Jaliz Persona ("برگچه" / Bargcheh)**:
   - A charming, living sprout nestled inside a cozy terracotta pot with stubby little feet.
   - The head is a plump, rounded emerald sprout with two dynamic crown leaves that respond to emotional states (perking upright when happy, drooping limply when thirsty, dancing during celebrations).
   - Large expressive anime-style eyes, pink blush cheeks, and dynamic mouth curves create an immediate empathetic bond with the user.
3. **Four Distinct Visual States**:
   - **Thriving / Happy (شاداب، پرانرژی)**:
     - *Leaves*: Perked upright at 45°, vibrant emerald gradient.
     - *Face*: Sparkling wide-open eyes with white light catchers, soft rosy blush, cheerful smile.
     - *Aura*: Tiny green sparkle or floating leaf aura; gentle idle breathing float.
     - *Condition*: Garden has plants, all are hydrated (`plantsToWaterCount === 0`, `isDone === false`), or general healthy state.
   - **Thirsty / Needs Attention (تشنه، بی‌حال، نیازمند آب)**:
     - *Leaves*: Drooping downward along the sides of the pot, limp posture, slightly desaturated sage hue.
     - *Face*: Slanted pleading eyes with worried eyebrows, pale dry cheek marks, wavy down-curved frown.
     - *Aura*: Translucent blue sweat/tear drop on cheek pulsing rhythmically.
     - *Condition*: `plantsToWaterCount > 0` and `isDone === false`.
   - **Celebrating / Completed (جشن و شادی، عینک دودی، تبریک)**:
     - *Leaves*: High upright dancing leaves swaying with excitement.
     - *Face*: **Cool Black Sunglasses (`😎`)** with crisp white reflection streaks (iconic Duolingo celebratory trope!), wide triumphant grin showing pink tongue.
     - *Aura*: Golden star bursts (`✦`) and colorful confetti dots (emerald, amber, rose, sky).
     - *Animation*: Upbeat victory bounce (`scale-105 animate-bounce`).
     - *Condition*: User completed watering today (`isDone === true`).
   - **Resting / Neutral (آرام، خواب‌آلود / خنثی)**:
     - *Leaves*: Gently curved natural leaves.
     - *Face*: Peaceful closed eye curves (`^ ^` or `- -`), sweet subtle smile.
     - *Aura*: Night moon/Zzz or calm breeze.
     - *Condition*: Late night hours (`hour >= 20 || hour < 5`) or empty garden state (`totalPlants === 0`).

### 2.2 Technical SVG & CSS Architecture
- **Zero External Dependencies**: Pure SVG React component (`PlantMascot.tsx`) rendered using standard React JSX elements (`<svg>`, `<path>`, `<circle>`, `<ellipse>`, `<rect>`).
- **Scalability**: Scalable `viewBox="0 0 120 120"` allows rendering at any size:
  - Header Hero: `w-28 h-28` (mobile) to `w-36 h-36` (desktop).
  - Mini Badge / Feedback: `w-12 h-12` or `w-16 h-16`.
- **CSS Transitions**: Colors and transforms use Tailwind CSS transitions (`transition-all duration-500 ease-in-out`), so switching states (e.g. from thirsty to celebrating) is smooth and organic.

### 2.3 Dynamic Persian Speech Bubble System
1. **Container & Layout**:
   - Duolingo-style bubbly card with a directional pointer tail pointing toward the mascot.
   - Built with high-contrast borders (`border-2 border-emerald-200 dark:border-emerald-700`), rounded-2xl or rounded-3xl corners, and subtle elevation shadow.
   - Direction-aware (RTL for Persian, LTR for English): in RTL, the tail points toward the mascot on the right.
2. **Contextual Dialogue Engine (`src/lib/mascot-dialogue.ts`)**:
   - Evaluates:
     - `totalPlants`: Total count of user's plants.
     - `plantsToWaterCount`: Number of plants needing water today.
     - `isDoneToday`: Whether today's watering log exists.
     - `streakDays`: Consecutive days of completed watering care.
     - `currentHour`: Time of day (morning, afternoon, evening, night).
   - Generates contextual Persian messages with warm, playful micro-copy:
     - *Empty Garden*: «سلام {name}! من برگچه‌ام، دوست سبز تو! اولین گیاهت رو اضافه کن تا با هم مراقبش باشیم! 🌱»
     - *Thirsty Plants*: «هی رفیق! امروز {count} تا از گیاهامون تشنه‌ان و منتظر آب هستن! بدو تا پژمرده نشدن به دادشون برسیم! 💧»
     - *Single Thirsty Plant*: «سلام {name}! {plantName} امروز واقعاً به آب نیاز داره تا طراوتش حفظ بشه. بریم سراغش؟ 🪴»
     - *Celebrating Completed*: «ایول! تمام گیاهان سیراب شدن و از شادی دارن می‌درخشن! ماموریت امروز با موفقیت تموم شد! 😎✨»
     - *Streak Milestone*: «ماشالله به این نظم! {streak} روز پشت سر هم به گیاهات سر زدی! استمرارت بی‌نظیره باغبان نمونه! 🔥🌱»
     - *Peaceful / Hydrated*: «خاک همه گلدون‌ها رطوبت عالی داره و همه گیاهات سرحالن! یه چای بنوش و از آرامش سبزشون لذت ببر ☕🍃»
   - **Interactive Tap/Click**: Tapping on the mascot triggers a wiggle animation and cycles through fun gardening tips or cute quotes (e.g. «قلقلکم نده رفیق! برو به گل‌هات برس 😄»).

### 2.4 Placement & Responsive Layout on `/schedule`
- **Location**: Hero Companion Card at the top of `/schedule` (inside `Dashboard.tsx`), directly above `<WateringSchedule />`.
  - Replaces the plain text static welcome title with a dynamic, gamified banner.
  - On Desktop (`md:`): Two-column layout. The mascot (`w-36 h-36`) stands on the start (right in RTL), with the speech bubble and streak badge on the left (`flex-1`).
  - On Mobile (<640px): Compact horizontal layout (`w-24 h-24` mascot beside speech bubble) or stacked layout with clear spacing so it doesn't crowd the viewport.
  - Bottom padding (`pb-20`) safely clears the mobile `BottomNav` (`h-16`).
- **Subscription Gating (R4)**:
  - Active Subscribers: Enjoy the full interactive mascot companion, dynamic speech bubbles, celebration animations, and streak counters.
  - Non-Subscribed Users: See the locked paywall preview card as established in `Dashboard.tsx` (lines 109–211). In the background, a blurred silhouette of the mascot can be visible to showcase the gamified companion awaiting them upon subscription.

### 2.5 Streak Calculation Strategy
- Compute streak directly from `WateringLog` via a fast server action `getWateringStreakAction()` in `src/app/actions/plants.ts`.
- Reads `WateringLog` entries for the user, checks consecutive days backwards from today (or yesterday if today is still pending), and returns the integer count.
- Zero database migrations required; leverages the existing SQLite/LibSQL schema.

---

## 3. Caveats

1. **Hydration Safety**:
   - Mascot dialogue depends on `new Date().getHours()` and current client date. All time-sensitive logic must execute within `useEffect` or client-side hooks to prevent Next.js hydration mismatch errors between SSR and client renders.
2. **Audio Effects**:
   - While Duolingo uses audio chimes for celebration, Jaliz currently has no audio assets. Visual celebration (sunglasses, star burst, CSS confetti bounce) provides 100% of the delight without audio playback restrictions on mobile browsers (autoplay policies).
3. **Multi-plant naming in speech bubbles**:
   - When multiple plants are thirsty, the speech bubble mentions the count (e.g. «۳ گیاه») or highlights the first plant name («سانسوریا و ۲ گیاه دیگر») to avoid overly long speech bubbles that could overflow on narrow screens (320px).

---

## 4. Conclusion

The Expressive Mascot Companion (R2) transforms Jaliz’s `/schedule` into an engaging, gamified experience. By implementing:
1. `src/components/mascot/PlantMascot.tsx`: Pure SVG vector component with 4 dynamic expressive states (Thriving, Thirsty, Celebrating with sunglasses, Resting).
2. `src/components/mascot/MascotSpeechBubble.tsx`: RTL-optimized responsive speech bubble.
3. `src/components/mascot/MascotCompanion.tsx`: Composite hero component linking plants state, watering progress, and streaks.
4. `src/lib/mascot-dialogue.ts`: Deterministic, unit-tested Persian dialogue engine.
5. `src/app/actions/plants.ts`: Addition of `getWateringStreakAction()` leveraging existing `WateringLog`.

All requirements in R2 are satisfied, subscription gating (R4) is strictly preserved, and 0 external dependencies are added.

---

## 5. Verification Method

### 5.1 Unit Tests for Dialogue Engine & State Resolution
Create `src/lib/__tests__/mascot.test.ts` to test:
- State resolves to `thirsty` when `plantsToWaterCount > 0` and `isDoneToday === false`.
- State resolves to `celebrating` when `isDoneToday === true`.
- State resolves to `thriving` when `totalPlants > 0` and `plantsToWaterCount === 0`.
- State resolves to `neutral` when `totalPlants === 0`.
- Streak milestone text generates correctly for 1, 3, 7, and 30 days.
- Run tests via:
  ```bash
  npm run test -- src/lib/__tests__/mascot.test.ts
  ```

### 5.2 TypeScript Build & Lint Check
Ensure the vector SVG components and props pass type checking without any errors:
```bash
npx tsc --noEmit
npm run lint
```

### 5.3 Visual & Interactive Acceptance
1. Open `/schedule` with an active subscription and plants needing water:
   - Mascot displays in `thirsty` state (drooping leaves, tear/sweat droplet, pleading eyes).
   - Speech bubble encourages watering the pending plants.
2. Click "آبیاری انجام شد" (Mark as Done):
   - Mascot immediately transitions to `celebrating` state (sunglasses on, upright leaves, confetti/stars).
   - Speech bubble celebrates task completion and congratulates the user.
3. View on mobile viewport (360px width) and desktop (1024px width):
   - Mascot and speech bubble scale smoothly without text clipping or horizontal overflow.
   - Mobile `BottomNav` does not obscure the mascot or schedule cards.
4. Open `/schedule` with a non-subscribed account:
   - Paywall preview card is presented as expected; subscriber features remain locked.

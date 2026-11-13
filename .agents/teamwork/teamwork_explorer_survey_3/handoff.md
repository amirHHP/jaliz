# Handoff Report — Explorer Survey 3: Automated Daily AI Advice, Caching & Subscription Gating

- **Agent ID**: explorer_survey_3
- **Role**: Codebase Researcher (Advice & Subscription Logic)
- **Working Directory**: `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_explorer_survey_3`
- **Target Requirements**: R3 (Automated Daily AI Advice & Caching) & R4 (Preservation of Subscription Gating)
- **Status**: Completed

---

## 1. Observation

### 1.1 Current `WeatherAdvice.tsx` Implementation & Manual Button Flow
Direct inspection of `src/components/WeatherAdvice.tsx` (lines 13–76, 116–124):
```tsx
export function WeatherAdvice() {
  const { user } = useAuth()
  const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)

  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<string>("")
  const { language, t } = useLanguage()

  useEffect(() => {
    // Read user location from localStorage or fallback
    const loc = localStorage.getItem("jaliz-location")
    if (loc) {
      setUserLocation(loc)
    } else {
      setUserLocation(language === "en" ? "Tehran, IR" : "تهران، ایران")
    }
  }, [language])

  if (!subscribed) {
    return null
  }

  const fetchAdvice = async () => {
    setLoading(true)
    setError(null)
    try {
      let userPlants: unknown[] = []
      const data = await getUserPlantsAction()
      ...
      const mockLocation = { latitude: 35.6892, longitude: 51.3890 }
      const responseData = await getWeatherAdviceAction({
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
        userLocation: userLocation,
        language: language,
        plants: userPlants
      })
      if (responseData && responseData.error) {
        throw new Error(responseData.error)
      }
      setAdvice(typeof responseData.advice === "string" ? responseData.advice : JSON.stringify(responseData.advice))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.")
    } finally {
      setLoading(false)
    }
  }
  ...
  <CardFooter className="bg-slate-50/50 pt-4 border-t border-slate-100">
    <Button
      onClick={fetchAdvice}
      disabled={loading}
      className="w-full"
    >
      {loading ? t("generating_btn") : t("generate_btn")}
    </Button>
  </CardFooter>
```
**Observations**:
1. When mounted, `advice` is initialized to `null` and `loading` is `false`.
2. There is no `useEffect` or lifecycle hook that calls `fetchAdvice()` on mount. The card content displays empty space (`<div className="h-4"></div>`) until the user manually clicks the button.
3. No caching mechanism exists: advice is kept strictly in component local state (`useState<string | null>(null)`). Navigating away from `/schedule` or reloading the page loses the advice completely, requiring another manual button click and another billable LLM request.
4. `getUserPlantsAction()` is called on every manual click even though `usePlants()` context already caches plants in `PlantsProvider`.

---

### 1.2 Backend API & Server Action Flow
Direct inspection of `src/app/actions/ai.ts` (lines 298–339, 410–418):
```ts
export async function getWeatherAdviceAction(data: { latitude: number, longitude: number, userLocation?: string, language?: string, plants: any[] }): Promise<any> {
  try {
    const userId = await getSessionUserId();
    if (!userId || !(await userHasActiveSubscription(userId))) {
      return {
        error: data.language === "fa"
          ? "دسترسی به هواشناسی هوشمند نیازمند اشتراک فعال است."
          : "Smart weather advice requires an active subscription."
      };
    }

    const { apiKey: globalApiKey, model: globalModel, provider } = await getAiConfig();
    ...
    if (process.env.API_URL) {
      const response = await fetch(`${getApiBase()}/api/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, api_key, model_name, provider }),
      });
      ...
      return await response.json();
    }

    // Direct JS call fallback
    const weatherData = await fetchWeather(data.latitude, data.longitude);
    ...
    const advice = await callLlmDirect({ provider, apiKey: api_key, modelName: model_name, prompt, temperature: 0.7 });
    return { advice };
  }
```
**Observations**:
1. The server action enforces strict server-side subscription validation:
   `if (!userId || !(await userHasActiveSubscription(userId)))`
   Returns localized error if not subscribed.
2. Supports both Python FastAPI backend (`/api/advice`) via `process.env.API_URL` and direct JS fallback via `fetchWeather` and `callLlmDirect` (Gemini, Sotoon, GapGPT, or TokenBazaar).
3. If LLM call times out, returns friendly localized error advising the user to try a faster model.

---

### 1.3 Subscription Gating & Paywall Architecture
Direct inspection of `src/components/Dashboard.tsx` (lines 26–28, 109–218):
```tsx
export function Dashboard() {
  const { t, language } = useLanguage()
  const { user, refreshUser } = useAuth()
  const subscribed = isSubscriptionActive(user?.subscriptionExpiresAt)
  ...
  {!subscribed ? (
    /* Entire irrigation & weather section is locked */
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 text-emerald-950 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ...">
      {/* Blurred preview of both watering and weather sections */}
      <div className="select-none p-6 md:p-8 blur-[3px] opacity-40 space-y-6" aria-hidden="true">
        {/* Blurred Watering Schedule preview */}
        ...
        {/* Blurred Weather Advice preview */}
        ...
      </div>

      {/* Lock card overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-950/20 px-5 backdrop-blur-[2px]">
        <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/95 p-6 md:p-8 text-center shadow-2xl backdrop-blur-md ...">
          <Lock className="h-7 w-7" />
          <h3 className="text-xl font-bold text-emerald-950">
            {language === "fa" ? "بخش آبیاری و هواشناسی هوشمند قفل است" : "Smart Watering & Weather Advice are Locked"}
          </h3>
          ...
          <div className="mt-5 rounded-2xl bg-emerald-50/80 border border-emerald-100 p-3 text-center">
            <p className="text-2xl font-black tracking-tight text-emerald-900">
              {formatToman(SUBSCRIPTION_PRICE_TOMAN, language)}
              <span className="ms-1.5 text-sm font-semibold text-emerald-700/70">
                {language === "fa" ? "/ ماه" : "/ month"}
              </span>
            </p>
          </div>
          ...
          <Button onClick={handleBuySubscription} disabled={checkoutLoading} className="...">
            ... {language === "fa" ? "خرید اشتراک و فعال‌سازی" : "Buy subscription"}
          </Button>
        </div>
      </div>
    </div>
  ) : (
    /* Unlocked view: Watering Schedule & Weather Advice */
    <div className="space-y-8 ...">
      <WateringSchedule />
      <WeatherAdvice />
    </div>
  )}
```
**Observations**:
1. When `subscribed` is false:
   - Neither `WateringSchedule` nor `WeatherAdvice` is mounted.
   - The user sees a blurred preview overlaying both watering and weather advice placeholders.
   - A lock card appears with subscription pricing (`99,000 تومان / ماه`) and a button triggering `createSubscriptionPaymentAction()`.
2. When `subscribed` is true:
   - The unlocked container mounts `WateringSchedule` and `WeatherAdvice`.
3. In `WeatherAdvice.tsx`, line 33:
   `if (!subscribed) return null;`
   Provides an additional client-side guard.
4. In `src/lib/subscription.ts`, `isSubscriptionActive(expiresAt)` returns `true` iff `new Date(expiresAt).getTime() > now.getTime()`.

---

### 1.4 Date Handling & Existing Local Date Utilities
Direct inspection of `src/lib/relative-date.ts` (lines 11–17):
```ts
/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export function toLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
```
**Observations**:
1. `src/lib/relative-date.ts` already contains a tested, robust `toLocalDateString()` function specifically built to prevent UTC shift (avoiding timezone bugs for users in Iran, UTC+3:30).
2. It returns ISO format `YYYY-MM-DD` in the user's local timezone.

---

### 1.5 Storage & Testing Patterns in Existing Codebase
Inspection of `src/lib/install-prompt.ts` and `src/lib/__tests__/install-prompt.test.ts`:
```ts
export function isInstallPromptDismissed(
  now: number = Date.now(),
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined" ? localStorage : null
): boolean { ... }
```
And its test pattern in `src/lib/__tests__/install-prompt.test.ts`:
```ts
function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => { data[key] = value },
    _data: data,
  }
}
```
Inspection of `vitest.config.ts`:
```ts
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
  },
})
```
**Observations**:
1. `vitest` runs in `node` environment (not jsdom) and only executes files matching `src/**/__tests__/**/*.test.ts` (notice `.test.ts`, NOT `.tsx`).
2. Codebase uses dependency-injected storage (`storage: Pick<Storage, ...> | null = typeof window !== "undefined" ? localStorage : null`) to enable 100% unit test coverage in Vitest Node environment without requiring DOM/jsdom dependencies.
3. Test suite execution: `npm test` ran 34 test files, all 272 tests passed.
4. **Current Test Gap**: Zero tests exist for `WeatherAdvice.tsx` or daily advice caching.

---

## 2. Logic Chain

1. **Auto-Fetch Requirement (R3)**:
   - *Premise*: User should not have to manually click "مشاوره" to receive care advice.
   - *Inference*: On component mount in `WeatherAdvice.tsx` (or parent `/schedule` view), when `subscribed === true` and `user?.id` exists, an effect must automatically trigger the fetch flow.
   - *Condition*: If valid advice is already cached for the current calendar day, use the cached advice immediately without issuing an API request or showing a loading spinner. If no cache exists, set `loading = true`, execute `getWeatherAdviceAction`, cache the successful result, and set state.

2. **Daily Caching Strategy (R3)**:
   - *Premise*: Advice results must be cached per user per calendar day to eliminate redundant LLM calls on repeat visits.
   - *Key Design*:
     Cache key must be user-isolated: `jaliz_daily_advice_${userId}`.
     Cache payload structure:
     ```ts
     export interface DailyAdviceCacheEntry {
       userId: string
       date: string // e.g. "2026-11-13" via toLocalDateString()
       advice: string
       fetchedAt: number // epoch ms
     }
     ```
   - *Invalidation Logic*:
     When checking cache on mount:
     `entry = getCachedDailyAdvice(user.id)`
     If `entry.date !== toLocalDateString(new Date())` or `entry.userId !== user.id`, the cache is invalid (new day turnover or user switch). Invalidate cache, fetch fresh advice from API, and overwrite with new date.
   - *Resilience*:
     Wrap all reads/writes in `try/catch` to handle SSR (`window === undefined`), corrupt JSON, and private browsing quota restrictions.

3. **Subscription Gating (R4)**:
   - *Premise*: Non-subscribed users must see the paywall preview; subscribed users must receive automated advice & mascot insights.
   - *Inference*:
     - In `Dashboard.tsx`, the paywall gating `!subscribed` must be preserved. The blurred preview and lock card directing to ZarinPal checkout (`createSubscriptionPaymentAction()`) must remain active for non-subscribers.
     - Auto-fetch MUST NOT execute if `!subscribed`. This prevents unnecessary server action errors and preserves backend security.
     - Even if client code were manipulated, server action `getWeatherAdviceAction` enforces `userHasActiveSubscription(userId)` and rejects non-subscribers with a 403 error.

4. **Architecture & Testability**:
   - Because `vitest.config.ts` runs in `node` environment and matches `src/**/__tests__/**/*.test.ts`, extracting the caching logic into a pure module `src/lib/daily-advice-cache.ts` allows writing comprehensive, fast, and robust unit tests in `src/lib/__tests__/daily-advice-cache.test.ts` without browser dependencies.

---

## 3. Caveats

1. **No `@testing-library/react`**: The project does not currently have `@testing-library/react` or a jsdom environment configured in Vitest. Testing UI component lifecycles directly as `.tsx` is not supported by the current `vitest.config.ts` pattern (`environment: "node"`). Therefore, all caching, validation, and gating logic should be housed in TypeScript utility modules (`.ts`) where Vitest has 100% test capabilities.
2. **Location Fallback**: Currently `WeatherAdvice.tsx` hardcodes coordinates `{ latitude: 35.6892, longitude: 51.3890 }` (Tehran). If the user hasn't set `jaliz-location` in Settings, it falls back to Tehran. This is existing expected behavior and does not block R3/R4.
3. **Mascot Companion Synergy**: The mascot companion (R2) will be rendered on the same `/schedule` view. The mascot should be able to consume the daily advice (or care tips) to populate speech bubbles when advice is ready.

---

## 4. Conclusion & Actionable Design

### Recommended Architecture for Implementers

#### A. New Helper Module: `src/lib/daily-advice-cache.ts`
Create a clean, tested cache helper:
```ts
import { toLocalDateString } from "@/lib/relative-date"

export interface DailyAdviceCacheEntry {
  userId: string
  date: string // YYYY-MM-DD
  advice: string
  fetchedAt: number
}

export function getDailyAdviceCacheKey(userId: string): string {
  return `jaliz_daily_advice_${userId}`
}

export function getCachedDailyAdvice(
  userId: string,
  todayDate: string = toLocalDateString(),
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined" ? localStorage : null
): string | null {
  if (!storage || !userId) return null
  try {
    const raw = storage.getItem(getDailyAdviceCacheKey(userId))
    if (!raw) return null
    const entry: DailyAdviceCacheEntry = JSON.parse(raw)
    if (entry.userId === userId && entry.date === todayDate && typeof entry.advice === "string" && entry.advice.trim().length > 0) {
      return entry.advice
    }
  } catch {
    // Malformed JSON or storage error
  }
  return null
}

export function setCachedDailyAdvice(
  userId: string,
  advice: string,
  todayDate: string = toLocalDateString(),
  storage: Pick<Storage, "setItem"> | null = typeof window !== "undefined" ? localStorage : null
): void {
  if (!storage || !userId || !advice) return
  try {
    const entry: DailyAdviceCacheEntry = {
      userId,
      date: todayDate,
      advice,
      fetchedAt: Date.now(),
    }
    storage.setItem(getDailyAdviceCacheKey(userId), JSON.stringify(entry))
  } catch {
    // Storage quota or error
  }
}

export function clearDailyAdviceCache(
  userId: string,
  storage: Pick<Storage, "removeItem"> | null = typeof window !== "undefined" ? localStorage : null
): void {
  if (!storage || !userId) return
  try {
    storage.removeItem(getDailyAdviceCacheKey(userId))
  } catch {}
}
```

#### B. Updated `WeatherAdvice.tsx` Flow
1. **Initial State with Cache Read**:
   ```tsx
   const [advice, setAdvice] = useState<string | null>(() => {
     if (typeof window === "undefined" || !user?.id || !subscribed) return null
     return getCachedDailyAdvice(user.id)
   })
   ```
2. **Auto-Fetch Effect on Mount**:
   ```tsx
   useEffect(() => {
     if (!subscribed || !user?.id) return

     const cached = getCachedDailyAdvice(user.id)
     if (cached) {
       setAdvice(cached)
       return
     }

     // Auto-fetch if not cached for today
     void fetchAdvice()
   }, [subscribed, user?.id])
   ```
3. **On Fetch Success**:
   ```tsx
   const text = typeof responseData.advice === "string" ? responseData.advice : JSON.stringify(responseData.advice)
   setAdvice(text)
   if (user?.id) {
     setCachedDailyAdvice(user.id, text)
   }
   ```
4. **UI Refinement**:
   - Remove the requirement to click the button.
   - Show Duolingo-style gamified advice card with mascot integration.
   - Provide an optional subtle refresh / retry button if `error` occurs or user explicitly requests a re-check.

#### C. Preserving Paywall in `Dashboard.tsx`
- Ensure `!subscribed` branch continues to display the blurred preview and payment lock card.
- Subscribed users receive the unlocked experience with automated daily advice and companion mascot.

---

## 5. Verification Method

### 5.1 Automated Unit Tests
Run the test suite with:
```bash
npm test
```
Create a new test file: `src/lib/__tests__/daily-advice-cache.test.ts` verifying:
1. Cache hit when `userId` and `date` match today.
2. Cache miss and invalidation when calendar date advances to next day.
3. Cache isolation between different user IDs.
4. Safe fallback on corrupted JSON in localStorage.
5. SSR safety when `storage` is null.
6. Explicit cache clearing.

### 5.2 Manual Verification Steps
1. **Auto-Fetch on Load**:
   - Log in as a subscribed user.
   - Clear `localStorage`.
   - Navigate to `/schedule`.
   - Verify advice begins fetching automatically without clicking any button.
   - Verify advice appears upon completion.
2. **Daily Caching**:
   - Refresh the page or navigate away and back to `/schedule`.
   - Verify advice appears immediately with zero loading spinner and zero network requests to `/api/advice` or `getWeatherAdviceAction`.
   - Check `localStorage.getItem("jaliz_daily_advice_<userId>")` contains today's date in `YYYY-MM-DD`.
3. **Day Invalidation**:
   - In DevTools console, modify the cached date to yesterday:
     `const c = JSON.parse(localStorage.getItem("jaliz_daily_advice_<userId>")); c.date = "2026-11-01"; localStorage.setItem("jaliz_daily_advice_<userId>", JSON.stringify(c));`
   - Reload `/schedule`.
   - Verify a fresh fetch is automatically triggered for the new day.
4. **Subscription Paywall**:
   - Log in as an unsubscribed user.
   - Navigate to `/schedule`.
   - Verify paywall blurred preview and lock card are shown with price 99,000 Toman.
   - Verify no advice API calls are made in the Network tab.

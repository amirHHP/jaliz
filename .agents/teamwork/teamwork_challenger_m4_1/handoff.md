# Empirical Challenge Report: Mascot State Machine & Daily Advice Cache Stress Test

**Agent**: `challenger_m4_1`  
**Working Directory**: `/Users/sotoon/personal/jaliz/.agents/teamwork/teamwork_challenger_m4_1`  
**Date**: 2026-11-13  
**Target Scope**: 
- `src/lib/daily-advice-cache.ts`
- `src/lib/mascot-dialogue.ts`
- `src/components/WeatherAdvice.tsx`
- `src/components/mascot/MascotCompanion.tsx`

---

## 1. Observation

### Empirical Test Execution Summary
A comprehensive adversarial stress harness was authored and executed in:
`src/lib/__tests__/challenger-m4-1-stress.test.ts` (74 tests).

Full repository regression verification command:
```bash
/opt/homebrew/bin/node ./node_modules/vitest/vitest.mjs run
```
**Result**: 40 test files passed (450 total tests, 0 failures, 2.28s duration).

### Verified Strengths Across Challenge Dimensions

1. **Daily Advice Cache Robustness**:
   - **Corrupted Payloads**: Fuzzed across 28 corrupt inputs (`""`, whitespace, null bytes, `null`, `undefined`, primitives `12345`, `true`, `false`, `NaN`, arrays `[]`, `[1, 2, 3]`, non-string `userId`/`date`/`advice`, missing fields, truncated JSON boundaries byte-by-byte). All safely caught without unhandled exceptions, returning `null`.
   - **Prototype Pollution Resilience**: Payloads containing `{"__proto__": {"polluted": true}}` or `{"constructor": {"prototype": {"polluted": true}}}` did not pollute `Object.prototype`.
   - **Large Payload Capacity**: A 1.5MB string payload was serialized and deserialized cleanly without stack overflow or performance degradation.
   - **Calendar Day Rollover**: Cache hit on identical date (`2026-11-13`); cache miss on calendar advance (`2026-11-14`); leap year turnover (`2028-02-28` -> `2028-02-29`) and year transition (`2026-12-31` -> `2027-01-01`) cleanly invalidate. Future timestamps also return `null`.
   - **Multi-User Isolation**: Isolated by key (`jaliz_daily_advice_${userId}`). Prefix collisions (`user_1`, `user_10`, `user_100`) and non-ASCII / special character IDs (`user@domain.com`, `user:123`, `user/abc`, `کاربر_فارسی_۱۲۳`) have zero cross-talk. Tampered payloads where `parsed.userId !== userId` are rejected at line 50.

2. **Mascot State Machine & Dialogue Engine**:
   - **Hour Boundaries (0..23)**:
     - Night / Resting: Hours `[20, 21, 22, 23, 0, 1, 2, 3, 4]` resolve strictly to `"resting"`.
     - Active Daytime: Hour `5` (5 AM) cleanly triggers wake-up (`"thirsty"` or `"thriving"`).
     - Hour `19` (7 PM) remains daytime; Hour `20` (8 PM) triggers resting transition.
   - **Garden State Matrix**:
     - `totalPlants === 0` (empty garden) strictly resolves `"resting"` at all hours.
     - `isDoneToday === true` takes precedence over pending plants during the day (`"celebrating"`).
     - Night resting takes absolute precedence over `isDoneToday` and `plantsToWaterCount` (`"resting"`).
   - **Dialogue Generation & Micro-Copy**:
     - Tested empty garden Persian micro-copy: includes `باغچه تو هنوز خالیه` and honorific `جان` when name is provided.
     - Tested extreme username strings (empty, whitespace, tabs, newlines, HTML tags `<script>`, bidi override characters `\u202E`, 500-char strings): 0% leakage of `"undefined"`, `"null"`, or `"NaN"`.
     - Tested empty/whitespace `firstThirstyPlantName`: cleanly falls back to plant count micro-copy rather than rendering empty Persian guillemets `«»`.
     - Tested high plant numbers (e.g. 999,999 plants): properly formatted without truncation.

---

### Confirmed Vulnerability: Unhandled `SecurityError` / `DOMException` on Storage Access

#### Exact File & Line Numbers
File: `src/lib/daily-advice-cache.ts`  
Lines: 10–16, 27, 70, 94

Verbatim code from `src/lib/daily-advice-cache.ts`:
```ts
10: function resolveStorage<T>(storage?: T | null): T | null {
11:   if (storage !== undefined) return storage
12:   if (typeof window !== "undefined" && window.localStorage) {
13:     return window.localStorage as unknown as T
14:   }
15:   return null
16: }
...
22: export function getCachedDailyAdvice(
23:   userId: string,
24:   todayDate?: string,
25:   storage?: Pick<Storage, "getItem"> | null
26: ): string | null {
27:   const store = resolveStorage(storage)
28:   if (!store) return null
29: 
30:   const targetDate = todayDate || toLocalDateString()
31:   const key = getDailyAdviceCacheKey(userId)
32: 
33:   try {
34:     const raw = store.getItem(key)
```

#### Verbatim Tool Command & Reproduction Output
From `src/lib/__tests__/challenger-m4-1-stress.test.ts` line 165:
```bash
/opt/homebrew/bin/node ./node_modules/vitest/vitest.mjs run src/lib/__tests__/challenger-m4-1-stress.test.ts
```
Output:
```
stdout | src/lib/__tests__/challenger-m4-1-stress.test.ts > Empirical Challenger Stress Harness: Daily Advice Cache > 2. Storage Exception Resilience & SSR Safety > investigates global window.localStorage SecurityError behavior when storage arg is omitted
=== EMPIRICAL OBSERVATION: Did getCachedDailyAdvice throw? === true
```

---

## 2. Logic Chain

1. **Observation**: In standard browser runtime, callers like `src/components/WeatherAdvice.tsx` invoke `getCachedDailyAdvice(user.id)` without passing a mock `storage` parameter (line 21: `getCachedDailyAdvice(user.id)` and line 47: `getCachedDailyAdvice(user.id)`).
2. **Observation**: When `storage === undefined`, `resolveStorage` accesses `window.localStorage` directly on line 12.
3. **Observation**: In restricted browser contexts (iOS Safari Private Browsing mode with strict storage blocking, sandboxed iframes without `allow-same-origin`, WebViews with third-party storage restrictions, or users with cookies/storage disabled), accessing the `window.localStorage` property directly throws a `DOMException` / `SecurityError: Access is denied for this document`.
4. **Observation**: `resolveStorage` does NOT wrap the `window.localStorage` check in a `try...catch` block.
5. **Observation**: In `getCachedDailyAdvice` (line 27), `setCachedDailyAdvice` (line 70), and `clearDailyAdviceCache` (line 94), `const store = resolveStorage(storage)` is invoked **outside** of the function's internal `try...catch` block (which only begins on line 33, 83, and 99 respectively).
6. **Inference**: When `window.localStorage` property access throws a `SecurityError`, the exception is uncaught and propagates directly to the caller.
7. **Inference**: In `src/components/WeatherAdvice.tsx` line 19–22:
   ```ts
   const [advice, setAdvice] = useState<string | null>(() => {
     if (typeof window === "undefined" || !user?.id || !subscribed) return null
     return getCachedDailyAdvice(user.id)
   })
   ```
   Because `typeof window !== "undefined"` is true in the browser, `getCachedDailyAdvice` is called during React state initialization. An unhandled `SecurityError` thrown here crashes the entire component render and triggers an unhandled React error boundary on the `/schedule` page.
8. **Conclusion**: While `daily-advice-cache.ts` handles corrupted JSON and storage method failures (`getItem` / `setItem` throwing), it fails to protect against storage property access errors when resolving the global storage instance.

---

## 3. Caveats

- In unconstrained desktop browsers (Chrome, Edge, standard Safari), `window.localStorage` property access succeeds, so this crash only manifests under private browsing, sandboxed iframes, or restricted storage policies.
- The unit test suite in M1 (`src/lib/__tests__/daily-advice-cache.test.ts`) did not uncover this vulnerability because it passed a mock storage object to all function calls (`storage`), which bypassed `resolveStorage`'s branch accessing `window.localStorage`.
- All other 73 adversarial stress tests passed 100%.

---

## 4. Conclusion & Required Changes

The mascot state machine and contextual dialogue generator (`src/lib/mascot-dialogue.ts`) are **exceptionally robust** and passed all edge case, extreme input, boundary hour, and 0% undefined/null leakage checks.

However, `src/lib/daily-advice-cache.ts` has a confirmed resilience flaw that can crash client rendering in private/restricted browser environments.

### Required Modification in `src/lib/daily-advice-cache.ts`
Wrap the `window.localStorage` resolution inside `resolveStorage` in a `try...catch` block:

```ts
// src/lib/daily-advice-cache.ts lines 10-16
function resolveStorage<T>(storage?: T | null): T | null {
  if (storage !== undefined) return storage
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage as unknown as T
    }
  } catch {
    return null
  }
  return null
}
```
This guarantees that if the browser restricts storage access, `resolveStorage` safely returns `null`, causing `getCachedDailyAdvice` to return `null` and `setCachedDailyAdvice` to no-op without crashing the client application.

---

## 5. Verification Method

To verify the issue and validate the fix:

1. **Run the Empirical Stress Test Suite**:
   ```bash
   /opt/homebrew/bin/node ./node_modules/vitest/vitest.mjs run src/lib/__tests__/challenger-m4-1-stress.test.ts
   ```
2. **Inspect the SecurityError Test Case**:
   Review `src/lib/__tests__/challenger-m4-1-stress.test.ts` lines 164–192.
3. **Run Full Project Test Suite**:
   ```bash
   /opt/homebrew/bin/node ./node_modules/vitest/vitest.mjs run
   ```
   Ensure all 40 test files pass.

---

## Verdict

`Verdict: REQUEST_CHANGES`

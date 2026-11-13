import assert from "node:assert/strict";
import {
  getCachedDailyAdvice,
  setCachedDailyAdvice,
  clearDailyAdviceCache,
  getDailyAdviceCacheKey,
} from "../../../src/lib/daily-advice-cache.ts";
import {
  resolveMascotState,
  getMascotDialogue,
} from "../../../src/lib/mascot-dialogue.ts";
import {
  partitionCareTasks,
} from "../../../src/lib/care-tasks.ts";
import {
  calculateWateringStreak,
  calculateGardenerLevel,
  getXpForAction,
} from "../../../src/lib/gamification.ts";

console.log("=== RUNNING VICTORY AUDITOR INDEPENDENT VERIFICATION SUITE ===");

// 1. R3: Daily advice cache
console.log("-> Testing R3: Daily Advice Cache...");
assert.equal(getDailyAdviceCacheKey("u-1"), "jaliz_daily_advice_u-1");

const store = new Map();
const storage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};

assert.equal(getCachedDailyAdvice("u-1", "2026-11-13", storage), null);
setCachedDailyAdvice("u-1", "Test Advice 123", "2026-11-13", storage);
assert.equal(getCachedDailyAdvice("u-1", "2026-11-13", storage), "Test Advice 123");
// User isolation
assert.equal(getCachedDailyAdvice("u-2", "2026-11-13", storage), null);
// Date rollover invalidation
assert.equal(getCachedDailyAdvice("u-1", "2026-11-14", storage), null);
// Corrupted entry resilience
store.set("jaliz_daily_advice_u-1", "{invalid json");
assert.equal(getCachedDailyAdvice("u-1", "2026-11-13", storage), null);
// Throwing storage resilience (Safari private browsing SecurityError)
const throwingStore = {
  getItem: () => { throw new Error("SecurityError: blocked"); },
  setItem: () => { throw new Error("QuotaExceededError"); },
  removeItem: () => { throw new Error("SecurityError"); },
};
assert.doesNotThrow(() => getCachedDailyAdvice("u-1", "2026-11-13", throwingStore));
assert.equal(getCachedDailyAdvice("u-1", "2026-11-13", throwingStore), null);
console.log("   ✓ R3 Daily Advice Cache verified successfully.");

// 2. R2: Mascot Dialogue & States
console.log("-> Testing R2: Mascot Companion Dialogue & States...");
// Night hours (20..23, 0..4)
for (const h of [20, 21, 22, 23, 0, 1, 2, 3, 4]) {
  const state = resolveMascotState({
    totalPlants: 2,
    plantsToWaterCount: 1,
    isDoneToday: false,
    streakDays: 5,
    currentHour: h,
  });
  assert.equal(state, "resting", `Hour ${h} should be resting`);
}

// Daytime hours
assert.equal(resolveMascotState({ totalPlants: 2, plantsToWaterCount: 1, isDoneToday: false, streakDays: 0, currentHour: 10 }), "thirsty");
assert.equal(resolveMascotState({ totalPlants: 2, plantsToWaterCount: 0, isDoneToday: true, streakDays: 0, currentHour: 10 }), "celebrating");
assert.equal(resolveMascotState({ totalPlants: 2, plantsToWaterCount: 0, isDoneToday: false, streakDays: 0, currentHour: 10 }), "thriving");
assert.equal(resolveMascotState({ totalPlants: 0, plantsToWaterCount: 0, isDoneToday: false, streakDays: 0, currentHour: 10 }), "resting");

// Contextual dialogues
const dialogueFa = getMascotDialogue({
  totalPlants: 3,
  plantsToWaterCount: 1,
  firstThirstyPlantName: "پتوس طلایی",
  isDoneToday: false,
  streakDays: 4,
  userName: "علی",
  currentHour: 14,
}, "fa");
assert(dialogueFa.includes("پتوس طلایی"), "Dialogue should inject thirsty plant name");
assert(dialogueFa.includes("علی"), "Dialogue should include user name");
assert(!/undefined|null|NaN/.test(dialogueFa), "Dialogue must not leak undefined/null/NaN");
console.log("   ✓ R2 Mascot Dialogue & States verified successfully.");

// 3. R1: Care tasks partitioning & gamification
console.log("-> Testing R1: Care Tasks Partitioning & Gamification...");
const now = new Date("2026-11-13T12:00:00Z");
const samplePlants = [
  { id: "1", name: "Plant 1", nextWateringDate: "2026-11-10", wateringInterval: 3 },
  { id: "2", name: "Plant 2", nextWateringDate: "2026-11-13", wateringInterval: 3 },
  { id: "3", name: "Plant 3", nextWateringDate: "2026-11-15", wateringInterval: 3 },
];
const partition = partitionCareTasks(samplePlants, false, now);
assert.equal(partition.overdue.length, 1);
assert.equal(partition.today.length, 1);
assert.equal(partition.upcoming.length, 1);
assert.equal(partition.totalDueToday, 2);

// Streak verification
assert.equal(calculateWateringStreak([], now), 0);
assert.equal(calculateWateringStreak(["2026-11-13"], now), 1);
assert.equal(calculateWateringStreak(["2026-11-12"], now), 1);
assert.equal(calculateWateringStreak(["2026-11-13", "2026-11-12", "2026-11-11"], now), 3);
assert.equal(calculateWateringStreak(["2026-11-10"], now), 0); // broken streak

// Gardener levels
assert.equal(calculateGardenerLevel(0).level, 1);
assert.equal(calculateGardenerLevel(99).level, 1);
assert.equal(calculateGardenerLevel(100).level, 2);
assert.equal(calculateGardenerLevel(250).level, 3);
assert.equal(calculateGardenerLevel(500).level, 4);
assert.equal(calculateGardenerLevel(1000).level, 5);

// XP rules
assert.equal(getXpForAction("water_plant"), 10);
assert.equal(getXpForAction("daily_complete"), 25);
assert.equal(getXpForAction("streak_milestone"), 50);
console.log("   ✓ R1 Care Tasks & Gamification verified successfully.");

console.log("=== ALL INDEPENDENT VERIFICATION CHECKS PASSED EMPIRICALLY! ===");

/** Canonical health values stored on plants and status logs. */
export const PLANT_HEALTH_VALUES = ["Excellent", "Good", "Needs Attention"] as const
export type PlantHealthValue = (typeof PLANT_HEALTH_VALUES)[number]

/**
 * Maps arbitrary model output to a stored health enum. Used client-side as a safety net.
 */
export function normalizePlantHealth(raw: string | undefined | null): PlantHealthValue {
  const s = (raw ?? "").trim()
  if (PLANT_HEALTH_VALUES.includes(s as PlantHealthValue)) {
    return s as PlantHealthValue
  }
  const lower = s.toLowerCase()
  if (
    lower.includes("excellent") ||
    lower.includes("عالی") ||
    lower.includes("بسیار خوب")
  ) {
    return "Excellent"
  }
  if (
    lower.includes("attention") ||
    lower.includes("critical") ||
    lower.includes("نیاز به توجه") ||
    lower.includes("ضعیف") ||
    lower.includes("bad")
  ) {
    return "Needs Attention"
  }
  if (lower.includes("good") || lower.includes("خوب") || lower.includes("متوسط")) {
    return "Good"
  }
  return "Good"
}

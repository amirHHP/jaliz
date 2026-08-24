export interface WateringNeedInput {
  lastWatered: string | null | undefined
  nextWateringDate?: string | null
  locationType?: string
  lightExposure?: string
  potType?: string
}

/**
 * Heuristic used everywhere to decide whether a plant needs water now:
 * prefer the explicit nextWateringDate, otherwise fall back to a threshold
 * in days derived from the plant's environment.
 */
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

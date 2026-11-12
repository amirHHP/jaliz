import { plantNeedsWater, type WateringNeedInput } from "@/lib/watering"

export const WATERING_NOTIF_STORAGE_KEY = "jaliz_last_watering_notif_date"

export interface PlantWithWateringInfo extends WateringNeedInput {
  name: string
  id?: string
}

export interface WateringNotificationPayload {
  title: string
  body: string
  tag: string
  url: string
}

function toPersianDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])
}

/**
 * Format title and body for watering reminder notifications based on plant list and language.
 */
export function formatWateringNotification(
  plantNames: string[],
  language: "fa" | "en" = "fa",
): WateringNotificationPayload {
  const count = plantNames.length

  if (count === 0) {
    return {
      title: language === "fa" ? "جالیز 🌱" : "Jaliz 🌱",
      body:
        language === "fa"
          ? "تمامی گیاهان شما شاداب هستند و امروز نیازی به آبیاری ندارند."
          : "All your plants are hydrated and do not need water today.",
      tag: "jaliz-watering-reminder",
      url: "/schedule",
    }
  }

  if (language === "fa") {
    let body = ""
    const countFa = toPersianDigits(count)
    if (count === 1) {
      body = `گیاه «${plantNames[0]}» امروز نیاز به آبیاری دارد.`
    } else if (count <= 3) {
      body = `${countFa} گیاه شما (${plantNames.join("، ")}) امروز نیاز به آبیاری دارند.`
    } else {
      const top3 = plantNames.slice(0, 3).join("، ")
      body = `${countFa} گیاه شما از جمله ${top3} امروز نیاز به آبیاری دارند.`
    }

    return {
      title: "یادآور آبیاری جالیز 💧",
      body,
      tag: "jaliz-watering-reminder",
      url: "/schedule",
    }
  }

  let body = ""
  if (count === 1) {
    body = `Plant "${plantNames[0]}" needs watering today.`
  } else if (count <= 3) {
    body = `${count} of your plants (${plantNames.join(", ")}) need watering today.`
  } else {
    const top3 = plantNames.slice(0, 3).join(", ")
    body = `${count} of your plants including ${top3} need watering today.`
  }

  return {
    title: "Jaliz Watering Reminder 💧",
    body,
    tag: "jaliz-watering-reminder",
    url: "/schedule",
  }
}

/**
 * Determine if notification should fire for the given date (daily throttling).
 */
export function shouldTriggerDailyWateringNotification(
  lastNotifiedDate: string | null | undefined,
  today: string,
): boolean {
  if (!lastNotifiedDate) return true
  return lastNotifiedDate !== today
}

/**
 * Dispatches notification using Service Worker showNotification if available,
 * or fallback to window Notification.
 */
export async function dispatchWateringNotification(
  payload: WateringNotificationPayload,
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false
  }

  if (Notification.permission !== "granted") {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") return false
    } catch {
      return false
    }
  }

  const options: NotificationOptions = {
    body: payload.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: payload.tag,
    data: { url: payload.url },
  }

  // 1. Try ServiceWorkerRegistration.showNotification (recommended on mobile/PWA)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(payload.title, options)
        return true
      }
    } catch {
      // Fallback to Notification constructor below
    }
  }

  // 2. Fallback to standard window Notification
  try {
    const notif = new Notification(payload.title, options)
    notif.onclick = () => {
      try {
        window.focus()
      } catch {}
      window.location.href = payload.url
    }
    return true
  } catch (err) {
    console.error("[WateringNotification] Failed to show notification:", err)
    return false
  }
}

export interface CheckAndNotifyOptions {
  plants: PlantWithWateringInfo[]
  language?: "fa" | "en"
  now?: Date
  force?: boolean
  storage?: Pick<Storage, "getItem" | "setItem">
}

export interface CheckAndNotifyResult {
  dispatched: boolean
  reason?:
    | "ssr"
    | "not_supported"
    | "permission_denied"
    | "already_notified_today"
    | "no_plants_need_water"
    | "dispatch_failed"
  needingWaterCount: number
  plantNames: string[]
}

/**
 * High-level helper: inspects user plants, decides if watering notification is due today,
 * and triggers it if appropriate.
 */
export async function checkAndDispatchWateringNotification(
  options: CheckAndNotifyOptions,
): Promise<CheckAndNotifyResult> {
  const {
    plants,
    language = "fa",
    now = new Date(),
    force = false,
    storage = typeof window !== "undefined" ? window.localStorage : undefined,
  } = options

  if (typeof window === "undefined" && !options.storage) {
    return { dispatched: false, reason: "ssr", needingWaterCount: 0, plantNames: [] }
  }

  if (typeof window !== "undefined" && !("Notification" in window)) {
    return { dispatched: false, reason: "not_supported", needingWaterCount: 0, plantNames: [] }
  }

  const todayKey = now.toLocaleDateString("en-CA") // YYYY-MM-DD in local time
  const lastDate = storage?.getItem(WATERING_NOTIF_STORAGE_KEY)

  if (!force && !shouldTriggerDailyWateringNotification(lastDate, todayKey)) {
    return { dispatched: false, reason: "already_notified_today", needingWaterCount: 0, plantNames: [] }
  }

  const needingWater = plants.filter((p) => plantNeedsWater(p, now))
  const needingPlantNames = needingWater.map((p) => p.name.trim()).filter(Boolean)

  if (needingWater.length === 0 && !force) {
    return { dispatched: false, reason: "no_plants_need_water", needingWaterCount: 0, plantNames: [] }
  }

  const payload = formatWateringNotification(
    needingPlantNames.length > 0 ? needingPlantNames : plants.map((p) => p.name).slice(0, 1),
    language,
  )

  const success = await dispatchWateringNotification(payload)
  if (success) {
    try {
      storage?.setItem(WATERING_NOTIF_STORAGE_KEY, todayKey)
    } catch {}
    return {
      dispatched: true,
      needingWaterCount: needingWater.length,
      plantNames: needingPlantNames,
    }
  }

  return {
    dispatched: false,
    reason: "dispatch_failed",
    needingWaterCount: needingWater.length,
    plantNames: needingPlantNames,
  }
}

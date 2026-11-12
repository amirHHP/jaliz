"use client"

import React, { createContext, useContext, useEffect, useCallback, useRef, useSyncExternalStore } from "react"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { getUserPlantsAction } from "@/app/actions/plants"
import {
  checkAndDispatchWateringNotification,
  dispatchWateringNotification,
  formatWateringNotification,
  type PlantWithWateringInfo,
} from "@/lib/watering-notification"

interface WateringNotificationContextValue {
  permission: NotificationPermission | "unsupported"
  isSupported: boolean
  requestPermissionAndNotify: () => Promise<boolean>
  sendTestNotification: (plants?: PlantWithWateringInfo[]) => Promise<boolean>
}

const WateringNotificationContext = createContext<WateringNotificationContextValue | null>(null)

function subscribeToPermission(callback: () => void) {
  if (typeof navigator !== "undefined" && "permissions" in navigator) {
    try {
      navigator.permissions
        .query({ name: "notifications" as PermissionName })
        .then((status) => {
          status.onchange = callback
        })
        .catch(() => {})
    } catch {}
  }
  return () => {}
}

function getPermissionSnapshot(): NotificationPermission | "unsupported" {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission
  }
  return "unsupported"
}

function getServerPermissionSnapshot(): NotificationPermission | "unsupported" {
  return "unsupported"
}

export function WateringNotificationProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const { language } = useLanguage()
  const permission = useSyncExternalStore(
    subscribeToPermission,
    getPermissionSnapshot,
    getServerPermissionSnapshot,
  )
  const autoCheckedRef = useRef(false)

  // Auto-check once per day if permission is granted
  useEffect(() => {
    if (status !== "authenticated" || autoCheckedRef.current) return
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission !== "granted") return

    autoCheckedRef.current = true
    void (async () => {
      try {
        const plants = await getUserPlantsAction()
        if (!plants || plants.length === 0) return

        await checkAndDispatchWateringNotification({
          plants: plants.map((p) => ({
            id: p.id,
            name: p.name,
            lastWatered: p.lastWatered ? new Date(p.lastWatered).toISOString() : null,
            nextWateringDate: p.nextWateringDate ? new Date(p.nextWateringDate).toISOString() : null,
            locationType: p.locationType ?? undefined,
            lightExposure: p.lightExposure ?? undefined,
            potType: p.potType ?? undefined,
          })),
          language: language === "fa" ? "fa" : "en",
        })
      } catch (err) {
        console.error("[WateringNotificationProvider] Auto-check failed:", err)
      }
    })()
  }, [status, language])

  const requestPermissionAndNotify = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false
    }

    try {
      const perm = await Notification.requestPermission()
      if (perm !== "granted") return false

      const plants = await getUserPlantsAction()
      const formattedPlants: PlantWithWateringInfo[] = (plants || []).map((p) => ({
        id: p.id,
        name: p.name,
        lastWatered: p.lastWatered ? new Date(p.lastWatered).toISOString() : null,
        nextWateringDate: p.nextWateringDate ? new Date(p.nextWateringDate).toISOString() : null,
        locationType: p.locationType ?? undefined,
        lightExposure: p.lightExposure ?? undefined,
        potType: p.potType ?? undefined,
      }))

      const result = await checkAndDispatchWateringNotification({
        plants: formattedPlants,
        language: language === "fa" ? "fa" : "en",
        force: true,
      })

      return result.dispatched
    } catch (err) {
      console.error("[WateringNotificationProvider] Request permission failed:", err)
      return false
    }
  }, [language])

  const sendTestNotification = useCallback(
    async (overridePlants?: PlantWithWateringInfo[]): Promise<boolean> => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        return false
      }

      try {
        let plantList = overridePlants
        if (!plantList) {
          const plants = await getUserPlantsAction()
          plantList = (plants || []).map((p) => ({
            id: p.id,
            name: p.name,
            lastWatered: p.lastWatered ? new Date(p.lastWatered).toISOString() : null,
            nextWateringDate: p.nextWateringDate ? new Date(p.nextWateringDate).toISOString() : null,
            locationType: p.locationType ?? undefined,
            lightExposure: p.lightExposure ?? undefined,
            potType: p.potType ?? undefined,
          }))
        }

        const plantNames = plantList.map((p) => p.name).filter(Boolean)
        const sampleNames =
          plantNames.length > 0 ? plantNames.slice(0, 2) : [language === "fa" ? "پتوس تستی" : "Sample Pothos"]

        const payload = formatWateringNotification(sampleNames, language === "fa" ? "fa" : "en")
        return await dispatchWateringNotification(payload)
      } catch (err) {
        console.error("[WateringNotificationProvider] Test notification failed:", err)
        return false
      }
    },
    [language],
  )

  const value: WateringNotificationContextValue = {
    permission,
    isSupported: permission !== "unsupported",
    requestPermissionAndNotify,
    sendTestNotification,
  }

  return (
    <WateringNotificationContext.Provider value={value}>
      {children}
    </WateringNotificationContext.Provider>
  )
}

export function useWateringNotification(): WateringNotificationContextValue {
  const ctx = useContext(WateringNotificationContext)
  if (!ctx) {
    return {
      permission: "unsupported",
      isSupported: false,
      requestPermissionAndNotify: async () => false,
      sendTestNotification: async () => false,
    }
  }
  return ctx
}

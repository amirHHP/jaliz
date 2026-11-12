"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useAuth } from "@/components/AuthProvider"
import {
  getUserPlantsAction,
  createUserPlantAction,
  updateUserPlantAction,
  deleteUserPlantAction,
} from "@/app/actions/plants"

export interface PlantStatusLog {
  id: string
  status: string
  health: string
  aiAdvice?: string | null
  image?: string | null
  createdAt: Date
}

export interface Plant {
  id: string
  name: string
  type: string
  locationType: "Indoor" | "Outdoor"
  lightExposure: "Low Light" | "Partial Shade" | "Bright Indirect" | "Full Sun"
  potType: "Terracotta" | "Plastic" | "Ceramic" | "Metal" | "Other"
  growingMedium: "Soil" | "Water"
  hasDrainage: boolean
  lastWatered: string
  nextWateringDate?: string
  wateringInterval: number
  recentlyReplanted: boolean
  lastSoilChange?: string
  health: "Excellent" | "Good" | "Needs Attention"
  image?: string
  careTips?: string
  wateringTips?: string
  statusLogs?: PlantStatusLog[]
}

function safeDateString(val: any, fallback?: string): string | undefined {
  if (!val) return fallback
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return fallback
    return d.toISOString().split("T")[0]
  } catch {
    return fallback
  }
}

export function dbRowToPlant(row: any): Plant {
  const { statusLogs, ...rest } = row
  return {
    id: rest.id,
    name: rest.name,
    type: rest.type ?? "",
    locationType: rest.locationType ?? "Indoor",
    lightExposure: rest.lightExposure ?? "Bright Indirect",
    potType: rest.potType ?? "Plastic",
    growingMedium: rest.growingMedium ?? "Soil",
    hasDrainage: rest.hasDrainage ?? true,
    lastWatered: safeDateString(rest.lastWatered, new Date().toISOString().split("T")[0])!,
    nextWateringDate: safeDateString(rest.nextWateringDate),
    wateringInterval: rest.wateringInterval ?? 7,
    recentlyReplanted: rest.recentlyReplanted ?? false,
    lastSoilChange: safeDateString(rest.lastSoilChange),
    health: rest.health ?? "Excellent",
    image: rest.image ?? undefined,
    careTips: rest.careTips ?? undefined,
    wateringTips: rest.wateringTips ?? undefined,
    statusLogs: statusLogs ?? undefined,
  }
}

export interface PlantsContextValue {
  plants: Plant[]
  loading: boolean
  ready: boolean
  refreshPlants: () => Promise<Plant[]>
  createPlant: (data: any) => Promise<any>
  updatePlant: (id: string, patch: any) => Promise<any>
  deletePlant: (id: string) => Promise<void>
}

const defaultPlantsContext: PlantsContextValue = {
  plants: [],
  loading: false,
  ready: false,
  refreshPlants: async () => [],
  createPlant: async () => null,
  updatePlant: async () => null,
  deletePlant: async () => {},
}

const PlantsContext = createContext<PlantsContextValue>(defaultPlantsContext)

export function PlantsProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const initialFetchedRef = useRef(false)
  const lastFetchedAtRef = useRef<number>(0)

  const fetchPlants = useCallback(async (isSilent = false) => {
    if (!user) {
      setPlants([])
      setReady(true)
      return []
    }
    if (!isSilent) setLoading(true)
    try {
      const data = await getUserPlantsAction()
      const mapped = data.map(dbRowToPlant)
      setPlants(mapped)
      setReady(true)
      lastFetchedAtRef.current = Date.now()
      return mapped
    } catch (e) {
      console.error("[PlantsProvider] Failed to fetch user plants:", e)
      return []
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (status === "authenticated" && user) {
      if (!initialFetchedRef.current) {
        initialFetchedRef.current = true
        fetchPlants(false)
      } else if (Date.now() - lastFetchedAtRef.current > 30000) {
        fetchPlants(true)
      }
    } else if (status === "unauthenticated") {
      initialFetchedRef.current = false
      setPlants([])
      setReady(false)
      setLoading(false)
    }
  }, [status, user, fetchPlants])

  // Listen for plant updates across the app (creation in /plants/new, diagnose, modal status logs)
  useEffect(() => {
    const handlePlantsUpdated = () => {
      fetchPlants(true)
    }
    window.addEventListener("jaliz:plants-updated", handlePlantsUpdated)
    return () => {
      window.removeEventListener("jaliz:plants-updated", handlePlantsUpdated)
    }
  }, [fetchPlants])

  const createPlant = useCallback(async (data: any) => {
    const created = await createUserPlantAction(data)
    if (created) {
      const mapped = dbRowToPlant(created)
      setPlants((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)])
      lastFetchedAtRef.current = Date.now()
    }
    return created
  }, [])

  const updatePlant = useCallback(async (id: string, patch: any) => {
    const updated = await updateUserPlantAction(id, patch)
    if (updated) {
      const mapped = dbRowToPlant(updated)
      setPlants((prev) => prev.map((p) => (p.id === id ? mapped : p)))
      lastFetchedAtRef.current = Date.now()
    }
    return updated
  }, [])

  const deletePlant = useCallback(async (id: string) => {
    await deleteUserPlantAction(id)
    setPlants((prev) => prev.filter((p) => p.id !== id))
    lastFetchedAtRef.current = Date.now()
  }, [])

  const value = useMemo<PlantsContextValue>(
    () => ({
      plants,
      loading: !ready && loading,
      ready,
      refreshPlants: (isSilent = false) => fetchPlants(isSilent),
      createPlant,
      updatePlant,
      deletePlant,
    }),
    [plants, loading, ready, fetchPlants, createPlant, updatePlant, deletePlant]
  )

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>
}

export function usePlants(): PlantsContextValue {
  return useContext(PlantsContext)
}

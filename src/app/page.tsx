"use client"

import { Loader2 } from "lucide-react"

import { Dashboard } from "@/components/Dashboard"
import { LandingPage } from "@/components/LandingPage"
import { useAuth } from "@/components/AuthProvider"

/**
 * Root route. Anonymous visitors see the marketing landing page; signed-in
 * users get the gardening dashboard. While auth is initializing we render
 * a tiny placeholder to avoid flashing the wrong view on first paint.
 */
export default function Home() {
  const { status } = useAuth()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (status === "authenticated") {
    return <Dashboard />
  }

  return <LandingPage />
}

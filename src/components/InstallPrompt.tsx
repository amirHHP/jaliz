"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import { Download, X, Share, Plus } from "lucide-react"
import Image from "next/image"
import {
  isInstallPromptDismissed,
  markInstallPromptDismissed,
} from "@/lib/install-prompt"

declare global {
  interface Window {
    MSStream?: unknown
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function getIOSVersion(): number | null {
  if (typeof navigator === "undefined") return null
  const match = navigator.userAgent.match(/OS (\d+)_/)
  return match ? parseInt(match[1], 10) : null
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

export function InstallPrompt() {
  const { t } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const dismissedRef = useRef(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current != null) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
  }, [])

  const scheduleShow = useCallback((show: () => void) => {
    clearShowTimer()
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null
      if (dismissedRef.current || isInstallPromptDismissed()) return
      show()
    }, 2000)
  }, [clearShowTimer])

  useEffect(() => {
    if (isStandalone() || isInstallPromptDismissed()) {
      dismissedRef.current = true
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      if (dismissedRef.current || isInstallPromptDismissed()) return
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      scheduleShow(() => setShowBanner(true))
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      clearShowTimer()
    }
  }, [scheduleShow, clearShowTimer])

  useEffect(() => {
    if (isStandalone() || isInstallPromptDismissed()) {
      dismissedRef.current = true
      return
    }
    if (!isIOS()) return

    const iosVersion = getIOSVersion()
    if (iosVersion && iosVersion >= 12) {
      scheduleShow(() => setShowIOSGuide(true))
    }

    return () => clearShowTimer()
  }, [scheduleShow, clearShowTimer])

  useEffect(() => {
    return () => {
      if (hideTimerRef.current != null) clearTimeout(hideTimerRef.current)
    }
  }, [])

  const dismiss = useCallback(() => {
    dismissedRef.current = true
    markInstallPromptDismissed()
    clearShowTimer()
    setIsAnimatingOut(true)

    if (hideTimerRef.current != null) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null
      setShowBanner(false)
      setShowIOSGuide(false)
      setDeferredPrompt(null)
      setIsAnimatingOut(false)
    }, 300)
  }, [clearShowTimer])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      dismissedRef.current = true
      markInstallPromptDismissed()
      clearShowTimer()
      setShowBanner(false)
      setDeferredPrompt(null)
    }
  }, [deferredPrompt, clearShowTimer])

  if (isStandalone()) return null

  if (showBanner && deferredPrompt) {
    return (
      <div
        className={`fixed bottom-18 left-0 right-0 z-[60] px-4 pb-2 ${
          isAnimatingOut ? "animate-slide-down" : "animate-slide-up"
        }`}
      >
        <div className="relative mx-auto max-w-lg rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 shadow-2xl shadow-emerald-500/10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative p-4">
            <button
              onClick={dismiss}
              className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/30">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-slate-800">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="جالیز"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  {t("install_title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {t("install_description")}
                </p>
              </div>
            </div>

            <button
              onClick={handleInstall}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              {t("install_button")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showIOSGuide) {
    return (
      <div
        className={`fixed bottom-18 left-0 right-0 z-[60] px-4 pb-2 ${
          isAnimatingOut ? "animate-slide-down" : "animate-slide-up"
        }`}
      >
        <div className="relative mx-auto max-w-lg rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 shadow-2xl shadow-emerald-500/10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-4">
            <button
              onClick={dismiss}
              className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/30">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-slate-800">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="جالیز"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  {t("install_title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {t("install_ios_guide")}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-6 py-2.5 px-4 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">۱</span>
                <Share className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{t("install_ios_step1")}</span>
              </div>
              <div className="w-px h-5 bg-emerald-300 dark:bg-emerald-700" />
              <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">۲</span>
                <Plus className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{t("install_ios_step2")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

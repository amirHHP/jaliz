"use client"

import React from "react"
import type { MascotState } from "@/lib/mascot-dialogue"

export interface MascotSpeechBubbleProps {
  message: string
  state?: MascotState
  className?: string
  onTap?: () => void
  speakerName?: string
}

/**
 * Duolingo-style RTL speech bubble with directional tail pointing toward the mascot.
 * High contrast, rounded-3xl, responsive Persian typography.
 */
export function MascotSpeechBubble({
  message,
  state = "thriving",
  className = "",
  onTap,
  speakerName = "برگچه",
}: MascotSpeechBubbleProps) {
  // Border & accent colors matching mascot state
  const stateAccent =
    state === "thirsty"
      ? "border-amber-300/90 bg-amber-50/40 text-amber-950 dark:border-amber-700/80 dark:bg-amber-950/20"
      : state === "celebrating"
      ? "border-emerald-300/90 bg-emerald-50/50 text-emerald-950 dark:border-emerald-700/80 dark:bg-emerald-950/20"
      : state === "resting"
      ? "border-slate-300/80 bg-slate-50/60 text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/30"
      : "border-emerald-200/90 bg-white/95 text-slate-800 dark:border-emerald-800/80 dark:bg-slate-900/90"

  const stateBadge =
    state === "thirsty"
      ? "💧 نیازمند رسیدگی"
      : state === "celebrating"
      ? "🎉 جشن موفقیت"
      : state === "resting"
      ? "🌙 زمان استراحت"
      : "🌿 همراه سبز تو"

  return (
    <div
      onClick={onTap}
      role={onTap ? "button" : undefined}
      tabIndex={onTap ? 0 : undefined}
      onKeyDown={
        onTap
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onTap()
              }
            }
          : undefined
      }
      className={`relative rounded-3xl border-2 p-4 sm:p-5 shadow-md backdrop-blur-sm transition-all duration-300 ${stateAccent} ${
        onTap
          ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          : ""
      } ${className}`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{speakerName}</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {stateBadge}
        </span>
      </div>

      {/* Main Dialogue Content */}
      <p className="text-sm sm:text-base font-semibold leading-relaxed tracking-normal whitespace-pre-wrap">
        {message}
      </p>

      {/* Interactive tap prompt footer if tappable */}
      {onTap && (
        <div className="mt-2.5 pt-1.5 flex items-center justify-end text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
          <span className="hover:underline">برای پیام بعدی بزنید ✨</span>
        </div>
      )}

      {/* Directional Tail Pointing Toward Mascot (Desktop RTL: points right) */}
      <div
        className="hidden md:block absolute -right-3 top-6 w-3 h-4 overflow-hidden pointer-events-none rtl:block ltr:hidden"
        aria-hidden="true"
      >
        <div className="w-4 h-4 bg-inherit border-t-2 border-r-2 border-inherit rotate-45 transform origin-top-left translate-x-[-2px] translate-y-[2px]" />
      </div>

      {/* Directional Tail Pointing Toward Mascot (Desktop LTR: points left) */}
      <div
        className="hidden md:block absolute -left-3 top-6 w-3 h-4 overflow-hidden pointer-events-none ltr:block rtl:hidden"
        aria-hidden="true"
      >
        <div className="w-4 h-4 bg-inherit border-b-2 border-l-2 border-inherit rotate-45 transform origin-bottom-right" />
      </div>
    </div>
  )
}

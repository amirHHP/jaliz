"use client"

import React from "react"
import type { MascotState } from "@/lib/mascot-dialogue"

export interface PlantMascotProps {
  state?: MascotState
  size?: number
  className?: string
  alt?: string
}

/**
 * Pure vector SVG companion mascot: "برگچه" (Bargcheh).
 * Zero external dependencies.
 *
 * Visual States:
 * - thriving: Upright emerald crown leaves, sparkling eyes, rosy cheeks, gentle floating bounce.
 * - thirsty: Drooping leaves along the pot, pleading eyes, pulsing blue teardrop.
 * - celebrating: Cool sunglasses (😎), star bursts, colorful confetti dots, victory celebration bounce.
 * - resting: Closed peaceful curved eyes, calm breathing scale, floating Zzz.
 */
export function PlantMascot({
  state = "thriving",
  size = 120,
  className = "",
  alt = "برگچه - همراه جالیز",
}: PlantMascotProps) {
  // Motion animation class based on state
  const animationClass =
    state === "celebrating"
      ? "animate-bounce"
      : state === "thriving"
      ? "hover:scale-105 transition-transform duration-300"
      : state === "thirsty"
      ? "animate-pulse"
      : "opacity-95"

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${animationClass} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${alt} - حالت ${state}`}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-all duration-500 ease-in-out"
      >
        <defs>
          {/* Sprout Head Gradient */}
          <linearGradient id="sproutGrad" x1="60" y1="28" x2="60" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={state === "thirsty" ? "#86EFAC" : "#34D399"} />
            <stop offset="100%" stopColor={state === "thirsty" ? "#22C55E" : "#059669"} />
          </linearGradient>

          {/* Crown Leaf Gradient */}
          <linearGradient id="leafGrad" x1="60" y1="10" x2="60" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={state === "thirsty" ? "#A7F3D0" : "#6EE7B7"} />
            <stop offset="100%" stopColor={state === "thirsty" ? "#4ADE80" : "#10B981"} />
          </linearGradient>

          {/* Terracotta Pot Gradient */}
          <linearGradient id="potGrad" x1="60" y1="65" x2="60" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA7A5B" />
            <stop offset="100%" stopColor="#C45335" />
          </linearGradient>

          {/* Rim Gradient */}
          <linearGradient id="rimGrad" x1="60" y1="63" x2="60" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F08A6C" />
            <stop offset="100%" stopColor="#B8492C" />
          </linearGradient>

          {/* Soil Gradient */}
          <linearGradient id="soilGrad" x1="60" y1="67" x2="60" y2="73" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A2E1E" />
            <stop offset="100%" stopColor="#2E1B11" />
          </linearGradient>

          {/* Sunglasses Specular Gradient */}
          <linearGradient id="shadesReflection" x1="40" y1="46" x2="80" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="45%" stopColor="#111827" />
            <stop offset="55%" stopColor="#4B5563" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>

          {/* Water Drop Gradient */}
          <linearGradient id="tearGrad" x1="77" y1="56" x2="77" y2="67" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* ================= BACKGROUND CONFETTI & STARS (Celebrating State) ================= */}
        {state === "celebrating" && (
          <g className="animate-pulse">
            {/* Confetti dots */}
            <circle cx="20" cy="24" r="3" fill="#F59E0B" />
            <circle cx="100" cy="22" r="3.5" fill="#EC4899" />
            <circle cx="14" cy="50" r="2.5" fill="#3B82F6" />
            <circle cx="106" cy="54" r="3" fill="#10B981" />
            <circle cx="28" cy="84" r="2" fill="#8B5CF6" />
            <circle cx="94" cy="86" r="2.5" fill="#F59E0B" />

            {/* Sparkle Stars */}
            <path
              d="M 22 10 L 24 16 L 30 18 L 24 20 L 22 26 L 20 20 L 14 18 L 20 16 Z"
              fill="#FBBF24"
            />
            <path
              d="M 98 12 L 100 17 L 105 18.5 L 100 20 L 98 25 L 96 20 L 91 18.5 L 96 17 Z"
              fill="#FBBF24"
            />
          </g>
        )}

        {/* ================= RESTING ZZZ (Resting State) ================= */}
        {state === "resting" && (
          <g opacity="0.75" className="animate-pulse">
            <text x="86" y="28" fill="#64748B" fontSize="9" fontWeight="bold" fontFamily="monospace">
              z
            </text>
            <text x="96" y="19" fill="#475569" fontSize="13" fontWeight="bold" fontFamily="monospace">
              Z
            </text>
            <path
              d="M 22 24 C 22 24 28 20 34 26"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ================= CROWN LEAVES ================= */}
        {state === "thriving" && (
          <g>
            {/* Left upright leaf */}
            <path
              d="M 56 34 C 44 26 30 18 36 10 C 48 8 56 22 58 32 Z"
              fill="url(#leafGrad)"
              stroke="#047857"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M 52 28 C 46 22 40 16 38 12" stroke="#047857" strokeWidth="0.8" strokeLinecap="round" />

            {/* Right upright leaf */}
            <path
              d="M 64 34 C 76 26 90 18 84 10 C 72 8 64 22 62 32 Z"
              fill="url(#leafGrad)"
              stroke="#047857"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M 68 28 C 74 22 80 16 82 12" stroke="#047857" strokeWidth="0.8" strokeLinecap="round" />

            {/* Center baby sprout */}
            <path
              d="M 59 31 C 57 24 58 18 60 16 C 62 18 63 24 61 31 Z"
              fill="#A7F3D0"
              stroke="#059669"
              strokeWidth="1"
            />
          </g>
        )}

        {state === "celebrating" && (
          <g>
            {/* High upright dancing leaves */}
            <path
              d="M 55 33 C 40 22 24 16 32 6 C 46 6 56 20 58 31 Z"
              fill="url(#leafGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
            <path
              d="M 65 33 C 80 22 96 16 88 6 C 74 6 64 20 62 31 Z"
              fill="url(#leafGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
            <path
              d="M 58 30 C 56 20 58 12 60 10 C 62 12 64 20 62 30 Z"
              fill="#FDE047"
              stroke="#EAB308"
              strokeWidth="1"
            />
          </g>
        )}

        {state === "thirsty" && (
          <g>
            {/* Left drooping leaf hanging down along pot rim */}
            <path
              d="M 54 36 C 42 36 26 44 22 58 C 24 66 36 62 48 46 Z"
              fill="url(#leafGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
            {/* Right drooping leaf hanging down */}
            <path
              d="M 66 36 C 78 36 94 44 98 58 C 96 66 84 62 72 46 Z"
              fill="url(#leafGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
          </g>
        )}

        {state === "resting" && (
          <g>
            {/* Soft gently curved resting leaves */}
            <path
              d="M 56 34 C 46 28 36 26 40 20 C 48 18 56 26 58 33 Z"
              fill="url(#leafGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
            <path
              d="M 64 34 C 74 28 84 26 80 20 C 72 18 64 26 62 33 Z"
              fill="url(#leafGrad)"
              stroke="#047857"
              strokeWidth="1.2"
            />
          </g>
        )}

        {/* ================= SPROUT BODY (HEAD) ================= */}
        <ellipse
          cx="60"
          cy="52"
          rx="25"
          ry="23"
          fill="url(#sproutGrad)"
          stroke="#047857"
          strokeWidth="1.5"
        />

        {/* Highlight on top of head */}
        <ellipse cx="54" cy="38" rx="8" ry="4" fill="#FFFFFF" opacity="0.25" />

        {/* ================= POT FEET ================= */}
        <rect x="42" y="103" width="9" height="7" rx="3.5" fill="#9C3D24" />
        <rect x="69" y="103" width="9" height="7" rx="3.5" fill="#9C3D24" />

        {/* ================= POT BODY ================= */}
        {/* Pot Base */}
        <path
          d="M 33 72 L 39 103 C 39 106 43 107 48 107 L 72 107 C 77 107 81 106 81 103 L 87 72 Z"
          fill="url(#potGrad)"
          stroke="#8A341D"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Soil inside pot */}
        <ellipse cx="60" cy="70" rx="27" ry="5.5" fill="url(#soilGrad)" />

        {/* Pot Rim */}
        <rect
          x="30"
          y="65"
          width="60"
          height="8.5"
          rx="4.25"
          fill="url(#rimGrad)"
          stroke="#8A341D"
          strokeWidth="1.5"
        />

        {/* Pot Rim Highlight */}
        <path d="M 36 67.5 L 84 67.5" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" strokeLinecap="round" />

        {/* ================= EYES & FACIAL EXPRESSIONS ================= */}
        {/* State: Thriving */}
        {state === "thriving" && (
          <g>
            {/* Left Eye */}
            <ellipse cx="51" cy="50" rx="3.5" ry="4.5" fill="#111827" />
            <circle cx="49.8" cy="48" r="1.6" fill="#FFFFFF" />
            <circle cx="52.4" cy="52" r="0.7" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="69" cy="50" rx="3.5" ry="4.5" fill="#111827" />
            <circle cx="67.8" cy="48" r="1.6" fill="#FFFFFF" />
            <circle cx="70.4" cy="52" r="0.7" fill="#FFFFFF" />

            {/* Rosy Blush Cheeks */}
            <ellipse cx="43" cy="55" rx="3.5" ry="2" fill="#F472B6" opacity="0.65" />
            <ellipse cx="77" cy="55" rx="3.5" ry="2" fill="#F472B6" opacity="0.65" />

            {/* Joyful Smile */}
            <path
              d="M 55 56 Q 60 62 65 56"
              stroke="#111827"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* State: Celebrating (Cool Sunglasses 😎 + Huge Grin) */}
        {state === "celebrating" && (
          <g>
            {/* Rosy cheeks under shades */}
            <ellipse cx="42" cy="56" rx="4" ry="2" fill="#F472B6" opacity="0.7" />
            <ellipse cx="78" cy="56" rx="4" ry="2" fill="#F472B6" opacity="0.7" />

            {/* Cool Sunglasses Frame */}
            {/* Bridge */}
            <rect x="56" y="47" width="8" height="3" rx="1.5" fill="#111827" />
            {/* Left Lens */}
            <path
              d="M 40 45 L 56 45 C 57 45 58 48 56 55 C 54 58 43 58 41 55 C 39 52 39 45 40 45 Z"
              fill="url(#shadesReflection)"
              stroke="#111827"
              strokeWidth="1.5"
            />
            {/* Right Lens */}
            <path
              d="M 64 45 L 80 45 C 81 45 81 52 79 55 C 77 58 66 58 64 55 C 62 48 63 45 64 45 Z"
              fill="url(#shadesReflection)"
              stroke="#111827"
              strokeWidth="1.5"
            />
            {/* White Specular Glint Streaks */}
            <path d="M 43 47 L 47 55" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
            <path d="M 67 47 L 71 55" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />

            {/* Wide Triumphant Grin with Pink Tongue */}
            <path
              d="M 53 59 Q 60 70 67 59 Z"
              fill="#DC2626"
              stroke="#111827"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M 56 65 Q 60 62 64 65" fill="#F472B6" />
          </g>
        )}

        {/* State: Thirsty (Pleading Eyes, Quivering Frown, Tear Droplet) */}
        {state === "thirsty" && (
          <g>
            {/* Sad Worried Eyebrows */}
            <path d="M 47 43 Q 51 46 54 44" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 66 44 Q 69 46 73 43" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Pleading Droopy Eyes */}
            <ellipse cx="51" cy="50" rx="3.2" ry="4" fill="#111827" />
            <circle cx="50" cy="48" r="1.2" fill="#FFFFFF" />
            <ellipse cx="69" cy="50" rx="3.2" ry="4" fill="#111827" />
            <circle cx="68" cy="48" r="1.2" fill="#FFFFFF" />

            {/* Pale Blue Cheeks */}
            <ellipse cx="43" cy="55" rx="3.2" ry="1.8" fill="#93C5FD" opacity="0.5" />
            <ellipse cx="77" cy="55" rx="3.2" ry="1.8" fill="#93C5FD" opacity="0.5" />

            {/* Quivering Pleading Mouth */}
            <path
              d="M 54 60 Q 57 57 60 60 Q 63 57 66 60"
              stroke="#111827"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Pulsing Blue Tear Droplet on Cheek */}
            <g className="animate-bounce">
              <path
                d="M 77 56 C 77 56 74 61 74 63 C 74 65.5 75.8 67.5 78 67.5 C 80.2 67.5 82 65.5 82 63 C 82 61 79 56 77 56 Z"
                fill="url(#tearGrad)"
                stroke="#0284C7"
                strokeWidth="0.8"
              />
              <circle cx="76.8" cy="62.5" r="0.7" fill="#FFFFFF" />
            </g>
          </g>
        )}

        {/* State: Resting (Peaceful Curved Closed Eyes ⌒ ⌒ + Gentle Smile) */}
        {state === "resting" && (
          <g>
            {/* Peaceful Closed Curved Eyes (⌒ ⌒) */}
            <path
              d="M 46 51 Q 51 46 56 51"
              stroke="#1F2937"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 64 51 Q 69 46 74 51"
              stroke="#1F2937"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Soft Sweet Blush */}
            <ellipse cx="43" cy="54" rx="3.5" ry="1.8" fill="#F472B6" opacity="0.5" />
            <ellipse cx="77" cy="54" rx="3.5" ry="1.8" fill="#F472B6" opacity="0.5" />

            {/* Peaceful Soft Smile */}
            <path
              d="M 56 58 Q 60 61 64 58"
              stroke="#1F2937"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  )
}

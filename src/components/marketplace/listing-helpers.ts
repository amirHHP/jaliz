import {
  ArrowLeftRight,
  Apple,
  Gift,
  LucideIcon,
  Scissors,
  Sprout,
  Tag,
  Wrench,
} from "lucide-react"

import { ListingMode, ListingType } from "@/lib/marketplace"

export const TYPE_ICON: Record<ListingType, LucideIcon> = {
  seed: Sprout,
  cutting: Scissors,
  tool: Wrench,
  produce: Apple,
}

export const MODE_ICON: Record<ListingMode, LucideIcon> = {
  sell: Tag,
  exchange: ArrowLeftRight,
  free: Gift,
}

export const TYPE_TRANSLATION_KEY: Record<ListingType, string> = {
  seed: "mp_type_seed",
  cutting: "mp_type_cutting",
  tool: "mp_type_tool",
  produce: "mp_type_produce",
}

export const MODE_TRANSLATION_KEY: Record<ListingMode, string> = {
  sell: "mp_mode_sell",
  exchange: "mp_mode_exchange",
  free: "mp_mode_free",
}

export const MODE_BADGE_CLASS: Record<ListingMode, string> = {
  sell: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  exchange: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  free: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
}

export function formatToman(amount: number, language: "en" | "fa"): string {
  const locale = language === "fa" ? "fa-IR" : "en-US"
  return new Intl.NumberFormat(locale).format(amount)
}

/** Build a `wa.me` URL for a phone number. Strips non-digits so users can
 * paste numbers in any local format. */
export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D+/g, "")
  const url = new URL(`https://wa.me/${digits}`)
  if (message) url.searchParams.set("text", message)
  return url.toString()
}

export function telLink(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "")
  return `tel:${digits}`
}

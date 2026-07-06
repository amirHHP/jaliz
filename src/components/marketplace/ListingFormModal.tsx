"use client"

import { FormEvent, useState } from "react"
import { Loader2, X } from "lucide-react"
import { track } from "@vercel/analytics"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { useMarketplace } from "@/components/MarketplaceProvider"
import {
  CreateListingInput,
  Listing,
  ListingMode,
  ListingType,
  LISTING_MODES,
  LISTING_TYPES,
} from "@/lib/marketplace"

import {
  MODE_TRANSLATION_KEY,
  TYPE_TRANSLATION_KEY,
} from "./listing-helpers"

interface ListingFormModalProps {
  onClose: () => void
  /** When provided, the modal acts as an editor for that listing. */
  editingListing?: Listing | null
  onSaved?: (listing: Listing) => void
}

const MAX_IMAGE_DIMENSION = 1200
const IMAGE_QUALITY = 0.75

/**
 * Modal form for creating or editing a marketplace listing.
 *
 * Mode-specific fields (price for sell, "exchange for" for exchange) appear
 * conditionally so the form never asks for irrelevant data.
 *
 * The component is unconditionally mounted by its parent — see the
 * `{showCreate && <ListingFormModal key=… />}` usage. The `key` should
 * change between "new" and an editing listing's id so React remounts and
 * our lazy state initializers pick the right defaults.
 */
export function ListingFormModal({
  onClose,
  editingListing = null,
  onSaved,
}: ListingFormModalProps) {
  const { t } = useLanguage()
  const { user, updateMyProfile } = useAuth()
  const { create, update } = useMarketplace()

  const isEditing = !!editingListing

  // Lazy initializers seed the form from `editingListing` on first mount.
  // Parent uses `key` so a new mount happens whenever the editing target
  // changes — that's why we don't need a sync-from-prop effect here.
  const [type, setType] = useState<ListingType>(editingListing?.type ?? "seed")
  const [mode, setMode] = useState<ListingMode>(editingListing?.mode ?? "sell")
  const [title, setTitle] = useState(editingListing?.title ?? "")
  const [description, setDescription] = useState(editingListing?.description ?? "")
  const [price, setPrice] = useState<string>(
    editingListing?.price !== undefined ? String(editingListing.price) : "",
  )
  const [exchangeFor, setExchangeFor] = useState(editingListing?.exchangeFor ?? "")
  const [location, setLocation] = useState(editingListing?.location ?? "")
  const [phone, setPhone] = useState(
    editingListing?.contactPhone ?? user?.phone ?? "",
  )
  const [image, setImage] = useState<string>(editingListing?.image ?? "")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Downscale large photos client-side so localStorage doesn't
        // explode and listings stay snappy to render.
        const canvas = document.createElement("canvas")
        let { width, height } = img
        if (width > height && width > MAX_IMAGE_DIMENSION) {
          height *= MAX_IMAGE_DIMENSION / width
          width = MAX_IMAGE_DIMENSION
        } else if (height > MAX_IMAGE_DIMENSION) {
          width *= MAX_IMAGE_DIMENSION / height
          height = MAX_IMAGE_DIMENSION
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height)
        setImage(canvas.toDataURL("image/jpeg", IMAGE_QUALITY))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !description.trim()) {
      setError(t("mp_form_error_required" as never))
      return
    }

    let parsedPrice: number | undefined
    if (mode === "sell") {
      const numeric = Number(price)
      if (!price || Number.isNaN(numeric) || numeric < 0) {
        setError(t("mp_form_error_price" as never))
        return
      }
      parsedPrice = numeric
    }

    if (!user) {
      // The callers gate this modal behind authentication, but stay defensive.
      setError(t("mp_form_error_generic" as never))
      return
    }

    const trimmedPhone = phone.trim()
    const input: CreateListingInput = {
      type,
      mode,
      title,
      description,
      price: parsedPrice,
      exchangeFor: mode === "exchange" ? exchangeFor : undefined,
      location,
      image: image || undefined,
      contactPhone: trimmedPhone || undefined,
    }

    setSubmitting(true)
    try {
      // Persist the phone on the user profile too, so future listings and
      // their tel:/wa.me links keep working even if the user removes the
      // number from this listing.
      if (trimmedPhone && trimmedPhone !== user.phone) {
        updateMyProfile({ phone: trimmedPhone })
      }

      const saved = isEditing
        ? await update(editingListing!.id, user.id, input)
        : await create(user.id, input)

      track(isEditing ? "Marketplace Listing Edited" : "Marketplace Listing Created", {
        type,
        mode,
      })

      onSaved?.(saved)
      onClose()
    } catch (err) {
      console.error(err)
      setError(t("mp_form_error_generic" as never))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing
              ? t("mp_form_edit_title" as never)
              : t("mp_form_create_title" as never)}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label={t("cancel" as never)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("mp_field_type" as never)}>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ListingType)}
                className={selectClass}
              >
                {LISTING_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(TYPE_TRANSLATION_KEY[tp] as never)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t("mp_field_mode" as never)}>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as ListingMode)}
                className={selectClass}
              >
                {LISTING_MODES.map((md) => (
                  <option key={md} value={md}>
                    {t(MODE_TRANSLATION_KEY[md] as never)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={t("mp_field_title_label" as never)} required>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("mp_field_title_ph" as never)}
              className={inputClass}
            />
          </Field>

          <Field label={t("mp_field_description_label" as never)} required>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("mp_field_description_ph" as never)}
              className={textareaClass}
            />
          </Field>

          {mode === "sell" && (
            <Field label={t("mp_field_price_label" as never)} required>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t("mp_field_price_ph" as never)}
                className={inputClass}
              />
            </Field>
          )}

          {mode === "exchange" && (
            <Field label={t("mp_field_exchange_for_label" as never)}>
              <input
                value={exchangeFor}
                onChange={(e) => setExchangeFor(e.target.value)}
                placeholder={t("mp_field_exchange_for_ph" as never)}
                className={inputClass}
              />
            </Field>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("mp_field_location_label" as never)}>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("mp_field_location_ph" as never)}
                className={inputClass}
              />
            </Field>

            <Field
              label={t("mp_field_phone_label" as never)}
              hint={t("mp_field_phone_hint" as never)}
            >
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("mp_field_phone_ph" as never)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label={t("mp_field_image_label" as never)}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium file:px-3 file:py-1 file:rounded-md file:mr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {image && (
              <div className="mt-3 h-40 w-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </Field>

          {error && (
            <div
              role="alert"
              className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-600"
            >
              {t("cancel" as never)}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing
                ? t("mp_form_submit_save" as never)
                : t("mp_form_submit_create" as never)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"

const textareaClass =
  "flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"

const selectClass =
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"

interface FieldProps {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}

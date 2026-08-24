"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/LanguageProvider"
import {
  Check,
  Droplets,
  Image as ImageIcon,
  Leaf,
  Loader2,
  MapPin,
  MessageSquarePlus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getSharedProfileAction,
  sharedMarkWateredAction,
  sharedMarkAllWateredAction,
  sharedAddStatusLogAction,
  type SharedPlant,
  type SharedProfile,
} from "@/app/actions/plant-share"
import { plantNeedsWater } from "@/lib/watering"

interface Props {
  token: string
  initialProfile: SharedProfile
}

const HEALTH_KEYS: Record<
  string,
  "health_excellent" | "health_good" | "health_needs_attention"
> = {
  Excellent: "health_excellent",
  Good: "health_good",
  "Needs Attention": "health_needs_attention",
}

function healthBadgeClass(health: string) {
  return health === "Excellent"
    ? "bg-emerald-50/90 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"
    : health === "Good"
      ? "bg-amber-50/90 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
      : "bg-rose-50/90 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
}

export function SharedPlantsView({ token, initialProfile }: Props) {
  const { t, language } = useLanguage()
  const [plants, setPlants] = useState<SharedPlant[]>(initialProfile.plants)
  const [wateringId, setWateringId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const [logPlant, setLogPlant] = useState<SharedPlant | null>(null)
  const [logStatus, setLogStatus] = useState("")
  const [logHealth, setLogHealth] = useState("Good")
  const [logImage, setLogImage] = useState<string | null>(null)
  const [submittingLog, setSubmittingLog] = useState(false)

  const ownerName =
    initialProfile.ownerName ||
    (language === "fa" ? "دوست ما" : "our friend")

  // Fixed server timestamp keeps render pure and avoids hydration mismatches
  const now = useMemo(() => new Date(initialProfile.nowIso), [initialProfile.nowIso])

  const needsWaterPlants = useMemo(
    () => plants.filter((p) => plantNeedsWater(p, now)),
    [plants, now]
  )
  const happyPlants = useMemo(
    () => plants.filter((p) => !plantNeedsWater(p, now)),
    [plants, now]
  )

  const refresh = async () => {
    try {
      const fresh = await getSharedProfileAction(token)
      if (fresh) setPlants(fresh.plants)
    } catch (e) {
      console.error(e)
    }
  }

  const showNotice = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(null), 2500)
  }

  const handleWaterOne = async (plantId: string) => {
    setWateringId(plantId)
    try {
      const updated = await sharedMarkWateredAction(token, plantId)
      if (updated) {
        setPlants((prev) =>
          prev.map((p) =>
            p.id === updated.id
              ? {
                  ...p,
                  lastWatered: updated.lastWatered,
                  nextWateringDate: updated.nextWateringDate,
                  health: updated.health,
                }
              : p
          )
        )
        showNotice(t("guest_watered_saved"))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setWateringId(null)
    }
  }

  const handleWaterAll = async () => {
    setMarkingAll(true)
    try {
      await sharedMarkAllWateredAction(token)
      await refresh()
      showNotice(t("guest_watered_saved"))
    } catch (e) {
      console.error(e)
    } finally {
      setMarkingAll(false)
    }
  }

  const openLogModal = (plant: SharedPlant) => {
    setLogPlant(plant)
    setLogStatus("")
    setLogHealth(plant.health || "Good")
    setLogImage(null)
  }

  const handleLogImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX = 560
        let w = img.width
        let h = img.height
        if (w > h ? w > MAX : h > MAX) {
          if (w > h) {
            h *= MAX / w
            w = MAX
          } else {
            w *= MAX / h
            h = MAX
          }
        }
        canvas.width = w
        canvas.height = h
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h)
        setLogImage(canvas.toDataURL("image/jpeg", 0.62))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitLog = async () => {
    if (!logPlant || !logStatus.trim()) return
    setSubmittingLog(true)
    try {
      const result = await sharedAddStatusLogAction(
        token,
        logPlant.id,
        logStatus.trim(),
        logHealth,
        logImage || null
      )
      if (result && result.ok) {
        setPlants((prev) =>
          prev.map((p) => (p.id === logPlant.id ? { ...p, health: logHealth } : p))
        )
        setLogPlant(null)
        showNotice(t("guest_update_saved"))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmittingLog(false)
    }
  }

  const wateringText = (p: SharedPlant) => {
    const lastWateredText = p.lastWatered
      ? (() => {
          const daysAgo = Math.floor(
            (now.getTime() - new Date(p.lastWatered).getTime()) / (1000 * 3600 * 24)
          )
          return daysAgo === 0 ? t("watered_today") : `${daysAgo} ${t("watered_days_ago")}`
        })()
      : language === "fa"
        ? "بدون سابقه آبیاری"
        : "Never watered"

    if (!p.nextWateringDate) return lastWateredText
    const diffDays = Math.ceil(
      (new Date(p.nextWateringDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    )
    let nextText: string
    if (language === "fa") {
      nextText =
        diffDays < 0
          ? `${Math.abs(diffDays)} روز تأخیر`
          : diffDays === 0
            ? "امروز"
            : diffDays === 1
              ? "فردا"
              : `${diffDays} روز دیگر`
    } else {
      nextText =
        diffDays < 0
          ? `${Math.abs(diffDays)} days overdue`
          : diffDays === 0
            ? "Today"
            : diffDays === 1
              ? "Tomorrow"
              : `in ${diffDays} days`
    }
    return `${lastWateredText} (${language === "fa" ? `آبیاری بعدی: ${nextText}` : `Next: ${nextText}`})`
  }

  return (
    <div className="page-shell">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Guest header */}
        <div className="mb-8 rounded-3xl border border-emerald-100/60 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-sky-950/30 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/50 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              <Leaf className="h-3 w-3" />
              {t("guest_badge")}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-950 dark:text-emerald-100 tracking-tight">
              {t("guest_plants_of").replace("{name}", ownerName)}
            </h1>
            <p className="text-sm font-medium text-emerald-700/80 dark:text-emerald-300/80">
              {t("guest_subtitle")}
            </p>
            {initialProfile.expiresAt && (
              <p className="text-[11px] font-medium text-emerald-600/60 dark:text-emerald-400/60">
                {t("share_active_until").replace(
                  "{date}",
                  new Date(initialProfile.expiresAt).toLocaleDateString(
                    language === "fa" ? "fa-IR" : "en-US"
                  )
                )}
              </p>
            )}
          </div>
        </div>

        {notice && (
          <div className="mb-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/50 px-4 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-200 animate-slide-up">
            {notice}
          </div>
        )}

        {/* Needs water */}
        {needsWaterPlants.length > 0 && (
          <section className="mb-8 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-6 relative overflow-hidden">
            <h3 className="font-bold text-xl text-emerald-800 dark:text-emerald-200 flex items-center gap-2 mb-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/60 p-2 rounded-2xl">
                <Droplets className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
              </div>
              {t("guest_needs_water_title")}
            </h3>
            <p className="text-emerald-700/80 dark:text-emerald-300/80 text-sm mb-4 font-medium">
              {language === "fa"
                ? `${new Intl.NumberFormat("fa-IR").format(needsWaterPlants.length)} گیاه از ${new Intl.NumberFormat("fa-IR").format(plants.length)} گیاه منتظر آب هستند.`
                : `${needsWaterPlants.length} of ${plants.length} plants are waiting for water.`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {needsWaterPlants.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-sm border border-emerald-100/50 dark:border-emerald-900/50 p-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-50 dark:ring-emerald-900" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-300 text-sm font-black uppercase">
                      {p.name.substring(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-emerald-900 dark:text-emerald-100">{p.name}</div>
                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 truncate mt-0.5 font-medium">
                      {wateringText(p)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1 shrink-0"
                    disabled={wateringId === p.id}
                    onClick={() => void handleWaterOne(p.id)}
                  >
                    {wateringId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Droplets className="h-3.5 w-3.5" />
                    )}
                    <span>{t("guest_mark_watered")}</span>
                  </Button>
                </div>
              ))}
            </div>
            <div className="pt-4 flex justify-center">
              <Button
                onClick={() => void handleWaterAll()}
                disabled={markingAll}
                className="group w-full sm:w-auto min-w-[220px]"
              >
                {markingAll ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                )}
                <span>{t("guest_mark_all_done")}</span>
              </Button>
            </div>
          </section>
        )}

        {/* Happy plants */}
        {happyPlants.length > 0 && (
          <section className="mb-8">
            <h3 className="text-sm font-bold text-emerald-600/70 dark:text-emerald-400/70 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              {t("guest_all_good_title")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {happyPlants.map((p) => (
                <div key={p.id} className="bg-white/50 dark:bg-slate-900/50 border border-emerald-100 dark:border-emerald-900 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  {p.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All plants grid */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {plants.map((plant) => (
              <div
                key={plant.id}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-border bg-card hover:-translate-y-1 flex flex-col rounded-2xl"
              >
                <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-b border-border shrink-0">
                  {plant.image ? (
                    <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                      <ImageIcon className="h-12 w-12 mb-2 opacity-60" />
                      <span className="text-xs font-medium uppercase tracking-wider">No Photo</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center text-[10px] font-bold border px-2 py-1 rounded-md shadow-sm backdrop-blur-sm ${healthBadgeClass(plant.health)}`}>
                      {t(HEALTH_KEYS[plant.health] ?? "health_good")}
                    </span>
                  </div>
                  {!plantNeedsWater(plant, now) && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500/90 text-white shadow-md">
                        <Check className="h-4 w-4" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-3 sm:p-4 grow flex flex-col">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-card-foreground leading-tight truncate">
                      {plant.name}
                    </h4>
                    <div className="space-y-1.5 text-[10px] sm:text-xs pt-1.5">
                      <div className="flex items-start text-muted">
                        <MapPin className="h-3.5 w-3.5 shrink-0 me-1.5 mt-0.5 text-indigo-400" />
                        <span className="font-medium">
                          {plant.locationType === "Outdoor" ? t("location_outdoor") : t("location_indoor")}
                        </span>
                      </div>
                      <div className="flex items-start text-muted">
                        <Droplets className="h-3.5 w-3.5 shrink-0 me-1.5 mt-0.5 text-sky-500" />
                        <span className="font-medium">{wateringText(plant)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant={plantNeedsWater(plant, now) ? "default" : "outline"}
                      className="grow gap-1 text-xs"
                      disabled={wateringId === plant.id}
                      onClick={() => void handleWaterOne(plant.id)}
                    >
                      {wateringId === plant.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Droplets className="h-3.5 w-3.5" />
                      )}
                      <span>{t("guest_mark_watered")}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs border border-border"
                      onClick={() => openLogModal(plant)}
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5" />
                      <span>{t("guest_add_update")}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-muted">
          {t("guest_owner_hint").replace("{name}", ownerName)}{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">
            {language === "fa" ? "ورود" : "Sign in"}
          </Link>
        </p>
      </main>

      {/* Status update modal */}
      {logPlant && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => !submittingLog && setLogPlant(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-300"
            dir="auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                {logPlant.image ? (
                  <img src={logPlant.image} alt={logPlant.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-50 dark:ring-emerald-900" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-emerald-600" />
                  </div>
                )}
                <h3 className="font-bold text-card-foreground">{logPlant.name}</h3>
              </div>
              <button
                aria-label="close"
                className="rounded-full p-1.5 text-muted hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => !submittingLog && setLogPlant(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={logStatus}
              onChange={(e) => setLogStatus(e.target.value)}
              placeholder={t("guest_update_ph")}
              rows={3}
              maxLength={2000}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />

            <div className="mt-3 space-y-1.5">
              <label className="text-xs font-bold text-muted">{t("health_status")}</label>
              <select
                value={logHealth}
                onChange={(e) => setLogHealth(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-card-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                <option value="Excellent">{t("health_excellent")}</option>
                <option value="Good">{t("health_good")}</option>
                <option value="Needs Attention">{t("health_needs_attention")}</option>
              </select>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{logImage ? "✓" : t("plant_image")}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogImageChange} />
              </label>
              {logImage && (
                <img src={logImage} alt="" className="h-11 w-11 rounded-lg object-cover border border-border" />
              )}
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Button
                className="grow gap-2"
                disabled={!logStatus.trim() || submittingLog}
                onClick={() => void handleSubmitLog()}
              >
                {submittingLog ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>{t("guest_submit_update")}</span>
              </Button>
              <Button variant="ghost" disabled={submittingLog} onClick={() => setLogPlant(null)}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { useLanguage } from "@/components/LanguageProvider"
import {
  Copy,
  Check,
  Link2,
  Loader2,
  RefreshCw,
  Share2,
  ShieldOff,
  Plane,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getMyPlantShareAction,
  savePlantShareAction,
  revokePlantShareAction,
  type PlantShareInfo,
} from "@/app/actions/plant-share"

type ExpiryChoice = "7" | "14" | "30" | "never"

export function ShareProfileDialog() {
  const { t, language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [share, setShare] = useState<PlantShareInfo | null>(null)
  const [expiry, setExpiry] = useState<ExpiryChoice>("14")
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmingRevoke, setConfirmingRevoke] = useState(false)

  const loadShare = useCallback(async () => {
    setLoading(true)
    try {
      const info = await getMyPlantShareAction()
      setShare(info && info.token ? info : null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      setNotice(null)
      setCopied(false)
      setConfirmingRevoke(false)
      void loadShare()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [open, loadShare])

  if (!open) {
    return (
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Plane className="h-4 w-4" />
        {t("share_profile")}
      </Button>
    )
  }

  const shareUrl = share ? `${window.location.origin}/share/${share.token}` : ""

  const handleCreate = async () => {
    setBusy(true)
    setNotice(null)
    try {
      const days = expiry === "never" ? null : Number(expiry)
      const result = await savePlantShareAction(days)
      if (result.ok) {
        setShare(result.share)
      } else {
        setNotice(
          result.reason === "db_schema"
            ? t("share_error_db_schema")
            : t("share_error_generic")
        )
      }
    } catch (e) {
      console.error(e)
      setNotice(t("share_error_generic"))
    } finally {
      setBusy(false)
    }
  }

  const handleRevoke = async () => {
    setBusy(true)
    setNotice(null)
    try {
      await revokePlantShareAction()
      setShare(null)
      setConfirmingRevoke(false)
      setNotice(t("share_revoked"))
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-300"
        dir="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 p-2.5 shrink-0">
            <Plane className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-card-foreground leading-snug">
              {t("share_profile_title")}
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {t("share_profile_desc")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : share ? (
          <div className="space-y-4">
            {notice && (
              <p className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-300">
                {notice}
              </p>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted">
                {t("share_link_label")}
              </label>
              <div className="flex items-center gap-2">
                <div className="grow min-w-0 flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 px-3 py-2.5">
                  <Link2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="truncate text-xs font-medium text-emerald-900 dark:text-emerald-100" dir="ltr">
                    {shareUrl}
                  </span>
                </div>
                <Button size="sm" variant="secondary" className="gap-1.5 shrink-0" onClick={() => void handleCopy()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? t("share_copied") : t("share_copy_link")}</span>
                </Button>
              </div>
              <p className="text-[11px] text-muted mt-1">
                {share.expiresAt
                  ? t("share_active_until").replace(
                      "{date}",
                      new Date(share.expiresAt).toLocaleDateString(language === "fa" ? "fa-IR" : "en-US")
                    )
                  : t("share_no_expiry_note")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={handleCreate}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                <span>{t("share_regenerate")}</span>
              </Button>
              {confirmingRevoke ? (
                <Button size="sm" variant="destructive" className="gap-1.5" disabled={busy} onClick={handleRevoke}>
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
                  <span>{t("share_revoke")}؟</span>
                </Button>
              ) : (
                <Button size="sm" variant="ghost" className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40" onClick={() => setConfirmingRevoke(true)}>
                  <ShieldOff className="h-3.5 w-3.5" />
                  <span>{t("share_revoke")}</span>
                </Button>
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-muted border-t border-border pt-3">
              {t("share_profile_desc")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notice && (
              <p className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                {notice}
              </p>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted">{t("share_expiry_label")}</label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value as ExpiryChoice)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-card-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                <option value="7">{t("share_expiry_1w")}</option>
                <option value="14">{t("share_expiry_2w")}</option>
                <option value="30">{t("share_expiry_1m")}</option>
                <option value="never">{t("share_expiry_never")}</option>
              </select>
            </div>
            <Button className="w-full gap-2" disabled={busy} onClick={handleCreate}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              <span>{t("share_create_link")}</span>
            </Button>
            <p className="text-[11px] text-center text-muted">
              {expiry === "never" ? t("share_no_expiry_note") : ""}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Search,
  Shield,
  ShieldOff,
  Sparkles,
  Trash2,
  User as UserIcon,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  UserX,
  X,
  Key,
  Globe,
} from "lucide-react"

import { Header } from "@/components/Header"
import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { Button } from "@/components/ui/button"
import { authErrorTranslationKey } from "@/lib/auth"
import type { AdminCreateUserInput, AdminUpdateUserInput, User, UserRole } from "@/lib/auth/types"
import { getAiConfig, setGlobalSetting, getAllProviderKeys } from "@/app/actions/settings"
import { fetchModelsAction } from "@/app/actions/ai"

interface ResetTarget {
  id: string
  name: string
}

export default function AdminPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const {
    status,
    user: currentUser,
    isAdmin,
    createUser,
    updateUser,
    updateUserRole,
    setUserActive,
    deleteUser,
    resetPassword,
    users,
    refreshUsers,
  } = useAuth()

  const [search, setSearch] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  // AI API key state — separate keys per provider
  const [aiProvider, setAiProvider] = useState<"gemini" | "sotoon" | "gapgpt">("gemini")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [sotoonApiKey, setSotoonApiKey] = useState("")
  const [gapgptApiKey, setGapgptApiKey] = useState("")
  const aiApiKey = aiProvider === "gemini" ? geminiApiKey : aiProvider === "sotoon" ? sotoonApiKey : gapgptApiKey
  const setAiApiKey = aiProvider === "gemini" ? setGeminiApiKey : aiProvider === "sotoon" ? setSotoonApiKey : setGapgptApiKey
  const [aiModels, setAiModels] = useState<{name: string; inputTokenLimit: number; outputTokenLimit: number}[]>([])
  const [aiSelectedModel, setAiSelectedModel] = useState("")
  const [aiModelSearch, setAiModelSearch] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSaved, setAiSaved] = useState(false)

  // Load existing AI settings on mount — per-provider keys
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getAiConfig()
        const keys = await getAllProviderKeys()

        if (config.provider) setAiProvider(config.provider as "gemini" | "sotoon" | "gapgpt")

        // Load each provider's key independently
        if (keys.geminiKey) setGeminiApiKey(keys.geminiKey)
        if (keys.sotoonKey) setSotoonApiKey(keys.sotoonKey)
        if (keys.gapgptKey) setGapgptApiKey(keys.gapgptKey)

        // Set selected model for current provider
        if (config.provider === "sotoon" && keys.sotoonModel) {
          setAiSelectedModel(keys.sotoonModel)
        } else if (config.provider === "gapgpt" && keys.gapgptModel) {
          setAiSelectedModel(keys.gapgptModel)
        } else if (keys.geminiModel) {
          setAiSelectedModel(keys.geminiModel)
        }

        // Also check localStorage for cache
        const cacheKey = `jaliz-models-cache-${config.provider || "gemini"}`
        const storedModels = localStorage.getItem(cacheKey)
        if (storedModels) {
          try { setAiModels(JSON.parse(storedModels)) } catch {}
        }
      } catch (err) {
        console.error("Failed to load AI config", err)
      }
    }
    loadConfig()
  }, [])

  const fetchAiModels = async (keyOverride?: string, providerOverride?: string) => {
    const key = keyOverride || aiApiKey.trim()
    const provider = providerOverride || aiProvider

    if (!key) return
    setAiLoading(true)
    setAiError(null)
    setAiSaved(false)
    try {
      const data = await fetchModelsAction(key, provider)
      if (data.models && data.models.length > 0) {
        setAiModels(data.models)
        localStorage.setItem(`jaliz-models-cache-${provider}`, JSON.stringify(data.models))

        // Update selected model if current one is invalid or not set
        const currentModel = aiSelectedModel
        if (!currentModel || !data.models.find((m: {name:string}) => m.name === currentModel)) {
          setAiSelectedModel(data.models[0].name)
        }
      } else {
        throw new Error("No compatible models found.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching models"
      setAiError(msg)
      // Don't clear models if we have cached ones, unless it's a 401
      if (msg.includes("401") || msg.includes("key")) {
        setAiModels([])
      }
    } finally {
      setAiLoading(false)
    }
  }

  // When provider changes, load cached models and selected model for that provider
  useEffect(() => {
    const key = aiProvider === "gemini" ? geminiApiKey : aiProvider === "sotoon" ? sotoonApiKey : gapgptApiKey
    setAiModels([])
    setAiSelectedModel("")

    // Restore cached models for this provider
    const cacheKey = `jaliz-models-cache-${aiProvider}`
    const storedModels = localStorage.getItem(cacheKey)
    if (storedModels) {
      try { setAiModels(JSON.parse(storedModels)) } catch {}
    }

    // Restore selected model for this provider
    async function loadProviderModel() {
      try {
        const keys = await getAllProviderKeys()
        const model = aiProvider === "gemini" ? keys.geminiModel : aiProvider === "sotoon" ? keys.sotoonModel : keys.gapgptModel
        if (model) setAiSelectedModel(model)
      } catch {}
    }
    loadProviderModel()

    // Auto-fetch models if key is available
    if (key && key.trim().length > 10) {
      const timer = setTimeout(() => {
        fetchAiModels(key, aiProvider)
      }, 500)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiProvider])

  const handleAiSave = async () => {
    if (!aiApiKey.trim()) return
    setAiLoading(true)
    try {
      await setGlobalSetting("ai-provider", aiProvider)
      // Save key to provider-specific setting
      await setGlobalSetting(`ai-api-key-${aiProvider}`, aiApiKey.trim())
      if (aiSelectedModel) {
        await setGlobalSetting(`ai-model-${aiProvider}`, aiSelectedModel)
      }

      setAiSaved(true)
      setTimeout(() => setAiSaved(false), 3000)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setAiLoading(false)
    }
  }

  // Load users when admin is authenticated
  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      refreshUsers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isAdmin])

  // Redirect anonymous users to login. We don't redirect *signed-in*
  // non-admins so we can show a nicer "admin only" message instead of
  // bouncing them silently.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/admin")
    }
  }, [status, router])

  const filteredAiModels = useMemo(() => {
    if (!aiModelSearch.trim()) return aiModels
    const q = aiModelSearch.toLowerCase()
    return aiModels.filter(m => m.name.toLowerCase().includes(q))
  }, [aiModels, aiModelSearch])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q),
    )
  }, [search, users])

  const totals = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      admins: users.filter((u) => u.role === "admin").length,
    }),
    [users],
  )

  const safeRun = async (fn: () => Promise<unknown>) => {
    setActionError(null)
    try {
      await fn()
      await refreshUsers()
    } catch (err) {
      setActionError(authErrorTranslationKey(err))
    }
  }

  const handleRoleChange = (id: string, role: UserRole) => {
    safeRun(() => updateUserRole(id, role))
  }

  const handleToggleActive = (u: User) => {
    safeRun(() => setUserActive(u.id, !u.isActive))
  }

  const handleDelete = (u: User) => {
    const confirmed = window.confirm(t("admin_confirm_delete"))
    if (!confirmed) return
    safeRun(() => deleteUser(u.id))
  }

  // Loading or auth-redirect states.
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </main>
      </div>
    )
  }

  if (status === "authenticated" && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">
              {t("admin_only")}
            </h1>
            <p className="text-slate-500 text-sm mb-6">{t("auth_required")}</p>
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {t("go_home")}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("admin_panel")}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t("admin_title")}
          </h1>
          <p className="text-slate-500 mt-1">{t("admin_desc")}</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<Users className="h-5 w-5 text-slate-500" />}
            label={t("admin_total_users")}
            value={totals.total}
          />
          <StatCard
            icon={<UserCheck className="h-5 w-5 text-emerald-500" />}
            label={t("admin_active_users")}
            value={totals.active}
          />
          <StatCard
            icon={<Shield className="h-5 w-5 text-emerald-700" />}
            label={t("admin_admins")}
            value={totals.admins}
          />
        </div>

        {/* AI API Configuration */}
        <div className="bg-white border border-emerald-200 rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">{t("admin_ai_title")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t("admin_ai_desc")}</p>
            </div>
            {aiApiKey && (
              <span className="ms-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                {language === "fa" ? "فعال" : "Active"}
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Provider selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-600" />
                {t("admin_ai_provider_label")}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setAiProvider("sotoon"); setAiSaved(false) }}
                  className={`flex-1 h-10 rounded-lg border text-sm font-medium transition ${
                    aiProvider === "sotoon"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🇮🇷 {t("admin_ai_provider_sotoon")}
                </button>
                <button
                  type="button"
                  onClick={() => { setAiProvider("gapgpt"); setAiSaved(false) }}
                  className={`flex-1 h-10 rounded-lg border text-sm font-medium transition ${
                    aiProvider === "gapgpt"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  💬 {t("admin_ai_provider_gapgpt")}
                </button>
                <button
                  type="button"
                  onClick={() => { setAiProvider("gemini"); setAiSaved(false) }}
                  className={`flex-1 h-10 rounded-lg border text-sm font-medium transition ${
                    aiProvider === "gemini"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🔮 Google Gemini
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {aiProvider === "sotoon" ? t("admin_ai_provider_sotoon_hint") : aiProvider === "gapgpt" ? t("admin_ai_provider_gapgpt_hint") : t("admin_ai_provider_gemini_hint")}
              </p>
            </div>

            {/* API Key row */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-emerald-600" />
                {t("admin_ai_key_label")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={aiApiKey}
                  onChange={(e) => { setAiApiKey(e.target.value); setAiSaved(false) }}
                  placeholder={aiProvider === "gemini" ? t("admin_ai_key_ph") : aiProvider === "sotoon" ? t("admin_ai_key_ph_sotoon") : t("admin_ai_key_ph_gapgpt")}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => fetchAiModels()}
                  disabled={aiLoading || !aiApiKey.trim()}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  {t("admin_ai_fetch_models")}
                </button>
              </div>
              {aiError && (
                <p className="text-xs text-red-500 mt-1">
                  {(() => {
                    try {
                      const parsed = JSON.parse(aiError);
                      if (Array.isArray(parsed)) return parsed.map(e => e.msg || JSON.stringify(e)).join(", ");
                      return aiError;
                    } catch {
                      return aiError;
                    }
                  })()}
                </p>
              )}
            </div>

            {/* Model selector */}
            {aiModels.length > 0 && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                  {t("admin_ai_select_model")}
                  <span className="text-[10px] text-slate-400 font-normal">{aiModels.length} models</span>
                </label>

                <div className="relative group">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    value={aiModelSearch}
                    onChange={(e) => setAiModelSearch(e.target.value)}
                    placeholder={language === "fa" ? "جستجوی مدل..." : "Search models..."}
                    className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50 ps-9 pe-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition mb-2"
                  />
                </div>

                <select
                  value={aiSelectedModel}
                  onChange={(e) => setAiSelectedModel(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {filteredAiModels.length > 0 ? (
                    filteredAiModels.map(m => (
                      <option key={m.name} value={m.name}>
                        {m.name.replace("models/", "")}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>{language === "fa" ? "مدلی یافت نشد" : "No models found"}</option>
                  )}
                </select>
                {aiModelSearch && filteredAiModels.length > 0 && (
                  <p className="text-[10px] text-emerald-600 mt-1">
                    {language === "fa" ? `نمایش ${filteredAiModels.length} مدل فیلتر شده` : `Showing ${filteredAiModels.length} filtered models`}
                  </p>
                )}
              </div>
            )}

            {/* Save row */}
            <div className="flex items-center justify-between pt-1">
              <div>
                {aiSaved && (
                  <span className="text-emerald-600 text-sm flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("admin_ai_saved")}
                  </span>
                )}
                {!aiApiKey && !aiSaved && (
                  <span className="text-slate-400 text-xs">{t("admin_ai_no_key")}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAiSave}
                disabled={!aiApiKey.trim()}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                <Key className="h-4 w-4" />
                {t("admin_ai_save")}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin_search_ph")}
                className="w-full h-10 ps-9 pe-3 rounded-md border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {t("admin_create_user_btn")}
            </Button>
          </div>

          {actionError && (
            <div
              role="alert"
              className="mx-4 mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(actionError as any)}
            </div>
          )}
          {flash && (
            <div
              role="status"
              className="mx-4 mt-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-3 py-2 flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {flash}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-start font-semibold px-4 py-3">{t("admin_col_user")}</th>
                  <th className="text-start font-semibold px-4 py-3">{t("admin_col_role")}</th>
                  <th className="text-start font-semibold px-4 py-3">{t("admin_col_status")}</th>
                  <th className="text-start font-semibold px-4 py-3">{t("admin_col_joined")}</th>
                  <th className="text-end font-semibold px-4 py-3">{t("admin_col_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      {t("admin_no_users")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const isSelf = u.id === currentUser?.id
                    return (
                      <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                              <UserIcon className="h-5 w-5 text-emerald-700" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 truncate">
                                {u.fullName}{" "}
                                {isSelf && (
                                  <span className="text-xs text-slate-400 font-normal">
                                    {t("you_label")}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isSelf ? t("admin_self_warning") : undefined}
                          >
                            <option value="user">{t("admin_role_user")}</option>
                            <option value="admin">{t("admin_role_admin")}</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                              u.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {u.isActive ? t("admin_status_active") : t("admin_status_inactive")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(u.createdAt).toLocaleDateString(
                            language === "fa" ? "fa-IR" : undefined,
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <IconButton
                              title={t("admin_action_edit")}
                              onClick={() => setEditTarget(u)}
                            >
                              <Pencil className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              title={t("admin_action_reset")}
                              onClick={() =>
                                setResetTarget({ id: u.id, name: u.fullName })
                              }
                            >
                              <KeyRound className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              title={
                                u.isActive
                                  ? t("admin_action_deactivate")
                                  : t("admin_action_activate")
                              }
                              disabled={isSelf}
                              onClick={() => handleToggleActive(u)}
                            >
                              {u.isActive ? (
                                <ShieldOff className="h-4 w-4" />
                              ) : (
                                <UserCog className="h-4 w-4" />
                              )}
                            </IconButton>
                            <IconButton
                              variant="danger"
                              title={t("admin_action_delete")}
                              disabled={isSelf}
                              onClick={() => handleDelete(u)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {currentUser && filtered.some((u) => u.id === currentUser.id) && (
          <p className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
            <UserX className="h-3.5 w-3.5" />
            {t("admin_self_warning")}
          </p>
        )}
      </main>

      {createOpen && (
        <UserFormModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSubmit={async (input) => {
            try {
              await createUser(input as AdminCreateUserInput)
              await refreshUsers()
              setCreateOpen(false)
              setFlash(t("admin_create_success"))
              setTimeout(() => setFlash(null), 3000)
              return null
            } catch (err) {
              return authErrorTranslationKey(err)
            }
          }}
        />
      )}

      {editTarget && (
        <UserFormModal
          mode="edit"
          user={editTarget}
          currentUserId={currentUser?.id}
          onClose={() => setEditTarget(null)}
          onSubmit={async (input) => {
            try {
              await updateUser(editTarget.id, input as AdminUpdateUserInput)
              await refreshUsers()
              setEditTarget(null)
              setFlash(t("admin_update_success"))
              setTimeout(() => setFlash(null), 3000)
              return null
            } catch (err) {
              return authErrorTranslationKey(err)
            }
          }}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          target={resetTarget}
          onClose={() => setResetTarget(null)}
          onSubmit={async (newPassword) => {
            try {
              await resetPassword(resetTarget.id, newPassword)
              setResetTarget(null)
              setFlash(t("admin_reset_success"))
              setTimeout(() => setFlash(null), 3000)
              return null
            } catch (err) {
              return authErrorTranslationKey(err)
            }
          }}
        />
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

function IconButton({
  children,
  onClick,
  disabled,
  title,
  variant = "default",
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title?: string
  variant?: "default" | "danger"
}) {
  const base =
    "inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  const palette =
    variant === "danger"
      ? "text-red-500 hover:bg-red-50 hover:text-red-600"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${palette}`}
    >
      {children}
    </button>
  )
}

const formControlClass =
  "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 caret-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"

interface ResetPasswordModalProps {
  target: ResetTarget
  onClose: () => void
  /** Returns a translation key on error, or null on success. */
  onSubmit: (newPassword: string) => Promise<string | null>
}

type UserFormInput = AdminCreateUserInput | AdminUpdateUserInput

interface UserFormModalProps {
  mode: "create" | "edit"
  user?: User
  currentUserId?: string
  onClose: () => void
  /** Returns a translation key on error, or null on success. */
  onSubmit: (input: UserFormInput) => Promise<string | null>
}

function UserFormModal({ mode, user, currentUserId, onClose, onSubmit }: UserFormModalProps) {
  const { t } = useLanguage()
  const isCreate = mode === "create"
  const isSelf = user?.id === currentUserId
  const [fullName, setFullName] = useState(user?.fullName ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>(user?.role ?? "user")
  const [isActive, setIsActive] = useState(user?.isActive ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    (!isCreate || password.length >= 6) &&
    (!password || password.length >= 6)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setErrorKey(null)
    const input: UserFormInput = isCreate
      ? { fullName, email, password, role, isActive }
      : {
          fullName,
          email,
          ...(password ? { password } : {}),
          ...(!isSelf ? { role, isActive } : {}),
        }
    const err = await onSubmit(input)
    if (err) setErrorKey(err)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {isCreate ? (
              <UserPlus className="h-4 w-4 text-emerald-600" />
            ) : (
              <Pencil className="h-4 w-4 text-emerald-600" />
            )}
            <h2 className="text-base font-semibold text-slate-900">
              {isCreate ? t("admin_create_title") : t("admin_edit_title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label={t("cancel")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            {isCreate ? t("admin_create_desc") : t("admin_edit_desc")}
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t("full_name")}
              </label>
              <input
                type="text"
                autoFocus
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("full_name_ph")}
                className={formControlClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t("email")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email_ph")}
                className={formControlClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t("password")}
              </label>
              <input
                type="password"
                required={isCreate}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isCreate ? t("password_ph") : t("admin_password_optional")}
                className={formControlClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t("admin_col_role")}
              </label>
              <select
                value={role}
                disabled={isSelf}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={formControlClass}
              >
                <option value="user">{t("admin_role_user")}</option>
                <option value="admin">{t("admin_role_admin")}</option>
              </select>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                disabled={isSelf}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-emerald-600 disabled:opacity-50"
              />
              {t("admin_user_active")}
            </label>
          </div>

          {isSelf && (
            <p className="text-xs text-slate-400">{t("admin_self_warning")}</p>
          )}

          {errorKey && (
            <div
              role="alert"
              className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(errorKey as any)}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-600"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !canSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreate ? t("admin_create_user_btn") : t("admin_save_user")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ResetPasswordModal({ target, onClose, onSubmit }: ResetPasswordModalProps) {
  const { t } = useLanguage()
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorKey(null)
    const err = await onSubmit(password)
    if (err) setErrorKey(err)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">
              {t("admin_reset_title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label={t("cancel")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            {t("admin_reset_desc").replace("{name}", target.name)}
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {t("admin_reset_new_password")}
            </label>
            <input
              type="password"
              autoFocus
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password_ph")}
              className={formControlClass}
            />
          </div>
          {errorKey && (
            <div
              role="alert"
              className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(errorKey as any)}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-600"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting || password.length < 6}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("admin_reset_btn")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/LanguageProvider"
import { Header } from "@/components/Header"
import {
  ChevronLeft,
  ChevronRight,
  History,
  Sparkles,
  Bug,
  RefreshCw,
  Wrench,
  FileText,
  Palette,
  Zap,
  TestTube,
  Cog,
  Package,
  GitCommit,
  Calendar,
  Filter,
} from "lucide-react"

interface ChangelogEntry {
  hash: string
  shortHash: string
  date: string
  message: string
  messageFa: string
  fullMessage: string
  type: string
  typeFa: string
  typeEn: string
  scope: string | null
}

// Icon + color mapping per commit type
const TYPE_CONFIG: Record<
  string,
  { icon: typeof Sparkles; gradient: string; bg: string; text: string; border: string }
> = {
  feat: {
    icon: Sparkles,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
  fix: {
    icon: Bug,
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/50",
  },
  refactor: {
    icon: RefreshCw,
    gradient: "from-sky-500 to-blue-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-800/50",
  },
  chore: {
    icon: Wrench,
    gradient: "from-slate-400 to-slate-500",
    bg: "bg-slate-50 dark:bg-slate-800/30",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700/50",
  },
  docs: {
    icon: FileText,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800/50",
  },
  style: {
    icon: Palette,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  perf: {
    icon: Zap,
    gradient: "from-yellow-500 to-amber-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800/50",
  },
  test: {
    icon: TestTube,
    gradient: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800/50",
  },
  ci: {
    icon: Cog,
    gradient: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800/50",
  },
  build: {
    icon: Package,
    gradient: "from-teal-500 to-emerald-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800/50",
  },
  other: {
    icon: GitCommit,
    gradient: "from-slate-400 to-slate-500",
    bg: "bg-slate-50 dark:bg-slate-800/30",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700/50",
  },
}

/** Format ISO date → Farsi "۱۶ تیر ۱۴۰۵" using Intl */
function formatDateFa(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "persian",
  }).format(d)
}

/** Format ISO date → English "Jul 7, 2026" */
function formatDateEn(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d)
}

/** Group entries by month key (YYYY-MM) */
function groupByMonth(
  entries: ChangelogEntry[],
  isFa: boolean
): { key: string; label: string; entries: ChangelogEntry[] }[] {
  const map = new Map<string, ChangelogEntry[]>()
  for (const e of entries) {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const arr = map.get(key)
    if (arr) arr.push(e)
    else map.set(key, [e])
  }

  return Array.from(map.entries()).map(([key, entries]) => {
    const d = new Date(entries[0].date)
    const label = isFa
      ? new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "long",
          calendar: "persian",
        }).format(d)
      : new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
        }).format(d)
    return { key, label, entries }
  })
}

const ALL_TYPES = ["feat", "fix", "refactor", "chore", "docs", "style", "perf", "test", "ci", "build", "other"]

export default function ChangelogPage() {
  const { language } = useLanguage()
  const isRtl = language === "fa"

  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>("all")

  useEffect(() => {
    fetch("/changelog.json")
      .then((r) => r.json())
      .then((data: ChangelogEntry[]) => {
        setEntries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => (activeFilter === "all" ? entries : entries.filter((e) => e.type === activeFilter)),
    [entries, activeFilter]
  )

  const months = useMemo(() => groupByMonth(filtered, isRtl), [filtered, isRtl])

  // Collect available types from the data for filter chips
  const availableTypes = useMemo(() => {
    const set = new Set(entries.map((e) => e.type))
    return ALL_TYPES.filter((t) => set.has(t))
  }, [entries])

  const stats = useMemo(() => {
    const feats = entries.filter((e) => e.type === "feat").length
    const fixes = entries.filter((e) => e.type === "fix").length
    return { total: entries.length, feats, fixes }
  }, [entries])

  return (
    <div
      className="min-h-screen bg-[#fcfaf8] dark:bg-slate-950 selection:bg-emerald-200 selection:text-emerald-900 dark:selection:bg-emerald-800 dark:selection:text-emerald-100"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            {isRtl ? "خانه" : "Home"}
          </Link>
          {isRtl ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-slate-600 dark:text-slate-300">
            {isRtl ? "تاریخچه تغییرات" : "Changelog"}
          </span>
        </nav>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl shadow-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 sm:p-10">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-teal-100/30 dark:bg-teal-900/10 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <History className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2 text-center sm:text-start grow">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {isRtl ? "تاریخچه تغییرات جالیز" : "Jaliz Changelog"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                {isRtl
                  ? "تمام تغییرات، ویژگی‌های جدید و رفع مشکلات اپلیکیشن جالیز در یک نگاه"
                  : "All changes, new features, and bug fixes for the Jaliz app at a glance"}
              </p>
            </div>
          </div>

          {/* Stats */}
          {!loading && (
            <div className="relative mt-6 grid grid-cols-3 gap-3">
              {[
                {
                  label: isRtl ? "کل تغییرات" : "Total Changes",
                  value: stats.total,
                  color: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  label: isRtl ? "ویژگی جدید" : "Features",
                  value: stats.feats,
                  color: "text-sky-600 dark:text-sky-400",
                },
                {
                  label: isRtl ? "رفع مشکل" : "Bug Fixes",
                  value: stats.fixes,
                  color: "text-rose-600 dark:text-rose-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3 text-center"
                >
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter chips */}
        {!loading && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <button
              onClick={() => setActiveFilter("all")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeFilter === "all"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {isRtl ? "همه" : "All"}
            </button>
            {availableTypes.map((type) => {
              const conf = TYPE_CONFIG[type] || TYPE_CONFIG.other
              const entry = entries.find((e) => e.type === type)
              const label = isRtl ? (entry?.typeFa || "سایر") : (entry?.typeEn || "Other")
              return (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeFilter === type
                      ? `bg-gradient-to-r ${conf.gradient} text-white shadow-md`
                      : `${conf.bg} ${conf.text} hover:opacity-80 border ${conf.border}`
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-10 text-center">
            <GitCommit className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRtl ? "موردی یافت نشد" : "No entries found"}
            </p>
          </div>
        )}

        {/* Timeline */}
        {!loading &&
          months.map((month) => (
            <section key={month.key} className="space-y-3">
              {/* Month header */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {month.label}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  {month.entries.length}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Entries */}
              <div className="space-y-2">
                {month.entries.map((entry, idx) => {
                  const conf = TYPE_CONFIG[entry.type] || TYPE_CONFIG.other
                  const Icon = conf.icon
                  return (
                    <div
                      key={entry.hash}
                      className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 sm:p-5 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all duration-300"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Type badge */}
                        <div
                          className={`shrink-0 w-9 h-9 rounded-xl ${conf.bg} border ${conf.border} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}
                        >
                          <Icon className={`h-4 w-4 ${conf.text}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Commit message */}
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                            {isRtl ? entry.messageFa : entry.message}
                          </p>

                          {/* Meta row */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {/* Type label */}
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${conf.bg} ${conf.text} border ${conf.border}`}
                            >
                              {isRtl ? entry.typeFa : entry.typeEn}
                            </span>

                            {/* Scope */}
                            {entry.scope && (
                              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">
                                {entry.scope}
                              </span>
                            )}

                            {/* Date */}
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                              {isRtl ? formatDateFa(entry.date) : formatDateEn(entry.date)}
                            </span>

                            {/* Commit hash */}
                            <code className="text-[10px] font-mono text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                              {entry.shortHash}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

        {/* Footer */}
        {!loading && entries.length > 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isRtl
                ? `نمایش ${filtered.length} تغییر از مجموع ${entries.length}`
                : `Showing ${filtered.length} of ${entries.length} changes`}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

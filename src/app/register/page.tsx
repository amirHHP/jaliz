"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Leaf, Loader2, UserPlus } from "lucide-react"

import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { Button } from "@/components/ui/button"
import { authErrorTranslationKey } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { register, status, user } = useAuth()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace("/plants/diagnose")
    }
  }, [status, user, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorKey(null)

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorKey("auth_error_empty_field")
      return
    }
    if (password !== confirmPassword) {
      setErrorKey("auth_error_password_mismatch")
      return
    }

    setSubmitting(true)
    try {
      await register({ fullName, email, password })
      router.replace("/plants/diagnose")
    } catch (err) {
      setErrorKey(authErrorTranslationKey(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 text-emerald-700 mb-6">
          <div className="p-2 bg-emerald-100 rounded-xl shadow-sm">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {t("app_title")}
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{t("register_title")}</h1>
            <p className="text-slate-500 text-sm mt-1">{t("register_desc")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                {t("full_name")}
              </label>
              <input
                id="fullName"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("full_name_ph")}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email_ph")}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password_ph")}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                {t("confirm_password")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("password_ph")}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
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

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {t("register_btn")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {t("have_account")}{" "}
            <Link
              href="/login"
              className="text-emerald-700 font-medium hover:underline"
            >
              {t("sign_in")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

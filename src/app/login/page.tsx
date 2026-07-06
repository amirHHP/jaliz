"use client"

import { FormEvent, Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Leaf, Loader2, LogIn } from "lucide-react"

import { useAuth } from "@/components/AuthProvider"
import { useLanguage } from "@/components/LanguageProvider"
import { Button } from "@/components/ui/button"
import { authErrorTranslationKey } from "@/lib/auth"

export default function LoginPage() {
  // useSearchParams requires a Suspense boundary during prerender.
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 px-4">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
    </div>
  )
}

import { track } from "@vercel/analytics"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const { login, sendOtp, loginWithOtp, status, user } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [loginMode, setLoginMode] = useState<"otp" | "password">("otp")
  const [otpSent, setOtpSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = searchParams?.get("redirect") || "/"

  // If a session already exists, bounce out of the login screen.
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(redirectTo)
    }
  }, [status, user, router, redirectTo])

  // Cooldown timer for sending OTP
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setErrorKey("auth_error_empty_field")
      return
    }
    setErrorKey(null)
    setSuccessMsg(null)
    setSubmitting(true)
    try {
      await sendOtp(email)
      track("Auth OTP Requested")
      setOtpSent(true)
      setCooldown(60) // 60 seconds cooldown
      setSuccessMsg("otp_sent_success")
    } catch (err) {
      setErrorKey(authErrorTranslationKey(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorKey(null)
    setSuccessMsg(null)

    if (loginMode === "password") {
      if (!email.trim() || !password) {
        setErrorKey("auth_error_empty_field")
        return
      }
      setSubmitting(true)
      try {
        await login(email, password)
        track("Auth Login Success", { method: "password" })
        router.replace(redirectTo)
      } catch (err) {
        setErrorKey(authErrorTranslationKey(err))
      } finally {
        setSubmitting(false)
      }
    } else {
      if (!otpSent) {
        await handleSendOtp()
      } else {
        if (!otpCode.trim()) {
          setErrorKey("auth_error_empty_field")
          return
        }
        setSubmitting(true)
        try {
          await loginWithOtp(email, otpCode)
          track("Auth Login Success", { method: "otp" })
          router.replace(redirectTo)
        } catch (err) {
          setErrorKey(authErrorTranslationKey(err))
        } finally {
          setSubmitting(false)
        }
      }
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
            <h1 className="text-2xl font-bold text-slate-900">{t("login_title")}</h1>
            <p className="text-slate-500 text-sm mt-1">{t("login_desc")}</p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 gap-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode("otp")
                setErrorKey(null)
                setSuccessMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                loginMode === "otp"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t("login_with_otp")}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("password")
                setErrorKey(null)
                setSuccessMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                loginMode === "password"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t("login_with_password")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t("email")}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loginMode === "otp" && otpSent}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email_ph")}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                />
                {loginMode === "otp" && otpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setOtpCode("")
                      setSuccessMsg(null)
                    }}
                    className="text-xs text-emerald-700 font-semibold hover:underline shrink-0"
                  >
                    {t("change_email")}
                  </button>
                )}
              </div>
            </div>

            {loginMode === "password" && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  {t("password")}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password_ph")}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            )}

            {loginMode === "otp" && otpSent && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label htmlFor="otpCode" className="text-sm font-medium text-slate-700">
                  {t("otp_code")}
                </label>
                <div className="flex gap-2">
                  <input
                    id="otpCode"
                    type="text"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder={t("otp_ph")}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 text-center tracking-[0.25em] font-bold"
                  />
                  <Button
                    type="button"
                    disabled={cooldown > 0 || submitting}
                    onClick={handleSendOtp}
                    variant="outline"
                    className="shrink-0 text-xs border-slate-300 hover:bg-slate-50 text-slate-700"
                  >
                    {cooldown > 0 ? `${cooldown}s` : t("send_otp")}
                  </Button>
                </div>
              </div>
            )}

            {errorKey && (
              <div
                role="alert"
                className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2"
              >
                {t(errorKey as any)}
              </div>
            )}

            {successMsg && (
              <div
                role="alert"
                className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-3 py-2"
              >
                {t(successMsg as any)}
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
                <LogIn className="h-4 w-4" />
              )}
              {loginMode === "password"
                ? t("login_btn")
                : otpSent
                ? t("login_btn_otp")
                : t("send_otp")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {t("no_account")}{" "}
            <Link
              href="/register"
              className="text-emerald-700 font-medium hover:underline"
            >
              {t("sign_up")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

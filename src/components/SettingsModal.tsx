"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "./LanguageProvider"
import { useAuth } from "./AuthProvider"
import { authErrorTranslationKey } from "@/lib/auth"
import { Settings, X, Loader2, CheckCircle2, MapPin, User, Camera, Trash2, Phone, Shield, ChevronLeft, ChevronRight, Sun, Moon, Lock } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, t } = useLanguage()
  const { status, user, updateMyProfile, setMyPassword } = useAuth()
  const { theme, setTheme, canChangeTheme } = useTheme()
  
  const [activeTab, setActiveTab] = useState<"profile" | "app">("profile")
  
  // Location setting
  const [location, setLocation] = useState("")
  
  // Profile settings
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isAuthenticated = status === "authenticated" && user !== null

  // Load existing settings
  useEffect(() => {
    if (isOpen) {
      const storedLocation = localStorage.getItem("jaliz-location") || ""
      setLocation(storedLocation)
      
      if (isAuthenticated) {
        setFullName(user.fullName || "")
        setPhone(user.phone || "")
        setAvatar(user.avatar || null)
        setPassword("")
        setConfirmPassword("")
        setActiveTab("profile")
      } else {
        setActiveTab("app")
      }
      
      setSaved(false)
      setError(null)
      setIsLoading(false)
    }
  }, [isOpen, isAuthenticated, user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limit file size to 1MB to prevent large base64 payloads
      if (file.size > 1024 * 1024) {
        setError(language === "fa" ? "حجم عکس باید کمتر از ۱ مگابایت باشد." : "Image size must be less than 1MB.")
        return
      }
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
        setSaved(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setAvatar(null)
    setSaved(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSaved(false)

    try {
      if (activeTab === "app") {
        if (location.trim()) {
          localStorage.setItem("jaliz-location", location.trim())
        } else {
          localStorage.removeItem("jaliz-location")
        }
        setSaved(true)
        setTimeout(() => {
          onClose()
        }, 1200)
      } else if (activeTab === "profile" && isAuthenticated) {
        if (!fullName.trim()) {
          setError(t("auth_error_empty_field"))
          setIsLoading(false)
          return
        }
        if (password || confirmPassword) {
          if (password !== confirmPassword) {
            setError(t("auth_error_password_mismatch"))
            setIsLoading(false)
            return
          }
          if (password.length < 6) {
            setError(t("auth_error_weak_password"))
            setIsLoading(false)
            return
          }
        }
        await updateMyProfile({
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          avatar: avatar,
        })
        if (password) {
          await setMyPassword(password)
          setPassword("")
          setConfirmPassword("")
        }
        setSaved(true)
        setTimeout(() => {
          onClose()
        }, 1200)
      }
    } catch (err: any) {
      console.error("Failed to save settings:", err)
      setError(t(authErrorTranslationKey(err) as any))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const isRtl = language === "fa"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-border bg-card max-h-[95vh] flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center bg-slate-50 dark:bg-slate-900/50 border-b border-border pb-4 shrink-0">
          <CardTitle className="text-xl flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-muted" />
            {t("settings")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground -mr-2">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        {/* Tab Selection if Authenticated */}
        {isAuthenticated && (
          <div className="flex border-b border-border bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
            <button
              onClick={() => {
                setActiveTab("profile")
                setError(null)
                setSaved(false)
              }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "profile"
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-card"
                  : "border-transparent text-muted hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              {t("edit_profile")}
            </button>
            <button
              onClick={() => {
                setActiveTab("app")
                setError(null)
                setSaved(false)
              }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "app"
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-card"
                  : "border-transparent text-muted hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              {t("settings")}
            </button>
          </div>
        )}

        <CardContent className="pt-6 pb-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg border border-rose-100 animate-in fade-in">
              {error}
            </div>
          )}

          {activeTab === "profile" && isAuthenticated ? (
            <div className="space-y-5">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm font-medium text-slate-700 self-start">
                  {t("profile_photo")}
                </span>
                
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-emerald-500">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-slate-400" />
                    )}
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all animate-in zoom-in-50 duration-150"
                    type="button"
                    title={t("change_photo")}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {avatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 -mt-1 flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("remove_photo")}
                  </Button>
                )}
              </div>

              {/* Name input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  {t("full_name")}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    setSaved(false)
                  }}
                  placeholder={t("full_name_ph")}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Phone input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {t("phone_number")}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setSaved(false)
                  }}
                  placeholder={t("phone_number_ph")}
                  dir="ltr"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-left"
                />
              </div>

              {/* Optional password */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-400" />
                    {t("settings_set_password")}
                  </label>
                  <p className="text-xs text-slate-500 mt-1">{t("settings_set_password_desc")}</p>
                </div>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setSaved(false)
                  }}
                  placeholder={t("password_ph")}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setSaved(false)
                  }}
                  placeholder={t("confirm_password")}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            /* App settings / Location */
            <div className="space-y-6">
              {canChangeTheme && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sun className="h-4 w-4 text-emerald-600" />
                    {t("theme_label")}
                  </label>
                  <p className="text-xs text-muted">{t("theme_desc")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                        theme === "light"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "border-border bg-input text-foreground hover:border-emerald-500"
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      {t("theme_light")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                        theme === "dark"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "border-border bg-input text-foreground hover:border-emerald-500"
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      {t("theme_dark")}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {t("user_location_label")}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    setSaved(false)
                  }}
                  placeholder={t("user_location_ph")}
                  className="surface-input flex h-10 w-full px-3 py-2 text-sm"
                />
              </div>

              {/* Privacy Policy Link */}
              <div className="border-t border-border pt-4 space-y-2">
                <span className="text-xs font-semibold text-muted block uppercase tracking-wider">
                  {language === "fa" ? "قوانین و حریم خصوصی" : "Rules & Privacy"}
                </span>
                <Link
                  href="/privacy"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 text-sm text-foreground hover:text-emerald-700 dark:hover:text-emerald-400 transition-all font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    {language === "fa" ? "سیاست حفظ حریم خصوصی جالیز" : "Jaliz Privacy Policy"}
                  </span>
                  {language === "fa" ? (
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </Link>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-border pt-4 pb-4 flex justify-between items-center shrink-0">
          <div>
            {saved && (
              <span className="text-emerald-600 text-sm flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" />
                {activeTab === "profile" ? t("profile_update_success") : t("saved_successfully")}
              </span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 font-semibold"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("save_settings")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

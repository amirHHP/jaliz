"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "./LanguageProvider"
import { useAuth } from "./AuthProvider"
import { Settings, X, Loader2, CheckCircle2, MapPin, User, Camera, Trash2, Phone } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, t } = useLanguage()
  const { status, user, updateMyProfile } = useAuth()
  
  const [activeTab, setActiveTab] = useState<"profile" | "app">("profile")
  
  // Location setting
  const [location, setLocation] = useState("")

  // Theme setting
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  const applyTheme = (tMode: "light" | "dark" | "system") => {
    const root = document.documentElement
    if (tMode === "dark" || (tMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    applyTheme(newTheme)
    setSaved(false)
  }
  
  // Profile settings
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  
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
      
      const storedTheme = (localStorage.getItem("theme") as "light" | "dark" | "system") || "system"
      setTheme(storedTheme)
      
      if (isAuthenticated) {
        setFullName(user.fullName || "")
        setPhone(user.phone || "")
        setAvatar(user.avatar || null)
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
        localStorage.setItem("theme", theme)
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
        await updateMyProfile({
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          avatar: avatar,
        })
        setSaved(true)
        setTimeout(() => {
          onClose()
        }, 1200)
      }
    } catch (err: any) {
      console.error("Failed to save settings:", err)
      setError(t("auth_error_generic"))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const isRtl = language === "fa"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[95vh] flex flex-col transition-colors">
        <CardHeader className="flex flex-row justify-between items-center bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/50 pb-4 shrink-0">
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800 dark:text-white">
            <Settings className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            {t("settings")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 -mr-2">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        {/* Tab Selection if Authenticated */}
        {isAuthenticated && (
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
            <button
              onClick={() => {
                setActiveTab("profile")
                setError(null)
                setSaved(false)
              }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "profile"
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-450 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"
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
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-455 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"
              }`}
            >
              {t("settings")}
            </button>
          </div>
        )}

        <CardContent className="pt-6 pb-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-sm bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-900/30 animate-in fade-in">
              {error}
            </div>
          )}

          {activeTab === "profile" && isAuthenticated ? (
            <div className="space-y-5">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 self-start">
                  {t("profile_photo")}
                </span>
                
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-emerald-500">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-slate-400 dark:text-slate-500" />
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
                    className="text-rose-600 dark:text-rose-450 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 -mt-1 flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("remove_photo")}
                  </Button>
                )}
              </div>

              {/* Name input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
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
                  className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Phone input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
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
                  className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-left"
                />
              </div>
            </div>
          ) : (
            /* App settings / Location & Theme */
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-450" />
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
                  className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-3 animate-in fade-in duration-300">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="text-base">🎨</span>
                  {t("theme_label")}
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                  {(["light", "dark", "system"] as const).map((tMode) => {
                    const isActive = theme === tMode
                    let translationKey: "theme_light" | "theme_dark" | "theme_system" = "theme_system"
                    if (tMode === "light") translationKey = "theme_light"
                    if (tMode === "dark") translationKey = "theme_dark"

                    return (
                      <button
                        key={tMode}
                        type="button"
                        onClick={() => handleThemeChange(tMode)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        {t(translationKey as any)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 pt-4 pb-4 flex justify-between items-center shrink-0">
          <div>
            {saved && (
              <span className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1 animate-in fade-in">
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

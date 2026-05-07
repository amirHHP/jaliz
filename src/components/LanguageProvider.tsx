"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Language = "en" | "fa"

const translations = {
  en: {
    app_title: "jaliz",
    dashboard: "Dashboard",
    marketplace: "Marketplace",
    my_plants: "My Plants",
    welcome_title: "Good morning, Sarah! 🪴",
    welcome_desc: "Here's what your garden needs today.",
    watering_title: "Watering Schedule",
    watering_desc: "3 plants need water today.",
    weather_title: "Hyper-Local Weather Advice",
    weather_desc: "AI-powered gardening advice based on your plants and local 48h forecast.",
    analyzing: "Analyzing weather risks...",
    generate_btn: "Generate Advice",
    generating_btn: "Generating...",
    advice_prompt: "Click below to generate actionable advice for your Monstera and Tomato plants.",
    market_title: "Nearby Marketplace",
    market_within: "Within 5km",
    contact_btn: "Contact via WhatsApp",
    away: "away",
    by: "by",
    add_plant: "Add Plant",
    add_new_plant: "Add a New Plant",
    plant_name: "Plant Name",
    plant_name_ph: "e.g., Monstera Deliciosa",
    plant_type: "Plant Type",
    plant_type_ph: "e.g., Indoor Tropical",
    location_type: "Location",
    location_indoor: "Indoor",
    location_outdoor: "Outdoor",
    light_exposure: "Light Exposure",
    light_low: "Low Light",
    light_partial: "Partial Shade",
    light_bright: "Bright Indirect",
    light_full: "Full Sun",
    pot_type: "Pot Type",
    pot_terracotta: "Terracotta",
    pot_plastic: "Plastic",
    pot_ceramic: "Ceramic",
    pot_metal: "Metal",
    pot_other: "Other",
    has_drainage: "Has Drainage Hole",
    last_watered: "Last Watered",
    recently_replanted: "Recently Replanted",
    plant_image: "Plant Image (Optional)",
    health_status: "Health Status",
    health_excellent: "Excellent",
    health_good: "Good",
    health_needs_attention: "Needs Attention",
    cancel: "Cancel",
    save: "Save Plant",
    no_plants: "You haven't added any plants yet.",
    watered_today: "Watered today",
    watered_days_ago: "days ago",
    settings: "Settings",
    api_key_title: "Gemini API Settings",
    api_key_desc: "Enter your Gemini API key to power the AI gardening advice.",
    api_key_label: "API Key",
    api_key_ph: "AIzaSy...",
    fetch_models: "Fetch Models",
    fetching: "Fetching...",
    select_model: "Select a Model",
    token_limit: "Token Limit",
    input_tokens: "Input",
    output_tokens: "Output",
    save_settings: "Save Settings",
    saved_successfully: "Settings saved successfully!",
    api_key_required: "API Key is required to generate advice.",
    // Auth
    sign_in: "Sign in",
    sign_up: "Sign up",
    sign_out: "Sign out",
    account: "Account",
    admin_panel: "Admin",
    login_title: "Welcome back",
    login_desc: "Sign in to your jaliz account.",
    register_title: "Create your account",
    register_desc: "Join jaliz and start growing smarter.",
    email: "Email",
    email_ph: "you@example.com",
    password: "Password",
    password_ph: "At least 6 characters",
    confirm_password: "Confirm password",
    full_name: "Full name",
    full_name_ph: "Your full name",
    register_btn: "Create account",
    login_btn: "Sign in",
    no_account: "Don't have an account?",
    have_account: "Already have an account?",
    auth_error_invalid_credentials: "Email or password is incorrect.",
    auth_error_email_exists: "An account with this email already exists.",
    auth_error_user_inactive: "This account has been disabled.",
    auth_error_user_not_found: "User not found.",
    auth_error_weak_password: "Password must be at least 6 characters.",
    auth_error_invalid_email: "Please enter a valid email address.",
    auth_error_empty_field: "Please fill in all required fields.",
    auth_error_password_mismatch: "Passwords do not match.",
    auth_error_generic: "Something went wrong. Please try again.",
    demo_admin_hint: "Default admin: admin@jaliz.local / admin123",
    // Admin panel
    admin_title: "User Management",
    admin_desc: "Manage registered users, roles and access.",
    admin_search_ph: "Search by name or email…",
    admin_total_users: "Total users",
    admin_active_users: "Active",
    admin_admins: "Admins",
    admin_col_user: "User",
    admin_col_role: "Role",
    admin_col_status: "Status",
    admin_col_joined: "Joined",
    admin_col_actions: "Actions",
    admin_role_admin: "Admin",
    admin_role_user: "User",
    admin_status_active: "Active",
    admin_status_inactive: "Disabled",
    admin_action_reset: "Reset password",
    admin_action_delete: "Delete",
    admin_action_deactivate: "Disable",
    admin_action_activate: "Enable",
    admin_no_users: "No users match your search.",
    admin_confirm_delete: "Delete this user permanently? This cannot be undone.",
    admin_reset_title: "Reset password",
    admin_reset_desc: "Set a new password for {name}. They will need to use it on their next sign-in.",
    admin_reset_new_password: "New password",
    admin_reset_btn: "Set password",
    admin_reset_success: "Password updated.",
    admin_self_warning: "You can't change the role or disable your own account here.",
    admin_only: "This page is for administrators only.",
    go_home: "Go to dashboard",
    auth_required: "Please sign in to continue.",
    you_label: "(you)"
  },
  fa: {
    app_title: "جالیز",
    dashboard: "داشبورد",
    marketplace: "بازارچه",
    my_plants: "گیاهان من",
    welcome_title: "صبح بخیر، سارا! 🪴",
    welcome_desc: "امروز باغچه شما به این موارد نیاز دارد.",
    watering_title: "برنامه آبیاری",
    watering_desc: "۳ گیاه امروز به آب نیاز دارند.",
    weather_title: "مشاوره هواشناسی محلی",
    weather_desc: "مشاوره هوشمند باغبانی بر اساس گیاهان شما و پیش‌بینی ۴۸ ساعته.",
    analyzing: "در حال بررسی ریسک‌های آب و هوایی...",
    generate_btn: "دریافت مشاوره",
    generating_btn: "در حال پردازش...",
    advice_prompt: "برای دریافت مشاوره اختصاصی برای گیاهان خود، روی دکمه زیر کلیک کنید.",
    market_title: "بازارچه اطراف شما",
    market_within: "شعاع ۵ کیلومتری",
    contact_btn: "تماس در واتساپ",
    away: "فاصله",
    by: "توسط",
    add_plant: "افزودن گیاه",
    add_new_plant: "افزودن گیاه جدید",
    plant_name: "نام گیاه",
    plant_name_ph: "مثال: برگ انجیری (مونسترا)",
    plant_type: "نوع گیاه",
    plant_type_ph: "مثال: آپارتمانی استوایی",
    location_type: "مکان قرارگیری",
    location_indoor: "فضای داخلی (Indoor)",
    location_outdoor: "فضای باز (Outdoor)",
    light_exposure: "میزان نور",
    light_low: "نور کم",
    light_partial: "سایه جزئی",
    light_bright: "نور غیرمستقیم و روشن",
    light_full: "آفتاب کامل",
    pot_type: "نوع گلدان",
    pot_terracotta: "سفالی",
    pot_plastic: "پلاستیکی",
    pot_ceramic: "سرامیکی",
    pot_metal: "فلزی",
    pot_other: "سایر",
    has_drainage: "دارای سوراخ زهکشی",
    last_watered: "آخرین آبیاری",
    recently_replanted: "اخیراً تعویض گلدان شده",
    plant_image: "تصویر گیاه (اختیاری)",
    health_status: "وضعیت سلامت",
    health_excellent: "عالی",
    health_good: "خوب",
    health_needs_attention: "نیاز به توجه",
    cancel: "انصراف",
    save: "ذخیره گیاه",
    no_plants: "هنوز هیچ گیاهی اضافه نکرده‌اید.",
    watered_today: "امروز آبیاری شده",
    watered_days_ago: "روز پیش",
    settings: "تنظیمات",
    api_key_title: "تنظیمات کلید API جمینای",
    api_key_desc: "کلید API جمینای خود را وارد کنید تا مشاوره هوشمند فعال شود.",
    api_key_label: "کلید API",
    api_key_ph: "AIzaSy...",
    fetch_models: "دریافت لیست مدل‌ها",
    fetching: "در حال دریافت...",
    select_model: "انتخاب مدل",
    token_limit: "محدودیت توکن",
    input_tokens: "ورودی",
    output_tokens: "خروجی",
    save_settings: "ذخیره تنظیمات",
    saved_successfully: "تنظیمات با موفقیت ذخیره شد!",
    api_key_required: "وارد کردن کلید API برای دریافت مشاوره الزامی است.",
    // Auth
    sign_in: "ورود",
    sign_up: "ثبت‌نام",
    sign_out: "خروج",
    account: "حساب کاربری",
    admin_panel: "پنل مدیریت",
    login_title: "خوش برگشتید",
    login_desc: "به حساب کاربری جالیز خود وارد شوید.",
    register_title: "ساخت حساب کاربری",
    register_desc: "به جالیز بپیوندید و باغبانی هوشمندتر را شروع کنید.",
    email: "ایمیل",
    email_ph: "you@example.com",
    password: "رمز عبور",
    password_ph: "حداقل ۶ کاراکتر",
    confirm_password: "تکرار رمز عبور",
    full_name: "نام و نام خانوادگی",
    full_name_ph: "نام کامل شما",
    register_btn: "ساخت حساب",
    login_btn: "ورود",
    no_account: "حساب کاربری ندارید؟",
    have_account: "قبلاً ثبت‌نام کرده‌اید؟",
    auth_error_invalid_credentials: "ایمیل یا رمز عبور اشتباه است.",
    auth_error_email_exists: "حسابی با این ایمیل قبلاً ثبت شده است.",
    auth_error_user_inactive: "این حساب کاربری غیرفعال شده است.",
    auth_error_user_not_found: "کاربر یافت نشد.",
    auth_error_weak_password: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
    auth_error_invalid_email: "لطفاً یک ایمیل معتبر وارد کنید.",
    auth_error_empty_field: "لطفاً همه فیلدهای ضروری را پر کنید.",
    auth_error_password_mismatch: "رمز عبور و تکرار آن یکسان نیستند.",
    auth_error_generic: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
    demo_admin_hint: "ادمین پیش‌فرض: admin@jaliz.local / admin123",
    // Admin panel
    admin_title: "مدیریت کاربران",
    admin_desc: "کاربران ثبت‌شده، نقش‌ها و دسترسی‌ها را مدیریت کنید.",
    admin_search_ph: "جستجو بر اساس نام یا ایمیل…",
    admin_total_users: "کل کاربران",
    admin_active_users: "فعال",
    admin_admins: "ادمین‌ها",
    admin_col_user: "کاربر",
    admin_col_role: "نقش",
    admin_col_status: "وضعیت",
    admin_col_joined: "تاریخ عضویت",
    admin_col_actions: "عملیات",
    admin_role_admin: "ادمین",
    admin_role_user: "کاربر",
    admin_status_active: "فعال",
    admin_status_inactive: "غیرفعال",
    admin_action_reset: "بازنشانی رمز",
    admin_action_delete: "حذف",
    admin_action_deactivate: "غیرفعال کردن",
    admin_action_activate: "فعال کردن",
    admin_no_users: "کاربری مطابق با جستجو یافت نشد.",
    admin_confirm_delete: "این کاربر برای همیشه حذف شود؟ این عمل قابل بازگشت نیست.",
    admin_reset_title: "بازنشانی رمز عبور",
    admin_reset_desc: "یک رمز عبور جدید برای {name} تعیین کنید. در ورود بعدی باید از آن استفاده کند.",
    admin_reset_new_password: "رمز عبور جدید",
    admin_reset_btn: "ثبت رمز",
    admin_reset_success: "رمز عبور با موفقیت تغییر کرد.",
    admin_self_warning: "نمی‌توانید نقش یا وضعیت حساب خودتان را از اینجا تغییر دهید.",
    admin_only: "این صفحه فقط مخصوص ادمین‌هاست.",
    go_home: "بازگشت به داشبورد",
    auth_required: "برای ادامه لطفاً وارد شوید.",
    you_label: "(شما)"
  }
}

type TranslationKey = keyof typeof translations.en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Read from localStorage if available
    const saved = localStorage.getItem("jaliz-lang") as Language
    if (saved && (saved === "en" || saved === "fa")) {
      setLanguage(saved)
    }
  }, [])

  useEffect(() => {
    // Save preference and update document direction
    localStorage.setItem("jaliz-lang", language)
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr"
    document.documentElement.lang = language
    
    if (language === "fa") {
      document.body.style.fontFamily = "var(--font-vazirmatn), ui-sans-serif, system-ui, sans-serif"
      document.documentElement.style.setProperty("--font-sans", "var(--font-vazirmatn)")
    } else {
      document.body.style.fontFamily = ""
      document.documentElement.style.setProperty("--font-sans", "var(--font-geist-sans)")
    }
  }, [language])

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key]
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

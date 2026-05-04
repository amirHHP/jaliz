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

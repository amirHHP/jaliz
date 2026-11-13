import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تشخیص آنلاین بیماری و آفت گیاهان آپارتمانی با هوش مصنوعی (رایگان)",
  description:
    "با بارگذاری یک عکس از برگ گیاه، هوش مصنوعی جالیز در چند ثانیه نوع بیماری، علت زرد شدن یا لکه‌ها و روش درمان قطعی را به شما اعلام می‌کند.",
  alternates: {
    canonical: "/plants/diagnose",
  },
  keywords: [
    "تشخیص بیماری گیاه با عکس",
    "تشخیص آفت گیاهان با هوش مصنوعی",
    "علت زرد شدن برگ گل",
    "درمان بیماری گیاهان آپارتمانی",
    "اسکن آنلاین گیاه",
    "مشاوره گیاه‌پزشکی آنلاین",
    "جالیز",
  ],
  openGraph: {
    title: "تشخیص آنلاین آفت و بیماری گیاهان با هوش مصنوعی | جالیز",
    description:
      "با یک عکس، نوع بیماری و آفت گیاه آپارتمانی‌تان را در چند ثانیه رایگان تشخیص دهید و روش درمان را دریافت کنید.",
    type: "website",
    locale: "fa_IR",
    url: "https://jalizapp.ir/plants/diagnose",
  },
  twitter: {
    card: "summary_large_image",
    title: "تشخیص آنلاین آفت و بیماری گیاهان با هوش مصنوعی (رایگان)",
    description: "آپلود عکس برگ بیمار و دریافت فوری علت و روش درمان با هوش مصنوعی جالیز.",
  },
}

export default function DiagnoseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

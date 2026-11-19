import type { Metadata } from "next"
import { getAllWikiPlants } from "@/lib/wikiData"
import { WikiIndexClient } from "./WikiIndexClient"
import { getCanonicalSiteUrl } from "@/lib/siteUrl"

const SITE_URL = getCanonicalSiteUrl()

export const metadata: Metadata = {
  title: "دانشنامه و راهنمای جامع گیاهان آپارتمانی | جالیز",
  description:
    "شناسنامه تخصصی و راهنمای جامع نگهداری محبوب‌ترین گیاهان آپارتمانی: جدول آبیاری، نیاز نوری، ترکیب خاک، امنیت برای حیوانات خانگی و حل مشکلات رایج در دانشنامه جالیز.",
  keywords: [
    "دانشنامه گیاهان آپارتمانی",
    "راهنمای نگهداری گیاهان",
    "شناسنامه گیاهان",
    "آبیاری گیاهان آپارتمانی",
    "نور گیاهان آپارتمانی",
    "گیاهان مقاوم به کم نوری",
    "گیاهان تصفیه کننده هوا",
    "گیاهان امن برای حیوانات خانگی",
    "سانسوریا",
    "پتوس",
    "زامیفولیا",
    "جالیز",
  ],
  alternates: {
    canonical: `${SITE_URL}/wiki`,
  },
  openGraph: {
    title: "دانشنامه و راهنمای جامع گیاهان آپارتمانی | جالیز",
    description:
      "شناسنامه تخصصی و راهنمای جامع نگهداری محبوب‌ترین گیاهان آپارتمانی در دانشنامه جالیز.",
    url: `${SITE_URL}/wiki`,
    type: "website",
    locale: "fa_IR",
    siteName: "جالیز | دانشنامه گیاهان",
  },
  twitter: {
    card: "summary_large_image",
    title: "دانشنامه و راهنمای جامع گیاهان آپارتمانی | جالیز",
    description:
      "شناسنامه تخصصی و راهنمای جامع نگهداری محبوب‌ترین گیاهان آپارتمانی در دانشنامه جالیز.",
  },
}

export default function WikiIndexPage() {
  const plants = getAllWikiPlants()
  return <WikiIndexClient plants={plants} />
}

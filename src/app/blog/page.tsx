import type { Metadata } from "next"
import { BlogIndexClient } from "./BlogIndexClient"

export const metadata: Metadata = {
  title: "مقالات نگهداری گیاهان آپارتمانی",
  description:
    "راهنمای نگهداری گیاهان آپارتمانی: آبیاری، نور، خاک، آفات و معرفی گونه‌های محبوب. مقالات کاربردی جالیز برای رشد بهتر گیاه در خانه.",
  keywords: [
    "نگهداری گیاهان آپارتمانی",
    "وبلاگ باغبانی",
    "آبیاری گیاه",
    "جالیز",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "مقالات نگهداری گیاهان آپارتمانی",
    description:
      "راهنمای نگهداری گیاهان آپارتمانی: آبیاری، نور، خاک، آفات و معرفی گونه‌های محبوب.",
    type: "website",
    locale: "fa_IR",
  },
}

export default function BlogIndexPage() {
  return <BlogIndexClient />
}

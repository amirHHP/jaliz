import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { MarketplaceProvider } from "@/components/MarketplaceProvider";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: {
    default: "جالیز | فروشگاه گیاه، بذر و ابزار باغبانی",
    template: "%s | جالیز",
  },
  description:
    "خرید و فروش بذر، قلمه، ابزار و محصولات باغبانی. یادآور آبیاری، ثبت گیاه و مشاوره هوشمند باغبانی.",
  keywords: [
    "فروشگاه گیاه",
    "بذر",
    "قلمه",
    "ابزار باغبانی",
    "یادآور آبیاری",
    "مشاوره باغبانی",
    "jaliz",
    "جالیز",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "جالیز",
    title: "جالیز | فروشگاه گیاه، بذر و ابزار باغبانی",
    description:
      "خرید و فروش بذر، قلمه، ابزار و محصولات باغبانی. یادآور آبیاری، ثبت گیاه و مشاوره هوشمند باغبانی.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <LanguageProvider>
          <AuthProvider>
            <MarketplaceProvider>
              {children}
              <BottomNav />
            </MarketplaceProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "./fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

const geistSans = localFont({
  src: "./fonts/Geist-Regular.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Regular.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { PlantsProvider } from "@/components/PlantsProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WateringNotificationProvider } from "@/components/WateringNotificationProvider";
import { MarketplaceProvider } from "@/components/MarketplaceProvider";
import { CartProvider } from "@/components/marketplace/CartProvider";
import { CartConflictModal } from "@/components/marketplace/CartConflictModal";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getCanonicalSiteUrl } from "@/lib/siteUrl";

export const maxDuration = 60;

export const viewport: Viewport = {
  themeColor: "#12382e",
};

export const metadata: Metadata = {
  metadataBase: new URL(getCanonicalSiteUrl()),
  title: {
    default: "جالیز | فروشگاه گیاه، بذر و ابزار باغبانی",
    template: "%s | جالیز",
  },
  description:
    "خرید و فروش بذر، قلمه، ابزار و محصولات باغبانی. یادآور آبیاری، ثبت گیاه و مشاوره هوشمند باغبانی.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "جالیز",
  },
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://jalizapp.ir/#organization",
      name: "جالیز | Jaliz",
      url: "https://jalizapp.ir",
      logo: "https://jalizapp.ir/icons/icon-512x512.png",
      description:
        "پلتفرم هوشمند مراقبت از گیاهان آپارتمانی، یادآور آبیاری، تشخیص آنلاین آفت و بازارچه تخصصی گل و گیاه.",
      sameAs: ["https://cafebazaar.ir/app/ir.noxte.jaliz.twa"],
    },
    {
      "@type": "WebSite",
      "@id": "https://jalizapp.ir/#website",
      url: "https://jalizapp.ir",
      name: "جالیز",
      publisher: {
        "@id": "https://jalizapp.ir/#organization",
      },
    },
  ],
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
      className={`${vazirmatn.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('jaliz-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <LanguageProvider>
          <AuthProvider>
            <PlantsProvider>
              <ThemeProvider>
                <WateringNotificationProvider>
                  <MarketplaceProvider>
                    <CartProvider>
                      {children}
                      <CartConflictModal />
                      <CartDrawer />
                      <BottomNav />
                      <InstallPrompt />
                    </CartProvider>
                  </MarketplaceProvider>
                </WateringNotificationProvider>
              </ThemeProvider>
            </PlantsProvider>
          </AuthProvider>
        </LanguageProvider>
        <SpeedInsights />
        <Analytics />
        <GoogleAnalytics gaId="G-FRDP1WTKXW" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .catch(function(err) { console.log('SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

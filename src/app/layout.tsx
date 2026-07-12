import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { MarketplaceProvider } from "@/components/MarketplaceProvider";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

export const maxDuration = 60;

export const viewport: Viewport = {
  themeColor: "#12382e",
};

export const metadata: Metadata = {
  title: {
    default: "جالیز | فروشگاه گیاه، بذر و ابزار باغبانی",
    template: "%s | جالیز",
  },
  description:
    "خرید و فروش بذر، قلمه، ابزار و محصولات باغبانی. یادآور آبیاری، ثبت گیاه و مشاوره هوشمند باغبانی.",
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
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <LanguageProvider>
          <AuthProvider>
            <MarketplaceProvider>
              {children}
              <BottomNav />
              <InstallPrompt />
            </MarketplaceProvider>
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
                  var hadController = !!navigator.serviceWorker.controller;
                  var refreshing = false;
                  navigator.serviceWorker.addEventListener('controllerchange', function() {
                    if (!hadController || refreshing) return;
                    refreshing = true;
                    window.location.reload();
                  });
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      function askSkipWaiting(worker) {
                        if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
                      }
                      if (reg.waiting) askSkipWaiting(reg.waiting);
                      reg.addEventListener('updatefound', function() {
                        var worker = reg.installing;
                        if (!worker) return;
                        worker.addEventListener('statechange', function() {
                          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                            askSkipWaiting(worker);
                          }
                        });
                      });
                    })
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

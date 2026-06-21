import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { MarketplaceProvider } from "@/components/MarketplaceProvider";
import { BottomNav } from "@/components/BottomNav";

export const maxDuration = 60;

export const metadata: Metadata = {
  title: {
    default: "جالیز | فروشگاه گیاه، بذر و ابزار باغبانی",
    template: "%s | جالیز",
  },
  description:
    "خرید و فروش بذر، قلمه، ابزار و محصولات باغبانی. یادآور آبیاری، ثبت گیاه و مشاوره هوشمند باغبانی.",
  manifest: "/manifest.json",
  themeColor: "#12382e",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme') || 'system';
                  if (storedTheme === 'dark' || (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Failed to init theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <LanguageProvider>
          <AuthProvider>
            <MarketplaceProvider>
              {children}
              <BottomNav />
            </MarketplaceProvider>
          </AuthProvider>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('SW registered:', reg.scope); })
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

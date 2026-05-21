import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { MarketplaceProvider } from "@/components/MarketplaceProvider";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "jaliz MVP",
  description: "Hyper-local gardening advice and marketplace",
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

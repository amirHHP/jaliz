import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "بازارچه خرید و فروش بذر، قلمه و ابزار باغبانی",
  description:
    "خرید، فروش و تبادل انواع بذر، قلمه گل، گیاهان آپارتمانی و ابزار باغبانی بدون واسطه در بازارچه جالیز.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "بازارچه خرید و فروش بذر، قلمه و ابزار باغبانی | جالیز",
    description:
      "خرید، فروش و تبادل انواع بذر، قلمه گل، گیاهان آپارتمانی و ابزار باغبانی بدون واسطه در بازارچه جالیز.",
    type: "website",
    locale: "fa_IR",
  },
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

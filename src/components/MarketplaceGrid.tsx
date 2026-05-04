"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf, Scissors, Sprout, MapPin, MessageCircle } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"

// Mock Data
const MOCK_LISTINGS = [
  {
    id: 1,
    titleEn: "Monstera Cutting",
    titleFa: "قلمه مونسترا",
    typeEn: "Cutting",
    typeFa: "قلمه",
    distance: "1.2 km",
    user: "Sarah J.",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d40?auto=format&fit=crop&q=80&w=400&h=300",
  },
  {
    id: 2,
    titleEn: "Heirloom Tomato Seeds",
    titleFa: "بذر گوجه فرنگی",
    typeEn: "Seed",
    typeFa: "بذر",
    distance: "3.5 km",
    user: "Mike T.",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=400&h=300",
  },
  {
    id: 3,
    titleEn: "Pruning Shears",
    titleFa: "قیچی هرس",
    typeEn: "Tool",
    typeFa: "ابزار",
    distance: "4.8 km",
    user: "Elena R.",
    image: "https://images.unsplash.com/photo-1416879598555-520f9f292fa0?auto=format&fit=crop&q=80&w=400&h=300",
  }
]

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Cutting": return <Leaf className="h-4 w-4" />
    case "Seed": return <Sprout className="h-4 w-4" />
    case "Tool": return <Scissors className="h-4 w-4" />
    default: return <Leaf className="h-4 w-4" />
  }
}

export function MarketplaceGrid() {
  const { language, t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{t("market_title")}</h2>
        <span className="text-sm text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-medium">{t("market_within")}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_LISTINGS.map((item) => (
          <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={item.image} 
                alt={language === "en" ? item.titleEn : item.titleFa} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow-sm">
                <TypeIcon type={item.typeEn} />
                {language === "en" ? item.typeEn : item.typeFa}
              </div>
            </div>
            
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-slate-900">{language === "en" ? item.titleEn : item.titleFa}</CardTitle>
              <div className="flex items-center text-sm text-slate-500 mt-1 font-medium">
                <MapPin className={`h-3.5 w-3.5 text-slate-400 ${language === "fa" ? 'ml-1' : 'mr-1'}`} />
                {item.distance} {t("away")} • {t("by")} {item.user}
              </div>
            </CardHeader>
            
            <CardFooter className="p-4 pt-3">
              <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 gap-2 transition-colors">
                <MessageCircle className="h-4 w-4" />
                {t("contact_btn")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

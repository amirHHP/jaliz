import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getListingByIdAction, getListingOwnerNameAction } from "@/app/actions/marketplace"
import { ListingPageClient } from "./ListingPageClient"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getListingByIdAction(id)
  if (!listing) {
    return { title: "آگهی یافت نشد | جالیز" }
  }

  const title = `${listing.title} | فروشگاه جالیز`
  const description =
    listing.description?.slice(0, 160) ||
    `خرید و فروش ${listing.type === "seed" ? "بذر" : listing.type === "cutting" ? "قلمه" : listing.type === "tool" ? "ابزار باغبانی" : "محصول"} در فروشگاه جالیز`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(listing.image && !listing.image.startsWith("data:") ? { images: [listing.image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params
  const listing = await getListingByIdAction(id)
  if (!listing) notFound()

  const owner = await getListingOwnerNameAction(listing.ownerId)

  // Map Prisma dates to serializable strings
  const serializedListing = {
    id: listing.id,
    ownerId: listing.ownerId,
    title: listing.title,
    description: listing.description,
    type: listing.type as "seed" | "cutting" | "tool" | "produce",
    mode: listing.mode as "sell" | "exchange" | "free",
    price: listing.price ?? undefined,
    exchangeFor: listing.exchangeFor ?? undefined,
    location: listing.location ?? undefined,
    image: listing.image ?? undefined,
    contactPhone: listing.contactPhone ?? undefined,
    status: listing.status as "active" | "completed",
    createdAt: listing.createdAt.toISOString(),
    completedAt: listing.completedAt?.toISOString(),
  }

  const ownerName = owner?.fullName || "—"
  const ownerPhone = owner?.phone ?? undefined

  // JSON-LD structured data for SEO (schema.org/Product)
  const typeMap: Record<string, string> = {
    seed: "بذر",
    cutting: "قلمه",
    tool: "ابزار باغبانی",
    produce: "محصول",
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    category: typeMap[listing.type] || listing.type,
    ...(listing.image && !listing.image.startsWith("data:")
      ? { image: listing.image }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price:
        listing.mode === "sell" && listing.price
          ? listing.price * 10 // toman to rial
          : 0,
      availability:
        listing.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      ...(listing.location ? { areaServed: listing.location } : {}),
    },
    seller: {
      "@type": "Person",
      name: ownerName,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingPageClient
        listing={serializedListing}
        ownerName={ownerName}
        ownerPhone={ownerPhone}
      />
    </>
  )
}

import { MetadataRoute } from "next"
import prisma from "@/lib/prisma"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jaliz.ir"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  // Dynamic listing pages
  let listingPages: MetadataRoute.Sitemap = []
  try {
    const listings = await prisma.marketplaceListing.findMany({
      where: { status: "active" },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })

    listingPages = listings.map((listing) => ({
      url: `${SITE_URL}/marketplace/${listing.id}`,
      lastModified: listing.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (err) {
    console.error("Sitemap: failed to fetch listings", err)
  }

  return [...staticPages, ...listingPages]
}

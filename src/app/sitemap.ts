import { MetadataRoute } from "next"
import prisma from "@/lib/prisma"
import { blogPosts } from "@/lib/blogData"
import { getAllWikiPlants } from "@/lib/wikiData"
import { getCanonicalSiteUrl } from "@/lib/siteUrl"

const SITE_URL = getCanonicalSiteUrl()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/wiki`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/plants/diagnose`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]

  // Plant encyclopedia pages
  let wikiPages: MetadataRoute.Sitemap = []
  try {
    const plants = getAllWikiPlants()
    wikiPages = plants.map((plant) => ({
      url: `${SITE_URL}/wiki/${encodeURIComponent(plant.slug)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch (err) {
    console.error("Sitemap: failed to load wiki plants", err)
  }

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
    lastModified: new Date(post.publishedAtIso),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

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

  return [...staticPages, ...wikiPages, ...blogPages, ...listingPages]
}

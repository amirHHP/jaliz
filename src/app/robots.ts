import { MetadataRoute } from "next"
import { getCanonicalSiteUrl } from "@/lib/siteUrl"

const SITE_URL = getCanonicalSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/schedule",
          "/plants/new",
          "/login",
          "/register",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getCanonicalSiteUrl } from "../siteUrl"
import sitemap from "@/app/sitemap"
import robots from "@/app/robots"

describe("Canonical Site URL & Cross-Domain Protection", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("defaults to https://jalizapp.ir when NEXT_PUBLIC_SITE_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    expect(getCanonicalSiteUrl()).toBe("https://jalizapp.ir")
  })

  it("strictly prevents payment gateway domain (jaliz.noxte.ir) from leaking into canonical URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://jaliz.noxte.ir"
    expect(getCanonicalSiteUrl()).toBe("https://jalizapp.ir")
  })

  it("strictly prevents legacy jaliz.ir domain from leaking into canonical URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://jaliz.ir"
    expect(getCanonicalSiteUrl()).toBe("https://jalizapp.ir")
  })

  it("strips trailing slash from canonical URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://jalizapp.ir/"
    expect(getCanonicalSiteUrl()).toBe("https://jalizapp.ir")
  })

  it("guarantees sitemap contains 0 foreign domains even if environment variables are set to noxte.ir", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://jaliz.noxte.ir"
    const entries = await sitemap()

    expect(entries.length).toBeGreaterThan(0)
    for (const entry of entries) {
      expect(entry.url.startsWith("https://jalizapp.ir")).toBe(true)
      expect(entry.url.includes("noxte.ir")).toBe(false)
      expect(entry.url.includes("jaliz.ir")).toBe(false)
    }
  })

  it("guarantees robots.txt sitemap points strictly to https://jalizapp.ir/sitemap.xml", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://jaliz.noxte.ir"
    const config = robots()
    expect(config.sitemap).toBe("https://jalizapp.ir/sitemap.xml")
  })
})

/**
 * Canonical public site URL used across SEO, Sitemaps, Robots, and Structured Data.
 * Always resolves to the official public production domain (https://jalizapp.ir).
 * Strictly guards against accidental leaks of payment gateway proxy domains (e.g. jaliz.noxte.ir)
 * or legacy development/internal domains in server environment variables.
 */
export function getCanonicalSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (
    !fromEnv ||
    fromEnv.includes("noxte.ir") ||
    fromEnv.includes("jaliz.ir") ||
    fromEnv.includes("localhost") ||
    fromEnv.includes("127.0.0.1")
  ) {
    if (
      process.env.NODE_ENV === "development" &&
      fromEnv &&
      (fromEnv.includes("localhost") || fromEnv.includes("127.0.0.1"))
    ) {
      return fromEnv.replace(/\/$/, "")
    }
    return "https://jalizapp.ir"
  }
  return fromEnv.replace(/\/$/, "")
}

export const CANONICAL_SITE_URL = getCanonicalSiteUrl()

/**
 * Pure helpers mirroring public/sw.js routing rules — kept testable outside the SW.
 * If you change matching rules, update public/sw.js in lockstep.
 */

export function isImmutableStaticPath(pathname: string): boolean {
  if (pathname.startsWith("/_next/static/")) return true
  if (pathname.startsWith("/icons/")) return true
  if (pathname.startsWith("/screenshots/")) return true
  if (/\.(?:woff2?|ttf|otf|eot)$/i.test(pathname)) return true
  if (
    pathname === "/manifest.json" ||
    pathname === "/logo-vertical.jpg" ||
    pathname === "/logo-horizontal.jpg" ||
    pathname === "/logo-icon.jpg" ||
    pathname === "/logo-icon-dark.jpg" ||
    pathname === "/offline.html"
  ) {
    return true
  }
  return false
}

export function isImagePath(pathname: string, destination?: string): boolean {
  if (destination === "image") return true
  return /\.(?:png|jpe?g|gif|webp|svg|avif|ico)$/i.test(pathname)
}

export function shouldBypassCache(pathname: string, method: string): boolean {
  if (method !== "GET") return true
  if (pathname.startsWith("/api/")) return true
  return false
}

export function trimCacheKeys<T>(keys: T[], maxEntries: number): T[] {
  if (keys.length <= maxEntries) return []
  return keys.slice(0, keys.length - maxEntries)
}

export function isDynamicUserPath(pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname === "/schedule" ||
    pathname.startsWith("/marketplace/chats") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/plants/new") ||
    pathname.startsWith("/plants/diagnose")
  ) {
    return true
  }
  return false
}

export function isRscRequest(url: URL | string, headers?: Headers | Record<string, string>): boolean {
  const parsedUrl = typeof url === "string" ? new URL(url, "http://localhost") : url
  if (parsedUrl.searchParams.has("_rsc")) return true
  if (headers) {
    if (typeof (headers as Headers).get === "function") {
      if ((headers as Headers).get("RSC") === "1") return true
    } else if (
      (headers as Record<string, string>)["RSC"] === "1" ||
      (headers as Record<string, string>)["rsc"] === "1"
    ) {
      return true
    }
  }
  return false
}

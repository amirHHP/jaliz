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
    pathname === "/hero-character.png" ||
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

import { describe, expect, it } from "vitest"
import {
  isImagePath,
  isImmutableStaticPath,
  shouldBypassCache,
  trimCacheKeys,
  isDynamicUserPath,
  isRscRequest,
} from "@/lib/pwa/cache-routing"

describe("isImmutableStaticPath", () => {
  it("matches Next hashed assets and icons", () => {
    expect(isImmutableStaticPath("/_next/static/chunks/app.js")).toBe(true)
    expect(isImmutableStaticPath("/icons/icon-192x192.png")).toBe(true)
    expect(isImmutableStaticPath("/fonts/vazir.woff2")).toBe(true)
    expect(isImmutableStaticPath("/manifest.json")).toBe(true)
  })

  it("rejects app routes", () => {
    expect(isImmutableStaticPath("/")).toBe(false)
    expect(isImmutableStaticPath("/marketplace")).toBe(false)
    expect(isImmutableStaticPath("/plants/diagnose")).toBe(false)
  })
})

describe("isImagePath", () => {
  it("detects by extension or destination", () => {
    expect(isImagePath("/logo-vertical.jpg")).toBe(true)
    expect(isImagePath("/foo", "image")).toBe(true)
    expect(isImagePath("/sw.js")).toBe(false)
  })
})

describe("shouldBypassCache", () => {
  it("bypasses API and non-GET", () => {
    expect(shouldBypassCache("/api/plants", "GET")).toBe(true)
    expect(shouldBypassCache("/", "POST")).toBe(true)
    expect(shouldBypassCache("/", "GET")).toBe(false)
  })
})

describe("trimCacheKeys", () => {
  it("returns oldest keys to delete when over limit", () => {
    expect(trimCacheKeys(["a", "b", "c", "d"], 2)).toEqual(["a", "b"])
    expect(trimCacheKeys(["a", "b"], 5)).toEqual([])
  })
})

describe("isDynamicUserPath", () => {
  it("identifies user-dependent pages that must not serve stale cache", () => {
    expect(isDynamicUserPath("/")).toBe(true)
    expect(isDynamicUserPath("/schedule")).toBe(true)
    expect(isDynamicUserPath("/marketplace/chats")).toBe(true)
    expect(isDynamicUserPath("/shop")).toBe(true)
    expect(isDynamicUserPath("/admin/shops")).toBe(true)
    expect(isDynamicUserPath("/plants/new")).toBe(true)
    expect(isDynamicUserPath("/plants/diagnose")).toBe(true)
  })

  it("does not flag static pages as dynamic user paths", () => {
    expect(isDynamicUserPath("/offline.html")).toBe(false)
    expect(isDynamicUserPath("/manifest.json")).toBe(false)
    expect(isDynamicUserPath("/blog")).toBe(false)
  })
})

describe("isRscRequest", () => {
  it("detects Next.js RSC requests via searchParam or header", () => {
    expect(isRscRequest("http://localhost/?_rsc=abc")).toBe(true)
    expect(isRscRequest(new URL("http://localhost/?_rsc=abc"))).toBe(true)
    expect(isRscRequest("http://localhost/", { RSC: "1" })).toBe(true)
    expect(isRscRequest("http://localhost/", new Headers({ RSC: "1" }))).toBe(true)
    expect(isRscRequest("http://localhost/")).toBe(false)
  })
})

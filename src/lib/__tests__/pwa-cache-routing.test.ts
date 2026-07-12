import { describe, expect, it } from "vitest"
import {
  isImagePath,
  isImmutableStaticPath,
  shouldBypassCache,
  trimCacheKeys,
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
    expect(isImagePath("/hero-character.png")).toBe(true)
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

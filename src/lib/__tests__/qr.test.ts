import { describe, expect, it } from "vitest"
import { renderQrSvg } from "@/lib/qr"

describe("renderQrSvg", () => {
  it("returns an svg for a url", () => {
    const svg = renderQrSvg("https://jaliz.app/store-scan?store=test")
    expect(svg.startsWith("<svg")).toBe(true)
    expect(svg).toContain("</svg>")
  })
})

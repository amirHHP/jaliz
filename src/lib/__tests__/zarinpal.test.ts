import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const fetchMock = vi.fn()

describe("zarinpal client", () => {
  beforeEach(() => {
    vi.resetModules()
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
    process.env.ZARINPAL_MERCHANT_ID = "f7ca2a9d-f8bc-43ca-a72c-a13addf1e507"
    process.env.NEXT_PUBLIC_SITE_URL = "https://jaliz.ir"
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("requests a payment and returns authority on code 100", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { code: 100, authority: "A00000000000000000000000000000000001", fee: 0 },
        errors: [],
      }),
    })

    const { requestZarinpalPayment, zarinpalStartPayUrl } = await import("@/lib/zarinpal")
    const result = await requestZarinpalPayment({
      amountRial: 990_000,
      description: "test",
      callbackUrl: "https://jaliz.ir/payments/callback",
    })

    expect(result).toEqual({
      ok: true,
      authority: "A00000000000000000000000000000000001",
      fee: 0,
    })
    expect(zarinpalStartPayUrl(result.ok ? result.authority : "")).toBe(
      "https://www.zarinpal.com/pg/StartPay/A00000000000000000000000000000000001",
    )
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.zarinpal.com/pg/v4/payment/request.json",
      expect.objectContaining({ method: "POST" }),
    )
  })

  it("verifies a successful payment", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { code: 100, ref_id: 123456, card_pan: "502229******1234" },
        errors: [],
      }),
    })

    const { verifyZarinpalPayment } = await import("@/lib/zarinpal")
    const result = await verifyZarinpalPayment({
      amountRial: 990_000,
      authority: "A00000000000000000000000000000000001",
    })

    expect(result).toEqual({
      ok: true,
      code: 100,
      refId: 123456,
      cardPan: "502229******1234",
    })
  })

  it("returns failure when zarinpal rejects the request", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { code: -9, message: "Validation error" },
        errors: [],
      }),
    })

    const { requestZarinpalPayment } = await import("@/lib/zarinpal")
    const result = await requestZarinpalPayment({
      amountRial: 100,
      description: "bad",
      callbackUrl: "https://jaliz.ir/payments/callback",
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe(-9)
    }
  })
})

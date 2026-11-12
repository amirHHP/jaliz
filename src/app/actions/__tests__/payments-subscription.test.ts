import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const mockGetSessionUserId = vi.fn()
const mockRequestZarinpalPayment = vi.fn()
const mockVerifyZarinpalPayment = vi.fn()

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
  },
  ensureDatabaseSchema: vi.fn().mockResolvedValue(undefined),
}

vi.mock("@/app/actions/auth", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
  SESSION_KEY: "jaliz_session",
}))

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  ensureDatabaseSchema: () => mockPrisma.ensureDatabaseSchema(),
}))

vi.mock("@/lib/zarinpal", () => ({
  getSiteUrl: () => "https://jalizapp.ir",
  getPaymentGatewayBaseUrl: () => "https://jaliz.noxte.ir",
  getPaymentCallbackUrl: () => "https://jaliz.noxte.ir/payments/callback",
  zarinpalStartPayUrl: (auth: string) => `https://www.zarinpal.com/pg/StartPay/${auth}`,
  zarinpalErrorMessageFa: (_code: number, fallback: string) => fallback,
  requestZarinpalPayment: (args: any) => mockRequestZarinpalPayment(args),
  verifyZarinpalPayment: (args: any) => mockVerifyZarinpalPayment(args),
}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => {
      if (name.toLowerCase() === "origin") return "https://jalizapp.ir"
      return null
    },
  })),
}))

describe("Subscription Payment Actions & Gateway Callback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createSubscriptionPaymentAction", () => {
    it("fails when user is not logged in", async () => {
      mockGetSessionUserId.mockResolvedValue(null)
      const { createSubscriptionPaymentAction } = await import("../payments")
      const result = await createSubscriptionPaymentAction()
      expect(result).toEqual({
        ok: false,
        error: "برای خرید اشتراک ابتدا وارد شوید.",
      })
    })

    it("initiates payment with canonical jaliz.noxte.ir callback and tracks origin jalizapp.ir", async () => {
      mockGetSessionUserId.mockResolvedValue("user-123")
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@jalizapp.ir",
        phone: "09121234567",
        isActive: true,
      })
      mockRequestZarinpalPayment.mockResolvedValue({
        ok: true,
        authority: "A0001",
        fee: 0,
      })
      mockPrisma.payment.create.mockResolvedValue({ id: "pay-1" })

      const { createSubscriptionPaymentAction } = await import("../payments")
      const result = await createSubscriptionPaymentAction()

      expect(result).toEqual({
        ok: true,
        paymentUrl: "https://www.zarinpal.com/pg/StartPay/A0001",
      })

      expect(mockRequestZarinpalPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          callbackUrl: "https://jaliz.noxte.ir/payments/callback",
          amountRial: 990000,
        }),
      )

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-123",
          authority: "A0001",
          status: "pending",
          buyerNotes: expect.stringContaining("jalizapp.ir"),
        }),
      })
    })

    it("auto-heals database schema and retries when Payment table is missing", async () => {
      mockGetSessionUserId.mockResolvedValue("user-123")
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@jalizapp.ir",
        isActive: true,
      })
      mockRequestZarinpalPayment.mockResolvedValue({
        ok: true,
        authority: "A0002",
        fee: 0,
      })

      // First create attempt fails (e.g. no such table: Payment)
      mockPrisma.payment.create
        .mockRejectedValueOnce(new Error("no such table: Payment"))
        .mockResolvedValueOnce({ id: "pay-2" })

      const { createSubscriptionPaymentAction } = await import("../payments")
      const result = await createSubscriptionPaymentAction()

      expect(result).toEqual({
        ok: true,
        paymentUrl: "https://www.zarinpal.com/pg/StartPay/A0002",
      })

      expect(mockPrisma.ensureDatabaseSchema).toHaveBeenCalled()
      expect(mockPrisma.payment.create).toHaveBeenCalledTimes(2)
    })
  })

  describe("payments/callback route GET", () => {
    it("redirects back to jalizapp.ir when user came from jalizapp.ir", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "pay-123",
        userId: "user-123",
        type: "subscription",
        amount: 990000,
        status: "pending",
        buyerNotes: JSON.stringify({ returnOrigin: "https://jalizapp.ir" }),
      })
      mockVerifyZarinpalPayment.mockResolvedValue({
        ok: true,
        code: 100,
        refId: 987654,
      })
      mockPrisma.payment.aggregate.mockResolvedValue({ _max: { expiresAt: null } })
      mockPrisma.payment.update.mockResolvedValue({})

      const { GET } = await import("../../payments/callback/route")
      const req = new NextRequest("https://jaliz.noxte.ir/payments/callback?Authority=A0001&Status=OK")
      const res = await GET(req)

      expect(res.status).toBe(307)
      const location = res.headers.get("location")
      expect(location).toBe("https://jalizapp.ir/schedule?subscribed=1")

      // Checks that session cookie is attached
      const setCookie = res.headers.get("set-cookie")
      expect(setCookie).toContain("jaliz_session=")
    })

    it("redirects to jalizapp.ir cancelled page when status is NOK", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "pay-123",
        userId: "user-123",
        type: "subscription",
        amount: 990000,
        status: "pending",
        buyerNotes: JSON.stringify({ returnOrigin: "https://jalizapp.ir" }),
      })
      mockPrisma.payment.update.mockResolvedValue({})

      const { GET } = await import("../../payments/callback/route")
      const req = new NextRequest("https://jaliz.noxte.ir/payments/callback?Authority=A0001&Status=NOK")
      const res = await GET(req)

      expect(res.status).toBe(307)
      const location = res.headers.get("location")
      expect(location).toBe("https://jalizapp.ir/schedule?payment=cancelled")
    })
  })
})

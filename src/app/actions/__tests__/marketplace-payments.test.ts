import { beforeEach, describe, expect, it, vi } from "vitest"

const mockGetSessionUserId = vi.fn()
const mockRequestZarinpalPayment = vi.fn()
const mockVerifyZarinpalPayment = vi.fn()

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  marketplaceListing: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  marketplaceConversation: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  marketplaceMessage: {
    create: vi.fn(),
  },
  globalSetting: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}

vi.mock("@/app/actions/auth", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
}))

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}))

vi.mock("@/lib/zarinpal", () => ({
  getSiteUrl: () => "https://jaliz.ir",
  zarinpalStartPayUrl: (auth: string) => `https://www.zarinpal.com/pg/StartPay/${auth}`,
  zarinpalErrorMessageFa: (_code: number, fallback: string) => fallback,
  requestZarinpalPayment: (args: any) => mockRequestZarinpalPayment(args),
  verifyZarinpalPayment: (args: any) => mockVerifyZarinpalPayment(args),
}))

describe("Marketplace Payments Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Shipping Fee Settings Actions", () => {
    it("returns default shipping fee of 150000 if setting is not in db", async () => {
      mockPrisma.globalSetting.findUnique.mockResolvedValue(null)
      const { getShippingFeeAction } = await import("../settings")
      const fee = await getShippingFeeAction()
      expect(fee).toBe(150000)
    })

    it("returns parsed fee from globalSetting", async () => {
      mockPrisma.globalSetting.findUnique.mockResolvedValue({ key: "marketplace_shipping_fee", value: "200000" })
      const { getShippingFeeAction } = await import("../settings")
      const fee = await getShippingFeeAction()
      expect(fee).toBe(200000)
    })

    it("saves shipping fee when user is admin", async () => {
      mockGetSessionUserId.mockResolvedValue("admin-1")
      mockPrisma.user.findUnique.mockResolvedValue({ id: "admin-1", role: "admin" })
      const { setShippingFeeAction } = await import("../settings")
      const result = await setShippingFeeAction(180000)
      expect(result).toEqual({ ok: true })
      expect(mockPrisma.globalSetting.upsert).toHaveBeenCalledWith({
        where: { key: "marketplace_shipping_fee" },
        update: { value: "180000" },
        create: { key: "marketplace_shipping_fee", value: "180000" },
      })
    })
  })

  describe("createMarketplacePaymentAction (Direct Buy)", () => {
    it("returns error if user is not authenticated", async () => {
      mockGetSessionUserId.mockResolvedValue(null)

      const { createMarketplacePaymentAction } = await import("../payments")
      const result = await createMarketplacePaymentAction({ listingId: "list-1" })

      expect(result).toEqual({
        ok: false,
        error: "برای خرید آنلاین ابتدا وارد حساب کاربری خود شوید.",
      })
    })

    it("returns error if listing is not found", async () => {
      mockGetSessionUserId.mockResolvedValue("user-buyer")
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-buyer", isActive: true })
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue(null)

      const { createMarketplacePaymentAction } = await import("../payments")
      const result = await createMarketplacePaymentAction({ listingId: "list-nonexistent" })

      expect(result).toEqual({
        ok: false,
        error: "آگهی مورد نظر یافت نشد.",
      })
    })

    it("prevents seller from buying their own listing", async () => {
      mockGetSessionUserId.mockResolvedValue("user-same")
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-same", isActive: true })
      mockPrisma.marketplaceListing.findUnique.mockResolvedValue({
        id: "list-1",
        status: "active",
        mode: "sell",
        price: 50000,
        ownerId: "user-same",
      })

      const { createMarketplacePaymentAction } = await import("../payments")
      const result = await createMarketplacePaymentAction({ listingId: "list-1" })

      expect(result).toEqual({
        ok: false,
        error: "شما نمی‌توانید آگهی ثبت‌شده توسط خودتان را خریداری کنید!",
      })
    })
  })

  describe("createMarketplaceCartPaymentAction (Cart Checkout)", () => {
    it("returns error if user is not authenticated", async () => {
      mockGetSessionUserId.mockResolvedValue(null)

      const { createMarketplaceCartPaymentAction } = await import("../payments")
      const result = await createMarketplaceCartPaymentAction({
        items: [{ listingId: "list-1", quantity: 1 }],
      })

      expect(result).toEqual({
        ok: false,
        error: "برای خرید آنلاین ابتدا وارد حساب کاربری خود شوید.",
      })
    })

    it("returns error if cart is empty", async () => {
      mockGetSessionUserId.mockResolvedValue("user-buyer")
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-buyer", isActive: true })

      const { createMarketplaceCartPaymentAction } = await import("../payments")
      const result = await createMarketplaceCartPaymentAction({ items: [] })

      expect(result).toEqual({
        ok: false,
        error: "سبد خرید شما خالی است.",
      })
    })

    it("ENFORCES SINGLE-SELLER CONSTRAINT and rejects items from multiple sellers", async () => {
      mockGetSessionUserId.mockResolvedValue("user-buyer")
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-buyer", isActive: true })

      mockPrisma.marketplaceListing.findMany.mockResolvedValue([
        {
          id: "list-1",
          title: "بذر ۱",
          price: 40000,
          mode: "sell",
          status: "active",
          ownerId: "seller-A",
          owner: { fullName: "فروشگاه الف" },
        },
        {
          id: "list-2",
          title: "بذر ۲",
          price: 60000,
          mode: "sell",
          status: "active",
          ownerId: "seller-B",
          owner: { fullName: "فروشگاه ب" },
        },
      ])

      const { createMarketplaceCartPaymentAction } = await import("../payments")
      const result = await createMarketplaceCartPaymentAction({
        items: [
          { listingId: "list-1", quantity: 1 },
          { listingId: "list-2", quantity: 1 },
        ],
      })

      expect(result).toEqual({
        ok: false,
        error: "سبد خرید فقط می‌تواند شامل محصولات متعلق به یک فروشگاه/فروشنده باشد.",
      })
    })

    it("calculates items subtotal + shipping fee and initiates payment for valid cart", async () => {
      mockGetSessionUserId.mockResolvedValue("user-buyer")
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-buyer",
        email: "buyer@jaliz.ir",
        phone: "09121111111",
        isActive: true,
      })

      // Default shipping fee: 150,000 Tomans
      mockPrisma.globalSetting.findUnique.mockResolvedValue(null)

      mockPrisma.marketplaceListing.findMany.mockResolvedValue([
        {
          id: "list-1",
          title: "بذر ریحان",
          price: 50000, // 2 x 50,000 = 100,000 Tomans
          mode: "sell",
          status: "active",
          ownerId: "seller-A",
          owner: { fullName: "گلخانه سبز" },
        },
        {
          id: "list-2",
          title: "کود مایع",
          price: 80000, // 1 x 80,000 = 80,000 Tomans
          mode: "sell",
          status: "active",
          ownerId: "seller-A",
          owner: { fullName: "گلخانه سبز" },
        },
      ])

      mockRequestZarinpalPayment.mockResolvedValue({
        ok: true,
        authority: "A_CART_123",
        fee: 0,
      })

      mockPrisma.payment.create.mockResolvedValue({ id: "pay-cart-1" })

      const { createMarketplaceCartPaymentAction } = await import("../payments")
      const result = await createMarketplaceCartPaymentAction({
        items: [
          { listingId: "list-1", quantity: 2 },
          { listingId: "list-2", quantity: 1 },
        ],
        buyerPhone: "09123456789",
        buyerAddress: "تهران، میدان ونک",
        buyerNotes: "لطفاً صبح ارسال شود",
      })

      expect(result).toEqual({
        ok: true,
        paymentUrl: "https://www.zarinpal.com/pg/StartPay/A_CART_123",
      })

      // Total Toman = 100,000 + 80,000 + 150,000 (shipping) = 330,000 Tomans -> 3,300,000 Rials
      expect(mockRequestZarinpalPayment).toHaveBeenCalledWith({
        amountRial: 3300000,
        description: "خرید آنلاین 2 کالا از گلخانه سبز در جالیز",
        callbackUrl: "https://jaliz.ir/payments/callback",
        email: "buyer@jaliz.ir",
        mobile: "09123456789",
      })

      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-buyer",
            listingId: "list-1",
            type: "marketplace",
            authority: "A_CART_123",
            amount: 3300000,
            status: "pending",
            buyerPhone: "09123456789",
            buyerAddress: "تهران، میدان ونک",
          }),
        }),
      )
    })
  })

  describe("verifyMarketplacePayment", () => {
    it("handles cancelled payment status", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "pay-1",
        authority: "AUTH123",
        amount: 500000,
        status: "pending",
        listingId: "list-1",
      })

      const { verifyMarketplacePayment } = await import("../payments")
      const result = await verifyMarketplacePayment("AUTH123", "NOK")

      expect(result).toEqual({
        ok: false,
        cancelled: true,
        error: "پرداخت لغو شد یا ناموفق بود.",
        listingId: "list-1",
      })

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: "pay-1" },
        data: { status: "cancelled" },
      })
    })

    it("verifies successful payment, updates listings, and sends chat notification with item breakdown and shipping fee", async () => {
      const orderMeta = JSON.stringify({
        isCart: true,
        items: [
          { listingId: "list-1", title: "بذر ریحان", price: 50000, quantity: 2 },
          { listingId: "list-2", title: "کود مایع", price: 80000, quantity: 1 },
        ],
        shippingFee: 150000,
        notes: "تحویل فوری",
      })

      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "pay-1",
        userId: "user-buyer",
        authority: "AUTH123",
        amount: 3300000,
        status: "pending",
        listingId: "list-1",
        buyerPhone: "09123456789",
        buyerAddress: "تهران، میدان ونک",
        buyerNotes: orderMeta,
        listing: {
          id: "list-1",
          title: "بذر ریحان",
          ownerId: "user-seller",
        },
      })

      mockVerifyZarinpalPayment.mockResolvedValue({
        ok: true,
        code: 100,
        refId: 987654,
      })

      mockPrisma.marketplaceConversation.findFirst.mockResolvedValue(null)
      mockPrisma.marketplaceConversation.create.mockResolvedValue({ id: "conv-1" })
      mockPrisma.marketplaceMessage.create.mockResolvedValue({ id: "msg-1", createdAt: new Date() })

      const { verifyMarketplacePayment } = await import("../payments")
      const result = await verifyMarketplacePayment("AUTH123", "OK")

      expect(result).toEqual({
        ok: true,
        refId: "987654",
        listingId: "list-1",
      })

      // Updates payment to paid
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "pay-1" },
          data: expect.objectContaining({
            status: "paid",
            refId: "987654",
          }),
        }),
      )

      // Updates all involved listings to completed
      expect(mockPrisma.marketplaceListing.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["list-1", "list-2"] } },
        data: expect.objectContaining({
          status: "completed",
        }),
      })

      // Sends formatted chat message with items and shipping fee
      expect(mockPrisma.marketplaceMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            conversationId: "conv-1",
            body: expect.stringContaining("هزینه ارسال"),
          }),
        }),
      )
    })
  })
})

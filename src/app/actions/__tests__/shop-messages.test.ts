import { beforeEach, describe, expect, it, vi } from "vitest"

const mockGetCurrentUser = vi.fn()

const mockPrisma = {
  shop: {
    findUnique: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  shopMessage: {
    create: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  shopMessageRead: {
    upsert: vi.fn(),
  },
}

vi.mock("@/app/actions/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}))

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("Shop Messages Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("sendShopMessageAction", () => {
    it("throws error when user is not logged in", async () => {
      mockGetCurrentUser.mockResolvedValue(null)
      const { sendShopMessageAction } = await import("../shop-messages")

      await expect(
        sendShopMessageAction({
          shopId: "shop-1",
          body: "سلام به همگی",
        })
      ).rejects.toThrow("لطفاً ابتدا وارد حساب کاربری خود شوید.")
    })

    it("throws error when user is neither shop owner nor admin", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user-2", role: "user" })
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: "shop-1",
        ownerId: "user-1",
        name: "گلخانه سبز",
      })

      const { sendShopMessageAction } = await import("../shop-messages")

      await expect(
        sendShopMessageAction({
          shopId: "shop-1",
          body: "سلام دوستان",
        })
      ).rejects.toThrow("شما دسترسی ارسال پیام در این فروشگاه را ندارید.")
    })

    it("successfully creates a broadcast message when sender is shop owner", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" })
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: "shop-1",
        ownerId: "user-1",
        name: "گلخانه سبز",
      })
      mockPrisma.shopMessage.create.mockResolvedValue({
        id: "msg-1",
        shopId: "shop-1",
        senderId: "user-1",
        recipientId: null,
        title: "تخفیف",
        body: "تخفیف ۲۰ درصدی کود ارگانیک",
        isBroadcast: true,
      })

      const { sendShopMessageAction } = await import("../shop-messages")

      const result = await sendShopMessageAction({
        shopId: "shop-1",
        title: "تخفیف",
        body: "تخفیف ۲۰ درصدی کود ارگانیک",
      })

      expect(result.success).toBe(true)
      expect(result.isBroadcast).toBe(true)
      expect(result.recipientId).toBeNull()
      expect(mockPrisma.shopMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shopId: "shop-1",
            senderId: "user-1",
            recipientId: null,
            isBroadcast: true,
            title: "تخفیف",
            body: "تخفیف ۲۰ درصدی کود ارگانیک",
          }),
        })
      )
    })

    it("successfully creates a direct message to a specific customer", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "admin-1", role: "admin" })
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: "shop-1",
        ownerId: "user-1",
        name: "گلخانه سبز",
      })
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "customer-1",
        fullName: "علی رضایی",
        email: "ali@example.com",
      })
      mockPrisma.shopMessage.create.mockResolvedValue({
        id: "msg-2",
        shopId: "shop-1",
        senderId: "admin-1",
        recipientId: "customer-1",
        body: "گلدان شما آماده ارسال است.",
        isBroadcast: false,
      })

      const { sendShopMessageAction } = await import("../shop-messages")

      const result = await sendShopMessageAction({
        shopId: "shop-1",
        recipientId: "customer-1",
        body: "گلدان شما آماده ارسال است.",
      })

      expect(result.success).toBe(true)
      expect(result.isBroadcast).toBe(false)
      expect(result.recipientId).toBe("customer-1")
    })

    it("throws error if direct recipient does not belong to shop", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user-1", role: "user" })
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: "shop-1",
        ownerId: "user-1",
        name: "گلخانه سبز",
      })
      mockPrisma.user.findFirst.mockResolvedValue(null)

      const { sendShopMessageAction } = await import("../shop-messages")

      await expect(
        sendShopMessageAction({
          shopId: "shop-1",
          recipientId: "stranger-1",
          body: "سلام",
        })
      ).rejects.toThrow("مشتری مورد نظر عضو این فروشگاه نیست.")
    })
  })

  describe("getCustomerShopMessagesAction", () => {
    it("returns empty when user has no shop", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user-1", shopId: null })
      const { getCustomerShopMessagesAction } = await import("../shop-messages")

      const result = await getCustomerShopMessagesAction()
      expect(result.messages).toEqual([])
      expect(result.shop).toBeNull()
    })

    it("returns mapped messages with read status", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "customer-1", shopId: "shop-1" })
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: "shop-1",
        name: "گلستان",
        code: "golestan",
      })
      mockPrisma.shopMessage.findMany.mockResolvedValue([
        {
          id: "m-1",
          title: "سلام",
          body: "پیام تستی",
          isBroadcast: true,
          createdAt: new Date(),
          sender: { fullName: "مدیر گلستان" },
          reads: [{ readAt: new Date() }],
        },
        {
          id: "m-2",
          title: null,
          body: "پیام جدید",
          isBroadcast: false,
          createdAt: new Date(),
          sender: { fullName: "مدیر گلستان" },
          reads: [],
        },
      ])

      const { getCustomerShopMessagesAction } = await import("../shop-messages")
      const result = await getCustomerShopMessagesAction()

      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].isRead).toBe(true)
      expect(result.messages[1].isRead).toBe(false)
    })
  })

  describe("markShopMessageAsReadAction", () => {
    it("upserts read record for authenticated user", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user-1" })
      mockPrisma.shopMessageRead.upsert.mockResolvedValue({})

      const { markShopMessageAsReadAction } = await import("../shop-messages")
      const result = await markShopMessageAsReadAction("msg-1")

      expect(result.success).toBe(true)
      expect(mockPrisma.shopMessageRead.upsert).toHaveBeenCalledWith({
        where: {
          messageId_userId: {
            messageId: "msg-1",
            userId: "user-1",
          },
        },
        create: {
          messageId: "msg-1",
          userId: "user-1",
        },
        update: expect.any(Object),
      })
    })
  })
})

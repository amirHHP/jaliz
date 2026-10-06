import { beforeEach, describe, expect, it, vi } from "vitest"
import { signSessionValue } from "@/lib/auth/session-cookie"

const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookies),
}))

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  payment: {
    findMany: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    aggregate: vi.fn(),
  },
}

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}))

describe("Admin Subscription Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fails with FORBIDDEN if caller is not an admin", async () => {
    mockCookies.get.mockReturnValue({ value: signSessionValue("user-regular") })
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-regular",
      email: "regular@jaliz.local",
      role: "user",
      isActive: true,
      createdAt: new Date(),
    })
    mockPrisma.payment.aggregate.mockResolvedValue({ _max: { expiresAt: null } })

    const { grantUsersSubscriptionAction, revokeUsersSubscriptionAction } = await import("../auth")

    const grantRes = await grantUsersSubscriptionAction(["user-1"], 30)
    expect(grantRes).toHaveProperty("__authError", "FORBIDDEN")

    const revokeRes = await revokeUsersSubscriptionAction(["user-1"])
    expect(revokeRes).toHaveProperty("__authError", "FORBIDDEN")
  })

  it("grants subscription to a single user successfully", async () => {
    mockCookies.get.mockReturnValue({ value: signSessionValue("admin-id") })
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "admin-id",
      email: "admin@jaliz.local",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    })
    mockPrisma.payment.aggregate.mockResolvedValue({ _max: { expiresAt: null } })
    mockPrisma.payment.create.mockResolvedValue({ id: "pay-1" })

    const { grantUsersSubscriptionAction } = await import("../auth")
    const res = await grantUsersSubscriptionAction(["target-user-1"], 30, "هدیه ثبت نام")

    expect(res).toEqual({ count: 1 })
    expect(mockPrisma.payment.create).toHaveBeenCalledTimes(1)
    const createArgs = mockPrisma.payment.create.mock.calls[0][0].data
    expect(createArgs.userId).toBe("target-user-1")
    expect(createArgs.amount).toBe(0)
    expect(createArgs.status).toBe("paid")
    expect(createArgs.type).toBe("subscription")
    expect(createArgs.description).toBe("هدیه ثبت نام")
    expect(createArgs.expiresAt).toBeInstanceOf(Date)
    expect(createArgs.authority).toMatch(/^admin_grant_/)
  })

  it("grants subscription to multiple users in batch", async () => {
    mockCookies.get.mockReturnValue({ value: signSessionValue("admin-id") })
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "admin-id",
      email: "admin@jaliz.local",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    })
    mockPrisma.payment.aggregate.mockResolvedValue({ _max: { expiresAt: null } })
    mockPrisma.payment.create.mockResolvedValue({ id: "pay-batch" })

    const { grantUsersSubscriptionAction } = await import("../auth")
    const res = await grantUsersSubscriptionAction(["u1", "u2", "u3"], 90)

    expect(res).toEqual({ count: 3 })
    expect(mockPrisma.payment.create).toHaveBeenCalledTimes(3)
  })

  it("grants permanent lifetime access when durationDays >= 36500", async () => {
    mockCookies.get.mockReturnValue({ value: signSessionValue("admin-id") })
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "admin-id",
      email: "admin@jaliz.local",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    })
    mockPrisma.payment.aggregate.mockResolvedValue({ _max: { expiresAt: null } })
    mockPrisma.payment.create.mockResolvedValue({ id: "pay-perm" })

    const { grantUsersSubscriptionAction } = await import("../auth")
    const res = await grantUsersSubscriptionAction(["u1"], 36500)

    expect(res).toEqual({ count: 1 })
    const createArgs = mockPrisma.payment.create.mock.calls[0][0].data
    expect(createArgs.expiresAt.getUTCFullYear()).toBe(2099)
  })

  it("stacks duration on top of current active subscription", async () => {
    mockCookies.get.mockReturnValue({ value: signSessionValue("admin-id") })
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "admin-id",
      email: "admin@jaliz.local",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    })
    // Existing subscription expires in 10 days
    const futureExpiry = new Date(Date.now() + 10 * 24 * 3600 * 1000)
    mockPrisma.payment.aggregate.mockResolvedValue({ _max: { expiresAt: futureExpiry } })
    mockPrisma.payment.create.mockResolvedValue({ id: "pay-stacked" })

    const { grantUsersSubscriptionAction } = await import("../auth")
    const res = await grantUsersSubscriptionAction(["u1"], 30)

    expect(res).toEqual({ count: 1 })
    const createArgs = mockPrisma.payment.create.mock.calls[0][0].data
    const resultingTime = createArgs.expiresAt.getTime()
    // Should be approximately futureExpiry + 30 days
    const expectedTime = futureExpiry.getTime() + 30 * 24 * 3600 * 1000
    expect(Math.abs(resultingTime - expectedTime)).toBeLessThan(1000)
  })

  it("revokes subscription for users by setting expiresAt to now", async () => {
    mockCookies.get.mockReturnValue({ value: signSessionValue("admin-id") })
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "admin-id",
      email: "admin@jaliz.local",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    })
    mockPrisma.payment.aggregate.mockResolvedValue({ _max: { expiresAt: null } })
    mockPrisma.payment.updateMany.mockResolvedValue({ count: 2 })

    const { revokeUsersSubscriptionAction } = await import("../auth")
    const res = await revokeUsersSubscriptionAction(["u1", "u2"])

    expect(res).toEqual({ count: 2 })
    expect(mockPrisma.payment.updateMany).toHaveBeenCalledTimes(1)
    const updateArgs = mockPrisma.payment.updateMany.mock.calls[0][0]
    expect(updateArgs.where.userId).toEqual({ in: ["u1", "u2"] })
    expect(updateArgs.where.status).toBe("paid")
    expect(updateArgs.data.expiresAt).toBeInstanceOf(Date)
  })

  it("listUsersAction returns users with subscriptionExpiresAt attached", async () => {
    mockCookies.get.mockReturnValue({ value: signSessionValue("admin-id") })
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "admin-id",
      email: "admin@jaliz.local",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    })
    mockPrisma.payment.aggregate.mockResolvedValue({ _max: { expiresAt: null } })

    const u1 = {
      id: "u1",
      email: "u1@jaliz.local",
      fullName: "User One",
      role: "user",
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    }
    const u2 = {
      id: "u2",
      email: "u2@jaliz.local",
      fullName: "User Two",
      role: "user",
      isActive: true,
      createdAt: new Date("2026-01-02T00:00:00Z"),
    }

    mockPrisma.user.findMany.mockResolvedValue([u1, u2])

    const payDate = new Date("2026-10-01T00:00:00Z")
    mockPrisma.payment.findMany.mockResolvedValue([
      { userId: "u1", expiresAt: payDate },
    ])

    const { listUsersAction } = await import("../auth")
    const users = await listUsersAction()

    expect(Array.isArray(users)).toBe(true)
    const typedUsers = (users as unknown) as Array<Record<string, unknown>>
    expect(typedUsers).toHaveLength(2)
    expect(typedUsers[0].subscriptionExpiresAt).toBe(payDate.toISOString())
    expect(typedUsers[1].subscriptionExpiresAt).toBeNull()
  })
})

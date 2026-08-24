import { beforeEach, describe, expect, it, vi } from "vitest"

const mockGetSessionUserId = vi.fn()

const mockPrisma = {
  plantShare: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  userPlant: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  plantStatusLog: {
    create: vi.fn(),
  },
  wateringLog: {
    upsert: vi.fn(),
  },
  $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
}

vi.mock("@/app/actions/auth", () => ({
  getSessionUserId: () => mockGetSessionUserId(),
}))

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}))

function usableShare(overrides: Record<string, unknown> = {}) {
  return {
    id: "share-1",
    token: "tok-1234567890",
    ownerId: "owner-1",
    isActive: true,
    expiresAt: null,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    owner: { id: "owner-1", fullName: "سارا", isActive: true },
    ...overrides,
  }
}

describe("plant share server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("owner actions", () => {
    it("getMyPlantShareAction returns null without a session", async () => {
      mockGetSessionUserId.mockResolvedValue(null)
      const { getMyPlantShareAction } = await import("../plant-share")
      expect(await getMyPlantShareAction()).toBeNull()
    })

    it("getMyPlantShareAction returns null for an expired share", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      mockPrisma.plantShare.findFirst.mockResolvedValue(
        usableShare({ expiresAt: new Date("2026-08-10T00:00:00Z") })
      )
      const { getMyPlantShareAction } = await import("../plant-share")
      expect(await getMyPlantShareAction()).toBeNull()
    })

    it("getMyPlantShareAction returns the active share", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      const expires = new Date("2027-08-10T00:00:00Z")
      mockPrisma.plantShare.findFirst.mockResolvedValue(usableShare({ expiresAt: expires }))
      const { getMyPlantShareAction } = await import("../plant-share")
      expect(await getMyPlantShareAction()).toEqual({ token: "tok-1234567890", expiresAt: expires.toISOString() })
    })

    it("getMyPlantShareAction returns null when the db query fails", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      mockPrisma.plantShare.findFirst.mockRejectedValue(new Error("boom"))
      const { getMyPlantShareAction } = await import("../plant-share")
      expect(await getMyPlantShareAction()).toBeNull()
    })

    it("savePlantShareAction rotates the link and applies expiry days", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      mockPrisma.plantShare.create.mockResolvedValue(usableShare())
      const { savePlantShareAction } = await import("../plant-share")
      const result = await savePlantShareAction(14)
      expect(mockPrisma.plantShare.deleteMany).toHaveBeenCalledWith({ where: { ownerId: "owner-1" } })
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.share.token).toBeTruthy()
      const data = mockPrisma.plantShare.create.mock.calls[0][0].data
      expect(data.token).toBeTruthy()
      expect(data.expiresAt).toBeInstanceOf(Date)
      const diffDays = Math.round((data.expiresAt.getTime() - Date.now()) / 86_400_000)
      expect(diffDays).toBe(14)
    })

    it("savePlantShareAction supports a never-expiring link", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      mockPrisma.plantShare.create.mockResolvedValue(usableShare())
      const { savePlantShareAction } = await import("../plant-share")
      const result = await savePlantShareAction(null)
      const data = mockPrisma.plantShare.create.mock.calls[0][0].data
      expect(data.expiresAt).toBeNull()
      expect(result.ok).toBe(true)
    })

    it("savePlantShareAction rejects out-of-range expiry without touching the db", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      const { savePlantShareAction } = await import("../plant-share")
      expect(await savePlantShareAction(0)).toEqual({ ok: false, reason: "invalid_expiry" })
      expect(await savePlantShareAction(9999)).toEqual({ ok: false, reason: "invalid_expiry" })
      expect(mockPrisma.plantShare.deleteMany).not.toHaveBeenCalled()
    })

    it("savePlantShareAction maps a missing table to a db_schema failure", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      const { PrismaClientKnownRequestError } = await import("@prisma/client/runtime/library")
      mockPrisma.plantShare.deleteMany.mockRejectedValue(
        new PrismaClientKnownRequestError("table does not exist", {
          code: "P2021",
          clientVersion: "test",
        })
      )
      const { savePlantShareAction } = await import("../plant-share")
      expect(await savePlantShareAction(14)).toEqual({ ok: false, reason: "db_schema" })
    })

    it("savePlantShareAction maps unexpected db failures to unknown", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      mockPrisma.plantShare.deleteMany.mockRejectedValue(new Error("connection refused"))
      const { savePlantShareAction } = await import("../plant-share")
      expect(await savePlantShareAction(14)).toEqual({ ok: false, reason: "unknown" })
    })

    it("revokePlantShareAction reports whether anything was removed", async () => {
      mockGetSessionUserId.mockResolvedValue("owner-1")
      mockPrisma.plantShare.deleteMany.mockResolvedValue({ count: 1 })
      const { revokePlantShareAction } = await import("../plant-share")
      expect(await revokePlantShareAction()).toBe(true)
      mockPrisma.plantShare.deleteMany.mockResolvedValue({ count: 0 })
      expect(await revokePlantShareAction()).toBe(false)
    })
  })

  describe("guest actions", () => {
    it("rejects malformed or expired tokens", async () => {
      const { getSharedProfileAction } = await import("../plant-share")
      expect(await getSharedProfileAction("short")).toBeNull()
      mockPrisma.plantShare.findUnique.mockResolvedValue(null)
      expect(await getSharedProfileAction("tok-1234567890")).toBeNull()

      mockPrisma.plantShare.findUnique.mockResolvedValue(
        usableShare({ expiresAt: new Date("2020-01-01T00:00:00Z") })
      )
      expect(await getSharedProfileAction("tok-1234567890")).toBeNull()
    })

    it("returns the profile with mapped plants for a valid token", async () => {
      mockPrisma.plantShare.findUnique.mockResolvedValue(usableShare())
      mockPrisma.userPlant.findMany.mockResolvedValue([
        {
          id: "p1",
          name: "مانسترا",
          type: "Tropical",
          locationType: "Indoor",
          lightExposure: "Bright Indirect",
          potType: "Plastic",
          health: "Good",
          image: null,
          lastWatered: new Date("2026-08-20T00:00:00Z"),
          nextWateringDate: new Date("2026-08-27T00:00:00Z"),
          wateringInterval: 7,
        },
      ])
      const { getSharedProfileAction } = await import("../plant-share")
      const profile = await getSharedProfileAction("tok-1234567890")
      expect(profile).not.toBeNull()
      expect(profile!.ownerName).toBe("سارا")
      expect(profile!.plants).toHaveLength(1)
      expect(profile!.plants[0].lastWatered).toBe("2026-08-20T00:00:00.000Z")
      expect(profile!.nowIso).toBeTruthy()
    })

    it("sharedMarkWateredAction recomputes nextWateringDate from the interval", async () => {
      mockPrisma.plantShare.findUnique.mockResolvedValue(usableShare())
      mockPrisma.userPlant.findFirst.mockResolvedValue({
        id: "p1",
        name: "مانسترا",
        health: "Good",
        lastWatered: new Date("2026-08-20T00:00:00Z"),
        nextWateringDate: new Date("2026-08-27T00:00:00Z"),
        wateringInterval: 5,
      })
      mockPrisma.userPlant.update.mockImplementation((_args, ...rest) => {
        void rest
        return Promise.resolve({
          id: "p1",
          name: "مانسترا",
          health: "Good",
          lastWatered: new Date(),
          nextWateringDate: new Date(),
          wateringInterval: 5,
        })
      })
      const { sharedMarkWateredAction } = await import("../plant-share")
      const updated = await sharedMarkWateredAction("tok-1234567890", "p1")
      expect(updated).not.toBeNull()
      const call = mockPrisma.userPlant.update.mock.calls[0][0]
      expect(call.where).toEqual({ id: "p1" })
      const diffDays = Math.round(
        (call.data.nextWateringDate.getTime() - call.data.lastWatered.getTime()) / 86_400_000
      )
      expect(diffDays).toBe(5)
    })

    it("sharedMarkWateredAction returns null when the plant is not owned by the share owner", async () => {
      mockPrisma.plantShare.findUnique.mockResolvedValue(usableShare())
      mockPrisma.userPlant.findFirst.mockResolvedValue(null)
      const { sharedMarkWateredAction } = await import("../plant-share")
      expect(await sharedMarkWateredAction("tok-1234567890", "other-plant")).toBeNull()
    })

    it("sharedAddStatusLogAction stores the log and updates health in a transaction", async () => {
      mockPrisma.plantShare.findUnique.mockResolvedValue(usableShare())
      mockPrisma.userPlant.findFirst.mockResolvedValue({
        id: "p1",
        name: "مانسترا",
        health: "Needs Attention",
        lastWatered: null,
        nextWateringDate: null,
        wateringInterval: 7,
      })
      mockPrisma.plantStatusLog.create.mockResolvedValue({ id: "log-1" })
      const { sharedAddStatusLogAction } = await import("../plant-share")
      const result = await sharedAddStatusLogAction(
        "tok-1234567890",
        "p1",
        "برگ‌های پایین کمی زرد شده‌اند ولی بقیه سالم است",
        "invalid-health",
        "data:image/jpeg;base64,abc"
      )
      expect(result).toEqual({ ok: true })
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
      const updateCall = mockPrisma.userPlant.update.mock.calls[0][0]
      expect(updateCall.data.health).toBe("Needs Attention")
      const logCall = mockPrisma.plantStatusLog.create.mock.calls[0][0]
      expect(logCall.data.status).toContain("زرد شده‌اند")
      expect(logCall.data.image).toBe("data:image/jpeg;base64,abc")
    })

    it("sharedAddStatusLogAction rejects empty status", async () => {
      mockPrisma.plantShare.findUnique.mockResolvedValue(usableShare())
      mockPrisma.userPlant.findFirst.mockResolvedValue({
        id: "p1",
        name: "مانسترا",
        health: "Good",
        lastWatered: null,
        nextWateringDate: null,
        wateringInterval: 7,
      })
      const { sharedAddStatusLogAction } = await import("../plant-share")
      expect(await sharedAddStatusLogAction("tok-1234567890", "p1", "   ", "Good")).toBeNull()
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })

    it("sharedMarkAllWateredAction waters every plant and completes the day log", async () => {
      mockPrisma.plantShare.findUnique.mockResolvedValue(usableShare())
      mockPrisma.userPlant.findMany.mockResolvedValue([
        { id: "p1", wateringInterval: 3 },
        { id: "p2", wateringInterval: null },
      ])
      const { sharedMarkAllWateredAction } = await import("../plant-share")
      const count = await sharedMarkAllWateredAction("tok-1234567890")
      expect(count).toBe(2)
      expect(mockPrisma.userPlant.update).toHaveBeenCalledTimes(2)
      const p2Call = mockPrisma.userPlant.update.mock.calls[1][0]
      expect(p2Call.where).toEqual({ id: "p2" })
      const p2Diff = Math.round(
        (p2Call.data.nextWateringDate.getTime() - p2Call.data.lastWatered.getTime()) / 86_400_000
      )
      expect(p2Diff).toBe(7)
      expect(mockPrisma.wateringLog.upsert).toHaveBeenCalledTimes(1)
      const upsertCall = mockPrisma.wateringLog.upsert.mock.calls[0][0]
      expect(upsertCall.where.userId_logDate.userId).toBe("owner-1")
    })
  })
})

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = {
  userPlant: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  globalSetting: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(async (ops: any[]) => Promise.all(ops)),
};

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}));

vi.mock("@/app/actions/auth", () => ({
  getSessionUserId: vi.fn(async () => "test-user-id"),
}));

vi.mock("@/lib/subscription-status", () => ({
  userHasActiveSubscription: vi.fn(async () => true),
}));

describe("Performance & Robustness Optimizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updatePlantsLastWateredAction", () => {
    it("handles empty or invalid inputs safely without crashing", async () => {
      const { updatePlantsLastWateredAction } = await import("../plants");

      await updatePlantsLastWateredAction([], "2026-09-23");
      expect(mockPrisma.userPlant.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();

      await updatePlantsLastWateredAction(["p1"], "invalid-date-format");
      expect(mockPrisma.userPlant.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("batches updates in a single prisma.$transaction scoped to user", async () => {
      const { updatePlantsLastWateredAction } = await import("../plants");

      mockPrisma.userPlant.findMany.mockResolvedValue([
        { id: "plant-1", wateringInterval: 3 },
        { id: "plant-2", wateringInterval: 5 },
      ]);
      mockPrisma.userPlant.update.mockImplementation(({ where, data }: any) => ({
        where,
        data,
      }));

      await updatePlantsLastWateredAction(["plant-1", "plant-2"], "2026-09-20T00:00:00.000Z");

      expect(mockPrisma.userPlant.findMany).toHaveBeenCalledWith({
        where: { id: { in: ["plant-1", "plant-2"] }, userId: "test-user-id" },
        select: { id: true, wateringInterval: true },
      });

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.userPlant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "plant-1", userId: "test-user-id" },
        })
      );
      expect(mockPrisma.userPlant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "plant-2", userId: "test-user-id" },
        })
      );
    });
  });

  describe("getAiConfig batched queries", () => {
    it("fetches all settings in a single batched database query", async () => {
      const { getAiConfig } = await import("../settings");

      mockPrisma.globalSetting.findMany.mockResolvedValue([
        { key: "ai-provider", value: "tokenbazaar" },
        { key: "ai-api-key-tokenbazaar", value: "tb-secret-key" },
        { key: "ai-model-tokenbazaar", value: "glm-5.3-flash" },
      ]);

      const config = await getAiConfig();

      expect(mockPrisma.globalSetting.findMany).toHaveBeenCalledTimes(1);
      expect(config).toEqual({
        provider: "tokenbazaar",
        apiKey: "tb-secret-key",
        model: "glm-5.3-flash",
      });
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const countMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      count: countMock,
    },
  },
}));

describe("measureDbLatency", () => {
  beforeEach(() => {
    countMock.mockReset();
    countMock.mockResolvedValue(3);
  });

  it("returns latency after a user.count query", async () => {
    const { measureDbLatency } = await import("@/lib/db-latency");

    const result = await measureDbLatency();

    expect(countMock).toHaveBeenCalledOnce();
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("propagates database errors", async () => {
    countMock.mockRejectedValue(new Error("connection failed"));
    const { measureDbLatency } = await import("@/lib/db-latency");

    await expect(measureDbLatency()).rejects.toThrow("connection failed");
  });
});

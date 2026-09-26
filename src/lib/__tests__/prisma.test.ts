import { describe, expect, it, vi } from "vitest";
import { applyPrismaPragmas } from "../prisma";

describe("applyPrismaPragmas", () => {
  it("executes SQLite WAL mode, busy_timeout, and synchronous PRAGMAs", async () => {
    const executedQueries: string[] = [];
    const mockClient = {
      $queryRawUnsafe: vi.fn(async (query: string) => {
        executedQueries.push(query);
        return [];
      }),
    };

    await applyPrismaPragmas(mockClient as any);

    expect(executedQueries).toEqual([
      "PRAGMA journal_mode = WAL;",
      "PRAGMA busy_timeout = 5000;",
      "PRAGMA synchronous = NORMAL;",
    ]);
  });

  it("handles errors gracefully without throwing", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockClient = {
      $queryRawUnsafe: vi.fn(async () => {
        throw new Error("DB lock error");
      }),
    };

    await expect(applyPrismaPragmas(mockClient as any)).resolves.not.toThrow();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchModelsAction } from "../ai";

describe("TokenBazaar AI Provider", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should fetch models dynamically from TokenBazaar endpoint", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { id: "glm-5.3-flash", context_length: 128000, max_output: 16384 },
          { id: "gpt-4o", context_length: 128000, max_output: 16384 },
        ],
      }),
    } as any);

    const result = await fetchModelsAction("test-tokenbazaar-key", "tokenbazaar");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.tokenbazaar.ai/v1/models",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-tokenbazaar-key" },
      })
    );
    expect(result.models).toBeDefined();
    expect(result.models).toEqual([
      { name: "glm-5.3-flash", inputTokenLimit: 128000, outputTokenLimit: 16384 },
      { name: "gpt-4o", inputTokenLimit: 128000, outputTokenLimit: 16384 },
    ]);
  });

  it("should return invalid API key error on 401 from TokenBazaar", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    } as any);

    const result = await fetchModelsAction("invalid-key", "tokenbazaar");

    expect(result.error).toBe("Invalid API key for TokenBazaar");
    expect(result.models).toBeUndefined();
  });

  it("should fallback to static models including glm-5.3-flash on network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection error"));

    const result = await fetchModelsAction("test-tokenbazaar-key", "tokenbazaar");

    expect(result.models).toBeDefined();
    expect(result.models?.some((m) => m.name === "glm-5.3-flash")).toBe(true);
    expect(result.models?.some((m) => m.name === "gpt-4o")).toBe(true);
  });
});

import prisma from "@/lib/prisma";

export type DbLatencyResult = {
  latencyMs: number;
  timestamp: string;
};

/** Runs a lightweight read query and returns round-trip DB latency in milliseconds. */
export async function measureDbLatency(): Promise<DbLatencyResult> {
  const start = performance.now();
  await prisma.user.count();
  const latencyMs = performance.now() - start;

  return {
    latencyMs: Math.round(latencyMs * 100) / 100,
    timestamp: new Date().toISOString(),
  };
}

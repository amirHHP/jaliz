import { measureDbLatency } from "@/lib/db-latency";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { latencyMs, timestamp } = await measureDbLatency();
    console.log(`⏱️ DB Query Latency: ${latencyMs.toFixed(2)} ms`);

    return Response.json({
      latencyMs,
      latency: `${latencyMs.toFixed(2)}ms`,
      timestamp,
      hint:
        latencyMs > 150
          ? "High latency — database region may be far from Vercel (iad1)."
          : "Latency looks healthy for co-located regions.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("DB latency check failed:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

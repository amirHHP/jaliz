"use server";

import { getAiConfig } from "./settings";

// Read at runtime (not build time) so Docker's API_URL env var is picked up correctly
function getApiBase() {
  return process.env.API_URL || "http://127.0.0.1:8000";
}

export async function analyzePlantAction(formData: { image?: string, name?: string, language?: string, model_name?: string }) {
  try {
    const { apiKey: globalApiKey, model: globalModel, provider } = await getAiConfig();
    const api_key = globalApiKey;
    const model_name = formData.model_name || globalModel || (provider === "sotoon" || provider === "gapgpt" ? "gpt-4o" : "gemini-1.5-pro");

    if (!api_key) {
      throw new Error("API key is required. Please set it in admin settings.");
    }

    const response = await fetch(`${getApiBase()}/api/analyze-plant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        api_key,
        model_name,
        provider
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Analysis failed");
    }

    return await response.json();
  } catch (error) {
    console.error("AI Action Error:", error);
    throw error;
  }
}

export async function getWeatherAdviceAction(data: { latitude: number, longitude: number, userLocation?: string, language?: string, plants: any[] }) {
  try {
    const { apiKey: globalApiKey, model: globalModel, provider } = await getAiConfig();
    const api_key = globalApiKey;
    const model_name = globalModel || (provider === "sotoon" || provider === "gapgpt" ? "gpt-4o" : "gemini-1.5-pro");

    if (!api_key) {
      throw new Error("API key is required. Please set it in admin settings.");
    }

    const response = await fetch(`${getApiBase()}/api/advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        api_key,
        model_name,
        provider
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to fetch advice");
    }

    return await response.json();
  } catch (error) {
    console.error("AI Advice Action Error:", error);
    throw error;
  }
}

const SOTOON_BASE_URL = "https://api.intelligence.sotoon.ir/inference/v1";
const GAPGPT_BASE_URL = "https://api.gapgpt.app/v1";

// Static fallback models for each provider
const GEMINI_FALLBACK_MODELS = [
  { name: "models/gemini-2.5-pro-preview-05-06", inputTokenLimit: 1048576, outputTokenLimit: 65536 },
  { name: "models/gemini-2.5-flash-preview-05-20", inputTokenLimit: 1048576, outputTokenLimit: 65536 },
  { name: "models/gemini-2.0-flash", inputTokenLimit: 1048576, outputTokenLimit: 8192 },
  { name: "models/gemini-2.0-flash-lite", inputTokenLimit: 1048576, outputTokenLimit: 8192 },
  { name: "models/gemini-1.5-pro", inputTokenLimit: 2097152, outputTokenLimit: 8192 },
  { name: "models/gemini-1.5-flash", inputTokenLimit: 1048576, outputTokenLimit: 8192 },
];

const OPENAI_FALLBACK_MODELS = [
  { name: "gpt-4o", inputTokenLimit: 128000, outputTokenLimit: 16384 },
  { name: "gpt-4o-mini", inputTokenLimit: 128000, outputTokenLimit: 16384 },
  { name: "gpt-4-turbo", inputTokenLimit: 128000, outputTokenLimit: 4096 },
  { name: "gpt-3.5-turbo", inputTokenLimit: 16385, outputTokenLimit: 4096 },
];

export async function fetchModelsAction(api_key: string, provider?: string): Promise<{ models?: { name: string; inputTokenLimit: number; outputTokenLimit: number }[]; error?: string }> {
  try {
    const effectiveProvider = provider || "gemini";

    if (effectiveProvider === "sotoon" || effectiveProvider === "gapgpt") {
      const baseUrl = effectiveProvider === "gapgpt" ? GAPGPT_BASE_URL : SOTOON_BASE_URL;
      const providerLabel = effectiveProvider === "gapgpt" ? "GapGPT" : "Sotoon Intelligence";

      try {
        const resp = await fetch(`${baseUrl}/models`, {
          headers: { "Authorization": `Bearer ${api_key}` },
          signal: AbortSignal.timeout(10000),
        });

        if (resp.status === 401 || resp.status === 403) {
          return { error: `Invalid API key for ${providerLabel}` };
        }

        if (resp.ok) {
          const data = await resp.json();
          if (data?.data && Array.isArray(data.data)) {
            const fetched = data.data
              .filter((m: { id?: string }) => m.id)
              .map((m: { id: string; context_length?: number; max_output?: number }) => ({
                name: m.id,
                inputTokenLimit: m.context_length ?? 128000,
                outputTokenLimit: m.max_output ?? 16384,
              }));
            if (fetched.length > 0) {
              return { models: fetched };
            }
          }
        }
      } catch (e) {
        console.error(`Network error fetching ${providerLabel} models:`, e);
      }

      // Fallback to static list
      return { models: OPENAI_FALLBACK_MODELS };
    }

    // Gemini — call the REST API directly
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${api_key}`,
        { signal: AbortSignal.timeout(10000) }
      );

      if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
        const errData = await resp.json().catch(() => ({}));
        const msg = errData?.error?.message || `Invalid API key (${resp.status})`;
        return { error: msg };
      }

      if (resp.ok) {
        const data = await resp.json();
        if (data?.models && Array.isArray(data.models)) {
          const models = data.models
            .filter((m: { supportedGenerationMethods?: string[] }) =>
              m.supportedGenerationMethods?.includes("generateContent")
            )
            .map((m: { name: string; inputTokenLimit?: number; outputTokenLimit?: number }) => ({
              name: m.name,
              inputTokenLimit: m.inputTokenLimit ?? 0,
              outputTokenLimit: m.outputTokenLimit ?? 0,
            }));
          if (models.length > 0) {
            return { models };
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch Gemini models dynamically:", e);
    }

    // Fallback to static list
    return { models: GEMINI_FALLBACK_MODELS };
  } catch (error) {
    console.error("AI Models Action Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch models";
    return { error: msg };
  }
}

export async function getStatusAdviceAction(data: {
  plant_name: string;
  plant_type?: string;
  status: string;
  health?: string;
  language?: string;
  /** data URL (e.g. image/jpeg;base64,...) for vision */
  image?: string | null;
  /** full: advice + health; health_only: quick health classification */
  mode?: "full" | "health_only";
}) {
  try {
    const { apiKey: globalApiKey, model: globalModel, provider } = await getAiConfig();
    const api_key = globalApiKey;
    const model_name = globalModel || (provider === "sotoon" || provider === "gapgpt" ? "gpt-4o" : "gemini-1.5-pro");

    if (!api_key) {
      throw new Error("API key is required. Please set it in admin settings.");
    }

    const response = await fetch(`${getApiBase()}/api/status-advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        api_key,
        model_name,
        provider
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to fetch status advice");
    }

    return await response.json();
  } catch (error) {
    console.error("AI Status Advice Action Error:", error);
    throw error;
  }
}

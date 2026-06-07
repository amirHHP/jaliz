"use server";

import { getAiConfig } from "./settings";

// Allow Vercel serverless functions up to 120s (requires Pro plan; Hobby caps at 60s)
export const maxDuration = 120;

// Read at runtime (not build time) so Docker's API_URL env var is picked up correctly
function getApiBase() {
  return process.env.API_URL || "http://127.0.0.1:8000";
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

/**
 * Reusable helper to call Gemini or OpenAI-compatible LLMs directly via fetch.
 */
async function callLlmDirect({
  provider,
  apiKey,
  modelName,
  prompt,
  image,
  temperature = 0.3
}: {
  provider: string;
  apiKey: string;
  modelName: string;
  prompt: string;
  image?: string | null;
  temperature?: number;
}): Promise<string> {
  if (provider === "sotoon" || provider === "gapgpt") {
    const baseUrl = provider === "gapgpt" ? GAPGPT_BASE_URL : SOTOON_BASE_URL;
    const providerLabel = provider === "gapgpt" ? "GapGPT" : "Sotoon";

    const messages: any[] = [];
    if (image && image.startsWith("data:")) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: image } }
        ]
      });
    } else {
      messages.push({ role: "user", content: prompt });
    }

    const requestBody: any = {
      model: modelName,
      messages,
      temperature
    };
    // Request JSON output when the prompt expects it
    if (prompt.includes("JSON") || prompt.includes("json")) {
      requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120000)
    });

    if (!response.ok) {
      const errText = await response.text();
      if (errText.includes("egress-proxy") || errText.includes("OpenrouterException")) {
        throw new Error(`${providerLabel} API is currently having connectivity issues with this model. Please try a different model or try again later.`);
      }
      throw new Error(`${providerLabel} API error: ${errText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error(`Empty response from ${providerLabel}`);
    }
    return data.choices[0].message.content;
  } else {
    // Gemini
    const cleanModelName = modelName.startsWith("models/") ? modelName : `models/${modelName}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${cleanModelName}:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: prompt }];

    if (image) {
      let encoded = image;
      let mimeType = "image/jpeg";
      if (image.includes(",")) {
        const partsList = image.split(",");
        const header = partsList[0];
        encoded = partsList[1];
        const mimeMatch = /data:([^;]+);base64/.exec(header);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }
      parts.push({
        inlineData: {
          mimeType,
          data: encoded
        }
      });
    }

    // Build request body; ask Gemini for JSON output when the prompt expects it
    const requestBody: any = { contents: [{ parts }] };
    if (prompt.includes("JSON") || prompt.includes("json")) {
      requestBody.generationConfig = { responseMimeType: "application/json" };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120000)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `Gemini API error (${response.status})`;
      throw new Error(msg);
    }

    const data = await response.json();
    // Thinking models (Gemma 4, Gemini 2.5) return multiple parts:
    // parts with `thought: true` are internal reasoning — skip them.
    const responseParts = data.candidates?.[0]?.content?.parts || [];
    const answerParts = responseParts.filter((p: any) => !p.thought && p.text);
    const text = answerParts.length > 0
      ? answerParts.map((p: any) => p.text).join("")
      : responseParts[0]?.text;  // fallback to first part if no non-thought parts
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }
    return text;
  }
}

/**
 * Parses JSON content from the raw model response.
 * Tries multiple strategies: fenced code block, raw JSON.parse, and
 * extracting the first `{...}` object from mixed markdown/text.
 */
function parseJsonFromModelText(text: string): any {
  // Strategy 1: Extract from ```json ... ``` fenced code block
  const fenceMatch = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/.exec(text);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch { /* fall through */ }
  }

  // Strategy 2: Try parsing the raw text directly
  try {
    return JSON.parse(text.trim());
  } catch { /* fall through */ }

  // Strategy 3: Find the first `{` and last `}` and try to parse the substring
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch { /* fall through */ }
  }

  throw new Error(
    `Could not extract valid JSON from AI response. Response starts with: "${text.substring(0, 120)}..."`
  );
}

/**
 * Normalizes the health label returned from model.
 */
function normalizeStatusHealth(raw?: string): "Excellent" | "Good" | "Needs Attention" {
  const allowed = new Set(["Excellent", "Good", "Needs Attention"]);
  const h = (raw || "").trim();
  if (allowed.has(h)) {
    return h as any;
  }
  const lower = h.toLowerCase();
  if (lower.includes("excellent") || h.includes("عالی")) {
    return "Excellent";
  }
  if (lower.includes("attention") || h.includes("نیاز به توجه") || lower.includes("critical")) {
    return "Needs Attention";
  }
  if (lower.includes("good") || h.includes("خوب")) {
    return "Good";
  }
  return "Good";
}

/**
 * Fetches forecast from OpenWeatherMap or returns mocked data.
 */
async function fetchWeather(lat: number, lon: number): Promise<any> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === "your_openweather_api_key_here") {
    return {
      list: [
        { main: { temp: 15.5 }, weather: [{ description: "partly cloudy" }] },
        { main: { temp: 12.0 }, weather: [{ description: "clear sky" }] },
        { main: { temp: 8.5 }, weather: [{ description: "clear sky" }] },
      ]
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (response.ok) {
    return await response.json();
  }
  return { error: `Failed to fetch weather: ${response.statusText}` };
}

export async function analyzePlantAction(formData: { image?: string, name?: string, language?: string, model_name?: string }): Promise<any> {
  try {
    const { apiKey: globalApiKey, model: globalModel, provider } = await getAiConfig();
    const api_key = globalApiKey;
    const model_name = formData.model_name || globalModel || (provider === "sotoon" || provider === "gapgpt" ? "gpt-4o" : "gemini-1.5-pro");

    if (!api_key) {
      return { error: "API key is required. Please set it in admin settings." };
    }

    if (process.env.API_URL) {
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
        return { error: err.detail || "Analysis failed" };
      }

      return await response.json();
    }

    // Direct JS call fallback
    const languageName = formData.language === "fa" ? "Persian (Farsi)" : "English";
    const prompt = `
You are an expert botanist and plant care assistant.
Identify the plant provided either by its image or its name: "${formData.name ? formData.name : 'Unknown'}".
Provide the following details in a JSON object exactly matching this structure, returning ONLY the JSON:
{
    "name": "Scientific or common name of the plant. IMPORTANT: If the user provided the name in a specific language (e.g., Persian), you MUST return the completed name in that EXACT same language.",
    "type": "e.g., Indoor Tropical, Outdoor Vegetable",
    "locationType": "Indoor" or "Outdoor",
    "lightExposure": "Low Light" or "Partial Shade" or "Bright Indirect" or "Full Sun",
    "potType": "Terracotta" or "Plastic" or "Ceramic" or "Metal" or "Other",
    "hasDrainage": true or false,
    "careTips": "Provide a detailed and comprehensive paragraph explaining the best general care practices for this plant. Must be written in ${languageName}.",
    "wateringTips": "Provide a detailed and comprehensive paragraph explaining the specific watering schedule and techniques for this plant. Must be written in ${languageName}.",
    "soilChangeTips": "Provide a concise paragraph explaining when and how to change the soil for this plant, including recommended soil mix and frequency (e.g., every 12-18 months). Must be written in ${languageName}."
}
`;

    const text = await callLlmDirect({
      provider,
      apiKey: api_key,
      modelName: model_name,
      prompt,
      image: formData.image
    });

    return parseJsonFromModelText(text);
  } catch (error) {
    console.error("AI Action Error:", error);
    return { error: error instanceof Error ? error.message : "Failed to analyze plant" };
  }
}

export async function getWeatherAdviceAction(data: { latitude: number, longitude: number, userLocation?: string, language?: string, plants: any[] }): Promise<any> {
  try {
    const { apiKey: globalApiKey, model: globalModel, provider } = await getAiConfig();
    const api_key = globalApiKey;
    const model_name = globalModel || (provider === "sotoon" || provider === "gapgpt" ? "gpt-4o" : "gemini-1.5-pro");

    if (!api_key) {
      if (data.language === "fa") {
        return { advice: "🌱 توجه: لطفاً کلید API خود را در تنظیمات وارد کنید تا مشاوره تخصصی دریافت کنید." };
      }
      return { advice: "🌱 Note: Please enter your API key in Settings to get expert advice." };
    }

    if (process.env.API_URL) {
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
        return { error: err.detail || "Failed to fetch advice" };
      }

      return await response.json();
    }

    // Direct JS call fallback
    const weatherData = await fetchWeather(data.latitude, data.longitude);

    let weatherSummary = "Weather data currently unavailable.";
    if (weatherData && !weatherData.error) {
      const forecasts = (weatherData.list || []).slice(0, 16);
      const temps = forecasts.map((f: any) => f.main?.temp).filter((t: any) => typeof t === "number");
      const minTemp = temps.length ? Math.min(...temps) : "Unknown";
      const maxTemp = temps.length ? Math.max(...temps) : "Unknown";
      const weatherDesc = forecasts[0]?.weather?.[0]?.description || "Unknown";

      weatherSummary = `Expect ${weatherDesc}. Temperatures will range from ${minTemp}°C to ${maxTemp}°C over the next 48 hours.`;
      if (data.userLocation) {
        weatherSummary += ` The user's location is '${data.userLocation}'.`;
      }
    }

    const plantDetails: string[] = [];
    for (const p of (data.plants || [])) {
      const details = [`${p.name || "Unknown"} (${p.type || "Unknown type"})`];
      details.push(`Location: ${p.locationType || "Indoor"}`);
      details.push(`Light: ${p.lightExposure || "Unknown"}`);
      details.push(`Pot: ${p.potType || "Unknown"}`);
      const drainage = p.hasDrainage ? "Yes" : "No";
      details.push(`Drainage: ${drainage}`);
      if (p.recentlyReplanted) {
        details.push("WARNING: Recently Replanted (High Stress Risk)");
      }
      if (p.lastSoilChange) {
        const soilMonths = Math.floor((Date.now() - new Date(p.lastSoilChange).getTime()) / (1000 * 3600 * 24 * 30));
        details.push(`Last Soil Change: ${soilMonths} months ago`);
      } else {
        details.push("Last Soil Change: Unknown / Never recorded");
      }
      plantDetails.push(" - " + details.join(", "));
    }
    const plantListStr = plantDetails.join("\n");

    const isFarsi = data.language === "fa";
    const langInstruction = isFarsi
      ? `CRITICAL LANGUAGE RULE: Your ENTIRE response MUST be written in Persian (Farsi). Do NOT use any English words. Use right-to-left Persian script only.`
      : "Write the advice in English.";

    const prompt = `You are an expert, hyper-local gardening AI agent.
You provide short, actionable plant care advice based on weather conditions.

${langInstruction}

Weather Forecast (Next 48h): ${weatherSummary}

User's Plants:
${plantListStr}

Rules:
1. Only apply outdoor weather risks (frost/rain) to "Outdoor" plants.
2. Warn about UV/heatwaves for "Full Sun" or "Bright Indirect" plants.
3. Mention pot evaporation: Terracotta dries fast, Plastic retains water.
4. If hasDrainage is No and heavy rain is expected, warn about root rot for Outdoor plants.
5. If Recently Replanted is True, add a stress warning.
6. If Last Soil Change is older than 12 months (or unknown), recommend a soil change soon with a brief reason (nutrient depletion, compaction, salt buildup). If soil is recently changed (< 6 months), skip soil advice.

IMPORTANT OUTPUT FORMAT:
- Output ONLY the final advice text. No analysis, no reasoning, no bullet points of constraints.
- Keep it short (2-4 sentences per plant).
- Use a warm, friendly tone.
${isFarsi ? "- پاسخ باید کاملاً به فارسی باشد. هیچ کلمه انگلیسی استفاده نکن." : ""}

Actionable Advice:`;

    const advice = await callLlmDirect({
      provider,
      apiKey: api_key,
      modelName: model_name,
      prompt,
      temperature: 0.7
    });

    return { advice };
  } catch (error) {
    console.error("AI Advice Action Error:", error);
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.message.includes("timeout") || error.message.includes("aborted"));
    if (isTimeout) {
      if (data.language === "fa") {
        return { error: "⏱️ پاسخ هوش مصنوعی بیش از حد طول کشید. لطفاً یک مدل سریع‌تر مثل gemini-2.0-flash را در تنظیمات انتخاب کنید." };
      }
      return { error: "⏱️ The AI response took too long. Please try a faster model like gemini-2.0-flash in Settings." };
    }
    if (data.language === "fa") {
      return { error: "⚠️ سرویس هوش مصنوعی در حال حاضر با اختلال مواجه است. لطفاً دوباره تلاش کنید." };
    }
    return { error: "⚠️ The AI service is currently experiencing issues. Please try again." };
  }
}

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
  image?: string | null;
  mode?: "full" | "health_only";
}): Promise<any> {
  try {
    const { apiKey: globalApiKey, model: globalModel, provider } = await getAiConfig();
    const api_key = globalApiKey;
    const model_name = globalModel || (provider === "sotoon" || provider === "gapgpt" ? "gpt-4o" : "gemini-1.5-pro");

    if (!api_key) {
      return { error: "API key is required. Please set it in admin settings." };
    }

    if (process.env.API_URL) {
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
        return { error: err.detail || "Failed to fetch status advice" };
      }

      return await response.json();
    }

    // Direct JS call fallback
    const languageName = data.language === "fa" ? "Persian (Farsi)" : "English";
    const mode = (data.mode || "full").trim().toLowerCase();
    const health_hint = data.health || "not yet classified";

    let prompt = "";
    if (mode === "health_only") {
      prompt = `
You are an expert botanist. A user described their plant's current situation (and may have attached a photo).

Plant name: ${data.plant_name}
Plant type: ${data.plant_type || "Unknown"}
User's status note: ${data.status}
Previous health label (hint only, may be wrong): ${health_hint}

Classify overall plant health as EXACTLY one of these English strings:
- "Excellent" — thriving, no serious issues mentioned
- "Good" — minor issues or uncertainty, generally OK
- "Needs Attention" — clear stress, pests, severe yellowing, rot, worsening after treatment, etc.

Use the photo if provided to spot pests, leaf color, wilting, etc.

Return ONLY valid JSON with this exact shape (no markdown):
{"health": "Excellent"}
The value for "health" must be exactly one of: Excellent, Good, Needs Attention.
`;
    } else {
      prompt = `
You are an expert botanist and plant care assistant.
The user reported a status update for their plant (optional photo may show current leaf/soil/pests).

Plant Name: ${data.plant_name}
Plant Type: ${data.plant_type || "Unknown"}
Status description: ${data.status}
Previous health label (hint only): ${health_hint}

Tasks:
1) Infer the correct health level as EXACTLY one of: Excellent, Good, Needs Attention (English).
2) Write concise, practical next-step advice for the user in ${languageName}.
   If a photo is included, incorporate visible cues (color, spots, pests, soil wetness) together with the text.

Return ONLY valid JSON (no markdown fences) with this exact shape:
{"health": "Good", "advice": "..."}
`;
    }

    const text = await callLlmDirect({
      provider,
      apiKey: api_key,
      modelName: model_name,
      prompt,
      image: data.image,
      temperature: 0.35
    });

    let parsed: any;
    try {
      parsed = parseJsonFromModelText(text);
    } catch (e) {
      if (mode === "health_only") {
        return { health: "Good" };
      }
      return { health: "Good", advice: text.trim() };
    }

    const health = normalizeStatusHealth(parsed.health);
    if (mode === "health_only") {
      return { health };
    }

    let advice = (parsed.advice || "").trim();
    if (!advice) {
      advice = text.trim();
    }
    return { health, advice };
  } catch (error) {
    console.error("AI Status Advice Action Error:", error);
    return { error: error instanceof Error ? error.message : "Failed to fetch status advice" };
  }
}

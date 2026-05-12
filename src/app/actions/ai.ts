"use server";

import { getAiConfig } from "./settings";

const PYTHON_API_BASE = process.env.API_URL || "http://127.0.0.1:8000";

export async function analyzePlantAction(formData: { image?: string, name?: string, language?: string, model_name?: string }) {
  try {
    const { apiKey: globalApiKey, model: globalModel, provider } = await getAiConfig();
    const api_key = globalApiKey;
    const model_name = formData.model_name || globalModel || (provider === "sotoon" ? "gpt-4o" : "gemini-1.5-pro");

    if (!api_key) {
      throw new Error("API key is required. Please set it in admin settings.");
    }

    const response = await fetch(`${PYTHON_API_BASE}/api/analyze-plant`, {
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
    const model_name = globalModel || (provider === "sotoon" ? "gpt-4o" : "gemini-1.5-pro");

    if (!api_key) {
      throw new Error("API key is required. Please set it in admin settings.");
    }

    const response = await fetch(`${PYTHON_API_BASE}/api/advice`, {
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

export async function fetchModelsAction(api_key: string, provider?: string) {
  try {
    const response = await fetch(`${PYTHON_API_BASE}/api/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key, provider: provider || "gemini" }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch models";
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const err = await response.json();
        errorMessage = typeof err.detail === 'object' 
          ? JSON.stringify(err.detail) 
          : (err.detail || errorMessage);
      } else {
        const text = await response.text();
        errorMessage = text || `Server error (${response.status})`;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("AI Models Action Error:", error);
    throw error;
  }
}

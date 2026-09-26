"use server";

import prisma from "@/lib/prisma";
import { getSessionUserId } from "./auth";

export async function getGlobalSetting(key: string): Promise<string | null> {
  const setting = await prisma.globalSetting.findUnique({
    where: { key }
  });
  return setting ? setting.value : null;
}

export async function getGlobalSettings(keys: string[]): Promise<Record<string, string>> {
  if (!keys || keys.length === 0) return {};
  const settings = await prisma.globalSetting.findMany({
    where: { key: { in: keys } }
  });
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function setGlobalSetting(key: string, value: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (user?.role !== "admin") throw new Error("Only admins can change global settings");

  await prisma.globalSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}

export async function getAiConfig() {
  // Batched fetch of active provider, provider keys, and legacy fallbacks in 1 query
  const keys = [
    "ai-provider",
    "ai-api-key",
    "gemini-api-key",
    "ai-model",
    "gemini-model",
    "ai-api-key-gemini",
    "ai-model-gemini",
    "ai-api-key-sotoon",
    "ai-model-sotoon",
    "ai-api-key-gapgpt",
    "ai-model-gapgpt",
    "ai-api-key-tokenbazaar",
    "ai-model-tokenbazaar",
  ];
  const settings = await getGlobalSettings(keys);
  const provider = settings["ai-provider"] || "gemini";

  // Fallback chain: provider-specific -> env fallback -> shared legacy -> old gemini-specific
  const envKey = provider === "tokenbazaar"
    ? process.env.TOKENBAZAAR_API_KEY
    : provider === "gemini"
    ? process.env.GEMINI_API_KEY
    : undefined;

  const apiKey = settings[`ai-api-key-${provider}`]
    || envKey
    || settings["ai-api-key"]
    || settings["gemini-api-key"]
    || null;

  const model = settings[`ai-model-${provider}`]
    || settings["ai-model"]
    || settings["gemini-model"]
    || null;

  return { provider, apiKey, model };
}

/**
 * Returns stored API keys for all providers, used by the admin UI to
 * populate the key inputs independently. Batched into a single query.
 */
export async function getAllProviderKeys() {
  const keys = [
    "ai-api-key-gemini",
    "ai-api-key",
    "gemini-api-key",
    "ai-api-key-sotoon",
    "ai-api-key-gapgpt",
    "ai-api-key-tokenbazaar",
    "ai-model-gemini",
    "ai-model",
    "gemini-model",
    "ai-model-sotoon",
    "ai-model-gapgpt",
    "ai-model-tokenbazaar",
  ];
  const settings = await getGlobalSettings(keys);

  const geminiKey = settings["ai-api-key-gemini"]
    || settings["ai-api-key"]
    || settings["gemini-api-key"]
    || "";
  const sotoonKey = settings["ai-api-key-sotoon"] || "";
  const gapgptKey = settings["ai-api-key-gapgpt"] || "";
  const tokenbazaarKey = settings["ai-api-key-tokenbazaar"]
    || process.env.TOKENBAZAAR_API_KEY
    || "";
  const geminiModel = settings["ai-model-gemini"]
    || settings["ai-model"]
    || settings["gemini-model"]
    || "";
  const sotoonModel = settings["ai-model-sotoon"] || "";
  const gapgptModel = settings["ai-model-gapgpt"] || "";
  const tokenbazaarModel = settings["ai-model-tokenbazaar"] || "";
  return { geminiKey, sotoonKey, gapgptKey, tokenbazaarKey, geminiModel, sotoonModel, gapgptModel, tokenbazaarModel };
}

const DEFAULT_SHIPPING_FEE_TOMAN = 150000;
const SHIPPING_FEE_SETTING_KEY = "marketplace_shipping_fee";

/**
 * Returns the store shipping fee in Tomans.
 * Defaults to 150,000 Tomans if not customized in the Admin Panel.
 */
export async function getShippingFeeAction(): Promise<number> {
  try {
    const raw = await getGlobalSetting(SHIPPING_FEE_SETTING_KEY);
    if (!raw) return DEFAULT_SHIPPING_FEE_TOMAN;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_SHIPPING_FEE_TOMAN;
  } catch {
    return DEFAULT_SHIPPING_FEE_TOMAN;
  }
}

/**
 * Admin-only: sets the global store shipping fee in Tomans.
 */
export async function setShippingFeeAction(feeToman: number): Promise<{ ok: boolean; error?: string }> {
  if (typeof feeToman !== "number" || feeToman < 0 || !Number.isFinite(feeToman)) {
    return { ok: false, error: "مبلغ هزینه ارسال باید یک عدد معتبر باشد." };
  }
  try {
    await setGlobalSetting(SHIPPING_FEE_SETTING_KEY, Math.round(feeToman).toString());
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "خطا در ذخیره تنظیمات هزینه ارسال" };
  }
}


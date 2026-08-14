"use server";

import prisma from "@/lib/prisma";
import { getSessionUserId } from "./auth";

export async function getGlobalSetting(key: string): Promise<string | null> {
  const setting = await prisma.globalSetting.findUnique({
    where: { key }
  });
  return setting ? setting.value : null;
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
  const provider = await getGlobalSetting("ai-provider") || "gemini";

  // Each provider stores its own API key and model independently
  const providerApiKey = await getGlobalSetting(`ai-api-key-${provider}`);
  const providerModel = await getGlobalSetting(`ai-model-${provider}`);

  // Fallback chain: provider-specific -> shared legacy -> old gemini-specific
  const apiKey = providerApiKey
    || await getGlobalSetting("ai-api-key")
    || await getGlobalSetting("gemini-api-key");

  const model = providerModel
    || await getGlobalSetting("ai-model")
    || await getGlobalSetting("gemini-model");

  return { provider, apiKey, model };
}

/**
 * Returns stored API keys for all providers, used by the admin UI to
 * populate the key inputs independently.
 */
export async function getAllProviderKeys() {
  const geminiKey = await getGlobalSetting("ai-api-key-gemini")
    || await getGlobalSetting("ai-api-key")
    || await getGlobalSetting("gemini-api-key")
    || "";
  const sotoonKey = await getGlobalSetting("ai-api-key-sotoon") || "";
  const gapgptKey = await getGlobalSetting("ai-api-key-gapgpt") || "";
  const geminiModel = await getGlobalSetting("ai-model-gemini")
    || await getGlobalSetting("ai-model")
    || await getGlobalSetting("gemini-model")
    || "";
  const sotoonModel = await getGlobalSetting("ai-model-sotoon") || "";
  const gapgptModel = await getGlobalSetting("ai-model-gapgpt") || "";
  return { geminiKey, sotoonKey, gapgptKey, geminiModel, sotoonModel, gapgptModel };
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


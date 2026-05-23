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

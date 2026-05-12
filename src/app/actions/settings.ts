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
  const apiKey = await getGlobalSetting("ai-api-key");
  const model = await getGlobalSetting("ai-model");
  
  // Fallback to old gemini-specific keys for backwards compatibility
  const legacyApiKey = apiKey || await getGlobalSetting("gemini-api-key");
  const legacyModel = model || await getGlobalSetting("gemini-model");
  
  return { provider, apiKey: legacyApiKey, model: legacyModel };
}

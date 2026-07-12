"use server";

import type { Prisma } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/app/actions/auth";

const MAX_STATUS_LOG_ADVICE_CHARS = 80_000;
const MAX_STATUS_LOG_IMAGE_CHARS = 550_000;
/** Base64 plant photos in create/update must stay under Server Action / DB practical limits */
const MAX_PLANT_IMAGE_CHARS = 750_000;
const MAX_PLANT_TIPS_CHARS = 50_000;

function asDbString(value: unknown, maxLen: number): string | null {
  if (value === undefined || value === null) return null;
  const s = typeof value === "string" ? value : String(value);
  const t = s.trim();
  if (!t) return null;
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

export async function getUserPlantsAction(options?: { includeStatusLogs?: boolean }) {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const plants = await prisma.userPlant.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: options?.includeStatusLogs
      ? { statusLogs: { orderBy: { createdAt: "desc" } } }
      : undefined,
  });
  return plants;
}

export async function getWateringLogAction(dateStr: string) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const log = await prisma.wateringLog.findFirst({
    where: {
      userId,
      logDate: new Date(dateStr)
    }
  });
  return log;
}

export async function updatePlantsLastWateredAction(plantIds: string[], dateStr: string) {
  const userId = await getSessionUserId();
  if (!userId) return;

  const lastWatered = new Date(dateStr);

  // We need to fetch each plant to get its wateringInterval
  const plants = await prisma.userPlant.findMany({
    where: { id: { in: plantIds }, userId },
    select: { id: true, wateringInterval: true }
  });

  for (const plant of plants) {
    const interval = plant.wateringInterval || 7;
    const nextWateringDate = new Date(lastWatered);
    nextWateringDate.setDate(nextWateringDate.getDate() + interval);

    await prisma.userPlant.update({
      where: { id: plant.id },
      data: {
        lastWatered,
        nextWateringDate
      }
    });
  }
}

export async function markWateringDoneAction(dateStr: string) {
  const userId = await getSessionUserId();
  if (!userId) return;

  await prisma.wateringLog.upsert({
    where: {
      userId_logDate: {
        userId,
        logDate: new Date(dateStr)
      }
    },
    update: {},
    create: {
      userId,
      logDate: new Date(dateStr)
    }
  });
}

export async function deleteUserPlantAction(plantId: string) {
  const userId = await getSessionUserId();
  if (!userId) return;

  await prisma.userPlant.delete({
    where: { id: plantId, userId } // Ensure it belongs to user
  });
}

export type UpdateUserPlantInput = {
  name?: string;
  type?: string | null;
  locationType?: string | null;
  lightExposure?: string | null;
  potType?: string | null;
  growingMedium?: string | null;
  hasDrainage?: boolean | null;
  lastWatered?: Date | string | null;
  recentlyReplanted?: boolean | null;
  lastSoilChange?: Date | string | null;
  health?: string | null;
  image?: string | null;
  careTips?: string | null;
  wateringTips?: string | null;
  wateringInterval?: number | null;
};

export async function updateUserPlantAction(plantId: string, data: UpdateUserPlantInput) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const updateData: Prisma.UserPlantUpdateInput = {};

  if (data.name !== undefined) updateData.name = String(data.name).trim();
  if (data.type !== undefined) updateData.type = data.type == null ? "" : String(data.type).trim();
  if (data.locationType !== undefined) updateData.locationType = data.locationType ?? undefined;
  if (data.lightExposure !== undefined) updateData.lightExposure = data.lightExposure ?? undefined;
  if (data.potType !== undefined) updateData.potType = data.potType ?? undefined;
  if (data.growingMedium !== undefined) updateData.growingMedium = data.growingMedium ?? undefined;
  if (data.hasDrainage !== undefined) updateData.hasDrainage = data.hasDrainage;
  if (data.recentlyReplanted !== undefined) updateData.recentlyReplanted = data.recentlyReplanted;
  if (data.lastSoilChange !== undefined) {
    updateData.lastSoilChange = data.lastSoilChange ? new Date(data.lastSoilChange) : null;
  }
  if (data.health !== undefined) updateData.health = data.health ?? undefined;
  if (data.image !== undefined) updateData.image = asDbString(data.image, MAX_PLANT_IMAGE_CHARS);
  if (data.careTips !== undefined) updateData.careTips = asDbString(data.careTips, MAX_PLANT_TIPS_CHARS);
  if (data.wateringTips !== undefined) updateData.wateringTips = asDbString(data.wateringTips, MAX_PLANT_TIPS_CHARS);
  if (data.wateringInterval !== undefined) updateData.wateringInterval = data.wateringInterval ?? undefined;

  if (data.lastWatered !== undefined) {
    updateData.lastWatered = data.lastWatered ? new Date(data.lastWatered) : null;
  }

  // If lastWatered or wateringInterval is updated, recalculate nextWateringDate
  if (data.lastWatered !== undefined || data.wateringInterval !== undefined) {
    const existing = await prisma.userPlant.findUnique({
      where: { id: plantId, userId },
      select: { lastWatered: true, wateringInterval: true },
    });

    if (existing) {
      const lw =
        data.lastWatered !== undefined
          ? data.lastWatered
            ? new Date(data.lastWatered)
            : null
          : existing.lastWatered;
      const lastWatered = lw ? new Date(lw) : new Date();
      if (Number.isNaN(lastWatered.getTime())) {
        throw new Error("Invalid last watered date");
      }
      const interval =
        data.wateringInterval !== undefined
          ? Number(data.wateringInterval) || 7
          : existing.wateringInterval || 7;

      const nextDate = new Date(lastWatered);
      nextDate.setDate(nextDate.getDate() + interval);
      updateData.nextWateringDate = nextDate;
    }
  }

  return await prisma.userPlant.update({
    where: { id: plantId, userId },
    data: updateData,
  });
}

export type CreateUserPlantInput = {
  name: string;
  type?: string | null;
  locationType?: string | null;
  lightExposure?: string | null;
  potType?: string | null;
  growingMedium?: string | null;
  hasDrainage?: boolean | null;
  lastWatered?: Date | string | null;
  recentlyReplanted?: boolean | null;
  lastSoilChange?: Date | string | null;
  health?: string | null;
  image?: string | null;
  careTips?: string | null;
  wateringTips?: string | null;
  wateringInterval?: number | null;
};

export async function createUserPlantAction(data: CreateUserPlantInput) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const lastWatered = data.lastWatered ? new Date(data.lastWatered) : new Date();
  if (Number.isNaN(lastWatered.getTime())) {
    throw new Error("Invalid last watered date");
  }

  const interval = Number(data.wateringInterval) || 7;
  const nextWateringDate = new Date(lastWatered);
  nextWateringDate.setDate(nextWateringDate.getDate() + interval);

  const name = typeof data.name === "string" ? data.name.trim() : String(data.name ?? "").trim();
  if (!name) throw new Error("Plant name is required");

  const imageDb = asDbString(data.image, MAX_PLANT_IMAGE_CHARS);
  const careTipsDb = asDbString(data.careTips, MAX_PLANT_TIPS_CHARS);
  const wateringTipsDb = asDbString(data.wateringTips, MAX_PLANT_TIPS_CHARS);

  return await prisma.userPlant.create({
    data: {
      userId,
      name,
      type: (typeof data.type === "string" ? data.type.trim() : "") || "Unknown",
      locationType: data.locationType ?? "Indoor",
      lightExposure: data.lightExposure ?? "Bright Indirect",
      potType: data.potType ?? "Plastic",
      growingMedium: data.growingMedium ?? "Soil",
      hasDrainage: data.hasDrainage ?? true,
      lastWatered,
      nextWateringDate,
      wateringInterval: interval,
      recentlyReplanted: data.recentlyReplanted ?? false,
      lastSoilChange: data.lastSoilChange ? new Date(data.lastSoilChange) : null,
      health: data.health ?? "Excellent",
      image: imageDb,
      careTips: careTipsDb,
      wateringTips: wateringTipsDb,
    },
  });
}

export async function getPlantLogsAction(plantId: string) {
  const userId = await getSessionUserId();
  if (!userId) return [];

  return await prisma.plantStatusLog.findMany({
    where: { plantId, plant: { userId } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function addPlantStatusLogAction(
  plantId: string,
  status: string,
  health: string,
  aiAdvice?: string,
  image?: string | null
) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const statusText = typeof status === "string" ? status.trim() : String(status ?? "").trim();
  if (!statusText) return null;

  const healthValue =
    typeof health === "string" && health.trim() ? health.trim() : "Good";

  const adviceDb = asDbString(aiAdvice, MAX_STATUS_LOG_ADVICE_CHARS);
  const imageDb = asDbString(image, MAX_STATUS_LOG_IMAGE_CHARS);

  const baseData = {
    plantId,
    status: statusText,
    health: healthValue,
    aiAdvice: adviceDb,
    ...(imageDb ? { image: imageDb } : {}),
  };

  try {
    const [, created] = await prisma.$transaction([
      prisma.userPlant.update({
        where: { id: plantId, userId },
        data: { health: healthValue },
      }),
      prisma.plantStatusLog.create({ data: baseData }),
    ]);
    return created;
  } catch (e) {
    if (
      e instanceof PrismaClientValidationError &&
      e.message.includes("Unknown argument") &&
      e.message.includes("image")
    ) {
      const [, created] = await prisma.$transaction([
        prisma.userPlant.update({
          where: { id: plantId, userId },
          data: { health: healthValue },
        }),
        prisma.plantStatusLog.create({
          data: {
            plantId,
            status: statusText,
            health: healthValue,
            aiAdvice: adviceDb,
          },
        }),
      ]);
      return created;
    }
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2022") {
      throw new Error(
        "Database schema is out of date for plant status logs. From the project root run: npx prisma db push — then restart the dev server (delete the .next folder if the error persists)."
      );
    }
    throw e;
  }
}

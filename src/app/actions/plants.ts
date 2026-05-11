"use server";

import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/app/actions/auth";

export async function getUserPlantsAction() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const plants = await prisma.userPlant.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
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

  await prisma.userPlant.updateMany({
    where: {
      id: { in: plantIds },
      userId
    },
    data: { lastWatered: new Date(dateStr) }
  });
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

export async function updateUserPlantAction(plantId: string, data: any) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return await prisma.userPlant.update({
    where: { id: plantId, userId },
    data
  });
}

export async function createUserPlantAction(data: any) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return await prisma.userPlant.create({
    data: {
      ...data,
      userId
    }
  });
}

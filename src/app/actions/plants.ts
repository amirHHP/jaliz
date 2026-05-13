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

export async function updateUserPlantAction(plantId: string, data: any) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  // If lastWatered or wateringInterval is updated, recalculate nextWateringDate
  if (data.lastWatered || data.wateringInterval) {
    const existing = await prisma.userPlant.findUnique({
      where: { id: plantId, userId },
      select: { lastWatered: true, wateringInterval: true }
    });

    if (existing) {
      const lastWatered = data.lastWatered ? new Date(data.lastWatered) : existing.lastWatered ? new Date(existing.lastWatered) : new Date();
      const interval = data.wateringInterval !== undefined ? data.wateringInterval : existing.wateringInterval || 7;
      
      const nextDate = new Date(lastWatered);
      nextDate.setDate(nextDate.getDate() + (Number(interval) || 7));
      data.nextWateringDate = nextDate;
    }
  }

  return await prisma.userPlant.update({
    where: { id: plantId, userId },
    data
  });
}

export async function createUserPlantAction(data: any) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const lastWatered = data.lastWatered ? new Date(data.lastWatered) : new Date();
  const interval = data.wateringInterval || 7;
  const nextWateringDate = new Date(lastWatered);
  nextWateringDate.setDate(nextWateringDate.getDate() + interval);

  return await prisma.userPlant.create({
    data: {
      ...data,
      userId,
      lastWatered,
      nextWateringDate,
      wateringInterval: interval
    }
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

export async function addPlantStatusLogAction(plantId: string, status: string, health: string, aiAdvice?: string) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  // Update plant health
  await prisma.userPlant.update({
    where: { id: plantId, userId },
    data: { health }
  });

  // Create log
  return await prisma.plantStatusLog.create({
    data: {
      plantId,
      status,
      health,
      aiAdvice
    }
  });
}

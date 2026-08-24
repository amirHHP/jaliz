"use server";

import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/app/actions/auth";
import type { Prisma } from "@prisma/client";

const MAX_GUEST_STATUS_CHARS = 5_000;
const MAX_GUEST_LOG_IMAGE_CHARS = 550_000;
const MIN_EXPIRY_DAYS = 1;
const MAX_EXPIRY_DAYS = 365;

export type PlantShareInfo = {
  token: string;
  expiresAt: string | null;
};

export type SharedPlant = {
  id: string;
  name: string;
  type: string;
  locationType: string;
  lightExposure: string;
  potType: string;
  health: string;
  image?: string;
  lastWatered: string | null;
  nextWateringDate: string | null;
  wateringInterval: number;
};

export type SharedProfile = {
  ownerName: string;
  expiresAt: string | null;
  /** Server timestamp so clients compute "needs water" without impure Date.now() */
  nowIso: string;
  plants: SharedPlant[];
};

function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}

function toIso(value: Date | null | undefined): string | null {
  return value ? new Date(value).toISOString() : null;
}

function isShareUsable(
  share: { isActive: boolean; expiresAt: Date | null },
  now: Date = new Date()
): boolean {
  if (!share.isActive) return false;
  if (share.expiresAt && new Date(share.expiresAt) <= now) return false;
  return true;
}

/* ------------------------------ Owner actions ----------------------------- */

/** Returns the current usable share link info, or null if none exists. */
export async function getMyPlantShareAction(): Promise<PlantShareInfo | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const share = await prisma.plantShare.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  if (!share || !isShareUsable(share)) return null;
  return { token: share.token, expiresAt: toIso(share.expiresAt) };
}

/**
 * Creates a fresh share link, invalidating any previous one.
 * Pass expiresInDays = null for a link that never expires.
 */
export async function savePlantShareAction(
  expiresInDays: number | null
): Promise<PlantShareInfo | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  let expiresAt: Date | null = null;
  if (expiresInDays !== null && expiresInDays !== undefined) {
    const days = Number(expiresInDays);
    if (!Number.isFinite(days) || days < MIN_EXPIRY_DAYS || days > MAX_EXPIRY_DAYS) {
      throw new Error("Invalid expiry");
    }
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Math.floor(days));
  }

  await prisma.plantShare.deleteMany({ where: { ownerId: userId } });
  const share = await prisma.plantShare.create({
    data: { token: generateShareToken(), ownerId: userId, expiresAt },
  });

  return { token: share.token, expiresAt: toIso(share.expiresAt) };
}

export async function revokePlantShareAction(): Promise<boolean> {
  const userId = await getSessionUserId();
  if (!userId) return false;

  const result = await prisma.plantShare.deleteMany({ where: { ownerId: userId } });
  return result.count > 0;
}

/* ------------------------------ Guest actions ------------------------------ */

async function getValidShare(token: string) {
  if (!token || token.length < 10 || token.length > 128) return null;
  const share = await prisma.plantShare.findUnique({
    where: { token },
    include: { owner: { select: { id: true, fullName: true, isActive: true } } },
  });
  if (!share || !isShareUsable(share) || !share.owner.isActive) return null;
  return share;
}

export async function getSharedProfileAction(token: string): Promise<SharedProfile | null> {
  const share = await getValidShare(token);
  if (!share) return null;

  const plants = await prisma.userPlant.findMany({
    where: { userId: share.ownerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      locationType: true,
      lightExposure: true,
      potType: true,
      health: true,
      image: true,
      lastWatered: true,
      nextWateringDate: true,
      wateringInterval: true,
    },
  });

  return {
    ownerName: share.owner.fullName?.trim() || "",
    expiresAt: toIso(share.expiresAt),
    nowIso: new Date().toISOString(),
    plants: plants.map((p): SharedPlant => ({
      id: p.id,
      name: p.name,
      type: p.type ?? "",
      locationType: p.locationType ?? "Indoor",
      lightExposure: p.lightExposure ?? "Bright Indirect",
      potType: p.potType ?? "Plastic",
      health: p.health ?? "Excellent",
      image: p.image ?? undefined,
      lastWatered: toIso(p.lastWatered),
      nextWateringDate: toIso(p.nextWateringDate),
      wateringInterval: p.wateringInterval ?? 7,
    })),
  };
}

async function requireOwnedPlant(token: string, plantId: string) {
  const share = await getValidShare(token);
  if (!share) return null;
  const plant = await prisma.userPlant.findFirst({
    where: { id: plantId, userId: share.ownerId },
    select: {
      id: true,
      name: true,
      health: true,
      lastWatered: true,
      nextWateringDate: true,
      wateringInterval: true,
    },
  });
  if (!plant) return null;
  return { share, plant };
}

function plantToShared(p: {
  id: string;
  name: string;
  health: string | null;
  lastWatered: Date | null;
  nextWateringDate: Date | null;
  wateringInterval: number | null;
}): SharedPlant {
  return {
    id: p.id,
    name: p.name,
    type: "",
    locationType: "Indoor",
    lightExposure: "Bright Indirect",
    potType: "Plastic",
    health: p.health ?? "Excellent",
    lastWatered: toIso(p.lastWatered),
    nextWateringDate: toIso(p.nextWateringDate),
    wateringInterval: p.wateringInterval ?? 7,
  };
}

/** Guest marks one plant as watered right now. Returns the updated plant. */
export async function sharedMarkWateredAction(
  token: string,
  plantId: string
): Promise<SharedPlant | null> {
  const ctx = await requireOwnedPlant(token, plantId);
  if (!ctx) return null;

  const now = new Date();
  const interval = ctx.plant.wateringInterval || 7;
  const nextWateringDate = new Date(now);
  nextWateringDate.setDate(nextWateringDate.getDate() + interval);

  const updated = await prisma.userPlant.update({
    where: { id: plantId },
    data: { lastWatered: now, nextWateringDate },
    select: {
      id: true,
      name: true,
      health: true,
      lastWatered: true,
      nextWateringDate: true,
      wateringInterval: true,
    },
  });
  return plantToShared(updated);
}

/** Guest marks every thirsty plant watered and completes the owner's day log. */
export async function sharedMarkAllWateredAction(token: string): Promise<number> {
  const share = await getValidShare(token);
  if (!share) return 0;

  const plants = await prisma.userPlant.findMany({
    where: { userId: share.ownerId },
    select: { id: true, wateringInterval: true },
  });
  if (plants.length === 0) return 0;

  const now = new Date();
  let count = 0;
  for (const plant of plants) {
    const interval = plant.wateringInterval || 7;
    const nextWateringDate = new Date(now);
    nextWateringDate.setDate(nextWateringDate.getDate() + interval);
    await prisma.userPlant.update({
      where: { id: plant.id },
      data: { lastWatered: now, nextWateringDate },
    });
    count++;
  }

  // Complete the owner's daily watering checklist for today
  await prisma.wateringLog.upsert({
    where: {
      userId_logDate: { userId: share.ownerId, logDate: now },
    },
    update: {},
    create: { userId: share.ownerId, logDate: now },
  });

  return count;
}

const HEALTH_VALUES = ["Excellent", "Good", "Needs Attention"];

/** Guest posts a status update on a plant (no AI involved). */
export async function sharedAddStatusLogAction(
  token: string,
  plantId: string,
  status: string,
  health: string,
  image?: string | null
): Promise<{ ok: true } | null> {
  const ctx = await requireOwnedPlant(token, plantId);
  if (!ctx) return null;

  const statusText = typeof status === "string" ? status.trim().slice(0, MAX_GUEST_STATUS_CHARS) : "";
  if (!statusText) return null;

  let healthValue =
    typeof health === "string" && HEALTH_VALUES.includes(health.trim())
      ? health.trim()
      : "";
  if (!healthValue) healthValue = ctx.plant.health || "Good";

  const imageDb =
    typeof image === "string" && image.trim()
      ? image.trim().slice(0, MAX_GUEST_LOG_IMAGE_CHARS)
      : null;

  const data: Prisma.PlantStatusLogCreateInput = {
    plant: { connect: { id: plantId } },
    status: statusText,
    health: healthValue,
    ...(imageDb ? { image: imageDb } : {}),
  };

  await prisma.$transaction([
    prisma.userPlant.update({
      where: { id: plantId },
      data: { health: healthValue },
    }),
    prisma.plantStatusLog.create({ data }),
  ]);

  return { ok: true };
}

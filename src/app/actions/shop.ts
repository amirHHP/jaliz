"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSessionUserId, getCurrentUser } from "./auth"

export async function joinShopAction(code: string) {
  if (typeof (prisma as any)?.ensureDatabaseSchema === "function") {
    await (prisma as any).ensureDatabaseSchema().catch(() => {})
  }
  const userId = await getSessionUserId()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const shop = await prisma.shop.findUnique({
    where: { code }
  })

  if (!shop) {
    throw new Error("Shop not found")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { shopId: shop.id }
  })

  revalidatePath("/")
  return { success: true, shopName: shop.name }
}

export async function createShopAction(data: { name: string; code: string; ownerId: string }) {
  if (typeof (prisma as any)?.ensureDatabaseSchema === "function") {
    await (prisma as any).ensureDatabaseSchema().catch(() => {})
  }
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const existingShop = await prisma.shop.findFirst({
    where: {
      OR: [
        { code: data.code },
        { ownerId: data.ownerId }
      ]
    }
  })

  if (existingShop) {
    throw new Error("Shop code or owner already in use")
  }

  const shop = await prisma.shop.create({
    data
  })

  revalidatePath("/admin/shops")
  return shop
}

export async function getAdminShopsAction() {
  if (typeof (prisma as any)?.ensureDatabaseSchema === "function") {
    await (prisma as any).ensureDatabaseSchema().catch(() => {})
  }
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  return prisma.shop.findMany({
    include: {
      owner: { select: { fullName: true, email: true } },
      _count: { select: { customers: true } }
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function getShopCustomersAction(page: number = 1, limit: number = 20) {
  if (typeof (prisma as any)?.ensureDatabaseSchema === "function") {
    await (prisma as any).ensureDatabaseSchema().catch(() => {})
  }
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Unauthorized")

  const shop = await prisma.shop.findUnique({
    where: { ownerId: currentUser.id },
    include: {
      _count: {
        select: { customers: true }
      },
      customers: {
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          plants: {
            select: {
              id: true,
              name: true,
              health: true,
              statusLogs: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      }
    }
  })

  if (!shop) throw new Error("Shop not found")
  return shop
}

"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSessionUserId, getCurrentUser } from "./auth"

export async function joinShopAction(code: string) {
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

export async function getShopCustomersAction(page: number = 1, limit: number = 20, shopId?: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Unauthorized")

  let whereClause: any = null
  if (shopId && currentUser.role === "admin") {
    whereClause = { id: shopId }
  } else if (shopId) {
    whereClause = { id: shopId, ownerId: currentUser.id }
  } else if (currentUser.ownedShop) {
    whereClause = { ownerId: currentUser.id }
  } else if (currentUser.role === "admin") {
    const firstShop = await prisma.shop.findFirst({ select: { id: true } })
    if (firstShop) {
      whereClause = { id: firstShop.id }
    }
  }

  if (!whereClause) throw new Error("شما مالک هیچ فروشگاهی نیستید.")

  const shop = await prisma.shop.findUnique({
    where: whereClause,
    include: {
      owner: { select: { id: true, fullName: true, email: true } },
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

export async function updateShopAction(id: string, data: { name?: string; code?: string; ownerId?: string }) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  if (data.code) {
    const existingCode = await prisma.shop.findFirst({
      where: { code: data.code, NOT: { id } }
    })
    if (existingCode) throw new Error("این کد اختصاصی قبلاً برای فروشگاه دیگری ثبت شده است.")
  }

  if (data.ownerId) {
    const existingOwner = await prisma.shop.findFirst({
      where: { ownerId: data.ownerId, NOT: { id } }
    })
    if (existingOwner) throw new Error("این کاربر قبلاً مالک فروشگاه دیگری است.")
  }

  const updated = await prisma.shop.update({
    where: { id },
    data
  })

  revalidatePath("/admin/shops")
  revalidatePath("/shop")
  return updated
}

export async function deleteShopAction(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  await prisma.user.updateMany({
    where: { shopId: id },
    data: { shopId: null }
  })

  await prisma.shop.delete({
    where: { id }
  })

  revalidatePath("/admin/shops")
  revalidatePath("/shop")
  return { success: true }
}

export async function getShopByCodeAction(code: string) {
  return prisma.shop.findUnique({
    where: { code },
    select: {
      id: true,
      name: true,
      code: true,
      owner: { select: { fullName: true } }
    }
  })
}

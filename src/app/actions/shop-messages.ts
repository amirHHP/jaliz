"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "./auth"

export interface SendShopMessageInput {
  shopId: string
  recipientId?: string | null // null or empty string = broadcast to all customers
  title?: string | null
  body: string
}

export async function sendShopMessageAction(input: SendShopMessageInput) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید.")
  }

  const { shopId, recipientId, title, body } = input

  if (!shopId) {
    throw new Error("شناسه فروشگاه نامعتبر است.")
  }

  const trimmedBody = (body || "").trim()
  if (!trimmedBody) {
    throw new Error("متن پیام نمی‌تواند خالی باشد.")
  }

  if (trimmedBody.length > 3000) {
    throw new Error("متن پیام بیش از حد مجاز است (حداکثر ۳۰۰۰ نویسه).")
  }

  const trimmedTitle = title ? title.trim().slice(0, 150) : null

  // Check shop and permissions
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, ownerId: true, name: true }
  })

  if (!shop) {
    throw new Error("فروشگاه مورد نظر یافت نشد.")
  }

  const isOwner = shop.ownerId === currentUser.id
  const isAdmin = currentUser.role === "admin"
  if (!isOwner && !isAdmin) {
    throw new Error("شما دسترسی ارسال پیام در این فروشگاه را ندارید.")
  }

  // If sending to a specific customer, verify the recipient
  let finalRecipientId: string | null = null
  if (recipientId && recipientId.trim()) {
    const recipient = await prisma.user.findFirst({
      where: {
        id: recipientId.trim(),
        shopId: shop.id
      },
      select: { id: true, fullName: true, email: true }
    })

    if (!recipient) {
      throw new Error("مشتری مورد نظر عضو این فروشگاه نیست.")
    }
    finalRecipientId = recipient.id
  }

  const isBroadcast = !finalRecipientId

  const message = await prisma.shopMessage.create({
    data: {
      shopId: shop.id,
      senderId: currentUser.id,
      recipientId: finalRecipientId,
      title: trimmedTitle,
      body: trimmedBody,
      isBroadcast
    }
  })

  revalidatePath("/shop")
  return {
    success: true,
    messageId: message.id,
    isBroadcast,
    recipientId: finalRecipientId
  }
}

export async function getShopSentMessagesAction(shopId: string, page: number = 1, limit: number = 20) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error("Unauthorized")
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, ownerId: true }
  })

  if (!shop) {
    throw new Error("Shop not found")
  }

  const isOwner = shop.ownerId === currentUser.id
  const isAdmin = currentUser.role === "admin"
  if (!isOwner && !isAdmin) {
    throw new Error("Access denied")
  }

  const safePage = Math.max(1, page)
  const safeLimit = Math.min(50, Math.max(1, limit))

  const [total, messages, customersCount] = await Promise.all([
    prisma.shopMessage.count({ where: { shopId } }),
    prisma.shopMessage.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      include: {
        recipient: {
          select: { id: true, fullName: true, email: true }
        },
        sender: {
          select: { id: true, fullName: true, email: true }
        },
        _count: {
          select: { reads: true }
        }
      }
    }),
    prisma.user.count({ where: { shopId } })
  ])

  return {
    messages,
    total,
    customersCount,
    page: safePage,
    totalPages: Math.ceil(total / safeLimit)
  }
}

export async function getCustomerShopMessagesAction() {
  const currentUser = await getCurrentUser()
  if (!currentUser || !currentUser.shopId) {
    return { messages: [], shop: null }
  }

  const shop = await prisma.shop.findUnique({
    where: { id: currentUser.shopId },
    select: { id: true, name: true, code: true }
  })

  if (!shop) {
    return { messages: [], shop: null }
  }

  const messages = await prisma.shopMessage.findMany({
    where: {
      shopId: shop.id,
      OR: [
        { isBroadcast: true },
        { recipientId: currentUser.id }
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      sender: {
        select: { fullName: true }
      },
      reads: {
        where: { userId: currentUser.id },
        select: { readAt: true }
      }
    }
  })

  const mapped = messages.map((m) => ({
    id: m.id,
    title: m.title,
    body: m.body,
    isBroadcast: m.isBroadcast,
    createdAt: m.createdAt,
    senderName: m.sender?.fullName || shop.name,
    isRead: m.reads.length > 0,
    readAt: m.reads[0]?.readAt || null
  }))

  return {
    messages: mapped,
    shop
  }
}

export async function getUnreadShopMessagesCountAction(): Promise<number> {
  const currentUser = await getCurrentUser()
  if (!currentUser || !currentUser.shopId) {
    return 0
  }

  try {
    const count = await prisma.shopMessage.count({
      where: {
        shopId: currentUser.shopId,
        OR: [
          { isBroadcast: true },
          { recipientId: currentUser.id }
        ],
        reads: {
          none: {
            userId: currentUser.id
          }
        }
      }
    })
    return count
  } catch (err) {
    console.warn("getUnreadShopMessagesCountAction error:", err)
    return 0
  }
}

export async function markShopMessageAsReadAction(messageId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error("Unauthorized")
  }

  await prisma.shopMessageRead.upsert({
    where: {
      messageId_userId: {
        messageId,
        userId: currentUser.id
      }
    },
    create: {
      messageId,
      userId: currentUser.id
    },
    update: {
      readAt: new Date()
    }
  })

  return { success: true }
}

export async function markAllCustomerMessagesReadAction() {
  const currentUser = await getCurrentUser()
  if (!currentUser || !currentUser.shopId) {
    return { success: true }
  }

  // Find all unread messages
  const unreadMessages = await prisma.shopMessage.findMany({
    where: {
      shopId: currentUser.shopId,
      OR: [
        { isBroadcast: true },
        { recipientId: currentUser.id }
      ],
      reads: {
        none: {
          userId: currentUser.id
        }
      }
    },
    select: { id: true }
  })

  if (unreadMessages.length === 0) {
    return { success: true }
  }

  await Promise.all(
    unreadMessages.map((m) =>
      prisma.shopMessageRead.upsert({
        where: {
          messageId_userId: {
            messageId: m.id,
            userId: currentUser.id
          }
        },
        create: {
          messageId: m.id,
          userId: currentUser.id
        },
        update: {}
      })
    )
  )

  return { success: true, count: unreadMessages.length }
}

export async function deleteShopMessageAction(messageId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error("Unauthorized")
  }

  const msg = await prisma.shopMessage.findUnique({
    where: { id: messageId },
    include: { shop: { select: { ownerId: true } } }
  })

  if (!msg) {
    throw new Error("Message not found")
  }

  const isOwner = msg.shop.ownerId === currentUser.id
  const isAdmin = currentUser.role === "admin"
  if (!isOwner && !isAdmin) {
    throw new Error("Access denied")
  }

  await prisma.shopMessage.delete({
    where: { id: messageId }
  })

  revalidatePath("/shop")
  return { success: true }
}

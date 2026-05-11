"use server";

import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/app/actions/auth";
import { MarketplaceError } from "@/lib/marketplace/types";

export async function getMarketplaceListingsAction() {
  const listings = await prisma.marketplaceListing.findMany({
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' }
    ]
  });
  return listings;
}

export async function getMarketplaceConversationsAction() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const conversations = await prisma.marketplaceConversation.findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
    include: {
      participants: true
    },
    orderBy: { lastMessageAt: 'desc' }
  });

  // Map back to expected UI shape if needed (adding participantIds back as virtual field)
  return conversations.map(c => ({
    ...c,
    participantIds: c.participants.map(p => p.userId)
  }));
}

export async function getMarketplaceMessagesAction() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const conversations = await prisma.marketplaceConversation.findMany({
    where: { participants: { some: { userId } } },
    select: { id: true }
  });
  
  const conversationIds = conversations.map(c => c.id);

  const messages = await prisma.marketplaceMessage.findMany({
    where: {
      conversationId: { in: conversationIds }
    },
    orderBy: { createdAt: 'asc' }
  });
  
  return messages;
}

export async function createListingAction(input: any) {
  const ownerId = await getSessionUserId();
  if (!ownerId) throw new MarketplaceError("EMPTY_FIELD", "ownerId required");

  const listing = await prisma.marketplaceListing.create({
    data: {
      ownerId,
      title: input.title,
      description: input.description,
      type: input.type,
      mode: input.mode,
      price: input.mode === "sell" ? input.price : null,
      exchangeFor: input.mode === "exchange" ? input.exchangeFor : null,
      location: input.location,
      image: input.image,
      contactPhone: input.contactPhone,
      status: "active"
    }
  });

  return listing;
}

export async function updateListingAction(id: string, patch: any) {
  const ownerId = await getSessionUserId();
  if (!ownerId) throw new MarketplaceError("FORBIDDEN");

  const existing = await prisma.marketplaceListing.findUnique({ where: { id } });
  if (!existing) throw new MarketplaceError("NOT_FOUND");
  if (existing.ownerId !== ownerId) throw new MarketplaceError("FORBIDDEN");

  const data: any = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.type !== undefined) data.type = patch.type;
  if (patch.mode !== undefined) {
    data.mode = patch.mode;
    if (patch.mode !== "sell") data.price = null;
    if (patch.mode !== "exchange") data.exchangeFor = null;
  }
  if (patch.price !== undefined) data.price = patch.price;
  if (patch.exchangeFor !== undefined) data.exchangeFor = patch.exchangeFor;
  if (patch.location !== undefined) data.location = patch.location;
  if (patch.image !== undefined) data.image = patch.image;
  if (patch.contactPhone !== undefined) data.contactPhone = patch.contactPhone;

  const updated = await prisma.marketplaceListing.update({
    where: { id },
    data
  });

  return updated;
}

export async function setListingCompletedAction(id: string, completed: boolean) {
  const ownerId = await getSessionUserId();
  if (!ownerId) throw new MarketplaceError("FORBIDDEN");

  const existing = await prisma.marketplaceListing.findUnique({ where: { id } });
  if (!existing) throw new MarketplaceError("NOT_FOUND");
  if (existing.ownerId !== ownerId) throw new MarketplaceError("FORBIDDEN");

  const updated = await prisma.marketplaceListing.update({
    where: { id },
    data: {
      status: completed ? "completed" : "active",
      completedAt: completed ? new Date() : null
    }
  });

  return updated;
}

export async function removeListingAction(id: string) {
  const ownerId = await getSessionUserId();
  if (!ownerId) throw new MarketplaceError("FORBIDDEN");

  const existing = await prisma.marketplaceListing.findUnique({ where: { id } });
  if (!existing) throw new MarketplaceError("NOT_FOUND");
  if (existing.ownerId !== ownerId) throw new MarketplaceError("FORBIDDEN");

  await prisma.marketplaceListing.delete({ where: { id } });
}

export async function getOrCreateConversationAction(listingId: string, otherUserId: string) {
  const requesterId = await getSessionUserId();
  if (!requesterId) throw new MarketplaceError("EMPTY_FIELD");
  if (requesterId === otherUserId) throw new MarketplaceError("SAME_PARTICIPANT");

  let conversation = await prisma.marketplaceConversation.findFirst({
    where: {
      listingId,
      AND: [
        { participants: { some: { userId: requesterId } } },
        { participants: { some: { userId: otherUserId } } }
      ]
    },
    include: {
      participants: true
    }
  });

  if (!conversation) {
    conversation = await prisma.marketplaceConversation.create({
      data: {
        listingId,
        participants: {
          create: [
            { userId: requesterId },
            { userId: otherUserId }
          ]
        }
      },
      include: {
        participants: true
      }
    });
  }

  return {
    ...conversation,
    participantIds: conversation.participants.map(p => p.userId)
  };
}

export async function sendMessageAction(conversationId: string, body: string) {
  const senderId = await getSessionUserId();
  if (!senderId) throw new MarketplaceError("FORBIDDEN");

  const conversation = await prisma.marketplaceConversation.findUnique({ 
    where: { id: conversationId },
    include: { participants: true }
  });
  
  if (!conversation) throw new MarketplaceError("NOT_FOUND");
  
  const participantIds = conversation.participants.map(p => p.userId);
  if (!participantIds.includes(senderId)) throw new MarketplaceError("FORBIDDEN");

  const recipientId = participantIds.find(id => id !== senderId)!;

  const msg = await prisma.marketplaceMessage.create({
    data: {
      conversationId,
      listingId: conversation.listingId,
      senderId,
      recipientId,
      body: body.trim()
    }
  });

  await prisma.marketplaceConversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: msg.createdAt }
  });

  return msg;
}

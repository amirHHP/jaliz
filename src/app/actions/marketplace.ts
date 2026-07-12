"use server";

import { cache } from "react";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/app/actions/auth";
import { MarketplaceError } from "@/lib/marketplace/types";

const listingOwnerSelect = {
  fullName: true,
  phone: true,
  avatar: true,
} as const;

const listingOrderBy = [
  { status: "asc" as const },
  { createdAt: "desc" as const },
];

async function fetchMarketplaceInbox(userId: string) {
  const conversations = await prisma.marketplaceConversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const messages = conversations.flatMap((c) => c.messages);

  return {
    conversations: conversations.map(({ messages: _messages, participants, ...c }) => ({
      ...c,
      participantIds: participants.map((p: { userId: string }) => p.userId),
    })),
    messages,
  };
}

export async function getMarketplaceListingsAction() {
  const listings = await prisma.marketplaceListing.findMany({
    include: {
      owner: { select: listingOwnerSelect },
    },
    orderBy: listingOrderBy,
  });
  return listings;
}

/**
 * One Server Action round-trip for initial marketplace load:
 * listings (with owner) + inbox (conversations + messages).
 */
export async function getMarketplaceBootstrapAction() {
  const userId = await getSessionUserId();

  const [listings, inbox] = await Promise.all([
    prisma.marketplaceListing.findMany({
      include: {
        owner: { select: listingOwnerSelect },
      },
      orderBy: listingOrderBy,
    }),
    userId ? fetchMarketplaceInbox(userId) : Promise.resolve({ conversations: [], messages: [] }),
  ]);

  return { listings, ...inbox };
}

/** Public: fetch a single listing by id — no auth required (for SSR product pages). */
export async function getListingByIdAction(id: string) {
  const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
  return listing;
}

/** Public: listing + owner in one query. Cached per request (metadata + page). */
export const getListingWithOwnerAction = cache(async (id: string) => {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    include: {
      owner: { select: listingOwnerSelect },
    },
  });

  if (!listing) return null;

  const { owner, ...rest } = listing;
  return { listing: rest, owner };
});

/** Public: fetch owner name for a listing — no auth required (for SSR product pages). */
export async function getListingOwnerNameAction(ownerId: string) {
  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    select: listingOwnerSelect,
  });
  return user;
}

/** Public: fetch all active listing IDs for sitemap generation. */
export async function getAllListingIdsAction() {
  const listings = await prisma.marketplaceListing.findMany({
    where: { status: "active" },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
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

/**
 * Single round-trip for chat polling (conversations + messages).
 * Avoids separate Server Action POSTs on each poll tick.
 */
export async function getMarketplaceInboxAction() {
  const userId = await getSessionUserId();
  if (!userId) return { conversations: [], messages: [] };

  return fetchMarketplaceInbox(userId);
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

export async function createListingReportAction(listingId: string, reason: string) {
  const reporterId = await getSessionUserId();
  
  const report = await prisma.marketplaceReport.create({
    data: {
      listingId,
      reporterId,
      reason,
    }
  });

  return report;
}

export async function getMarketplaceReportsAction() {
  const userId = await getSessionUserId();
  if (!userId) throw new MarketplaceError("FORBIDDEN");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") throw new MarketplaceError("FORBIDDEN");

  const reports = await prisma.marketplaceReport.findMany({
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          ownerId: true,
          status: true,
        }
      },
      reporter: {
        select: {
          fullName: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return reports;
}

export async function deleteReportAction(id: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new MarketplaceError("FORBIDDEN");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") throw new MarketplaceError("FORBIDDEN");

  await prisma.marketplaceReport.delete({
    where: { id }
  });
}

export async function deleteListingByAdminAction(listingId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new MarketplaceError("FORBIDDEN");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") throw new MarketplaceError("FORBIDDEN");

  await prisma.marketplaceListing.delete({
    where: { id: listingId }
  });
}

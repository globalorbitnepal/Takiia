import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { assertMember } from './conversationService.js';

export async function listMessages(
  conversationId: string,
  userId: string,
  cursor?: string,
  take = 50,
) {
  await assertMember(conversationId, userId);
  const messages = await prisma.message.findMany({
    where: { conversationId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: { select: { id: true, displayName: true, avatarUrl: true } },
      attachments: true,
    },
  });
  const hasMore = messages.length > take;
  const items = hasMore ? messages.slice(0, take) : messages;
  return { items, nextCursor: hasMore ? items[items.length - 1]?.id : null };
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
  clientMessageId?: string;
  replyToId?: string;
}) {
  await assertMember(input.conversationId, input.senderId);
  if (!input.body.trim()) {
    throw new AppError(400, 'Message body is required');
  }

  try {
    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId: input.conversationId,
          senderId: input.senderId,
          body: input.body.trim(),
          clientMessageId: input.clientMessageId,
          replyToId: input.replyToId,
        },
        include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
      });
      await tx.conversation.update({
        where: { id: input.conversationId },
        data: { lastMessageAt: created.createdAt },
      });
      const members = await tx.conversationMember.findMany({
        where: { conversationId: input.conversationId, leftAt: null },
        select: { userId: true },
      });
      for (const member of members) {
        if (member.userId === input.senderId) continue;
        await tx.conversationReadState.update({
          where: {
            conversationId_userId: { conversationId: input.conversationId, userId: member.userId },
          },
          data: { unreadCount: { increment: 1 } },
        });
      }
      return created;
    });
    return message;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      throw new AppError(409, 'Duplicate message submission', 'DUPLICATE_MESSAGE');
    }
    throw error;
  }
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
  messageId: string,
) {
  await assertMember(conversationId, userId);
  await prisma.$transaction([
    prisma.messageReadReceipt.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: { readAt: new Date() },
    }),
    prisma.conversationReadState.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadMessageId: messageId, unreadCount: 0 },
    }),
  ]);
}

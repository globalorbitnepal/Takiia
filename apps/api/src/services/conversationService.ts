import { ConversationType, MemberRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

function sortUserPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function assertMember(conversationId: string, userId: string) {
  const member = await prisma.conversationMember.findFirst({
    where: { conversationId, userId, leftAt: null },
  });
  if (!member) {
    throw new AppError(403, 'Not a member of this conversation', 'FORBIDDEN');
  }
  return member;
}

export async function listConversations(userId: string) {
  const memberships = await prisma.conversationMember.findMany({
    where: { userId, leftAt: null },
    include: {
      conversation: {
        include: {
          groupProfile: true,
          members: {
            where: { leftAt: null },
            include: {
              user: { select: { id: true, displayName: true, avatarUrl: true, lastSeenAt: true } },
            },
          },
          messages: { take: 1, orderBy: { createdAt: 'desc' }, where: { deletedAt: null } },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: 'desc' } },
  });
  return memberships.map((m) => m.conversation);
}

export async function createDirectConversation(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    throw new AppError(400, 'Cannot start a conversation with yourself');
  }
  const blocked = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: userId },
      ],
    },
  });
  if (blocked) {
    throw new AppError(403, 'User is blocked', 'BLOCKED');
  }

  const [userAId, userBId] = sortUserPair(userId, otherUserId);
  const existing = await prisma.directConversationPair.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
    include: { conversation: true },
  });
  if (existing) {
    return existing.conversation;
  }

  return prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: { type: ConversationType.DIRECT },
    });
    await tx.directConversationPair.create({
      data: { conversationId: conversation.id, userAId, userBId },
    });
    await tx.conversationMember.createMany({
      data: [
        { conversationId: conversation.id, userId, role: MemberRole.MEMBER },
        { conversationId: conversation.id, userId: otherUserId, role: MemberRole.MEMBER },
      ],
    });
    await tx.conversationReadState.createMany({
      data: [
        { conversationId: conversation.id, userId },
        { conversationId: conversation.id, userId: otherUserId },
      ],
    });
    return conversation;
  });
}

export async function createGroupConversation(userId: string, name: string, memberIds: string[]) {
  const uniqueMembers = [...new Set([userId, ...memberIds])];
  return prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({ data: { type: ConversationType.GROUP } });
    await tx.groupProfile.create({ data: { conversationId: conversation.id, name } });
    await tx.conversationMember.createMany({
      data: uniqueMembers.map((id) => ({
        conversationId: conversation.id,
        userId: id,
        role: id === userId ? MemberRole.OWNER : MemberRole.MEMBER,
      })),
    });
    await tx.conversationReadState.createMany({
      data: uniqueMembers.map((id) => ({ conversationId: conversation.id, userId: id })),
    });
    return conversation;
  });
}

export async function searchUsers(query: string, excludeUserId: string) {
  return prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      OR: [
        { displayName: { contains: query, mode: 'insensitive' } },
        { emailNormalized: { contains: query.toLowerCase(), mode: 'insensitive' } },
      ],
    },
    take: 20,
    select: { id: true, displayName: true, avatarUrl: true, emailVerifiedAt: true },
  });
}

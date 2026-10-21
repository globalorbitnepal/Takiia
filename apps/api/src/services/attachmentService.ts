import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { assertMember } from './conversationService.js';

export async function userCanAccessAttachment(
  userId: string,
  attachmentId: string,
): Promise<boolean> {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { message: { select: { conversationId: true } } },
  });
  if (!attachment) return false;
  if (attachment.uploaderId === userId) return true;
  if (!attachment.message) return false;
  try {
    await assertMember(attachment.message.conversationId, userId);
    return true;
  } catch {
    return false;
  }
}

export async function linkAttachmentsToMessage(
  tx: Prisma.TransactionClient,
  attachmentIds: string[],
  messageId: string,
  uploaderId: string,
): Promise<void> {
  if (attachmentIds.length === 0) return;
  const owned = await tx.attachment.findMany({
    where: { id: { in: attachmentIds }, uploaderId, messageId: null },
  });
  if (owned.length !== attachmentIds.length) {
    throw new Error('INVALID_ATTACHMENTS');
  }
  await tx.attachment.updateMany({
    where: { id: { in: attachmentIds } },
    data: { messageId },
  });
}

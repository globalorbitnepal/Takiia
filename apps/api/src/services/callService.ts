import { CallStatus, CallType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { assertMember } from './conversationService.js';

export async function startCall(input: {
  callerId: string;
  calleeId: string;
  conversationId?: string;
  type: CallType;
}) {
  if (input.conversationId) {
    await assertMember(input.conversationId, input.callerId);
    await assertMember(input.conversationId, input.calleeId);
  }
  return prisma.call.create({
    data: {
      type: input.type,
      status: CallStatus.RINGING,
      conversationId: input.conversationId,
      participants: {
        create: [{ userId: input.callerId }, { userId: input.calleeId }],
      },
    },
    include: { participants: true },
  });
}

export async function updateCallStatus(callId: string, userId: string, status: CallStatus) {
  const participant = await prisma.callParticipant.findFirst({ where: { callId, userId } });
  if (!participant) {
    throw new AppError(403, 'Not a call participant', 'FORBIDDEN');
  }
  return prisma.call.update({
    where: { id: callId },
    data: {
      status,
      endedAt:
        status === CallStatus.ENDED ||
        status === CallStatus.DECLINED ||
        status === CallStatus.MISSED
          ? new Date()
          : undefined,
    },
  });
}

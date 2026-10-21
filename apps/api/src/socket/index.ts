import type { Server } from 'socket.io';
import { hashToken } from '../lib/crypto.js';
import { prisma } from '../lib/prisma.js';
import { sendMessage } from '../services/messageService.js';
import { assertMember } from '../services/conversationService.js';

export function registerSocketHandlers(io: Server): void {
  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        socket.request.headers.cookie?.match(/takiia_session=([^;]+)/)?.[1];
      if (!token) {
        return next(new Error('UNAUTHENTICATED'));
      }
      const session = await prisma.session.findFirst({
        where: {
          tokenHash: hashToken(token),
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });
      if (!session) {
        return next(new Error('UNAUTHENTICATED'));
      }
      socket.data.userId = session.user.id;
      socket.data.user = session.user;
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on('conversation:join', async (conversationId: string, cb?: (err?: string) => void) => {
      try {
        await assertMember(conversationId, userId);
        await socket.join(`conversation:${conversationId}`);
        cb?.();
      } catch {
        cb?.('FORBIDDEN');
      }
    });

    socket.on(
      'message:send',
      async (
        payload: { conversationId: string; body: string; clientMessageId?: string },
        cb?: (err?: string, message?: unknown) => void,
      ) => {
        try {
          const message = await sendMessage({
            conversationId: payload.conversationId,
            senderId: userId,
            body: payload.body,
            clientMessageId: payload.clientMessageId,
          });
          io.to(`conversation:${payload.conversationId}`).emit('message:new', message);
          cb?.(undefined, message);
        } catch {
          cb?.('SEND_FAILED');
        }
      },
    );

    socket.on('typing:start', async (conversationId: string) => {
      try {
        await assertMember(conversationId, userId);
        socket
          .to(`conversation:${conversationId}`)
          .emit('typing:start', { conversationId, userId });
      } catch {
        /* ignore */
      }
    });

    socket.on('typing:stop', async (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { conversationId, userId });
    });

    socket.on('presence:heartbeat', async () => {
      await prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
      socket.broadcast.emit('presence:update', { userId, lastSeenAt: new Date().toISOString() });
    });

    socket.on('call:signal', async (payload: { toUserId: string; data: unknown }) => {
      io.to(`user:${payload.toUserId}`).emit('call:signal', {
        fromUserId: userId,
        data: payload.data,
      });
    });

    socket.on('call:invite', (payload: { toUserId: string; callId: string; type: string }) => {
      io.to(`user:${payload.toUserId}`).emit('call:invite', {
        fromUserId: userId,
        callId: payload.callId,
        type: payload.type,
      });
    });
  });
}

import { Router } from 'express';
import { z } from 'zod';
import { MemberRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';
import {
  assertMember,
  createDirectConversation,
  createGroupConversation,
  listConversations,
  searchUsers,
} from '../services/conversationService.js';
import { listMessages, markConversationRead, sendMessage } from '../services/messageService.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const conversations = await listConversations(req.user!.id);
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
});

router.get('/users/search', async (req: AuthedRequest, res, next) => {
  try {
    const q = z.string().min(1).max(100).parse(req.query.q);
    const users = await searchUsers(q, req.user!.id);
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.post('/direct', async (req: AuthedRequest, res, next) => {
  try {
    const otherUserId = z.object({ userId: z.string().uuid() }).parse(req.body).userId;
    const conversation = await createDirectConversation(req.user!.id, otherUserId);
    res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
});

router.post('/group', async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({ name: z.string().min(1).max(120), memberIds: z.array(z.string().uuid()).max(50) })
      .parse(req.body);
    const conversation = await createGroupConversation(req.user!.id, body.name, body.memberIds);
    res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
});

router.get('/:conversationId/messages', async (req: AuthedRequest, res, next) => {
  try {
    const conversationId = z.string().uuid().parse(req.params.conversationId);
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const result = await listMessages(conversationId, req.user!.id, cursor);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:conversationId/messages', async (req: AuthedRequest, res, next) => {
  try {
    const conversationId = z.string().uuid().parse(req.params.conversationId);
    const body = z
      .object({
        body: z.string().min(1).max(8000),
        clientMessageId: z.string().max(64).optional(),
        replyToId: z.string().uuid().optional(),
      })
      .parse(req.body);
    const message = await sendMessage({
      conversationId,
      senderId: req.user!.id,
      body: body.body,
      clientMessageId: body.clientMessageId,
      replyToId: body.replyToId,
    });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

router.post('/:conversationId/members', async (req: AuthedRequest, res, next) => {
  try {
    const conversationId = z.string().uuid().parse(req.params.conversationId);
    const member = await assertMember(conversationId, req.user!.id);
    if (member.role !== MemberRole.OWNER && member.role !== MemberRole.ADMIN) {
      throw new AppError(403, 'Only admins can add members');
    }
    const userIds = z
      .object({ userIds: z.array(z.string().uuid()).min(1) })
      .parse(req.body).userIds;
    await prisma.conversationMember.createMany({
      data: userIds.map((userId) => ({ conversationId, userId, role: MemberRole.MEMBER })),
      skipDuplicates: true,
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/:conversationId/members/:userId', async (req: AuthedRequest, res, next) => {
  try {
    const conversationId = z.string().uuid().parse(req.params.conversationId);
    const userId = z.string().uuid().parse(req.params.userId);
    const member = await assertMember(conversationId, req.user!.id);
    if (
      member.role !== MemberRole.OWNER &&
      member.role !== MemberRole.ADMIN &&
      userId !== req.user!.id
    ) {
      throw new AppError(403, 'Not allowed to remove this member');
    }
    await prisma.conversationMember.updateMany({
      where: { conversationId, userId, leftAt: null },
      data: { leftAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:conversationId/read', async (req: AuthedRequest, res, next) => {
  try {
    const conversationId = z.string().uuid().parse(req.params.conversationId);
    const messageId = z.object({ messageId: z.string().uuid() }).parse(req.body).messageId;
    await markConversationRead(conversationId, req.user!.id, messageId);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export { router as conversationsRouter };

import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { getEntitlements } from '../services/entitlementService.js';
import { getPrimaryWorkspace } from '../services/workspaceService.js';
import { listConversations } from '../services/conversationService.js';

const router = Router();
router.use(requireAuth);

router.get('/overview', async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const workspace = await getPrimaryWorkspace(userId);
    const conversations = await listConversations(userId);
    const readStates = await prisma.conversationReadState.findMany({ where: { userId } });
    const unreadTotal = readStates.reduce((sum, r) => sum + r.unreadCount, 0);

    let entitlements = null;
    let upcomingEvents: unknown[] = [];
    let scheduledPosts: unknown[] = [];
    if (workspace) {
      entitlements = await getEntitlements(workspace.id, userId);
      upcomingEvents = await prisma.workspaceEvent.findMany({
        where: { workspaceId: workspace.id, startsAt: { gte: new Date() } },
        orderBy: { startsAt: 'asc' },
        take: 5,
      });
      scheduledPosts = await prisma.scheduledPost.findMany({
        where: { workspaceId: workspace.id, status: { in: ['SCHEDULED', 'DRAFT'] } },
        orderBy: { scheduledFor: 'asc' },
        take: 5,
      });
    }

    const upcomingCalls = await prisma.call.findMany({
      where: {
        participants: { some: { userId } },
        status: { in: ['RINGING', 'ACTIVE'] },
      },
      take: 5,
      orderBy: { startedAt: 'asc' },
    });

    res.json({
      unreadMessages: unreadTotal,
      conversationsCount: conversations.length,
      workspace,
      entitlements,
      upcomingEvents,
      scheduledPosts,
      upcomingCalls,
    });
  } catch (error) {
    next(error);
  }
});

export { router as dashboardRouter };

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { listWorkspacesForUser, getPrimaryWorkspace } from '../services/workspaceService.js';
import { prisma } from '../lib/prisma.js';
import { assertWorkspaceMember } from '../services/workspaceService.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const workspaces = await listWorkspacesForUser(req.user!.id);
    res.json({ workspaces });
  } catch (error) {
    next(error);
  }
});

router.get('/primary', async (req: AuthedRequest, res, next) => {
  try {
    const workspace = await getPrimaryWorkspace(req.user!.id);
    res.json({ workspace });
  } catch (error) {
    next(error);
  }
});

router.get('/:workspaceId/events', async (req: AuthedRequest, res, next) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    await assertWorkspaceMember(workspaceId, req.user!.id);
    const events = await prisma.workspaceEvent.findMany({
      where: { workspaceId },
      orderBy: { startsAt: 'asc' },
      take: 50,
    });
    res.json({ events });
  } catch (error) {
    next(error);
  }
});

export { router as workspacesRouter };

import { Router } from 'express';
import { z } from 'zod';
import { SocialPlatform } from '@prisma/client';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import {
  beginSocialConnect,
  listScheduledPosts,
  listSocialAccounts,
  retryPublishJob,
  schedulePost,
} from '../services/socialService.js';
const router = Router();
router.use(requireAuth);

router.get('/:workspaceId/accounts', async (req: AuthedRequest, res, next) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const accounts = await listSocialAccounts(workspaceId, req.user!.id);
    res.json({ accounts });
  } catch (error) {
    next(error);
  }
});

router.post('/:workspaceId/accounts/connect', async (req: AuthedRequest, res, next) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const platform = z.nativeEnum(SocialPlatform).parse(req.body.platform);
    const result = await beginSocialConnect(workspaceId, req.user!.id, platform);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:workspaceId/posts', async (req: AuthedRequest, res, next) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const posts = await listScheduledPosts(workspaceId, req.user!.id);
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

router.post('/:workspaceId/posts', async (req: AuthedRequest, res, next) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const body = z
      .object({
        content: z.string().min(1).max(5000),
        scheduledFor: z.string().datetime().optional(),
        socialAccountIds: z.array(z.string().uuid()).min(1),
        idempotencyKey: z.string().max(128).optional(),
      })
      .parse(req.body);
    const post = await schedulePost({
      workspaceId,
      userId: req.user!.id,
      body: body.content,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      socialAccountIds: body.socialAccountIds,
      idempotencyKey: body.idempotencyKey,
    });
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});

router.post('/jobs/:jobId/retry', async (req: AuthedRequest, res, next) => {
  try {
    const jobId = z.string().uuid().parse(req.params.jobId);
    const job = await retryPublishJob(jobId, req.user!.id);
    res.json({ job });
  } catch (error) {
    next(error);
  }
});

export { router as socialRouter };

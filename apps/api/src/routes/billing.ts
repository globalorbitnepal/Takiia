import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { getEntitlements } from '../services/entitlementService.js';
import { getPrimaryWorkspace } from '../services/workspaceService.js';

const router = Router();

router.get('/plans', async (_req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({
      plans: plans.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        monthlyPriceCents: p.monthlyPriceCents,
        yearlyPriceCents: p.yearlyPriceCents,
        limits: {
          maxMembers: p.maxMembers,
          maxSocialAccounts: p.maxSocialAccounts,
          maxScheduledPostsPerMonth: p.maxScheduledPostsPerMonth,
          maxStorageBytes: p.maxStorageBytes.toString(),
          maxMeetingMinutesPerMonth: p.maxMeetingMinutesPerMonth,
          maxMeetingParticipants: p.maxMeetingParticipants,
        },
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth);

router.get('/subscription', async (req: AuthedRequest, res, next) => {
  try {
    const workspace = await getPrimaryWorkspace(req.user!.id);
    if (!workspace) {
      res.json({ subscription: null });
      return;
    }
    const entitlements = await getEntitlements(workspace.id, req.user!.id);
    res.json(entitlements);
  } catch (error) {
    next(error);
  }
});

router.post('/checkout', async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({
        planCode: z.enum(['STARTER', 'PRO', 'BUSINESS', 'AGENCY']),
        billingInterval: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
      })
      .parse(req.body);
    res.status(503).json({
      error: {
        code: 'PAYMENT_NOT_CONFIGURED',
        message:
          'Payment checkout is not configured. Set PAYMENT_PROVIDER and gateway credentials on the server before accepting paid subscriptions.',
      },
      requested: body,
    });
  } catch (error) {
    next(error);
  }
});

export { router as billingRouter };

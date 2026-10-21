import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { prisma } from '../lib/prisma.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/users', async (req: AuthedRequest, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { displayName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.get('/plans', async (_req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ plans });
  } catch (error) {
    next(error);
  }
});

router.patch('/plans/:planId', async (req: AuthedRequest, res, next) => {
  try {
    const planId = z.string().uuid().parse(req.params.planId);
    const body = z
      .object({
        monthlyPriceCents: z.number().int().positive().optional(),
        yearlyPriceCents: z.number().int().positive().optional(),
        maxScheduledPostsPerMonth: z.number().int().positive().optional(),
        maxSocialAccounts: z.number().int().positive().optional(),
        maxMembers: z.number().int().positive().optional(),
        active: z.boolean().optional(),
      })
      .parse(req.body);
    const plan = await prisma.plan.update({ where: { id: planId }, data: body });
    await prisma.auditEvent.create({
      data: {
        userId: req.user!.id,
        action: 'admin.plan.update',
        metadata: { planId, fields: Object.keys(body) },
      },
    });
    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

router.get('/reports', async (_req, res, next) => {
  try {
    const reports = await prisma.userReport.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, displayName: true } },
        reported: { select: { id: true, displayName: true } },
      },
    });
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

export { router as adminRouter };

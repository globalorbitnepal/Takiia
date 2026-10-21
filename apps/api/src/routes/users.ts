import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';

const router = Router();
router.use(requireAuth);

router.post('/:userId/block', async (req: AuthedRequest, res, next) => {
  try {
    const blockedId = z.string().uuid().parse(req.params.userId);
    if (blockedId === req.user!.id) {
      throw new AppError(400, 'Cannot block yourself');
    }
    await prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId: req.user!.id, blockedId } },
      create: { blockerId: req.user!.id, blockedId },
      update: {},
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/:userId/block', async (req: AuthedRequest, res, next) => {
  try {
    const blockedId = z.string().uuid().parse(req.params.userId);
    await prisma.userBlock.deleteMany({ where: { blockerId: req.user!.id, blockedId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/report', async (req: AuthedRequest, res, next) => {
  try {
    const reportedId = z.string().uuid().parse(req.params.userId);
    const body = z
      .object({ reason: z.string().min(3).max(200), details: z.string().max(2000).optional() })
      .parse(req.body);
    await prisma.userReport.create({
      data: {
        reporterId: req.user!.id,
        reportedId,
        reason: body.reason,
        details: body.details,
      },
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export { router as usersRouter };

import { Router } from 'express';
import { z } from 'zod';
import { CallStatus, CallType } from '@prisma/client';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { startCall, updateCallStatus } from '../services/callService.js';

const router = Router();
router.use(requireAuth);

router.post('/start', async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({
        calleeId: z.string().uuid(),
        conversationId: z.string().uuid().optional(),
        type: z.nativeEnum(CallType).default(CallType.VOICE),
      })
      .parse(req.body);
    const call = await startCall({
      callerId: req.user!.id,
      calleeId: body.calleeId,
      conversationId: body.conversationId,
      type: body.type,
    });
    res.status(201).json({ call });
  } catch (error) {
    next(error);
  }
});

router.post('/:callId/accept', async (req: AuthedRequest, res, next) => {
  try {
    const callId = z.string().uuid().parse(req.params.callId);
    const call = await updateCallStatus(callId, req.user!.id, CallStatus.ACTIVE);
    res.json({ call });
  } catch (error) {
    next(error);
  }
});

router.post('/:callId/decline', async (req: AuthedRequest, res, next) => {
  try {
    const callId = z.string().uuid().parse(req.params.callId);
    const call = await updateCallStatus(callId, req.user!.id, CallStatus.DECLINED);
    res.json({ call });
  } catch (error) {
    next(error);
  }
});

router.post('/:callId/end', async (req: AuthedRequest, res, next) => {
  try {
    const callId = z.string().uuid().parse(req.params.callId);
    const call = await updateCallStatus(callId, req.user!.id, CallStatus.ENDED);
    res.json({ call });
  } catch (error) {
    next(error);
  }
});

export { router as callsRouter };

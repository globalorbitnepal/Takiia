import { Router } from 'express';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/config', (_req, res) => {
  res.json({
    iceServers: [
      ...env.webrtc.stunUrls.map((url) => ({ urls: url })),
      ...(env.webrtc.turnUrls.length > 0
        ? [
            {
              urls: env.webrtc.turnUrls,
              username: env.webrtc.turnUsername,
              credential: env.webrtc.turnCredential,
            },
          ]
        : []),
    ],
  });
});

export { router as webrtcRouter };

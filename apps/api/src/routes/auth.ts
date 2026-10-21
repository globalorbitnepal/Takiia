import { Router } from 'express';
import { z } from 'zod';
import {
  loginUser,
  logoutSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmailToken,
} from '../services/authService.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import {
  clearSessionCookie,
  getSessionToken,
  requireAuth,
  setSessionCookie,
  type AuthedRequest,
} from '../middleware/auth.js';
const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(128),
  displayName: z.string().min(1).max(80),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

router.post('/register', authRateLimit, async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const { user, sessionToken } = await registerUser(body);
    setSessionCookie(res, sessionToken);
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authRateLimit, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const { user, sessionToken } = await loginUser(body.email, body.password);
    setSessionCookie(res, sessionToken);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const token = getSessionToken(req);
    if (token) await logoutSession(token);
    clearSessionCookie(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerifiedAt: user.emailVerifiedAt,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    },
  });
});

router.post('/verify-email', authRateLimit, async (req, res, next) => {
  try {
    const token = z.object({ token: z.string().min(10) }).parse(req.body).token;
    await verifyEmailToken(token);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', authRateLimit, async (req, res, next) => {
  try {
    const email = z.object({ email: z.string().email() }).parse(req.body).email;
    await requestPasswordReset(email);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', authRateLimit, async (req, res, next) => {
  try {
    const body = z
      .object({ token: z.string().min(10), password: z.string().min(10).max(128) })
      .parse(req.body);
    await resetPassword(body.token, body.password);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({
        displayName: z.string().min(1).max(80).optional(),
        bio: z.string().max(500).optional(),
      })
      .parse(req.body);
    const { prisma } = await import('../lib/prisma.js');
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: body,
    });
    res.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };

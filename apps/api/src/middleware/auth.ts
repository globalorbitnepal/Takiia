import type { NextFunction, Request, Response } from 'express';
import type { User } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import { getUserBySessionToken } from '../services/authService.js';
import { baseCookieOptions } from '../lib/cookies.js';

const SESSION_COOKIE = 'takiia_session';

export type AuthedRequest = Request & { user?: User; sessionToken?: string };

export function getSessionToken(req: Request): string | undefined {
  const cookie = req.cookies?.[SESSION_COOKIE];
  if (typeof cookie === 'string' && cookie.length > 0) {
    return cookie;
  }
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return undefined;
}

export async function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = getSessionToken(req);
    if (!token) {
      throw new AppError(401, 'Authentication required', 'UNAUTHENTICATED');
    }
    const user = await getUserBySessionToken(token);
    if (!user) {
      throw new AppError(401, 'Invalid session', 'UNAUTHENTICATED');
    }
    req.user = user;
    req.sessionToken = token;
    next();
  } catch (error) {
    next(error);
  }
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    ...baseCookieOptions(),
    httpOnly: true,
  });
}

export { SESSION_COOKIE };

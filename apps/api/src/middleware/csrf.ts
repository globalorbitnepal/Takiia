import type { NextFunction, Request, Response } from 'express';
import { randomToken, hashToken } from '../lib/crypto.js';
import { AppError } from '../lib/errors.js';
import { env } from '../config/env.js';

const CSRF_COOKIE = 'takiia_csrf';
const CSRF_HEADER = 'x-csrf-token';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function issueCsrfToken(res: Response): string {
  const token = randomToken(24);
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    domain: env.cookieDomain,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get(CSRF_HEADER);
  if (!cookieToken || !headerToken || hashToken(cookieToken) !== hashToken(headerToken)) {
    next(new AppError(403, 'CSRF validation failed', 'CSRF_FAILED'));
    return;
  }
  next();
}

export function registerCsrfRoute(app: import('express').Express): void {
  app.get('/auth/csrf', (_req, res) => {
    const token = issueCsrfToken(res);
    res.json({ csrfToken: token });
  });
}

export { CSRF_HEADER };

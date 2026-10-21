import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { randomToken, hashToken } from '../lib/crypto.js';
import { AppError } from '../lib/errors.js';
import { baseCookieOptions } from '../lib/cookies.js';

const CSRF_COOKIE = 'takiia_csrf';
const CSRF_HEADER = 'x-csrf-token';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function tokensMatch(left: string, right: string): boolean {
  const leftHash = hashToken(left);
  const rightHash = hashToken(right);
  const leftBuf = Buffer.from(leftHash);
  const rightBuf = Buffer.from(rightHash);
  return leftBuf.length === rightBuf.length && timingSafeEqual(leftBuf, rightBuf);
}

function csrfCookieValues(req: Request): string[] {
  const values: string[] = [];
  const parsed = req.cookies?.[CSRF_COOKIE];
  if (typeof parsed === 'string' && parsed.length > 0) {
    values.push(parsed);
  }
  const raw = req.headers.cookie;
  if (!raw) {
    return values;
  }
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    if (name !== CSRF_COOKIE) continue;
    try {
      const value = decodeURIComponent(part.slice(idx + 1).trim());
      if (value) values.push(value);
    } catch {
      const value = part.slice(idx + 1).trim();
      if (value) values.push(value);
    }
  }
  return values;
}

export function issueCsrfToken(res: Response): string {
  const token = randomToken(24);
  res.cookie(CSRF_COOKIE, token, {
    ...baseCookieOptions(),
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }
  const headerToken = req.get(CSRF_HEADER);
  if (
    !headerToken ||
    !csrfCookieValues(req).some((cookieToken) => tokensMatch(cookieToken, headerToken))
  ) {
    next(new AppError(403, 'CSRF validation failed', 'CSRF_FAILED'));
    return;
  }
  next();
}

export function registerCsrfRoute(app: import('express').Express): void {
  app.get('/auth/csrf', (req, res) => {
    const existing = csrfCookieValues(req)[0];
    const token = existing ?? issueCsrfToken(res);
    res.json({ csrfToken: token });
  });
}

export { CSRF_HEADER, CSRF_COOKIE };

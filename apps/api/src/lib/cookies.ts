import type { CookieOptions } from 'express';
import { env } from '../config/env.js';

export function baseCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
  };
  if (env.cookieDomain) {
    options.domain = env.cookieDomain;
  }
  return options;
}

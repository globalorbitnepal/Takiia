import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { isAppError } from '../lib/errors.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: { message: 'Validation failed', code: 'VALIDATION_ERROR' } });
    return;
  }
  if (isAppError(err)) {
    res.status(err.status).json({ error: { message: err.message, code: err.code } });
    return;
  }

  const detail = err instanceof Error ? err.message : String(err);
  console.error('[api] unhandled error', detail);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'production' ? {} : { detail }),
    },
  });
}

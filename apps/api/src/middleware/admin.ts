import type { NextFunction, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import type { AuthedRequest } from './auth.js';

export function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction): void {
  if (req.user?.role !== UserRole.ADMIN) {
    next(new AppError(403, 'Admin access required', 'FORBIDDEN'));
    return;
  }
  next();
}

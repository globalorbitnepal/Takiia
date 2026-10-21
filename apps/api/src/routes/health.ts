import type { Express, Request, Response } from 'express';
import { createHealthPayload } from '@takiia/shared';
import { API_VERSION } from '../version.js';

export function registerHealthRoutes(app: Express): void {
  app.get('/health', (_req: Request, res: Response) => {
    res.json(createHealthPayload('api', API_VERSION));
  });

  app.get('/health/ready', (_req: Request, res: Response) => {
    // Database readiness checks will be added when migrations are introduced.
    res.json({
      ...createHealthPayload('api', API_VERSION),
      checks: {
        database: 'skipped',
      },
    });
  });
}

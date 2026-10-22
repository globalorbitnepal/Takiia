import type { Express, Request, Response } from 'express';
import { createHealthPayload, readDeployCommitFromAppRoot } from '@takiia/shared';
import { API_VERSION } from '../version.js';

function deployCommit(): string | undefined {
  return readDeployCommitFromAppRoot(process.env.TAKIIA_APP_ROOT ?? process.cwd());
}

export function registerHealthRoutes(app: Express): void {
  app.get('/health', (_req: Request, res: Response) => {
    res.json(createHealthPayload('api', API_VERSION, deployCommit()));
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    let database: 'ok' | 'error' | 'skipped' = 'skipped';
    try {
      const { prisma } = await import('../lib/prisma.js');
      await prisma.$queryRaw`SELECT 1`;
      database = 'ok';
    } catch {
      database = 'error';
    }
    const status = database === 'error' ? 503 : 200;
    res.status(status).json({
      ...createHealthPayload('api', API_VERSION, deployCommit()),
      checks: { database },
    });
  });
}

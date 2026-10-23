import type { Express, Request, Response } from 'express';
import { createHealthPayload, readDeployCommitFromAppRoot } from '@takiia/shared';
import { API_VERSION } from '../version.js';
import { diffRequiredTables, isTakiiaDbUrl } from '../lib/schemaCheck.js';

function deployCommit(): string | undefined {
  return readDeployCommitFromAppRoot(process.env.TAKIIA_APP_ROOT ?? process.cwd());
}

export function registerHealthRoutes(app: Express): void {
  app.get('/health', (_req: Request, res: Response) => {
    res.json(createHealthPayload('api', API_VERSION, deployCommit()));
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    let database: 'ok' | 'error' | 'skipped' = 'skipped';
    let schema: 'ok' | 'error' | 'skipped' = 'skipped';
    let plans: number | 'skipped' = 'skipped';
    let missingTables: string[] = [];
    try {
      const { prisma } = await import('../lib/prisma.js');
      await prisma.$queryRaw`SELECT 1`;
      database = 'ok';
      if (isTakiiaDbUrl(process.env.DATABASE_URL)) {
        const rows = await prisma.$queryRaw<{ tablename: string }[]>`
          SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
        `;
        const present = rows.map((row) => row.tablename);
        const diff = diffRequiredTables(present);
        missingTables = diff.missing;
        schema = diff.missing.length === 0 ? 'ok' : 'error';
        plans = await prisma.plan.count({ where: { active: true } });
        if (typeof plans === 'number' && plans < 1) {
          schema = 'error';
        }
      }
    } catch {
      database = 'error';
      schema = 'error';
    }
    const status = database === 'error' || schema === 'error' ? 503 : 200;
    res.status(status).json({
      ...createHealthPayload('api', API_VERSION, deployCommit()),
      checks: {
        database,
        schema,
        plans,
        ...(missingTables.length ? { missingTables } : {}),
      },
    });
  });
}

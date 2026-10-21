import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

const databaseUrl = process.env.DATABASE_URL;
const runIntegration = Boolean(databaseUrl?.includes('takiia_test') || process.env.CI === 'true');
const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe.runIf(runIntegration)('integration', () => {
  const app = createApp();

  beforeAll(async () => {
    if (process.env.CI !== 'true') {
      execSync('npx prisma migrate deploy', {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'inherit',
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('health endpoints respond', async () => {
    const live = await request(app).get('/health');
    expect(live.status).toBe(200);
    const ready = await request(app).get('/health/ready');
    expect([200, 503]).toContain(ready.status);
  });

  it('registers, logs in, and creates a direct conversation', async () => {
    const agent = request.agent(app);
    const csrf = await agent.get('/auth/csrf');
    const token = csrf.body.csrfToken as string;

    const emailA = `a-${Date.now()}@example.com`;
    const emailB = `b-${Date.now()}@example.com`;

    const regA = await agent
      .post('/auth/register')
      .set('x-csrf-token', token)
      .send({ email: emailA, password: 'password-12345', displayName: 'User A' });
    expect(regA.status).toBe(201);

    const regB = await agent
      .post('/auth/register')
      .set('x-csrf-token', token)
      .send({ email: emailB, password: 'password-12345', displayName: 'User B' });
    expect(regB.status).toBe(201);

    const dup = await agent
      .post('/auth/register')
      .set('x-csrf-token', token)
      .send({ email: emailA, password: 'password-12345', displayName: 'Dup' });
    expect(dup.status).toBe(409);

    const userBId = regB.body.user.id as string;
    const conv = await agent
      .post('/conversations/direct')
      .set('x-csrf-token', token)
      .send({ userId: userBId });
    expect(conv.status).toBe(201);
  });
});

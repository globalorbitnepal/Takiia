import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { io as ioClient } from 'socket.io-client';
import { prisma } from '../lib/prisma.js';
import { createTestServer, sessionCookieHeader } from './testServer.js';

const databaseUrl = process.env.DATABASE_URL;
const runIntegration = Boolean(databaseUrl?.includes('takiia_test'));
const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const sentEmails: { to: string; subject: string; text: string }[] = [];

vi.mock('../services/email.js', () => ({
  sendEmail: vi.fn(async (to: string, subject: string, text: string) => {
    sentEmails.push({ to, subject, text });
  }),
}));

function extractToken(text: string, param: string): string {
  const match = text.match(new RegExp(`[?&]${param}=([^\\s]+)`));
  if (!match) throw new Error(`token ${param} not found`);
  return match[1];
}

function sessionTokenFromCookieHeader(cookieHeader: string): string {
  const match = cookieHeader.match(/(?:^|;\s*)takiia_session=([^;]+)/);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

type ApiAgent = ReturnType<typeof request.agent>;
type TestResponse = Awaited<ReturnType<ApiAgent['get']>>;

const csrfByAgent = new WeakMap<ApiAgent, string>();

async function csrfToken(agent: ApiAgent): Promise<string> {
  const cached = csrfByAgent.get(agent);
  if (cached) return cached;
  const res = await agent.get('/auth/csrf');
  const token = res.body.csrfToken as string;
  if (!token) {
    throw new Error(`csrf failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  csrfByAgent.set(agent, token);
  return token;
}

function expectStatus(res: TestResponse, status: number): void {
  expect(res.status, JSON.stringify(res.body)).toBe(status);
}

async function registerUser(
  agent: ApiAgent,
  email: string,
  displayName: string,
): Promise<{ id: string; email: string; sessionCookie: string }> {
  const token = await csrfToken(agent);
  const res = await agent
    .post('/auth/register')
    .set('x-csrf-token', token)
    .send({ email, password: 'password-12345', displayName });
  if (res.status !== 201) {
    throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const sessionCookie = sessionCookieHeader(res.headers['set-cookie']);
  return {
    ...(res.body.user as { id: string; email: string }),
    sessionCookie,
  };
}

describe.runIf(runIntegration)('integration', () => {
  let server: Awaited<ReturnType<typeof createTestServer>>;

  beforeAll(async () => {
    if (!databaseUrl?.includes('takiia_test')) {
      throw new Error(
        `Integration tests require DATABASE_URL with takiia_test (got ${databaseUrl ? 'other database' : 'unset'})`,
      );
    }
    await prisma.$queryRaw`SELECT 1`;

    const uploadDir = path.join(tmpdir(), `takiia-upload-${Date.now()}`);
    mkdirSync(uploadDir, { recursive: true });
    process.env.UPLOAD_DIR = uploadDir;

    if (!process.env.GITHUB_ACTIONS) {
      execSync('npx prisma migrate deploy', {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'inherit',
      });
    }
    server = await createTestServer();
  });

  afterAll(async () => {
    await server?.close();
    await prisma.$disconnect();
  });

  it('health endpoints respond', async () => {
    const live = await request(server.httpServer).get('/health');
    expect(live.status).toBe(200);
    const ready = await request(server.httpServer).get('/health/ready');
    expect(ready.status).toBe(200);
    expect(ready.body.checks?.database).toBe('ok');
  });

  it('exposes database-backed plans and workspace on register', async () => {
    const plansRes = await request(server.httpServer).get('/billing/plans');
    expect(plansRes.status).toBe(200);
    expect(plansRes.body.plans.length).toBeGreaterThanOrEqual(4);

    const agent = request.agent(server.baseUrl);
    const email = `ws-${Date.now()}@example.com`;
    await registerUser(agent, email, 'Workspace User');
    const primary = await agent.get('/workspaces/primary');
    expectStatus(primary, 200);
    expect(primary.body.workspace?.subscription?.plan?.code).toBe('STARTER');
  });

  it('registers, verifies email, and resets password', async () => {
    sentEmails.length = 0;
    const agent = request.agent(server.baseUrl);
    const email = `verify-${Date.now()}@example.com`;
    await registerUser(agent, email, 'Verify User');

    expect(sentEmails.some((m) => m.to === email && m.subject.includes('Verify'))).toBe(true);
    const verifyToken = extractToken(sentEmails.find((m) => m.to === email)!.text, 'token');
    const verify = await agent
      .post('/auth/verify-email')
      .set('x-csrf-token', await csrfToken(agent))
      .send({ token: verifyToken });
    expectStatus(verify, 200);

    const me = await agent.get('/auth/me');
    expect(me.body.user.emailVerifiedAt).toBeTruthy();

    sentEmails.length = 0;
    const forgot = await agent
      .post('/auth/forgot-password')
      .set('x-csrf-token', await csrfToken(agent))
      .send({ email });
    expectStatus(forgot, 200);
    const resetToken = extractToken(sentEmails[0].text, 'token');
    const reset = await agent
      .post('/auth/reset-password')
      .set('x-csrf-token', await csrfToken(agent))
      .send({ token: resetToken, password: 'new-password-99' });
    expectStatus(reset, 200);

    const login = await agent
      .post('/auth/login')
      .set('x-csrf-token', await csrfToken(agent))
      .send({ email, password: 'new-password-99' });
    expectStatus(login, 200);
  });

  it('creates direct chat, messages, and attachments', async () => {
    const agentA = request.agent(server.baseUrl);
    const agentB = request.agent(server.baseUrl);
    const emailA = `msg-a-${Date.now()}@example.com`;
    const emailB = `msg-b-${Date.now()}@example.com`;
    await registerUser(agentA, emailA, 'A');
    const userB = await registerUser(agentB, emailB, 'B');

    const conv = await agentA
      .post('/conversations/direct')
      .set('x-csrf-token', await csrfToken(agentA))
      .send({ userId: userB.id });
    expectStatus(conv, 201);
    const conversationId = conv.body.conversation.id as string;

    const upload = await agentA
      .post('/attachments')
      .set('x-csrf-token', await csrfToken(agentA))
      .field('conversationId', conversationId)
      .attach('file', Buffer.from('hello attachment'), {
        filename: 'note.txt',
        contentType: 'text/plain',
      });
    expectStatus(upload, 201);
    const attachmentId = upload.body.attachment.id as string;

    const sent = await agentA
      .post(`/conversations/${conversationId}/messages`)
      .set('x-csrf-token', await csrfToken(agentA))
      .send({ body: 'See file', attachmentIds: [attachmentId] });
    expectStatus(sent, 201);

    const downloadB = await agentB.get(`/attachments/${attachmentId}`);
    expect(downloadB.status).toBe(200);

    const downloadDenied = await request(server.httpServer).get(`/attachments/${attachmentId}`);
    expect(downloadDenied.status).toBe(401);
  });

  it('enforces group member permissions', async () => {
    const owner = request.agent(server.baseUrl);
    const member = request.agent(server.baseUrl);
    const outsider = request.agent(server.baseUrl);
    const ownerUser = await registerUser(owner, `owner-${Date.now()}@example.com`, 'Owner');
    const memberUser = await registerUser(member, `member-${Date.now()}@example.com`, 'Member');
    await registerUser(outsider, `out-${Date.now()}@example.com`, 'Out');

    const group = await owner
      .post('/conversations/group')
      .set('x-csrf-token', await csrfToken(owner))
      .send({ name: 'Test Group', memberIds: [memberUser.id] });
    expectStatus(group, 201);
    const conversationId = group.body.conversation.id as string;

    const denied = await member
      .post(`/conversations/${conversationId}/members`)
      .set('x-csrf-token', await csrfToken(member))
      .send({ userIds: [ownerUser.id] });
    expectStatus(denied, 403);

    const block = await owner
      .post(`/users/${memberUser.id}/block`)
      .set('x-csrf-token', await csrfToken(owner));
    expectStatus(block, 201);

    const report = await member
      .post(`/users/${ownerUser.id}/report`)
      .set('x-csrf-token', await csrfToken(member))
      .send({ reason: 'spam', details: 'test report' });
    expectStatus(report, 201);
  });

  it('authorizes Socket.IO with session cookie', async () => {
    const agent = request.agent(server.baseUrl);
    const email = `socket-${Date.now()}@example.com`;
    const { sessionCookie } = await registerUser(agent, email, 'Socket User');
    expect(sessionCookie).toContain('takiia_session=');

    const sessionToken = sessionTokenFromCookieHeader(sessionCookie);
    expect(sessionToken.length).toBeGreaterThan(0);

    const authed = ioClient(server.baseUrl, {
      auth: { token: sessionToken },
      transports: ['polling'],
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      authed.on('connect', () => {
        authed.close();
        resolve();
      });
      authed.on('connect_error', (err) => {
        authed.close();
        reject(err);
      });
      setTimeout(() => {
        authed.close();
        reject(new Error('socket timeout'));
      }, 5000);
    });
  });
});

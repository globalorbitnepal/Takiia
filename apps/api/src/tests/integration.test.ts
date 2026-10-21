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
const runIntegration = Boolean(databaseUrl?.includes('takiia_test') || process.env.CI === 'true');
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

async function csrfToken(agent: ApiAgent): Promise<string> {
  const res = await agent.get('/auth/csrf');
  return res.body.csrfToken as string;
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
  expect(res.status).toBe(201);
  const sessionCookie = sessionCookieHeader(res.headers['set-cookie']);
  return {
    ...(res.body.user as { id: string; email: string }),
    sessionCookie,
  };
}

describe.runIf(runIntegration)('integration', () => {
  let server: Awaited<ReturnType<typeof createTestServer>>;

  beforeAll(async () => {
    const uploadDir = path.join(tmpdir(), `takiia-upload-${Date.now()}`);
    mkdirSync(uploadDir, { recursive: true });
    process.env.UPLOAD_DIR = uploadDir;

    if (process.env.CI !== 'true') {
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
    const live = await request(server.app).get('/health');
    expect(live.status).toBe(200);
    const ready = await request(server.app).get('/health/ready');
    expect(ready.status).toBe(200);
    expect(ready.body.checks?.database).toBe('ok');
  });

  it('exposes database-backed plans and workspace on register', async () => {
    const plansRes = await request(server.app).get('/billing/plans');
    expect(plansRes.status).toBe(200);
    expect(plansRes.body.plans.length).toBeGreaterThanOrEqual(4);

    const agent = request.agent(server.app);
    const email = `ws-${Date.now()}@example.com`;
    await registerUser(agent, email, 'Workspace User');
    const primary = await agent.get('/workspaces/primary');
    expect(primary.status).toBe(200);
    expect(primary.body.workspace?.subscription?.plan?.code).toBe('STARTER');
  });

  it('registers, verifies email, and resets password', async () => {
    sentEmails.length = 0;
    const agent = request.agent(server.app);
    const email = `verify-${Date.now()}@example.com`;
    await registerUser(agent, email, 'Verify User');

    expect(sentEmails.some((m) => m.to === email && m.subject.includes('Verify'))).toBe(true);
    const verifyToken = extractToken(sentEmails.find((m) => m.to === email)!.text, 'token');
    const verify = await agent
      .post('/auth/verify-email')
      .set('x-csrf-token', await csrfToken(agent))
      .send({ token: verifyToken });
    expect(verify.status).toBe(200);

    const me = await agent.get('/auth/me');
    expect(me.body.user.emailVerifiedAt).toBeTruthy();

    sentEmails.length = 0;
    const forgot = await agent
      .post('/auth/forgot-password')
      .set('x-csrf-token', await csrfToken(agent))
      .send({ email });
    expect(forgot.status).toBe(200);
    const resetToken = extractToken(sentEmails[0].text, 'token');
    const reset = await agent
      .post('/auth/reset-password')
      .set('x-csrf-token', await csrfToken(agent))
      .send({ token: resetToken, password: 'new-password-99' });
    expect(reset.status).toBe(200);

    const login = await agent
      .post('/auth/login')
      .set('x-csrf-token', await csrfToken(agent))
      .send({ email, password: 'new-password-99' });
    expect(login.status).toBe(200);
  });

  it('creates direct chat, messages, and attachments', async () => {
    const agentA = request.agent(server.app);
    const agentB = request.agent(server.app);
    const emailA = `msg-a-${Date.now()}@example.com`;
    const emailB = `msg-b-${Date.now()}@example.com`;
    await registerUser(agentA, emailA, 'A');
    const userB = await registerUser(agentB, emailB, 'B');

    const conv = await agentA
      .post('/conversations/direct')
      .set('x-csrf-token', await csrfToken(agentA))
      .send({ userId: userB.id });
    expect(conv.status).toBe(201);
    const conversationId = conv.body.conversation.id as string;

    const upload = await agentA
      .post('/attachments')
      .set('x-csrf-token', await csrfToken(agentA))
      .field('conversationId', conversationId)
      .attach('file', Buffer.from('hello attachment'), {
        filename: 'note.txt',
        contentType: 'text/plain',
      });
    expect(upload.status).toBe(201);
    const attachmentId = upload.body.attachment.id as string;

    const sent = await agentA
      .post(`/conversations/${conversationId}/messages`)
      .set('x-csrf-token', await csrfToken(agentA))
      .send({ body: 'See file', attachmentIds: [attachmentId] });
    expect(sent.status).toBe(201);

    const downloadB = await agentB.get(`/attachments/${attachmentId}`);
    expect(downloadB.status).toBe(200);

    const downloadDenied = await request(server.app).get(`/attachments/${attachmentId}`);
    expect(downloadDenied.status).toBe(401);
  });

  it('enforces group member permissions', async () => {
    const owner = request.agent(server.app);
    const member = request.agent(server.app);
    const outsider = request.agent(server.app);
    const ownerUser = await registerUser(owner, `owner-${Date.now()}@example.com`, 'Owner');
    const memberUser = await registerUser(member, `member-${Date.now()}@example.com`, 'Member');
    await registerUser(outsider, `out-${Date.now()}@example.com`, 'Out');

    const group = await owner
      .post('/conversations/group')
      .set('x-csrf-token', await csrfToken(owner))
      .send({ name: 'Test Group', memberIds: [memberUser.id] });
    expect(group.status).toBe(201);
    const conversationId = group.body.conversation.id as string;

    const denied = await member
      .post(`/conversations/${conversationId}/members`)
      .set('x-csrf-token', await csrfToken(member))
      .send({ userIds: [ownerUser.id] });
    expect(denied.status).toBe(403);

    const block = await owner
      .post(`/users/${memberUser.id}/block`)
      .set('x-csrf-token', await csrfToken(owner));
    expect(block.status).toBe(201);

    const report = await member
      .post(`/users/${ownerUser.id}/report`)
      .set('x-csrf-token', await csrfToken(member))
      .send({ reason: 'spam', details: 'test report' });
    expect(report.status).toBe(201);
  });

  it('authorizes Socket.IO with session cookie', async () => {
    const agent = request.agent(server.app);
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

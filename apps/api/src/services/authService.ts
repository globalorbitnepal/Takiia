import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/passwords.js';
import { hashToken, normalizeEmail, randomToken } from '../lib/crypto.js';
import { env } from '../config/env.js';
import { sendEmail } from './email.js';
import { provisionWorkspaceForUser } from './workspaceService.js';

const SESSION_DAYS = 14;
const VERIFY_HOURS = 48;
const RESET_HOURS = 2;

function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<{ user: User; sessionToken: string; verificationToken: string }> {
  const emailNormalized = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { emailNormalized } });
  if (existing) {
    throw new AppError(409, 'An account with this email already exists', 'EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email.trim(),
      emailNormalized,
      passwordHash,
      displayName: input.displayName.trim(),
      notificationPreference: { create: {} },
    },
  });

  const sessionToken = randomToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: sessionExpiry(),
    },
  });

  const verificationToken = randomToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(verificationToken),
      expiresAt: new Date(Date.now() + VERIFY_HOURS * 60 * 60 * 1000),
    },
  });

  try {
    await provisionWorkspaceForUser(user.id, user.displayName);
  } catch (error) {
    console.warn(
      '[auth] workspace provisioning skipped:',
      error instanceof Error ? error.message : error,
    );
  }

  const verifyUrl = `${env.publicWebUrl}/verify-email?token=${verificationToken}`;
  await sendEmail(user.email, 'Verify your Takiia email', `Open this link to verify: ${verifyUrl}`);

  return { user, sessionToken, verificationToken };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: User; sessionToken: string }> {
  const emailNormalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { emailNormalized } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const sessionToken = randomToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: sessionExpiry(),
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
  return { user, sessionToken };
}

export async function logoutSession(sessionToken: string): Promise<void> {
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(sessionToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserBySessionToken(sessionToken: string): Promise<User | null> {
  const session = await prisma.session.findFirst({
    where: {
      tokenHash: hashToken(sessionToken),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  return session?.user ?? null;
}

export async function verifyEmailToken(token: string): Promise<void> {
  const record = await prisma.emailVerificationToken.findFirst({
    where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!record) {
    throw new AppError(400, 'Invalid or expired verification token', 'INVALID_TOKEN');
  }
  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { emailNormalized: normalizeEmail(email) } });
  if (!user) {
    return;
  }
  const token = randomToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_HOURS * 60 * 60 * 1000),
    },
  });
  const resetUrl = `${env.publicWebUrl}/reset-password?token=${token}`;
  await sendEmail(user.email, 'Reset your Takiia password', `Reset link: ${resetUrl}`);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const record = await prisma.passwordResetToken.findFirst({
    where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!record) {
    throw new AppError(400, 'Invalid or expired reset token', 'INVALID_TOKEN');
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.session.updateMany({
      where: { userId: record.userId },
      data: { revokedAt: new Date() },
    }),
  ]);
}

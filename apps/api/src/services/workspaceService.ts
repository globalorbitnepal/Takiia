import { MemberRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

function billingPeriod(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export async function provisionWorkspaceForUser(userId: string, displayName: string) {
  const starter = await prisma.plan.findUnique({ where: { code: 'STARTER' } });
  if (!starter) {
    throw new Error('PLANS_NOT_SEEDED');
  }
  const slug = `ws-${userId.replace(/-/g, '')}`;
  const { start, end } = billingPeriod();
  return prisma.workspace.create({
    data: {
      name: `${displayName.trim()}'s workspace`,
      slug,
      ownerId: userId,
      members: { create: { userId, role: MemberRole.OWNER } },
      subscription: {
        create: {
          planId: starter.id,
          status: 'TRIALING',
          billingInterval: 'MONTHLY',
          currentPeriodStart: start,
          currentPeriodEnd: end,
          paymentProvider: 'pending',
        },
      },
      usageRecords: {
        create: {
          periodStart: start,
          periodEnd: end,
        },
      },
    },
    include: { subscription: { include: { plan: true } } },
  });
}

export async function assertWorkspaceMember(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) {
    throw new AppError(403, 'Workspace access denied', 'FORBIDDEN');
  }
  return member;
}

export async function listWorkspacesForUser(userId: string) {
  return prisma.workspace.findMany({
    where: { members: { some: { userId } } },
    include: {
      subscription: { include: { plan: true } },
      members: { include: { user: { select: { id: true, displayName: true, email: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getPrimaryWorkspace(userId: string) {
  const workspaces = await listWorkspacesForUser(userId);
  if (workspaces.length === 0) {
    return null;
  }
  return workspaces[0];
}

import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { assertWorkspaceMember } from './workspaceService.js';

type QuotaMetric = 'scheduled_posts' | 'social_accounts' | 'team_members' | 'storage_bytes';

async function currentUsage(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  let usage = await tx.usageRecord.findUnique({
    where: { workspaceId_periodStart: { workspaceId, periodStart } },
  });
  if (!usage) {
    usage = await tx.usageRecord.create({
      data: { workspaceId, periodStart, periodEnd },
    });
  }
  return usage;
}

export async function getEntitlements(workspaceId: string, userId: string) {
  await assertWorkspaceMember(workspaceId, userId);
  const subscription = await prisma.workspaceSubscription.findUnique({
    where: { workspaceId },
    include: { plan: true },
  });
  if (!subscription) {
    throw new AppError(404, 'Subscription not found', 'NOT_FOUND');
  }
  const usage = await prisma.usageRecord.findFirst({
    where: {
      workspaceId,
      periodStart: { lte: new Date() },
      periodEnd: { gt: new Date() },
    },
    orderBy: { periodStart: 'desc' },
  });
  const socialCount = await prisma.socialAccount.count({
    where: { workspaceId, status: { in: ['CONNECTED', 'PENDING'] } },
  });
  const memberCount = await prisma.workspaceMember.count({ where: { workspaceId } });
  const plan = subscription.plan;
  return {
    subscription: {
      status: subscription.status,
      billingInterval: subscription.billingInterval,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      paymentProvider: subscription.paymentProvider,
    },
    plan: {
      code: plan.code,
      name: plan.name,
      monthlyPriceCents: plan.monthlyPriceCents,
      yearlyPriceCents: plan.yearlyPriceCents,
      limits: {
        maxMembers: plan.maxMembers,
        maxSocialAccounts: plan.maxSocialAccounts,
        maxScheduledPostsPerMonth: plan.maxScheduledPostsPerMonth,
        maxStorageBytes: plan.maxStorageBytes.toString(),
        maxMeetingMinutesPerMonth: plan.maxMeetingMinutesPerMonth,
        maxMeetingParticipants: plan.maxMeetingParticipants,
      },
    },
    usage: {
      scheduledPostsCount: usage?.scheduledPostsCount ?? 0,
      storageBytesUsed: (usage?.storageBytesUsed ?? BigInt(0)).toString(),
      meetingMinutesUsed: usage?.meetingMinutesUsed ?? 0,
      socialAccountsConnected: socialCount,
      teamMembers: memberCount,
    },
  };
}

export async function assertQuota(
  workspaceId: string,
  userId: string,
  metric: QuotaMetric,
  amount = 1,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await assertWorkspaceMember(workspaceId, userId);
    const subscription = await tx.workspaceSubscription.findUnique({
      where: { workspaceId },
      include: { plan: true },
    });
    if (!subscription) {
      throw new AppError(404, 'Subscription not found', 'NOT_FOUND');
    }
    if (!['TRIALING', 'ACTIVE'].includes(subscription.status)) {
      throw new AppError(402, 'Subscription is not active', 'SUBSCRIPTION_INACTIVE');
    }
    const plan = subscription.plan;
    const usage = await currentUsage(
      tx,
      workspaceId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
    );

    if (metric === 'scheduled_posts') {
      if (usage.scheduledPostsCount + amount > plan.maxScheduledPostsPerMonth) {
        throw new AppError(
          402,
          'Scheduled post quota reached for this billing period',
          'QUOTA_EXCEEDED',
        );
      }
      await tx.usageRecord.update({
        where: { id: usage.id },
        data: { scheduledPostsCount: { increment: amount } },
      });
      return;
    }

    if (metric === 'social_accounts') {
      const count = await tx.socialAccount.count({
        where: { workspaceId, status: { in: ['CONNECTED', 'PENDING'] } },
      });
      if (count + amount > plan.maxSocialAccounts) {
        throw new AppError(402, 'Social account limit reached', 'QUOTA_EXCEEDED');
      }
      return;
    }

    if (metric === 'team_members') {
      const count = await tx.workspaceMember.count({ where: { workspaceId } });
      if (count + amount > plan.maxMembers) {
        throw new AppError(402, 'Team member limit reached', 'QUOTA_EXCEEDED');
      }
      return;
    }

    if (metric === 'storage_bytes') {
      const next = BigInt(usage.storageBytesUsed) + BigInt(amount);
      if (next > plan.maxStorageBytes) {
        throw new AppError(402, 'Storage quota exceeded', 'QUOTA_EXCEEDED');
      }
      await tx.usageRecord.update({
        where: { id: usage.id },
        data: { storageBytesUsed: next },
      });
    }
  });
}

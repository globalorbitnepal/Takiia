import {
  SocialAccountStatus,
  SocialPlatform,
  ScheduledPostStatus,
  PublishJobStatus,
} from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { env } from '../config/env.js';
import { assertQuota } from './entitlementService.js';
import { assertWorkspaceMember } from './workspaceService.js';

function oauthConfigured(platform: SocialPlatform): boolean {
  if (platform === SocialPlatform.FACEBOOK) {
    return Boolean(env.social.facebookAppId && env.social.facebookAppSecret);
  }
  if (platform === SocialPlatform.INSTAGRAM) {
    return Boolean(env.social.facebookAppId && env.social.facebookAppSecret);
  }
  if (platform === SocialPlatform.TIKTOK) {
    return Boolean(env.social.tiktokClientKey && env.social.tiktokClientSecret);
  }
  return false;
}

export async function listSocialAccounts(workspaceId: string, userId: string) {
  await assertWorkspaceMember(workspaceId, userId);
  return prisma.socialAccount.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      platform: true,
      status: true,
      displayName: true,
      externalAccountId: true,
      connectedAt: true,
      tokenExpiresAt: true,
    },
  });
}

export async function beginSocialConnect(
  workspaceId: string,
  userId: string,
  platform: SocialPlatform,
) {
  await assertWorkspaceMember(workspaceId, userId);
  if (!oauthConfigured(platform)) {
    throw new AppError(
      503,
      `${platform} integration requires platform credentials to be configured on the server`,
      'INTEGRATION_NOT_CONFIGURED',
    );
  }
  await assertQuota(workspaceId, userId, 'social_accounts', 1);
  const account = await prisma.socialAccount.create({
    data: {
      workspaceId,
      platform,
      status: SocialAccountStatus.PENDING,
      displayName: `${platform} (pending authorization)`,
    },
  });
  return {
    account,
    authorizeUrl: null as string | null,
    message:
      'OAuth callback routes are prepared; complete Meta/TikTok app review and configure redirect URLs to enable live authorization.',
  };
}

export async function schedulePost(input: {
  workspaceId: string;
  userId: string;
  body: string;
  scheduledFor?: Date;
  socialAccountIds: string[];
  idempotencyKey?: string;
}) {
  await assertWorkspaceMember(input.workspaceId, input.userId);
  if (input.idempotencyKey) {
    const existing = await prisma.scheduledPost.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) {
      return existing;
    }
  }
  const accounts = await prisma.socialAccount.findMany({
    where: { id: { in: input.socialAccountIds }, workspaceId: input.workspaceId },
  });
  if (accounts.length !== input.socialAccountIds.length) {
    throw new AppError(400, 'Invalid social accounts for workspace', 'INVALID_ACCOUNTS');
  }
  const notReady = accounts.filter((a) => a.status !== SocialAccountStatus.CONNECTED);
  if (notReady.length > 0) {
    throw new AppError(
      400,
      'All selected accounts must be connected before scheduling',
      'ACCOUNTS_NOT_CONNECTED',
    );
  }

  const status =
    input.scheduledFor && input.scheduledFor > new Date()
      ? ScheduledPostStatus.SCHEDULED
      : ScheduledPostStatus.DRAFT;

  return prisma.$transaction(async (tx) => {
    const subscription = await tx.workspaceSubscription.findUnique({
      where: { workspaceId: input.workspaceId },
      include: { plan: true },
    });
    if (!subscription || !['TRIALING', 'ACTIVE'].includes(subscription.status)) {
      throw new AppError(402, 'Subscription is not active', 'SUBSCRIPTION_INACTIVE');
    }
    let usage = await tx.usageRecord.findUnique({
      where: {
        workspaceId_periodStart: {
          workspaceId: input.workspaceId,
          periodStart: subscription.currentPeriodStart,
        },
      },
    });
    if (!usage) {
      usage = await tx.usageRecord.create({
        data: {
          workspaceId: input.workspaceId,
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
        },
      });
    }
    if (usage.scheduledPostsCount + 1 > subscription.plan.maxScheduledPostsPerMonth) {
      throw new AppError(
        402,
        'Scheduled post quota reached for this billing period',
        'QUOTA_EXCEEDED',
      );
    }
    await tx.usageRecord.update({
      where: { id: usage.id },
      data: { scheduledPostsCount: { increment: 1 } },
    });

    const post = await tx.scheduledPost.create({
      data: {
        workspaceId: input.workspaceId,
        authorId: input.userId,
        body: input.body.trim(),
        scheduledFor: input.scheduledFor,
        status,
        idempotencyKey: input.idempotencyKey,
        targets: {
          create: input.socialAccountIds.map((socialAccountId) => ({ socialAccountId })),
        },
      },
    });
    for (const account of accounts) {
      await tx.publishJob.create({
        data: {
          scheduledPostId: post.id,
          socialAccountId: account.id,
          status: PublishJobStatus.PENDING,
          idempotencyKey: `${post.id}:${account.id}`,
          lastError:
            'Publishing worker not configured; job recorded for retry when credentials are available.',
        },
      });
    }
    return post;
  });
}

export async function listScheduledPosts(workspaceId: string, userId: string) {
  await assertWorkspaceMember(workspaceId, userId);
  return prisma.scheduledPost.findMany({
    where: { workspaceId },
    orderBy: { scheduledFor: 'asc' },
    include: {
      targets: { include: { socialAccount: { select: { platform: true, displayName: true } } } },
      jobs: { select: { status: true, lastError: true, socialAccountId: true } },
    },
  });
}

export async function retryPublishJob(jobId: string, userId: string) {
  const job = await prisma.publishJob.findUnique({
    where: { id: jobId },
    include: { scheduledPost: true, socialAccount: true },
  });
  if (!job) {
    throw new AppError(404, 'Job not found');
  }
  await assertWorkspaceMember(job.scheduledPost.workspaceId, userId);
  if (!oauthConfigured(job.socialAccount.platform)) {
    throw new AppError(503, 'Platform credentials not configured', 'INTEGRATION_NOT_CONFIGURED');
  }
  return prisma.publishJob.update({
    where: { id: jobId },
    data: {
      attempts: { increment: 1 },
      status: PublishJobStatus.FAILED,
      lastError: 'External publish API not enabled in this environment',
      nextAttemptAt: new Date(Date.now() + 60_000),
    },
  });
}

export { oauthConfigured };

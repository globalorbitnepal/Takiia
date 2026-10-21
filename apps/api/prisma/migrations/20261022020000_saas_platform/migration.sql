-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK');

-- CreateEnum
CREATE TYPE "SocialAccountStatus" AS ENUM ('PENDING', 'CONNECTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ScheduledPostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PublishJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "Plan" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPriceCents" INTEGER NOT NULL,
    "yearlyPriceCents" INTEGER NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "maxSocialAccounts" INTEGER NOT NULL,
    "maxScheduledPostsPerMonth" INTEGER NOT NULL,
    "maxStorageBytes" BIGINT NOT NULL,
    "maxMeetingMinutesPerMonth" INTEGER NOT NULL,
    "maxMeetingParticipants" INTEGER NOT NULL DEFAULT 10,
    "features" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceSubscription" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "paymentProvider" TEXT,
    "externalSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "scheduledPostsCount" INTEGER NOT NULL DEFAULT 0,
    "storageBytesUsed" BIGINT NOT NULL DEFAULT 0,
    "meetingMinutesUsed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "status" "SocialAccountStatus" NOT NULL DEFAULT 'PENDING',
    "displayName" TEXT,
    "externalAccountId" TEXT,
    "tokenCiphertext" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledPost" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "mediaStorageKey" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "status" "ScheduledPostStatus" NOT NULL DEFAULT 'DRAFT',
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTarget" (
    "id" UUID NOT NULL,
    "scheduledPostId" UUID NOT NULL,
    "socialAccountId" UUID NOT NULL,

    CONSTRAINT "PostTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishJob" (
    "id" UUID NOT NULL,
    "scheduledPostId" UUID NOT NULL,
    "socialAccountId" UUID NOT NULL,
    "status" "PublishJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "externalPostId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "nextAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublishJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceEvent" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "creatorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceSubscription_workspaceId_key" ON "WorkspaceSubscription"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceSubscription_planId_idx" ON "WorkspaceSubscription"("planId");

-- CreateIndex
CREATE INDEX "WorkspaceSubscription_status_idx" ON "WorkspaceSubscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_workspaceId_periodStart_key" ON "UsageRecord"("workspaceId", "periodStart");

-- CreateIndex
CREATE INDEX "UsageRecord_workspaceId_periodEnd_idx" ON "UsageRecord"("workspaceId", "periodEnd");

-- CreateIndex
CREATE INDEX "SocialAccount_workspaceId_idx" ON "SocialAccount"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_workspaceId_platform_externalAccountId_key" ON "SocialAccount"("workspaceId", "platform", "externalAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledPost_idempotencyKey_key" ON "ScheduledPost"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ScheduledPost_workspaceId_scheduledFor_idx" ON "ScheduledPost"("workspaceId", "scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledPost_authorId_idx" ON "ScheduledPost"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTarget_scheduledPostId_socialAccountId_key" ON "PostTarget"("scheduledPostId", "socialAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishJob_idempotencyKey_key" ON "PublishJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PublishJob_status_nextAttemptAt_idx" ON "PublishJob"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "WorkspaceEvent_workspaceId_startsAt_idx" ON "WorkspaceEvent"("workspaceId", "startsAt");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSubscription" ADD CONSTRAINT "WorkspaceSubscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSubscription" ADD CONSTRAINT "WorkspaceSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTarget" ADD CONSTRAINT "PostTarget_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "ScheduledPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTarget" ADD CONSTRAINT "PostTarget_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishJob" ADD CONSTRAINT "PublishJob_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "ScheduledPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishJob" ADD CONSTRAINT "PublishJob_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceEvent" ADD CONSTRAINT "WorkspaceEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceEvent" ADD CONSTRAINT "WorkspaceEvent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default plans (configurable via admin; prices in USD cents)
INSERT INTO "Plan" ("id", "code", "name", "monthlyPriceCents", "yearlyPriceCents", "maxMembers", "maxSocialAccounts", "maxScheduledPostsPerMonth", "maxStorageBytes", "maxMeetingMinutesPerMonth", "maxMeetingParticipants", "features", "active", "sortOrder", "updatedAt") VALUES
('11111111-1111-4111-8111-111111111101', 'STARTER', 'Starter', 900, 9000, 1, 3, 60, 5368709120, 120, 5, '{"analytics":"basic"}', true, 1, CURRENT_TIMESTAMP),
('11111111-1111-4111-8111-111111111102', 'PRO', 'Pro', 1900, 19000, 1, 10, 300, 21474836480, 600, 25, '{"analytics":"basic"}', true, 2, CURRENT_TIMESTAMP),
('11111111-1111-4111-8111-111111111103', 'BUSINESS', 'Business', 4900, 49000, 5, 25, 1000, 107374182400, 3000, 50, '{"analytics":"advanced"}', true, 3, CURRENT_TIMESTAMP),
('11111111-1111-4111-8111-111111111104', 'AGENCY', 'Agency', 9900, 99000, 15, 50, 3000, 322122547200, 10000, 100, '{"analytics":"advanced","clientWorkspaces":true}', true, 4, CURRENT_TIMESTAMP);

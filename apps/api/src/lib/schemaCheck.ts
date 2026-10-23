/** Read-only inventory of Prisma public tables. Never writes. */

export const TAKIIA_REQUIRED_PUBLIC_TABLES = [
  'User',
  'Session',
  'RefreshToken',
  'EmailVerificationToken',
  'PasswordResetToken',
  'Conversation',
  'DirectConversationPair',
  'ConversationMember',
  'GroupProfile',
  'GroupInvitation',
  'Message',
  'MessageDeliveryReceipt',
  'MessageReadReceipt',
  'ConversationReadState',
  'Attachment',
  'UserBlock',
  'UserReport',
  'Device',
  'NotificationPreference',
  'Call',
  'CallParticipant',
  'AuditEvent',
  'Plan',
  'Workspace',
  'WorkspaceMember',
  'WorkspaceSubscription',
  'UsageRecord',
  'SocialAccount',
  'ScheduledPost',
  'PostTarget',
  'PublishJob',
  'WorkspaceEvent',
  '_prisma_migrations',
] as const;

export function isTakiiaDbUrl(url?: string): boolean {
  if (!url) {
    return false;
  }
  return /\/takiia_db(\?|$)/.test(url);
}

export function diffRequiredTables(
  present: string[],
  required: readonly string[] = TAKIIA_REQUIRED_PUBLIC_TABLES,
): { missing: string[]; extra: string[] } {
  const have = new Set(present);
  const need = new Set(required);
  return {
    missing: required.filter((name) => !have.has(name)),
    extra: present.filter((name) => !need.has(name)).sort(),
  };
}

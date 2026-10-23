import type { Metadata } from 'next';
import { FeaturePageLayout } from '../../../components/marketing/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Teams & workspaces',
  description:
    'Shared workspaces with roles, invitations, and isolated billing and social accounts.',
};

export default function TeamsFeaturePage() {
  return (
    <FeaturePageLayout
      title="Give your team one place to work together"
      description="Create workspaces, invite members, and keep messaging, files, and social publishing scoped to the right team."
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Teams' },
      ]}
      highlights={[
        'Workspace creation and member invitations',
        'Roles and permissions on conversations and admin actions',
        'Isolated social accounts and scheduled posts per workspace',
        'Shared files and events',
        'Activity surfaced in the dashboard where implemented',
      ]}
      ctaHref="/signup"
      ctaLabel="Explore teams"
    />
  );
}

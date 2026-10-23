import type { Metadata } from 'next';
import { FeaturePageLayout } from '../../../components/marketing/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'File sharing',
  description: 'Secure attachments with authenticated downloads and plan-based storage quotas.',
};

export default function FileSharingFeaturePage() {
  return (
    <FeaturePageLayout
      title="Share what your team needs, securely"
      description="Upload files to conversations and social drafts with size limits, storage metering, and membership checks on every download."
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'File sharing' },
      ]}
      highlights={[
        'Message attachments',
        'Media for social publishing',
        'Validated uploads and MIME checks',
        'Storage quotas by subscription plan',
        'Authenticated, membership-checked downloads',
      ]}
      ctaHref="/signup"
      ctaLabel="Explore file sharing"
    />
  );
}

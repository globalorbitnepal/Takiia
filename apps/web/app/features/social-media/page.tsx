import type { Metadata } from 'next';
import { FeaturePageLayout } from '../../../components/marketing/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Social media management',
  description: 'Connect Facebook, Instagram, and TikTok via official OAuth. Schedule posts and track publish jobs.',
};

export default function SocialFeaturePage() {
  return (
    <FeaturePageLayout
      title="Plan once. Publish across connected channels."
      description="Draft posts, attach media, schedule publishing, and monitor queue status—all scoped to your workspace and plan limits."
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Social media' },
      ]}
      highlights={[
        'Facebook, Instagram, and TikTok connection flows (credentials required)',
        'Composer with media validation',
        'Scheduling and publishing queue',
        'Idempotent publish jobs with retries',
        'Status and error visibility in the dashboard',
        'Quota meters tied to subscription entitlements',
      ]}
      honestyNote="Live publishing requires platform developer apps and approvals. The UI shows real connection state—never fake connected accounts."
      ctaHref="/signup"
      ctaLabel="Explore social publishing"
      preview={
        <div style={{ fontSize: 13 }}>
          <div className="card" style={{ padding: '0.65rem', marginBottom: '0.5rem', background: '#fff' }}>
            <strong>Composer</strong>
            <p className="muted" style={{ margin: '0.25rem 0 0' }}>Instagram · Scheduled Thu 15:00</p>
          </div>
          <div className="card" style={{ padding: '0.65rem', background: 'var(--panel-2)' }}>
            Queue: 2 scheduled · 1 publishing · 0 failed (demo)
          </div>
        </div>
      }
      faq={[
        {
          question: 'Do you store my platform password?',
          answer: 'No. OAuth tokens are used; passwords are never collected.',
        },
      ]}
    />
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '../../components/marketing/Breadcrumbs';
import { MarketingShell } from '../../components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Messaging, meetings, social publishing, teams, calendar, and secure file sharing in one Takiia workspace.',
};

const features = [
  {
    href: '/features/messaging',
    title: 'Messaging',
    desc: 'Direct and group conversations with attachments.',
  },
  {
    href: '/features/meetings',
    title: 'Meetings',
    desc: 'Scheduled meetings and call flows where enabled.',
  },
  {
    href: '/features/social-media',
    title: 'Social media',
    desc: 'OAuth connections, scheduling, and publish queue.',
  },
  { href: '/features/teams', title: 'Teams', desc: 'Workspaces, roles, and shared activity.' },
  {
    href: '/features/calendar',
    title: 'Calendar',
    desc: 'Meetings, posts, and team events together.',
  },
  {
    href: '/features/file-sharing',
    title: 'File sharing',
    desc: 'Authenticated downloads and storage quotas.',
  },
];

export default function FeaturesOverviewPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Features' }]} />
        <h1 className="h1">Everything in one workspace</h1>
        <p className="marketing-lead">
          Explore what Takiia supports today. Capabilities marked as requiring setup reflect missing
          credentials or platform approval—not hidden limitations.
        </p>
        <div className="feature-card-grid">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="card glass feature-card-link">
              <h2 className="h2" style={{ fontSize: '1.35rem' }}>
                {f.title}
              </h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                {f.desc}
              </p>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: '2rem' }}>
          <Link className="btn" href="/pricing">
            Compare plans
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}

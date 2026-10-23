import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '../../components/marketing/MarketingShell';
import { Breadcrumbs } from '../../components/marketing/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Help & documentation',
  description:
    'Getting started with Takiia: account, teams, social connections, billing, and security.',
};

const topics = [
  {
    href: '/signup',
    title: 'Create your account',
    body: 'Register with email verification when SMTP is configured.',
  },
  {
    href: '/app/teams',
    title: 'Set up a workspace',
    body: 'Invite members and assign roles from the app.',
  },
  {
    href: '/integrations',
    title: 'Connect social accounts',
    body: 'OAuth flows require platform developer credentials.',
  },
  {
    href: '/app/social',
    title: 'Schedule and publish',
    body: 'Use the composer and queue; watch quota meters.',
  },
  {
    href: '/app/billing',
    title: 'Billing & plans',
    body: 'View subscription status and usage in the dashboard.',
  },
  {
    href: '/privacy',
    title: 'Security & privacy',
    body: 'Read how sessions, attachments, and tokens are handled.',
  },
];

export default function HelpPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Help' }]} />
        <h1 className="h1">Help center</h1>
        <p className="marketing-lead">
          Practical starting points for administrators and team members.
        </p>
        <div className="feature-card-grid">
          {topics.map((t) => (
            <Link key={t.href} href={t.href} className="card glass feature-card-link">
              <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>{t.title}</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                {t.body}
              </p>
            </Link>
          ))}
        </div>
        <p className="muted" style={{ marginTop: '2rem' }}>
          Need more? Use the <Link href="/contact">contact form</Link> when{' '}
          <code>CONTACT_INBOX_EMAIL</code> is configured on the server.
        </p>
      </div>
    </MarketingShell>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '../../components/marketing/Breadcrumbs';
import { MarketingShell } from '../../components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Integrations',
  description:
    'Facebook, Instagram, and TikTok connection status and setup requirements for Takiia.',
};

const integrations = [
  {
    name: 'Facebook',
    status: 'Requires setup',
    detail:
      'OAuth structure is implemented. Add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET, complete Meta app configuration, and verify publishing permissions.',
  },
  {
    name: 'Instagram',
    status: 'Requires setup',
    detail:
      'Connected via Meta APIs. Requires business/creator account types supported by the Graph API and Meta app review where applicable.',
  },
  {
    name: 'TikTok',
    status: 'Requires setup',
    detail:
      'OAuth scaffolding exists. Configure TikTok developer credentials and approved scopes before live publishing.',
  },
];

export default function IntegrationsPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Integrations' }]} />
        <h1 className="h1">Connect the platforms you already use</h1>
        <p className="marketing-lead">
          Takiia integrates through official APIs only—no scraping and no password collection.
          Status below reflects the current codebase, not marketing claims.
        </p>
        <div className="integration-grid">
          {integrations.map((item) => (
            <article key={item.name} className="card glass integration-card">
              <div className="integration-card-head">
                <h2 style={{ margin: 0 }}>{item.name}</h2>
                <span className="status-pill">{item.status}</span>
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>
                {item.detail}
              </p>
            </article>
          ))}
        </div>
        <p style={{ marginTop: '2rem' }}>
          <Link className="btn" href="/features/social-media">
            Social media features
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}

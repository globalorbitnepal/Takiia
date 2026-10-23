import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '../../../components/marketing/MarketingShell';
import { Breadcrumbs } from '../../../components/marketing/Breadcrumbs';

export const metadata: Metadata = {
  title: 'For teams',
  description: 'Shared workspaces, roles, messaging, meetings, and collaborative publishing.',
};

export default function SolutionsTeamsPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Solutions' },
          ]}
        />
        <h1 className="h1">One workspace for your whole team</h1>
        <p className="marketing-lead">
          Invite members, assign roles, and keep conversations and social schedules inside a single
          workspace boundary with usage enforced on the server.
        </p>
        <ul className="feature-highlights">
          <li>Team members and roles</li>
          <li>Group messaging and shared files</li>
          <li>Meeting scheduling and call flows where enabled</li>
          <li>Collaborative social scheduling with queue visibility</li>
        </ul>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Link className="btn" href="/signup">Start a workspace</Link>
          <Link className="btn secondary" href="/solutions/agencies">Agencies</Link>
          <Link className="btn secondary" href="/solutions/individuals">Individuals</Link>
        </div>
      </div>
    </MarketingShell>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '../../../components/marketing/MarketingShell';
import { Breadcrumbs } from '../../../components/marketing/Breadcrumbs';

export const metadata: Metadata = {
  title: 'For agencies',
  description:
    'Multiple workspaces, higher social account limits, and team permissions for client work.',
};

export default function SolutionsAgenciesPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Solutions', href: '/solutions/teams' },
            { label: 'Agencies' },
          ]}
        />
        <h1 className="h1">Scale client work without tool sprawl</h1>
        <p className="marketing-lead">
          Use higher-tier plans for more team members, social accounts, and scheduled posts. Each
          workspace isolates client data, billing, and connected accounts.
        </p>
        <ul className="feature-highlights">
          <li>Separate workspaces per client</li>
          <li>Team roles and permission checks on APIs</li>
          <li>Scheduling queue and publish status monitoring</li>
          <li>Usage meters for posts, storage, and members</li>
        </ul>
        <p className="honesty-note">
          Client approval workflows and white-label reporting are not included unless implemented in
          your deployment.
        </p>
        <Link className="btn" href="/pricing">
          View agency limits
        </Link>
      </div>
    </MarketingShell>
  );
}

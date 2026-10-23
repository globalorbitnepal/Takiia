import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '../../../components/marketing/MarketingShell';
import { Breadcrumbs } from '../../../components/marketing/Breadcrumbs';

export const metadata: Metadata = {
  title: 'For individuals',
  description: 'Manage conversations, meetings, and personal social publishing from one workspace.',
};

export default function SolutionsIndividualsPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Solutions', href: '/solutions/teams' },
            { label: 'Individuals' },
          ]}
        />
        <h1 className="h1">Built for focused solo work</h1>
        <p className="marketing-lead">
          Keep messaging, meeting links, and scheduled posts in one place without juggling multiple
          subscriptions—within the limits of your plan.
        </p>
        <ul className="feature-highlights">
          <li>Personal workspace with inbox and files</li>
          <li>Connect a limited number of social accounts per plan</li>
          <li>Schedule posts with clear quota meters</li>
          <li>Upgrade when you need more capacity or team members</li>
        </ul>
        <Link className="btn" href="/signup">Get started</Link>
      </div>
    </MarketingShell>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '../../components/marketing/MarketingShell';
import { Breadcrumbs } from '../../components/marketing/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Product updates and guides from Takiia when published.',
};

export default function BlogIndexPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
        <h1 className="h1">Blog</h1>
        <p className="marketing-lead">
          Articles will appear here when you publish them. Takiia does not ship fabricated posts or
          placeholder author profiles.
        </p>
        <p>
          <Link className="btn secondary" href="/help">Browse help topics</Link>
        </p>
      </div>
    </MarketingShell>
  );
}

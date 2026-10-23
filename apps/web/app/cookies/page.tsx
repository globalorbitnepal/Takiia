import type { Metadata } from 'next';
import { MarketingShell } from '../../components/marketing/MarketingShell';
import { Breadcrumbs } from '../../components/marketing/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Cookie policy',
  description: 'How Takiia uses cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page legal-prose">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cookie policy' }]} />
        <h1 className="h1">Cookie policy</h1>
        <p className="muted">
          <strong>Owner review required.</strong> This draft describes typical SaaS cookie usage for
          Takiia. Have qualified counsel adapt it to your jurisdiction and actual tracking practices.
        </p>
        <h2 className="h2">Essential cookies</h2>
        <p className="muted">
          Session and CSRF cookies support authentication and secure API requests. These are required
          for the signed-in product to function.
        </p>
        <h2 className="h2">Analytics</h2>
        <p className="muted">
          If you add analytics providers later, update this policy and any consent banners accordingly.
          The default open-source deployment does not include third-party marketing trackers.
        </p>
      </div>
    </MarketingShell>
  );
}

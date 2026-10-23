import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '../../components/marketing/MarketingShell';
import { Breadcrumbs } from '../../components/marketing/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Billing policy',
  description: 'Subscriptions, renewals, cancellations, and usage limits for Takiia.',
};

export default function BillingPolicyPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page legal-prose">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Billing policy' }]} />
        <h1 className="h1">Billing policy</h1>
        <p className="muted">
          <strong>Owner review required.</strong> Align amounts, tax treatment, and refund rules
          with your payment provider and legal entity before launch.
        </p>
        <h2 className="h2">Subscriptions</h2>
        <p className="muted">
          Plans, prices, and quotas are loaded from the database configuration. Charges recur
          monthly or yearly according to the selected interval when a live payment provider is
          connected.
        </p>
        <h2 className="h2">Usage limits</h2>
        <p className="muted">
          When a quota is reached, creating new metered resources may be blocked until you upgrade
          or the billing period resets. Existing data remains unless you delete it or a separate
          retention policy applies.
        </p>
        <h2 className="h2">Cancellation</h2>
        <p className="muted">
          You may cancel according to the flows available in{' '}
          <Link href="/app/billing">billing settings</Link>. Access may continue until the end of
          the paid period depending on subscription status.
        </p>
      </div>
    </MarketingShell>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { PricingCompare } from '../../components/marketing/PricingCompare';
import { PricingSection } from '../../components/marketing/PricingSection';
import { MarketingShell } from '../../components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Database-backed Takiia plans with messaging, social publishing limits, storage, and team quotas.',
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <div style={{ paddingTop: '1rem' }}>
        <PricingSection />
        <PricingCompare />
        <section className="section">
          <div className="container">
            <h2 className="h2">Billing FAQ</h2>
            <details className="card" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
              <summary>Is there a permanent free plan?</summary>
              <p className="muted" style={{ marginBottom: 0 }}>
                No. Takiia is a paid SaaS product. Trials, if offered, are time-limited and
                configurable by administrators.
              </p>
            </details>
            <details className="card" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
              <summary>How do yearly prices work?</summary>
              <p className="muted" style={{ marginBottom: 0 }}>
                Annual discounts are applied only when configured in the billing system—do not
                assume a percentage until it is set in plan data.
              </p>
            </details>
            <details className="card" style={{ padding: '1rem' }}>
              <summary>Which payment methods are supported?</summary>
              <p className="muted" style={{ marginBottom: 0 }}>
                Depends on the configured payment provider and your legal entity. Live checkout
                requires provider credentials.
              </p>
            </details>
            <div style={{ marginTop: '2rem' }}>
              <Link className="btn" href="/signup">
                Get Started
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}

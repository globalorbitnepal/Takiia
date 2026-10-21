'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';

type Plan = {
  code: string;
  name: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  limits: Record<string, number | string>;
};

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<unknown>(null);

  useEffect(() => {
    apiFetch<{ plans: Plan[] }>('/billing/plans').then((r) => setPlans(r.plans));
    apiFetch('/billing/subscription').then((r) => setSubscription(r));
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h1 className="h2" style={{ margin: 0 }}>
        Subscription & usage
      </h1>
      <pre
        className="card"
        style={{ padding: '1rem', overflow: 'auto', fontSize: 13, background: '#fff' }}
      >
        {JSON.stringify(subscription, null, 2)}
      </pre>
      <p>
        <Link href="/pricing">Compare public pricing</Link>
      </p>
      <div className="grid-2">
        {plans.map((plan) => (
          <article key={plan.code} className="card glass" style={{ padding: '1rem' }}>
            <h3>{plan.name}</h3>
            <p>
              <strong>${(plan.monthlyPriceCents / 100).toFixed(0)}/mo</strong>
              <span className="muted"> · ${(plan.yearlyPriceCents / 100).toFixed(0)}/yr</span>
            </p>
            <button
              className="btn secondary"
              type="button"
              onClick={() =>
                apiFetch('/billing/checkout', {
                  method: 'POST',
                  body: JSON.stringify({ planCode: plan.code, billingInterval: 'MONTHLY' }),
                }).then((res) => alert(JSON.stringify(res)))
              }
            >
              Upgrade (server checkout)
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

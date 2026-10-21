'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Plan = {
  code: string;
  name: string;
  monthlyPriceCents: number;
  limits: { maxSocialAccounts: number; maxScheduledPostsPerMonth: number; maxMembers: number };
};

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/billing/plans`)
      .then((r) => r.json())
      .then((d) => setPlans(d.plans ?? []))
      .catch(() => setPlans([]));
  }, []);

  return (
    <section className="section" id="pricing">
      <div className="container">
        <h2 className="h2">A Plan That Fits the Way You Work.</h2>
        <p className="muted">Prices load from the database-backed plan configuration.</p>
        <div className="grid-2" style={{ marginTop: '2rem' }}>
          {plans.map((plan) => (
            <article
              key={plan.code}
              className="card glass"
              style={{
                padding: '1.25rem',
                border: plan.code === 'PRO' ? '2px solid var(--primary)' : undefined,
              }}
            >
              <h3 style={{ marginTop: 0 }}>{plan.name}</h3>
              <p style={{ fontSize: '1.8rem', margin: '0.25rem 0', color: 'var(--primary-deep)' }}>
                ${(plan.monthlyPriceCents / 100).toFixed(0)}
                <span className="muted" style={{ fontSize: 14 }}>
                  /month
                </span>
              </p>
              <ul className="muted" style={{ fontSize: 14 }}>
                <li>{plan.limits.maxMembers} team members</li>
                <li>{plan.limits.maxSocialAccounts} social accounts</li>
                <li>{plan.limits.maxScheduledPostsPerMonth} scheduled posts / month</li>
              </ul>
              <Link className="btn" href="/signup">
                Get Started
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

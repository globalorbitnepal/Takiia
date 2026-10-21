'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

type Overview = {
  unreadMessages: number;
  conversationsCount: number;
  entitlements: {
    plan: { name: string; code: string };
    usage: { scheduledPostsCount: number; socialAccountsConnected: number; teamMembers: number };
    subscription: { status: string; currentPeriodEnd: string };
  } | null;
  upcomingEvents: { id: string; title: string; startsAt: string }[];
  scheduledPosts: { id: string; body: string; status: string; scheduledFor: string | null }[];
};

export default function DashboardOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Overview>('/dashboard/overview')
      .then(setData)
      .catch((err) => {
        if (err instanceof Error && err.message.includes('401')) {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      });
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <header>
        <h1 className="h2" style={{ margin: 0 }}>
          Overview
        </h1>
        <p className="muted">Your workspace at a glance — live data from your account.</p>
      </header>
      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
      <div className="grid-2">
        <article className="card glass" style={{ padding: '1.2rem' }}>
          <h2 style={{ marginTop: 0 }}>Inbox</h2>
          <p style={{ fontSize: '2rem', margin: '0.25rem 0', color: 'var(--primary-deep)' }}>
            {data?.unreadMessages ?? '—'}
          </p>
          <p className="muted">
            Unread messages across {data?.conversationsCount ?? 0} conversations
          </p>
          <Link className="btn secondary" href="/app/inbox">
            Open inbox
          </Link>
        </article>
        <article className="card glass" style={{ padding: '1.2rem' }}>
          <h2 style={{ marginTop: 0 }}>Subscription</h2>
          {data?.entitlements ? (
            <>
              <p style={{ margin: 0 }}>
                <strong>{data.entitlements.plan.name}</strong> (
                {data.entitlements.subscription.status})
              </p>
              <p className="muted" style={{ fontSize: 14 }}>
                Posts this period: {data.entitlements.usage.scheduledPostsCount} · Social accounts:{' '}
                {data.entitlements.usage.socialAccountsConnected} · Team:{' '}
                {data.entitlements.usage.teamMembers}
              </p>
            </>
          ) : (
            <p className="muted">Workspace provisioning may be pending after registration.</p>
          )}
          <Link className="btn secondary" href="/app/billing">
            Manage subscription
          </Link>
        </article>
      </div>
      <div className="grid-2">
        <article className="card" style={{ padding: '1rem' }}>
          <h3>Upcoming events</h3>
          {(data?.upcomingEvents ?? []).length === 0 ? (
            <p className="muted">No upcoming events scheduled.</p>
          ) : (
            <ul>
              {data?.upcomingEvents.map((e) => (
                <li key={e.id}>
                  {e.title} — {new Date(e.startsAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
          <Link href="/app/events">View calendar</Link>
        </article>
        <article className="card" style={{ padding: '1rem' }}>
          <h3>Social queue</h3>
          {(data?.scheduledPosts ?? []).length === 0 ? (
            <p className="muted">No drafts or scheduled posts yet.</p>
          ) : (
            <ul>
              {data?.scheduledPosts.map((p) => (
                <li key={p.id}>
                  {p.status}: {p.body.slice(0, 80)}
                </li>
              ))}
            </ul>
          )}
          <Link href="/app/social">Open social</Link>
        </article>
      </div>
    </div>
  );
}

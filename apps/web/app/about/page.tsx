import type { Metadata } from 'next';
import { MarketingShell } from '../../components/marketing/MarketingShell';
import { Breadcrumbs } from '../../components/marketing/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About',
  description: 'Takiia brings messaging, meetings, and social publishing into one honest, workspace-first SaaS.',
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
        <h1 className="h1">About Takiia</h1>
        <p className="marketing-lead">
          Takiia is built for teams that are tired of switching between chat apps, meeting links, and
          social schedulers. We focus on a single workspace with clear limits, secure defaults, and
          truthful integration status—not inflated marketing claims.
        </p>
        <p className="muted">
          Company legal name, registration details, and leadership bios should be added by the
          product owner before a formal launch. This page describes product intent only.
        </p>
      </div>
    </MarketingShell>
  );
}

import Link from 'next/link';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import { MarketingShell } from './MarketingShell';

export type FaqItem = { question: string; answer: string };

type FeaturePageLayoutProps = {
  title: string;
  description: string;
  crumbs: Crumb[];
  highlights: string[];
  honestyNote?: string;
  ctaHref: string;
  ctaLabel: string;
  faq?: FaqItem[];
  preview?: React.ReactNode;
};

export function FeaturePageLayout({
  title,
  description,
  crumbs,
  highlights,
  honestyNote,
  ctaHref,
  ctaLabel,
  faq = [],
  preview,
}: FeaturePageLayoutProps) {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs items={crumbs} />
        <header className="marketing-page-header">
          <h1 className="h1">{title}</h1>
          <p className="marketing-lead">{description}</p>
        </header>
        <div className="grid-2 marketing-feature-grid">
          <div>
            <ul className="feature-highlights">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {honestyNote ? <p className="honesty-note">{honestyNote}</p> : null}
            <Link className="btn" href={ctaHref}>{ctaLabel}</Link>
          </div>
          {preview ? <div className="card glass marketing-preview-panel">{preview}</div> : null}
        </div>
        {faq.length > 0 ? (
          <section className="section" style={{ paddingTop: '2rem' }}>
            <h2 className="h2">FAQ</h2>
            <div className="faq-stack">
              {faq.map((item) => (
                <details key={item.question} className="card" style={{ padding: '1rem' }}>
                  <summary>{item.question}</summary>
                  <p className="muted" style={{ marginBottom: 0 }}>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </MarketingShell>
  );
}

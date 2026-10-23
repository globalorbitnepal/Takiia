import Link from 'next/link';
import { SiteFooter } from '../../components/marketing/SiteFooter';
import { SiteHeader } from '../../components/marketing/SiteHeader';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with the Takiia team for product questions and account support.',
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="container section">
        <h1 className="h2">Contact</h1>
        <p className="muted" style={{ maxWidth: 560 }}>
          Questions about your workspace, billing, or getting started? We are happy to help.
        </p>
        <div
          className="card glass"
          style={{ padding: '1.25rem', maxWidth: 480, marginTop: '1.5rem' }}
        >
          <p style={{ marginTop: 0 }}>
            <strong>Email</strong>
            <br />
            <a href="mailto:support@takiia.com">support@takiia.com</a>
          </p>
          <p className="muted" style={{ fontSize: 14, marginBottom: 0 }}>
            For account access, use <Link href="/login">sign in</Link> or{' '}
            <Link href="/forgot-password">password reset</Link>. New teams can{' '}
            <Link href="/signup">create an account</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

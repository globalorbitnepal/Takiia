import { SiteFooter } from '../../components/marketing/SiteFooter';
import { SiteHeader } from '../../components/marketing/SiteHeader';

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container section">
        <h1 className="h2">Terms of Service</h1>
        <p className="muted">
          Placeholder terms. Include subscription billing, acceptable use, and cancellation terms
          before accepting paid customers.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

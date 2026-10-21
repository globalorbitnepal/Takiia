import { SiteFooter } from '../../components/marketing/SiteFooter';
import { SiteHeader } from '../../components/marketing/SiteHeader';

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="container section">
        <h1 className="h2">Contact</h1>
        <p className="muted">
          Add your verified support email or contact form endpoint here before publishing this page
          publicly.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

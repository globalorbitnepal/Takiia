import type { Metadata } from 'next';
import { Breadcrumbs } from '../../components/marketing/Breadcrumbs';
import { ContactForm } from '../../components/marketing/ContactForm';
import { MarketingShell } from '../../components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the Takiia team. Messages are delivered when CONTACT_INBOX_EMAIL is configured.',
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <div className="container marketing-page">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
        <h1 className="h1">Contact us</h1>
        <p className="marketing-lead">
          Send a message using the form below. In production, configure{' '}
          <code>CONTACT_INBOX_EMAIL</code> and SMTP on the API server so messages reach your support
          inbox.
        </p>
        <ContactForm />
      </div>
    </MarketingShell>
  );
}

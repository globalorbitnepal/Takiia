import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takiia.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Takiia — Chat, Meet & Social in One Workspace', template: '%s · Takiia' },
  description:
    'Team messaging, meetings, and social media scheduling in one premium workspace. Built for focused collaboration.',
  openGraph: {
    title: 'Takiia',
    description: 'Chat, meet, and manage social publishing in one workspace.',
    url: siteUrl,
    siteName: 'Takiia',
    type: 'website',
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}

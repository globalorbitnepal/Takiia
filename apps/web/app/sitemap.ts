import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takiia.com';
  const paths = [
    '',
    '/pricing',
    '/features',
    '/features/messaging',
    '/features/meetings',
    '/features/social-media',
    '/features/teams',
    '/features/calendar',
    '/features/file-sharing',
    '/integrations',
    '/solutions/individuals',
    '/solutions/teams',
    '/solutions/agencies',
    '/about',
    '/contact',
    '/help',
    '/blog',
    '/privacy',
    '/terms',
    '/cookies',
    '/billing-policy',
    '/login',
    '/signup',
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path.startsWith('/features') ? 0.8 : 0.6,
  }));
}

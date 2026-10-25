import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@takiia/shared'],
  images: {
    // Serve modern formats first and allow the higher-quality hero artwork (quality 92).
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 92],
    // Extra 1440 step so a 2x hero on a 1440px-wide laptop gets real HD pixels
    // without jumping all the way to the 1920 bucket.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
  },
};

export default nextConfig;

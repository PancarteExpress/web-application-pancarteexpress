import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.0.49'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.pancarteexpress.com',
      },
      {
        protocol: 'https',
        hostname: 'pancarteexpress.com',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
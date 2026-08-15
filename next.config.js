/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide the on-screen dev indicators so they don't show up in the /api/resume-pdf render.
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Handle environment variables
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  async redirects() {
    return [
      { source: '/let-it', destination: '/dead-letters', permanent: true },
    ];
  },
  // Cache assets in production only. In development this would cache the dev JS
  // chunks (which have stable URLs), making edits appear stale in the browser.
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/((?!_next/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App Router is now stable and not experimental
  images: {
    domains: ['images.unsplash.com'],
  },
  // Enable server components to access environment variables
  serverRuntimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
  },
  publicRuntimeConfig: {
    // You can expose public env vars here if needed
  },
};

module.exports = nextConfig;

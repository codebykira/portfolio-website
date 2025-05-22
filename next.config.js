/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
  },
  // Handle environment variables
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
};

module.exports = nextConfig;

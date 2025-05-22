/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App Router is now stable and not experimental
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig

const webpack = require('webpack');

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';
// Check if we're deploying to Vercel
const isVercel = process.env.VERCEL === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable React's StrictMode for now to avoid duplicate effects in development
  reactStrictMode: false,
  
  // Image configuration
  images: {
    domains: ['images.unsplash.com'],
    // Disable Image Optimization API for static exports
    unoptimized: true,
  },
  
  // Environment variables configuration
  env: {
    // This makes the RESEND_API_KEY available to the server-side
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    // Set the base path for API routes
    NEXT_PUBLIC_BASE_URL: isVercel 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000',
  },
  
  // Webpack configuration to handle environment variables
  webpack: (config, { isServer }) => {
    // This ensures that environment variables are available at build time
    config.plugins.push(
      new webpack.EnvironmentPlugin({
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        NEXT_PUBLIC_BASE_URL: isVercel 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000',
      })
    );
    
    return config;
  },
  
  // Enable static HTML export for GitHub Pages
  output: 'export',
  
  // Handle trailing slashes for static export
  trailingSlash: true,
};

// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
import type { Configuration } from "webpack";

const nextConfig = {
  // output: "export",
  // basePath: process.env.NODE_ENV === "production" ? "/portfolio-website" : "",
  // assetPrefix:
  //   process.env.NODE_ENV === "production" ? "/portfolio-website/" : "",
  images: {
    unoptimized: true,
  },
  webpack(config: Configuration) {
    if (!config.module) {
      config.module = {
        rules: [],
      };
    }
    if (!config.module.rules) {
      config.module.rules = [];
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  experimental: {
    turbo: {},
  },
};

module.exports = nextConfig;

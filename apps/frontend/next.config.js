/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  },
  rewrites: async () => ({
    beforeFiles: [],
    afterFiles: [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ],
    fallback: [],
  }),
  webpack: (config, { dev, isServer }) => {
    // Disable webpack cache in development to avoid monorepo warnings
    if (dev) {
      config.cache = false;
    }

    // Suppress false positive asset warnings
    if (config.stats) {
      config.stats.excludeAssets = [
        ...(config.stats.excludeAssets || []),
        /\.map$/,
        /manifest\.json$/,
      ];
    }

    return config;
  },
  onDemandEntries: {
    // Make on-demand entry more performant
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;

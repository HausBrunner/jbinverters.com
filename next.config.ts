import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This allows production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  // Disable React strict mode for production to reduce dev warnings
  reactStrictMode: false,

  // Example: Server config options
  serverExternalPackages: [],
  serverRuntimeConfig: {
    maxFileSize: '10mb',
  },
  publicRuntimeConfig: {
    maxFileSize: '10mb',
  },
};

export default nextConfig;

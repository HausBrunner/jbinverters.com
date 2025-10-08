import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Configure API routes for larger uploads
  serverExternalPackages: [],
  // Suppress React DevTools message in production
  reactStrictMode: true,
  // Increase body size limit for API routes
  serverRuntimeConfig: {
    maxFileSize: '10mb',
  },
  publicRuntimeConfig: {
    maxFileSize: '10mb',
  },
};

export default nextConfig;

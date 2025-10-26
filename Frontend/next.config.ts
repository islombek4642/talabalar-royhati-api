import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  // Suppress hydration warnings for browser extensions
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Note: Cross-origin and multiple lockfiles warnings are harmless
  // They only appear in development and don't affect functionality
};

export default nextConfig;

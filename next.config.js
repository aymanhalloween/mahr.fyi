/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Optimize build trace collection to prevent stack overflow
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-*/**/*',
        'node_modules/@next/swc-*/**/*',
      ],
    },
  },
  // Reduce memory usage during build
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig 
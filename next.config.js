/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'scripts/**',
        'node_modules/**',
        '.git/**',
      ],
    },
  },
}

module.exports = nextConfig 
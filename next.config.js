/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'scripts/**',
      ],
    },
  },
}

module.exports = nextConfig 
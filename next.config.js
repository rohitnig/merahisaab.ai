/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir is now stable and enabled by default in Next.js 15
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
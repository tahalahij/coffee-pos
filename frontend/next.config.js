/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

const isDesktopBuild = process.env.DESKTOP_BUILD === 'true';

const nextConfig = {
  // Static export for desktop app
  ...(isDesktopBuild && {
    output: 'export',
    images: {
      unoptimized: true,
    },
  }),
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
}

module.exports =
  process.env.NODE_ENV === 'production' && !isDesktopBuild
    ? withPWA(nextConfig)
    : nextConfig;

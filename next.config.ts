import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [new URL('https://storage.ko-fi.com/cdn/**')]
  }
}

export default nextConfig

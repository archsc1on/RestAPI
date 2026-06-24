// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        'diagnostics_channel': false,
        'node:diagnostics_channel': false,
      }
    }
    return config
  },

  experimental: {
    serverComponentsExternalPackages: ['xendit-node', '@prisma/client', 'bcryptjs', '@distube/ytdl-core', 'undici'],
  },
}

module.exports = nextConfig
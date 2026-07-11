// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  serverExternalPackages: ['xendit-node', '@prisma/client', 'bcryptjs', '@distube/ytdl-core', 'undici'],

  turbopack: {
    resolveAlias: {
      fs: { browser: './empty.js' },
      net: { browser: './empty.js' },
      tls: { browser: './empty.js' },
      crypto: { browser: './empty.js' },
      stream: { browser: './empty.js' },
      path: { browser: './empty.js' },
      os: { browser: './empty.js' },
    },
  },
}

module.exports = nextConfig

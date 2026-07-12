/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
  },

  serverExternalPackages: [
    'xendit-node',
    '@prisma/client',
    'bcryptjs',
    '@distube/ytdl-core',
    'undici',
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
      }
    }
    return config
  },

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

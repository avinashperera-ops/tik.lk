import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@open-ticket/database', '@open-ticket/crypto'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

export default nextConfig;
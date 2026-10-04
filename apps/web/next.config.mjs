/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@open-ticket/database', '@open-ticket/crypto'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
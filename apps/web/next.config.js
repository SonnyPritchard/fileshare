/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // disables image optimizer attack surface
  },
  experimental: {
    serverActions: {}, // disables risky RSC paths
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ultracem.co',
      },
      {
        protocol: 'https',
        hostname: '**.ultracem.co',
      },
    ],
  },
};

export default nextConfig;
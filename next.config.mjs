/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['bedev.kolektix.com', 'dev.kolektix.store', 'api.kolektix.com'],
    // domains: ['dev.kolektix.store'],
  },
};

export default nextConfig;

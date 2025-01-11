
import path from 'path';
import nextI18NextConfig from './next-i18next.config.mjs';


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['bedev.kolektix.com', 'dev.kolektix.store', 'api.kolektix.com', 'localhost'],
    // domains: ['dev.kolektix.store'],
  },
  // ...nextI18NextConfig,
};

export default nextConfig;

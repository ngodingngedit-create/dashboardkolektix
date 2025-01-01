
import path from 'path';


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['bedev.kolektix.com', 'dev.kolektix.store', 'api.kolektix.com'],
    // domains: ['dev.kolektix.store'],
  },
  i18n: {
      defaultLocale: 'en',
      locales: ['id', 'en'],
      localeDetection: false
  },
};

export default nextConfig;

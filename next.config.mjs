import path from "path";
import nextI18NextConfig from "./next-i18next.config.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["bedev.kolektix.com", "dev.kolektix.store", "api.kolektix.com", "localhost", "api.kolektix.cloud", "kolektix.com", "api.kolektix.my.id"],
    // domains: ['dev.kolektix.store'],
  },
  async redirects() {
    return [

      {
        source: "/event",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/merchandise",
        destination: "/login",
        permanent: true,
      },
    ];
  },
  // ...nextI18NextConfig,
};

export default nextConfig;

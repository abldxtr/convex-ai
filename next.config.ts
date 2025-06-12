import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["my8mw4-3000.csb.app"],
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn", "info"],
          }
        : false,
  },
  experimental: {
    reactCompiler: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;

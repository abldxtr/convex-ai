import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["my8mw4-3000.csb.app"],
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
};

export default nextConfig;

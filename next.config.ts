import type { NextConfig } from "next";
// import withPWAInit from "@ducanh2912/next-pwa";

import withSerwistInit from "@serwist/next";

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

// const withPWA = withPWAInit({
//   dest: "public",
//   cacheOnFrontEndNav: true,
//   aggressiveFrontEndNavCaching: true,
//   cacheStartUrl: true,
//   dynamicStartUrl: true,
//   reloadOnOnline: true,
//   extendDefaultRuntimeCaching: true,
// });

const nextConfig: NextConfig = {
  allowedDevOrigins: ["convext-vercel-ai-udon.vercel.app"],
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
    dynamicIO: true,
    useCache: true,
    ppr: "incremental",
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// export default nextConfig;

export default withSerwist(nextConfig);

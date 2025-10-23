import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { getMainCSPPolicy } from "./lib/csp";

const revision = crypto.randomUUID() ?? Date.now().toString();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

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
  experimental: {},
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    return [
      {
        // API routes CORS headers
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://convext-vercel-ai-udon.vercel.app",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS,PUT,DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key",
          },
        ],
      },
      {
        // Exclude Vercel internal resources and static assets from strict COEP, Google Drive Picker to prevent 'refused to connect' issue
        source:
          "/((?!_next|_vercel|api|favicon.ico|w/.*|workspace/.*|api/tools/drive).*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
      // Block access to sourcemap files (defense in depth)
      {
        source: "/(.*)\\.map$",
        headers: [{ key: "x-robots-tag", value: "noindex" }],
      },
      // Apply security headers to routes not handled by middleware runtime CSP
      {
        source: "/((?!_next|api|favicon.ico|.*\\.map$).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: getMainCSPPolicy() },
        ],
      },
    ];
  },
};

// export default withSerwist(nextConfig);

export default nextConfig;

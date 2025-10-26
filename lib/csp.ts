// import { env, getEnv } from "../env";

/**
 * Content Security Policy (CSP) configuration builder
 */

function getHostnameFromUrl(url: string | undefined): string[] {
  if (!url) return [];
  try {
    return [`https://${new URL(url).hostname}`];
  } catch {
    return [];
  }
}

export interface CSPDirectives {
  "default-src"?: string[];
  "script-src"?: string[];
  "style-src"?: string[];
  "img-src"?: string[];
  "media-src"?: string[];
  "font-src"?: string[];
  "connect-src"?: string[];
  "frame-src"?: string[];
  "frame-ancestors"?: string[];
  "form-action"?: string[];
  "base-uri"?: string[];
  "object-src"?: string[];
}

// Build-time CSP directives (for next.config.ts)
export const buildTimeCSPDirectives: CSPDirectives = {
  "default-src": ["'self'"],

  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://*.google.com",
    "https://apis.google.com",
    "https://*.vercel-scripts.com",
    "https://*.vercel-insights.com",
    "https://vercel.live",
    "https://*.vercel.live",
    "https://vercel.com",
    "https://*.vercel.app",
    "https://vitals.vercel-insights.com",
    "https://aware-barracuda-585.convex.cloud",
    "https://*.jsdelivr.net",
    "https://jsdelivr.net",
    "https://gh.jsdelivr.net",
  ],

  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],

  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.googleusercontent.com",
    "https://*.google.com",
    "https://aware-barracuda-585.convex.cloud",
    "https://cdn.jsdelivr.net",
    "https://*.jsdelivr.net",
    "https://jsdelivr.net",
    "https://gh.jsdelivr.net",
  ],

  "media-src": ["'self'", "blob:"],

  "font-src": ["'self'", "https://fonts.gstatic.com"],

  "connect-src": [
    "'self'",
    "https://convext-vercel-ai-udon.vercel.app",
    "wss://aware-barracuda-585.convex.cloud",
    "https://aware-barracuda-585.convex.cloud",
    "https://api.browser-use.com",
    "https://api.exa.ai",
    "https://*.googleapis.com",
    "https://*.vercel-insights.com",
    "https://vitals.vercel-insights.com",
    "https://vercel.live",
    "https://*.vercel.live",
    "https://vercel.com",
    "https://*.vercel.app",
    "wss://*.vercel.app",
    "https://*.jsdelivr.net",
    "https://jsdelivr.net",
    "https://gh.jsdelivr.net",
  ],

  "frame-src": [
    "https://drive.google.com",
    "https://docs.google.com",
    "https://*.google.com",
  ],

  "frame-ancestors": ["'self'"],
  "form-action": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
};

/**
 * Build CSP string from directives object
 */
export function buildCSPString(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (!sources || sources.length === 0) return "";
      const validSources = sources.filter(
        (source: string) => source && source.trim() !== ""
      );
      if (validSources.length === 0) return "";
      return `${directive} ${validSources.join(" ")}`;
    })
    .filter(Boolean)
    .join("; ");
}

/**
 * Generate runtime CSP header with dynamic environment variables (safer approach)
 * This maintains compatibility with existing inline scripts while fixing Docker env var issues
 */
export function generateRuntimeCSP(): string {
  const appUrl = "https://convext-vercel-ai-udon.vercel.app";

  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://apis.google.com https://*.vercel-scripts.com https://*.vercel-insights.com https://vercel.live https://*.vercel.live https://vercel.com https://*.vercel.app https://vitals.vercel-insights.com https://aware-barracuda-585.convex.cloud;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://*.googleusercontent.com https://*.githubusercontent.com https://aware-barracuda-585.convex.cloud https://jsdelivr.net https://*.jsdelivr.net https://gh.jsdelivr.net;
    media-src 'self' blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' ${appUrl} wss://aware-barracuda-585.convex.cloud https://aware-barracuda-585.convex.cloud https://api.browser-use.com https://api.exa.ai https://*.vercel-insights.com https://vitals.vercel-insights.com https://vercel.live https://*.vercel.live https://vercel.com https://*.vercel.app wss://*.vercel.app https://pro.ip-api.com ;
    frame-src https://drive.google.com https://docs.google.com https://*.google.com;
    frame-ancestors 'self';
    form-action 'self';
    base-uri 'self';
    object-src 'none';
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Get the main CSP policy string (build-time)
 */
export function getMainCSPPolicy(): string {
  return buildCSPString(buildTimeCSPDirectives);
}

/**
 * Permissive CSP for workflow execution endpoints
 */
export function getWorkflowExecutionCSPPolicy(): string {
  return "default-src * 'unsafe-inline' 'unsafe-eval'; connect-src *;";
}

/**
 * Add a source to a specific directive (modifies build-time directives)
 */
export function addCSPSource(
  directive: keyof CSPDirectives,
  source: string
): void {
  if (!buildTimeCSPDirectives[directive]) {
    buildTimeCSPDirectives[directive] = [];
  }
  if (!buildTimeCSPDirectives[directive]!.includes(source)) {
    buildTimeCSPDirectives[directive]!.push(source);
  }
}

/**
 * Remove a source from a specific directive (modifies build-time directives)
 */
export function removeCSPSource(
  directive: keyof CSPDirectives,
  source: string
): void {
  if (buildTimeCSPDirectives[directive]) {
    buildTimeCSPDirectives[directive] = buildTimeCSPDirectives[
      directive
    ]!.filter((s: string) => s !== source);
  }
}

/**
 * Generate static structured data for SEO
 */
export function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Chatbot",
    name: "T3 Chatbot",
    description:
      "T3 Chatbot یک چت‌بات هوش مصنوعی پیشرفته است که برای گفت‌وگو، پاسخ به پرسش‌ها و اجرای وظایف هوشمند طراحی شده است. این سیستم از مدل‌های زبانی قدرتمند استفاده می‌کند تا تجربه‌ای طبیعی و سریع را برای کاربران فراهم کند.",
    url: "https://convext-vercel-ai-udon.vercel.app",
    applicationCategory: "AIChatApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      category: "SaaS",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "T3 AI",
      url: "https://convext-vercel-ai-udon.vercel.app",
      sameAs: ["https://github.com/", "https://x.com/"],
    },
    featureList: [
      "پشتیبانی از مکالمه‌های هوشمند چندمرحله‌ای",
      "درک زبان طبیعی (NLP)",
      "حافظه گفتگو برای پاسخ‌های شخصی‌سازی‌شده",
      "قابلیت اتصال به APIهای خارجی",
      "رابط کاربری ساده و مدرن",
    ],
    inLanguage: "fa",
    keywords: [
      "چت‌بات هوش مصنوعی",
      "گفت‌وگوی خودکار",
      "ChatGPT فارسی",
      "ربات چت",
      "هوش مصنوعی تحت وب",
    ],
  };
}

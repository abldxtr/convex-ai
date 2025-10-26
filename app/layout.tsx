import "@/styles/globals.css";
import { Viewport, type Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/provider/ConvexClientProvider";
import { Toaster } from "sonner";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import Providers from "@/provider/react-query-provider";
import { geist, vazirmatn } from "@/lib/font";
import FullTextSearch from "@/components/full-text-search";
import { generateStructuredData } from "@/lib/csp";

const APP_NAME = "T3 Chatbot";
const APP_DEFAULT_TITLE = "T3 Chatbot – چت‌بات هوش مصنوعی";
const APP_TITLE_TEMPLATE = "%s | T3 Chatbot";
const APP_DESCRIPTION =
  "T3 Chatbot یک چت‌بات هوش مصنوعی پیشرفته است که به شما کمک می‌کند به سؤالاتتان پاسخ دهید، کارها را سریع‌تر انجام دهید و تجربه‌ای شبیه ChatGPT را به فارسی و انگلیسی داشته باشید.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: "https://convext-vercel-ai-udon.vercel.app",
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "https://convext-vercel-ai-udon.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "T3 Chatbot - چت‌بات هوش مصنوعی",
      },
    ],
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    site: "@t3chatbot",
    creator: "@t3chatbot",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    images: ["https://convext-vercel-ai-udon.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "AI Chatbot",
  keywords: [
    "چت‌بات هوش مصنوعی",
    "ChatGPT فارسی",
    "ربات گفتگو",
    "دستیار هوشمند",
    "T3 Chatbot",
    "چت آنلاین با هوش مصنوعی",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${vazirmatn.variable} `}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData),
          }}
        />
      </head>
      <ConvexAuthNextjsServerProvider>
        <body>
          <Toaster position="top-center" richColors />
          <ConvexClientProvider>
            <ConvexQueryCacheProvider>
              <Providers>
                {children}
                <FullTextSearch />
              </Providers>
            </ConvexQueryCacheProvider>
          </ConvexClientProvider>
        </body>
      </ConvexAuthNextjsServerProvider>
    </html>
  );
}

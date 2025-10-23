import "@/styles/globals.css";
import { Viewport, type Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/provider/ConvexClientProvider";
import { Toaster } from "sonner";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import Providers from "@/provider/react-query-provider";
import { geist, vazirmatn } from "@/lib/font";
import FullTextSearch from "@/components/full-text-search";

const APP_NAME = "T3 Chatgpt";
const APP_DEFAULT_TITLE = "Chat-gpt";
const APP_TITLE_TEMPLATE = "%s - Chatgpt";
const APP_DESCRIPTION = "Chatgpt";

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
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
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
    <html lang="en" className={`${geist.variable} ${vazirmatn.variable} `}>
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

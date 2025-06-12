import "@/styles/globals.css";

import { Viewport, type Metadata } from "next";
import { Geist } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/provider/ConvexClientProvider";
import { Toaster } from "sonner";
import { GlobalStoreProvider } from "@/context/global-store";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
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
    // startUpImage: [],
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
  themeColor: "#FFFFFF",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={`${geist.variable}`}>
        <GlobalStoreProvider>
          <body>
            <Toaster position="top-center" richColors />
            <ConvexClientProvider>
              <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
            </ConvexClientProvider>
          </body>
        </GlobalStoreProvider>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}

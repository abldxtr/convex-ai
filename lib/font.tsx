import { Geist, Vazirmatn } from "next/font/google";

export const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-vazirmatn",
  preload: true,
});
export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

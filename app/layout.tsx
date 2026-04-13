import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { VisitNotifier } from "@/components/visit-notifier";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { defaultOpenGraph, getSiteUrl } from "@/lib/metadata";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const noto = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME}｜GT 俱樂部`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "在輕鬆、可信賴的社群裡，一起探索 AI、Web3 與永續，並用行動讓生活與環境更好。",
  openGraph: {
    ...defaultOpenGraph,
    title: `${SITE_NAME}`,
    description: SITE_TAGLINE,
    url: getSiteUrl(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${noto.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-page text-ink">
        <ThemeProvider>
          <VisitNotifier />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
          >
            跳到主要內容
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

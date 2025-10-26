import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://channel-scope.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "YouTubeスコープ - チャンネル分析とキーワード検索ツール",
  description: "YouTubeチャンネル分析とキーワード検索で動画企画をサポート。配信者のための無料分析ツール。",
  keywords: ["YouTube", "分析", "チャンネル", "配信者", "動画", "統計", "キーワード検索", "企画", "トレンド"],
  authors: [{ name: "YouTubeScope" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://channel-scope.vercel.app",
    title: "YouTubeスコープ",
    description: "YouTubeチャンネル分析とキーワード検索で動画企画をサポート",
    siteName: "YouTubeスコープ",
    images: [
      {
        url: "/api/og?channel=YouTubeScope&subscribers=0&videos=0&views=0",
        width: 1200,
        height: 630,
        alt: "YouTubeスコープ - チャンネル分析とキーワード検索ツール",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTubeスコープ",
    description: "YouTubeチャンネル分析とキーワード検索で動画企画をサポート",
    images: ["/api/og?channel=YouTubeScope&subscribers=0&videos=0&views=0"],
  },
};

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prepfeed.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PrepFeed - 集めて、分析して、ネタにする。",
  description: "YouTube・Qiita・Zennのコンテンツ分析で企画のネタ出しをサポート。無料の分析ツール。",
  keywords: ["YouTube", "Qiita", "Zenn", "分析", "動画", "記事", "企画", "トレンド", "ネタ出し"],
  authors: [{ name: "PrepFeed" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://prepfeed.vercel.app",
    title: "PrepFeed",
    description: "集めて、分析して、ネタにする。",
    siteName: "PrepFeed",
    images: [
      {
        url: "/api/og?channel=PrepFeed&subscribers=0&videos=0&views=0",
        width: 1200,
        height: 630,
        alt: "PrepFeed - 集めて、分析して、ネタにする。",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepFeed",
    description: "集めて、分析して、ネタにする。",
    images: ["/api/og?channel=PrepFeed&subscribers=0&videos=0&views=0"],
  },
};

import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const headerUser = user
    ? {
        email: user.email ?? '',
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
        displayName: user.user_metadata?.full_name as string | undefined,
      }
    : null;

  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Header user={headerUser} />
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

'use client';

import Link from 'next/link';
import { Search, Instagram, Github, LogIn } from 'lucide-react';
import { useState } from 'react';
import UserMenu from './UserMenu';

// Xアイコン（カスタムSVG）
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface HeaderUser {
  email: string;
  avatarUrl?: string;
  displayName?: string;
}

interface HeaderProps {
  user?: HeaderUser | null;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a] border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF0000] to-[#00D4FF] rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gradient">
                PrepFeed
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                集めて、分析して、ネタにする。
              </p>
            </div>
          </Link>

          {/* キャッチコピー（デスクトップ） */}
          <div className="hidden md:block">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              集めて、分析して、ネタにする。
            </p>
          </div>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#FF0000] transition-colors"
            >
              ホーム
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#FF0000] transition-colors"
            >
              お問い合わせ
            </Link>

            {/* SNSリンク */}
            <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-300 dark:border-gray-600">
              <a
                href="https://x.com/masayuki_kiwami"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#1DA1F2] transition-colors"
                aria-label="X (Twitter)"
              >
                <XIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/masayuki.kiwami/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#E4405F] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/hohoemi-rabo/prepfeed"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#333] dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>

            {/* Auth */}
            <div className="ml-2 pl-2 border-l border-gray-300 dark:border-gray-600">
              {user ? (
                <UserMenu
                  email={user.email}
                  avatarUrl={user.avatarUrl}
                  displayName={user.displayName}
                />
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#FF0000] to-[#00D4FF] rounded-lg hover:opacity-90 transition-opacity"
                >
                  <LogIn className="w-4 h-4" />
                  ログイン
                </Link>
              )}
            </div>
          </nav>

          {/* モバイル: Auth + メニューボタン */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <UserMenu
                email={user.email}
                avatarUrl={user.avatarUrl}
                displayName={user.displayName}
              />
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#FF0000] to-[#00D4FF] rounded-lg hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-3.5 h-3.5" />
                ログイン
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="メニュー"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ホーム
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ダッシュボード
                </Link>
              )}
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                お問い合わせ
              </Link>
            </nav>

            {/* モバイル用SNSリンク */}
            <div className="mt-4 px-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">SNS</p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://x.com/masayuki_kiwami"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#1DA1F2] transition-colors"
                  aria-label="X (Twitter)"
                >
                  <XIcon className="w-6 h-6" />
                </a>
                <a
                  href="https://www.instagram.com/masayuki.kiwami/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#E4405F] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://github.com/hohoemi-rabo/prepfeed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#333] dark:hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-6 h-6" />
                </a>
              </div>
            </div>

            <p className="mt-4 px-4 text-xs text-gray-600 dark:text-gray-400">
              集めて、分析して、ネタにする。
            </p>
          </div>
        )}
      </div>
    </header>
  );
}

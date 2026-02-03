import Link from 'next/link';
import { Github, Instagram } from 'lucide-react';

// Xアイコン（カスタムSVG）
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#f5f5f5] dark:bg-[#1a1a1a] border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サービス情報 */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gradient">
              PrepFeed
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              YouTube・Qiita・Zennの分析で企画のネタ出しをサポート。
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com/masayuki_kiwami"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-[#1DA1F2] transition-colors"
                aria-label="X (Twitter)"
              >
                <XIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/masayuki.kiwami/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-[#E4405F] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/hohoemi-rabo/prepfeed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-[#333] dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* リンク */}
          <div>
            <h3 className="text-lg font-bold mb-4">リンク</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors"
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors"
                >
                  使い方
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors"
                >
                  免責事項
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>

          {/* 注意事項 */}
          <div>
            <h3 className="text-lg font-bold mb-4">ご利用にあたって</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              本サービスはYouTubeの公開データを利用した参考値を提供します。
              本サービスはYouTube及びGoogle LLCと提携していません。
              データの正確性・完全性は保証いたしません。
              分析結果は参考情報としてご利用ください。
            </p>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-8 pt-8 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} PrepFeed. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#f5f5f5] dark:bg-[#1a1a1a] border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サービス情報 */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gradient">
              YouTubeスコープ
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              YouTubeチャンネル分析とキーワード検索で動画企画をサポート。
              配信者の皆様の成長を応援します。
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors"
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
            © {currentYear} YouTubeスコープ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
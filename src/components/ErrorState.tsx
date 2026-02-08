'use client';

/**
 * エラー状態の共通コンポーネント
 * 検索ページ等で一貫したエラー表示を提供
 */

import { Search } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  icon?: LucideIcon;
}

export default function ErrorState({
  error,
  icon: Icon = Search,
}: ErrorStateProps) {
  return (
    <div className="container-custom py-8">
      <div className="card text-center">
        <div className="text-red-500 mb-4">
          <Icon className="w-16 h-16 mx-auto mb-4" />
        </div>
        <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            再試行
          </button>
          <Link href="/" className="btn-secondary">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

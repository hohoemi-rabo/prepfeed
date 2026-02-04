'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Search, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { QiitaUser, QiitaArticle } from '@/types/qiita';
import { ArticleSortType, ArticleSortOrder } from '@/lib/article-sort-utils';
import QiitaUserCard from '@/components/QiitaUserCard';
import ArticleList from '@/components/ArticleList';
import ArticleSortTabs from '@/components/ArticleSortTabs';
import { formatJapaneseNumber } from '@/lib/format-utils';

export default function QiitaUserPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<QiitaUser | null>(null);
  const [articles, setArticles] = useState<QiitaArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<ArticleSortType>('date');
  const [sortOrder, setSortOrder] = useState<ArticleSortOrder>('desc');

  useEffect(() => {
    if (userId) {
      document.title = `${userId} の記事一覧 | PrepFeed`;
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/qiita/user/${encodeURIComponent(userId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ユーザー情報の取得に失敗しました');
        }

        setUser(data.user);
        setArticles(data.articles || []);

        if (data.user) {
          document.title = `${data.user.name} (@${data.user.id}) の記事一覧 | PrepFeed`;
        }
      } catch (err) {
        console.error('Error fetching Qiita user data:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'エラーが発生しました';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#55C500]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            ユーザー情報を取得中...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center">
          <div className="text-red-500 mb-4">
            <Search className="w-16 h-16 mx-auto mb-4" />
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

  if (!user) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">ユーザーが見つかりません</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            指定されたQiitaユーザーは存在しないか、一時的にアクセスできません。
          </p>
          <Link href="/" className="btn-primary">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#55C500] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          検索に戻る
        </Link>
      </div>

      {/* ユーザー情報 */}
      <div className="mb-8">
        <QiitaUserCard user={user} />
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="card text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-[#55C500]" />
          <div className="text-2xl font-bold">
            {formatJapaneseNumber(user.items_count)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            記事数
          </div>
        </div>
        <div className="card text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-[#55C500]" />
          <div className="text-2xl font-bold">
            {formatJapaneseNumber(user.followers_count)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            フォロワー
          </div>
        </div>
      </div>

      {/* 記事一覧 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          記事一覧 ({articles.length}件)
        </h2>

        <ArticleSortTabs
          platform="qiita"
          sortType={sortType}
          sortOrder={sortOrder}
          onSortTypeChange={setSortType}
          onSortOrderToggle={() =>
            setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
          }
        />

        <ArticleList
          articles={articles}
          platform="qiita"
          sortType={sortType}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}

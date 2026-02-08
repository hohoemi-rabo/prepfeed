'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { ZennUser, ZennArticle } from '@/types/zenn';
import { ArticleSortType, ArticleSortOrder } from '@/lib/article-sort-utils';
import { PLATFORM_META } from '@/lib/platform-config';
import { useFetch } from '@/hooks/useFetch';
import PlatformUserCard from '@/components/PlatformUserCard';
import ArticleList from '@/components/ArticleList';
import ArticleSortTabs from '@/components/ArticleSortTabs';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { formatJapaneseNumber } from '@/lib/format-utils';

const { color } = PLATFORM_META.zenn;

export default function ZennUserPage() {
  const params = useParams();
  const username = params.username as string;

  const { data, isLoading, error } = useFetch<{ user: ZennUser; articles: ZennArticle[] }>(
    username ? `/api/zenn/user/${encodeURIComponent(username)}` : null,
    'Error fetching Zenn user data'
  );
  const user = data?.user || null;
  const articles = data?.articles || [];

  const [sortType, setSortType] = useState<ArticleSortType>('date');
  const [sortOrder, setSortOrder] = useState<ArticleSortOrder>('desc');

  useEffect(() => {
    if (user) {
      document.title = `${user.name} (@${user.username}) の記事一覧 | PrepFeed`;
    } else if (username) {
      document.title = `${username} の記事一覧 | PrepFeed`;
    }
  }, [username, user]);

  if (isLoading) {
    return <LoadingState message="ユーザー情報を取得中..." color={color} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!user) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">ユーザーが見つかりません</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            指定されたZennユーザーは存在しないか、一時的にアクセスできません。
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
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#3EA8FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          検索に戻る
        </Link>
      </div>

      {/* ユーザー情報 */}
      <div className="mb-8">
        <PlatformUserCard
          platform="zenn"
          name={user.name}
          handle={user.username}
          avatarUrl={user.avatar_url}
          stats={[
            { label: '記事', value: user.articles_count },
          ]}
          profileUrl={`https://zenn.dev/${user.username}`}
        />
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="card text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-[#3EA8FF]" />
          <div className="text-2xl font-bold">
            {formatJapaneseNumber(user.articles_count)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            記事数
          </div>
        </div>
      </div>

      {/* 記事一覧 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          記事一覧 ({articles.length}件)
        </h2>

        <ArticleSortTabs
          platform="zenn"
          sortType={sortType}
          sortOrder={sortOrder}
          onSortTypeChange={setSortType}
          onSortOrderToggle={() =>
            setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
          }
        />

        <ArticleList
          articles={articles}
          platform="zenn"
          sortType={sortType}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}

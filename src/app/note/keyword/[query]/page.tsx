'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { NoteArticle } from '@/types/note';
import { ArticleSortType, ArticleSortOrder } from '@/lib/article-sort-utils';
import { PLATFORM_META } from '@/lib/platform-config';
import { useFetch } from '@/hooks/useFetch';
import ArticleList from '@/components/ArticleList';
import ArticleSortTabs from '@/components/ArticleSortTabs';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

const { color, colorDark } = PLATFORM_META.note;

export default function NoteKeywordPage() {
  const params = useParams();
  const router = useRouter();
  const query = decodeURIComponent(params.query as string);

  const { data, isLoading, error } = useFetch<{ articles: NoteArticle[] }>(
    query ? `/api/note/keyword?q=${encodeURIComponent(query)}` : null,
    'Error fetching note keyword results'
  );
  const articles = data?.articles || [];

  const [keywordQuery, setKeywordQuery] = useState('');
  const [sortType, setSortType] = useState<ArticleSortType>('likes');
  const [sortOrder, setSortOrder] = useState<ArticleSortOrder>('desc');

  useEffect(() => {
    if (query) {
      document.title = `「${query}」の検索結果 | note | PrepFeed`;
    }
  }, [query]);

  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywordQuery.trim()) {
      router.push(
        `/note/keyword/${encodeURIComponent(keywordQuery.trim())}`
      );
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        message={`「${query}」を検索中...`}
        color={color}
      />
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (articles.length === 0) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">
            該当する記事が見つかりません
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            「{query}」に一致するnote記事は見つかりませんでした。
            <br />
            別のキーワードで検索してみてください。
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
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#41C9B4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ホームに戻る
        </Link>
      </div>

      {/* 再検索フォーム */}
      <div className="mb-6">
        <form onSubmit={handleKeywordSearch} className="w-full">
          <div className="relative">
            <input
              type="text"
              value={keywordQuery}
              onChange={(e) => setKeywordQuery(e.target.value)}
              placeholder="別のキーワードで検索"
              className="w-full pl-12 pr-24 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#41C9B4] focus:border-transparent transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(to right, ${color}, ${colorDark})` }}
            >
              検索
            </button>
          </div>
        </form>
      </div>

      {/* 検索結果ヘッダー */}
      <div className="mb-8">
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(to right, ${color}, ${colorDark})` }}
              >
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                「{query}」の検索結果
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {articles.length}件のnote記事を表示
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 記事一覧 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          記事一覧 ({articles.length}件)
        </h2>

        <ArticleSortTabs
          platform="note"
          sortType={sortType}
          sortOrder={sortOrder}
          onSortTypeChange={setSortType}
          onSortOrderToggle={() =>
            setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
          }
        />

        <ArticleList
          articles={articles}
          platform="note"
          sortType={sortType}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}

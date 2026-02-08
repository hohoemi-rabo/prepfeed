'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, FileText, Users, StickyNote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { NoteUser, NoteArticle } from '@/types/note';
import { ArticleSortType, ArticleSortOrder } from '@/lib/article-sort-utils';
import NoteUserCard from '@/components/NoteUserCard';
import ArticleList from '@/components/ArticleList';
import ArticleSortTabs from '@/components/ArticleSortTabs';
import { formatJapaneseNumber } from '@/lib/format-utils';

export default function NoteUserPage() {
  const params = useParams();
  const router = useRouter();
  const urlname = decodeURIComponent(params.urlname as string);

  const [user, setUser] = useState<NoteUser | null>(null);
  const [articles, setArticles] = useState<NoteArticle[]>([]);
  const [suggestions, setSuggestions] = useState<NoteUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<ArticleSortType>('date');
  const [sortOrder, setSortOrder] = useState<ArticleSortOrder>('desc');

  useEffect(() => {
    if (urlname) {
      document.title = `${urlname} の記事一覧 | PrepFeed`;
    }
  }, [urlname]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!urlname) return;

      setIsLoading(true);
      setError(null);
      setSuggestions([]);

      try {
        const response = await fetch(
          `/api/note/user/${encodeURIComponent(urlname)}`
        );
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            if (data.suggestions && data.suggestions.length > 0) {
              setSuggestions(data.suggestions);
            } else {
              setUser(null);
            }
            return;
          }
          throw new Error(data.error || 'ユーザー情報の取得に失敗しました');
        }

        setUser(data.user);
        setArticles(data.articles || []);

        if (data.user) {
          document.title = `${data.user.name} (@${data.user.urlname}) の記事一覧 | PrepFeed`;
        }
      } catch (err) {
        console.error('Error fetching note user data:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'エラーが発生しました';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [urlname]);

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#41C9B4]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            クリエイター情報を取得中...
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

  // クリエイター候補一覧
  if (suggestions.length > 0) {
    return (
      <div className="container-custom py-8 animate-fade-in">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#41C9B4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            検索に戻る
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            「{urlname}」の検索結果
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            該当するクリエイターが見つかりました ({suggestions.length}件)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((creator) => (
            <button
              key={creator.urlname}
              onClick={() => router.push(`/note/user/${encodeURIComponent(creator.urlname)}`)}
              className="card hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {creator.profile_image_path ? (
                    <Image
                      src={creator.profile_image_path}
                      alt={creator.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <StickyNote className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{creator.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{creator.urlname}
                  </div>
                  {creator.note_count > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {formatJapaneseNumber(creator.note_count)} 記事
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">クリエイターが見つかりません</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            指定されたnoteクリエイターは存在しないか、一時的にアクセスできません。
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
          検索に戻る
        </Link>
      </div>

      {/* ユーザー情報 */}
      <div className="mb-8">
        <NoteUserCard user={user} />
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="card text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-[#41C9B4]" />
          <div className="text-2xl font-bold">
            {formatJapaneseNumber(user.note_count ?? 0)}
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

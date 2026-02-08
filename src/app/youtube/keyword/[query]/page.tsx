'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, VideoIcon } from 'lucide-react';
import Link from 'next/link';
import { YouTubeVideo } from '@/types';
import { PLATFORM_META } from '@/lib/platform-config';
import VideoList from '@/components/VideoList';
import SortTabs from '@/components/SortTabs';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { trackError } from '@/lib/tracking';

const { color } = PLATFORM_META.youtube;

export default function KeywordSearchPage() {
  const params = useParams();
  const router = useRouter();
  const query = decodeURIComponent(params.query as string);

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywordQuery, setKeywordQuery] = useState('');

  // ページタイトルを設定
  useEffect(() => {
    if (query) {
      document.title = `「${query}」の検索結果 | PrepFeed`;
    }
  }, [query]);

  useEffect(() => {
    const fetchKeywordResults = async () => {
      if (!query) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/youtube/keyword?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'キーワード検索に失敗しました');
        }

        setVideos(data.videos || []);
      } catch (err) {
        console.error('Error fetching keyword search results:', err);
        const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
        setError(errorMessage);

        // エラートラッキング
        trackError('keyword_search_error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeywordResults();
  }, [query]);

  // キーワード検索を実行
  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywordQuery.trim()) {
      router.push(`/youtube/keyword/${encodeURIComponent(keywordQuery.trim())}`);
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

  if (videos.length === 0) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center">
          <VideoIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">該当する動画が見つかりません</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            「{query}」に一致する動画は見つかりませんでした。
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
      {/* ヘッダー（戻るボタン） */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ホームに戻る
        </Link>
      </div>

      {/* キーワード検索バー */}
      <div className="mb-6">
        <form onSubmit={handleKeywordSearch} className="w-full">
          <div className="relative">
            <input
              type="text"
              value={keywordQuery}
              onChange={(e) => setKeywordQuery(e.target.value)}
              placeholder="別のキーワードで検索"
              className="w-full pl-12 pr-24 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
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
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF0000] to-[#00D4FF] rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                「{query}」の検索結果
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {videos.length}件の動画を表示
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 動画リスト */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          人気動画 ({videos.length}本)
        </h2>

        {/* ソートタブ */}
        <SortTabs />

        <VideoList videos={videos} />
      </div>
    </div>
  );
}

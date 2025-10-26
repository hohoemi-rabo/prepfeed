'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Search, VideoIcon } from 'lucide-react';
import Link from 'next/link';
import { YouTubeVideo } from '@/types';
import VideoList from '@/components/VideoList';
import SortTabs from '@/components/SortTabs';
import SearchBar from '@/components/SearchBar';
import { trackError } from '@/lib/tracking';

export default function KeywordSearchPage() {
  const params = useParams();
  const query = decodeURIComponent(params.query as string);

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ページタイトルを設定
  useEffect(() => {
    if (query) {
      document.title = `「${query}」の検索結果 | YouTubeスコープ`;
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

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF0000]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            「{query}」を検索中...
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

      {/* 検索バー */}
      <div className="mb-6">
        <SearchBar />
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

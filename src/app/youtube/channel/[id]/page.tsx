'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, ExternalLink, Users, VideoIcon, Eye } from 'lucide-react';
import Link from 'next/link';
import { YouTubeChannel, YouTubeVideo } from '@/types';
import ChannelCard from '@/components/ChannelCard';
import VideoList from '@/components/VideoList';
import SortTabs from '@/components/SortTabs';
import ShareButton from '@/components/ShareButton';
import SearchBar from '@/components/SearchBar';
import { trackChannelView, trackError } from '@/lib/tracking';
import { formatJapaneseSubscribers, formatJapaneseViews } from '@/lib/format-utils';

// 重いコンポーネントを動的インポート（Rechartsを含むため）
const VideoChart = dynamic(() => import('@/components/VideoChart'), {
  loading: () => (
    <div className="card">
      <div className="h-64 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF0000]"></div>
      </div>
    </div>
  ),
  ssr: false,
});

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.id as string;

  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!channelId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/youtube/channel/${channelId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'チャンネル情報の取得に失敗しました');
        }

        setChannel(data.channel);
        setVideos(data.videos || []);

        // アナリティクストラッキング
        if (data.channel) {
          trackChannelView(channelId, data.channel.title);
        }
      } catch (err) {
        console.error('Error fetching channel data:', err);
        const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
        setError(errorMessage);

        // エラートラッキング
        trackError('channel_fetch_error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId]);

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF0000]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            チャンネル情報を取得中...
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
            <ExternalLink className="w-16 h-16 mx-auto mb-4" />
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

  if (!channel) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">チャンネルが見つかりません</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            指定されたチャンネルは存在しないか、一時的にアクセスできません。
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
      {/* ヘッダー（戻るボタンとシェアボタン） */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          検索に戻る
        </Link>
        <ShareButton channel={channel} videos={videos} />
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* チャンネル情報 */}
      <div className="mb-8">
        <ChannelCard channel={channel} />
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <VideoIcon className="w-8 h-8 mx-auto mb-2 text-[#FF0000]" />
          <div className="text-2xl font-bold">{channel.videoCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">動画数</div>
        </div>
        <div className="card text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-[#FF0000]" />
          <div className="text-2xl font-bold">{formatJapaneseSubscribers(channel.subscriberCount)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">登録者</div>
        </div>
        <div className="card text-center">
          <Eye className="w-8 h-8 mx-auto mb-2 text-[#FF0000]" />
          <div className="text-2xl font-bold">{formatJapaneseViews(channel.viewCount)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">総再生数</div>
        </div>
      </div>

      {/* 再生数推移グラフ */}
      <div className="mb-8">
        <VideoChart videos={videos} limit={10} />
      </div>

      {/* 動画リスト */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          最新動画 ({videos.length}本)
        </h2>

        {/* ソートタブ */}
        <SortTabs />

        <VideoList videos={videos} />
      </div>
    </div>
  );
}
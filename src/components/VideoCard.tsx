'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExternalLink, Eye, ThumbsUp, MessageCircle, TrendingUp, Calendar, Zap, Hash } from 'lucide-react';
import { YouTubeVideo } from '@/types';
import Badge from './Badge';
import { formatJapaneseNumber } from '@/lib/format-utils';

interface VideoCardProps {
  video: YouTubeVideo;
}

export default function VideoCard({ video }: VideoCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'たった今';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}週間前`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}ヶ月前`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}年前`;
    }
  };

  const handleWatchOnYouTube = () => {
    window.open(`https://youtube.com/watch?v=${video.id}`, '_blank', 'noopener,noreferrer');
  };

  const handleTagClick = (tag: string) => {
    router.push(`/youtube/keyword/${encodeURIComponent(tag)}`);
  };

  // バッジの判定（APIから計算済みのフラグを使用）
  const showNewBadge = video.isNew ?? false;
  const showTrendingBadge = video.isTrending ?? false;

  // タグの最大表示数
  const MAX_TAGS_DISPLAY = 8;
  const displayTags = video.tags?.slice(0, MAX_TAGS_DISPLAY) || [];

  return (
    <div className="card hover:shadow-lg transition-all duration-200 group">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* サムネイル */}
        <div className="relative flex-shrink-0">
          <div className="aspect-video w-full lg:w-80 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
            {video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Eye className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* 動画時間 */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>

          {/* バッジ */}
          <div className="absolute top-2 left-2 flex gap-1">
            {showNewBadge && <Badge type="new" animated={true} />}
            {showTrendingBadge && <Badge type="trending" animated={true} />}
          </div>
        </div>

        {/* 動画情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col h-full">
            {/* タイトル */}
            <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-[#FF0000] transition-colors">
              {video.title}
            </h3>

            {/* 投稿日 */}
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(video.publishedAt)}</span>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{formatJapaneseNumber(video.viewCount)}</span>
                <span className="text-gray-500">再生</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ThumbsUp className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{formatJapaneseNumber(video.likeCount)}</span>
                <span className="text-gray-500">({video.likeRate}%)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{formatJapaneseNumber(video.commentCount)}</span>
                <span className="text-gray-500">({video.commentRate}%)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{formatJapaneseNumber(video.growthRate || 0)}</span>
                <span className="text-gray-500">/日</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{video.engagementRate}%</span>
                <span className="text-gray-500">反応</span>
              </div>
            </div>

            {/* タグセクション */}
            {displayTags.length > 0 && (
              <div className="mb-3">
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {displayTags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => handleTagClick(tag)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-[#00D4FF] hover:text-white dark:hover:bg-[#00D4FF] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                    {video.tags && video.tags.length > MAX_TAGS_DISPLAY && (
                      <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                        +{video.tags.length - MAX_TAGS_DISPLAY}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 分析データ */}
            <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  公開から{video.daysFromPublished}日経過
                </div>
                <button
                  onClick={handleWatchOnYouTube}
                  className="flex items-center gap-1 text-xs text-[#FF0000] hover:underline transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  YouTubeで見る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
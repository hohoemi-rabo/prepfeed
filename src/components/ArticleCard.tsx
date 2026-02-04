'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, ThumbsUp, Bookmark, TrendingUp, Calendar, Sparkles, Hash } from 'lucide-react';
import { QiitaArticle } from '@/types/qiita';
import { ZennArticle } from '@/types/zenn';
import { formatJapaneseNumber } from '@/lib/format-utils';

type Platform = 'qiita' | 'zenn';

interface ArticleCardProps {
  article: QiitaArticle | ZennArticle;
  platform: Platform;
}

const platformConfig = {
  qiita: {
    label: 'Qiita',
    color: '#55C500',
    linkLabel: 'Qiitaで読む',
  },
  zenn: {
    label: 'Zenn',
    color: '#3EA8FF',
    linkLabel: 'Zennで読む',
  },
} as const;

export default function ArticleCard({ article, platform }: ArticleCardProps) {
  const router = useRouter();
  const config = platformConfig[platform];

  const likesCount =
    platform === 'qiita'
      ? (article as QiitaArticle).likes_count
      : (article as ZennArticle).liked_count;

  const stocksCount =
    platform === 'qiita' ? (article as QiitaArticle).stocks_count : null;

  const tags =
    platform === 'qiita' ? (article as QiitaArticle).tags : null;

  const daysFromPublished = article.days_from_published ?? 0;
  const growthRate = article.growth_rate ?? 0;

  const showNewBadge = daysFromPublished <= 3;
  const showTrendingBadge = growthRate >= 1 && daysFromPublished > 3;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  };

  const handleOpenArticle = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleTagClick = (tag: string) => {
    router.push(`/qiita/keyword/${encodeURIComponent(tag)}`);
  };

  const MAX_TAGS_DISPLAY = 8;
  const displayTags = tags?.slice(0, MAX_TAGS_DISPLAY) || [];

  return (
    <div className="card hover:shadow-lg transition-all duration-200 group">
      <div className="flex flex-col gap-3">
        {/* ヘッダー: プラットフォーム + バッジ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: config.color }}
            >
              {config.label}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {article.author_name}
            </span>
          </div>
          <div className="flex gap-1">
            {showNewBadge && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                NEW
              </span>
            )}
            {showTrendingBadge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                急上昇
              </span>
            )}
          </div>
        </div>

        {/* タイトル */}
        <h3
          className="text-lg font-bold line-clamp-2 transition-colors cursor-pointer"
          style={{ color: 'inherit' }}
          onClick={handleOpenArticle}
          onMouseEnter={(e) => (e.currentTarget.style.color = config.color)}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
        >
          {article.title}
        </h3>

        {/* 投稿日 */}
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(article.published_at)}</span>
        </div>

        {/* 統計情報 */}
        <div
          className={`grid ${
            stocksCount !== null ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'
          } gap-3`}
        >
          <div className="flex items-center gap-2 text-sm">
            <ThumbsUp className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{formatJapaneseNumber(likesCount)}</span>
            <span className="text-gray-500">いいね</span>
          </div>
          {stocksCount !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Bookmark className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{formatJapaneseNumber(stocksCount)}</span>
              <span className="text-gray-500">ストック</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{growthRate}</span>
            <span className="text-gray-500">/日</span>
          </div>
        </div>

        {/* タグセクション（Qiitaのみ） */}
        {displayTags.length > 0 && (
          <div className="flex items-start gap-2">
            <Hash className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:text-white transition-colors"
                  style={{ ['--hover-bg' as string]: config.color }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = config.color)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '')
                  }
                >
                  {tag}
                </button>
              ))}
              {tags && tags.length > MAX_TAGS_DISPLAY && (
                <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                  +{tags.length - MAX_TAGS_DISPLAY}
                </span>
              )}
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              公開から{daysFromPublished}日経過
            </div>
            <button
              onClick={handleOpenArticle}
              className="flex items-center gap-1 text-xs transition-colors hover:underline"
              style={{ color: config.color }}
            >
              <ExternalLink className="w-3 h-3" />
              {config.linkLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

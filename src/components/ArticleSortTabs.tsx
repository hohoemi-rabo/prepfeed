'use client';

import { ThumbsUp, Calendar, Bookmark, TrendingUp, ArrowUpDown } from 'lucide-react';
import { ArticleSortType, ArticleSortOrder, getArticleSortDisplayName } from '@/lib/article-sort-utils';

type Platform = 'qiita' | 'zenn';

interface SortOption {
  type: ArticleSortType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const qiitaSortOptions: SortOption[] = [
  {
    type: 'date',
    label: '投稿日',
    icon: <Calendar className="w-4 h-4" />,
    description: '投稿が新しい順',
  },
  {
    type: 'likes',
    label: 'いいね数',
    icon: <ThumbsUp className="w-4 h-4" />,
    description: 'いいね数の多い順',
  },
  {
    type: 'stocks',
    label: 'ストック数',
    icon: <Bookmark className="w-4 h-4" />,
    description: 'ストック数の多い順',
  },
  {
    type: 'growth',
    label: '伸び率',
    icon: <TrendingUp className="w-4 h-4" />,
    description: '1日あたりのいいね数',
  },
];

const zennSortOptions: SortOption[] = [
  {
    type: 'date',
    label: '投稿日',
    icon: <Calendar className="w-4 h-4" />,
    description: '投稿が新しい順',
  },
  {
    type: 'likes',
    label: 'いいね数',
    icon: <ThumbsUp className="w-4 h-4" />,
    description: 'いいね数の多い順',
  },
  {
    type: 'growth',
    label: '伸び率',
    icon: <TrendingUp className="w-4 h-4" />,
    description: '1日あたりのいいね数',
  },
];

const platformColors: Record<Platform, string> = {
  qiita: '#55C500',
  zenn: '#3EA8FF',
};

interface ArticleSortTabsProps {
  platform: Platform;
  sortType: ArticleSortType;
  sortOrder: ArticleSortOrder;
  onSortTypeChange: (type: ArticleSortType) => void;
  onSortOrderToggle: () => void;
}

export default function ArticleSortTabs({
  platform,
  sortType,
  sortOrder,
  onSortTypeChange,
  onSortOrderToggle,
}: ArticleSortTabsProps) {
  const sortOptions = platform === 'qiita' ? qiitaSortOptions : zennSortOptions;
  const accentColor = platformColors[platform];

  const getSortOrderLabel = () => {
    if (sortType === 'date') {
      return sortOrder === 'desc' ? '新しい順' : '古い順';
    }
    return sortOrder === 'desc' ? '多い順' : '少ない順';
  };

  const getCurrentDescription = () => {
    const option = sortOptions.find((opt) => opt.type === sortType);
    if (!option) return '';

    if (sortType === 'date') {
      return sortOrder === 'desc' ? '投稿が新しい順' : '投稿が古い順';
    }

    const baseDescription = option.description
      .replace('多い順', '')
      .replace('高い順', '');
    return sortOrder === 'desc'
      ? baseDescription + '多い順'
      : baseDescription + '少ない順';
  };

  return (
    <div className="mb-8">
      {/* ソートタブ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 mb-4">
        {sortOptions.map((option) => {
          const isActive = sortType === option.type;
          return (
            <button
              key={option.type}
              onClick={() => onSortTypeChange(option.type)}
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
              style={isActive ? { backgroundColor: accentColor } : undefined}
            >
              {option.icon}
              <span className="text-sm sm:text-base">{option.label}</span>
              {isActive && (
                <span className="text-xs opacity-90">
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ソート情報と順序切り替え */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {getArticleSortDisplayName(sortType)}
          </span>
          <span className="mx-2">•</span>
          <span>{getCurrentDescription()}</span>
        </div>

        <button
          onClick={onSortOrderToggle}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors self-start sm:self-auto"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>{getSortOrderLabel()}</span>
        </button>
      </div>

      {/* 区切り線 */}
      <div className="mt-6 border-b border-gray-200 dark:border-gray-700"></div>
    </div>
  );
}

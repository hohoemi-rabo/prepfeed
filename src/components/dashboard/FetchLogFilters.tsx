'use client';

import { Youtube, Code2, BookOpen } from 'lucide-react';
import type { Platform, FetchLogStatus } from '@/types/common';

interface FetchLogFiltersProps {
  platform: Platform | '';
  status: FetchLogStatus | '';
  onPlatformChange: (platform: Platform | '') => void;
  onStatusChange: (status: FetchLogStatus | '') => void;
}

const PLATFORM_OPTIONS: { value: Platform | ''; label: string; icon?: typeof Youtube }[] = [
  { value: '', label: 'すべて' },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'qiita', label: 'Qiita', icon: Code2 },
  { value: 'zenn', label: 'Zenn', icon: BookOpen },
];

const STATUS_OPTIONS: { value: FetchLogStatus | ''; label: string }[] = [
  { value: '', label: 'すべて' },
  { value: 'success', label: '成功' },
  { value: 'error', label: 'エラー' },
];

export default function FetchLogFilters({
  platform,
  status,
  onPlatformChange,
  onStatusChange,
}: FetchLogFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* プラットフォームフィルタ */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
          プラットフォーム:
        </span>
        {PLATFORM_OPTIONS.map((opt) => {
          const isActive = platform === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => onPlatformChange(opt.value)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ステータスフィルタ */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
          ステータス:
        </span>
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

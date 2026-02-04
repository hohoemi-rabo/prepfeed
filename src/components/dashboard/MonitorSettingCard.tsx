'use client';

import {
  Youtube,
  Code2,
  BookOpen,
  Search,
  Users,
  User,
  Pencil,
  Trash2,
  Clock,
} from 'lucide-react';
import type { MonitorSetting } from '@/types/monitor';
import type { Platform, MonitorType } from '@/types/common';

interface MonitorSettingCardProps {
  setting: MonitorSetting;
  onEdit: (setting: MonitorSetting) => void;
  onDelete: (setting: MonitorSetting) => void;
}

const PLATFORM_MAP: Record<Platform, { label: string; icon: typeof Youtube; color: string }> = {
  youtube: { label: 'YouTube', icon: Youtube, color: '#FF0000' },
  qiita: { label: 'Qiita', icon: Code2, color: '#55C500' },
  zenn: { label: 'Zenn', icon: BookOpen, color: '#3EA8FF' },
};

const TYPE_MAP: Record<MonitorType, { label: string; icon: typeof Search }> = {
  keyword: { label: 'キーワード', icon: Search },
  channel: { label: 'チャンネル', icon: Users },
  user: { label: 'ユーザー', icon: User },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'たった今';
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 30) return `${diffDay}日前`;
  return date.toLocaleDateString('ja-JP');
}

export default function MonitorSettingCard({
  setting,
  onEdit,
  onDelete,
}: MonitorSettingCardProps) {
  const platform = PLATFORM_MAP[setting.platform];
  const type = TYPE_MAP[setting.type];
  const PlatformIcon = platform.icon;
  const TypeIcon = type.icon;

  return (
    <div className={`card hover:shadow-lg transition-all duration-200 ${!setting.is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* プラットフォームアイコン */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${platform.color}15` }}
        >
          <PlatformIcon className="w-6 h-6" style={{ color: platform.color }} />
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: platform.color }}
            >
              {platform.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {type.label}
            </span>
            {!setting.is_active && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500">
                無効
              </span>
            )}
          </div>

          <div className="font-bold text-lg truncate">
            {setting.display_name || setting.value}
          </div>

          {setting.display_name && (
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {setting.value}
            </div>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>{setting.fetch_count}件取得</span>
            {setting.last_fetched_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(setting.last_fetched_at)}
              </span>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            onClick={() => onEdit(setting)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="編集"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(setting)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

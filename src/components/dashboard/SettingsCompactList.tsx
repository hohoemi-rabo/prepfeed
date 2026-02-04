'use client';

import Link from 'next/link';
import { Youtube, Code2, BookOpen, ChevronRight, Plus } from 'lucide-react';
import type { MonitorSetting } from '@/types/monitor';
import type { Platform } from '@/types/common';

interface SettingsCompactListProps {
  settings: MonitorSetting[];
}

const PLATFORM_ICONS: Record<Platform, typeof Youtube> = {
  youtube: Youtube,
  qiita: Code2,
  zenn: BookOpen,
};

const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: '#FF0000',
  qiita: '#55C500',
  zenn: '#3EA8FF',
};

const MAX_DISPLAY = 5;

export default function SettingsCompactList({ settings }: SettingsCompactListProps) {
  const displaySettings = settings.slice(0, MAX_DISPLAY);
  const remaining = settings.length - MAX_DISPLAY;

  return (
    <div>
      {settings.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-400 mb-3">
            監視設定を追加してデータ収集を開始しましょう
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#FF0000] hover:underline"
          >
            <Plus className="w-4 h-4" />
            設定を追加
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {displaySettings.map((setting) => {
              const Icon = PLATFORM_ICONS[setting.platform];
              const color = PLATFORM_COLORS[setting.platform];

              return (
                <div
                  key={setting.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                  <span className="text-sm font-medium truncate flex-1">
                    {setting.display_name || setting.value}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {setting.fetch_count}件
                  </span>
                  {!setting.is_active && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500">
                      無効
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {remaining > 0 && (
            <p className="text-xs text-gray-400 mt-2 px-3">
              他 {remaining}件
            </p>
          )}

          <Link
            href="/dashboard/settings"
            className="flex items-center justify-between mt-3 py-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            すべての設定を見る
            <ChevronRight className="w-4 h-4" />
          </Link>
        </>
      )}
    </div>
  );
}

'use client';

import { Youtube, Code2, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import type { FetchLog } from '@/types/monitor';
import type { Platform } from '@/types/common';
import { formatRelativeTime } from '@/lib/format-utils';

interface FetchLogListProps {
  logs: FetchLog[];
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

export default function FetchLogList({ logs }: FetchLogListProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        取得ログはまだありません
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const Icon = PLATFORM_ICONS[log.platform];
        const color = PLATFORM_COLORS[log.platform];

        return (
          <div
            key={log.id}
            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm"
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />

            <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
              {formatRelativeTime(log.executed_at)}
            </span>

            {log.status === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            )}

            <span className="text-gray-600 dark:text-gray-300 truncate">
              {log.status === 'success'
                ? `${log.records_count ?? 0}件取得`
                : log.error_message || 'エラー'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

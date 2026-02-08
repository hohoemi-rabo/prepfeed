'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { FetchLog } from '@/types/monitor';
import { formatRelativeTime } from '@/lib/format-utils';
import { PLATFORM_META } from '@/lib/platform-config';

interface FetchLogListProps {
  logs: FetchLog[];
  variant?: 'compact' | 'full';
}

export default function FetchLogList({
  logs,
  variant = 'compact',
}: FetchLogListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        取得ログはまだありません
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {logs.map((log) => {
          const { icon: Icon, color } = PLATFORM_META[log.platform];

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

  // Full variant
  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const { icon: Icon, color } = PLATFORM_META[log.platform];
        const isExpanded = expandedId === log.id;
        const hasError = log.status === 'error' && log.error_message;

        return (
          <div
            key={log.id}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden"
          >
            <div
              className={`flex items-center gap-3 py-3 px-4 text-sm ${
                hasError ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
              }`}
              onClick={() => {
                if (hasError) {
                  setExpandedId(isExpanded ? null : log.id);
                }
              }}
            >
              {/* エラー展開アイコン */}
              {hasError ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )
              ) : (
                <span className="w-4 flex-shrink-0" />
              )}

              {/* プラットフォームアイコン + ラベル */}
              <div className="flex items-center gap-1.5 flex-shrink-0 w-24">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-gray-600 dark:text-gray-300 text-xs">
                  {PLATFORM_META[log.platform].label}
                </span>
              </div>

              {/* ステータスバッジ */}
              {log.status === 'success' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  成功
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex-shrink-0">
                  <XCircle className="w-3 h-3" />
                  エラー
                </span>
              )}

              {/* 取得件数 */}
              <span className="text-gray-600 dark:text-gray-300 flex-shrink-0">
                {log.status === 'success'
                  ? `${log.records_count ?? 0}件`
                  : '-'}
              </span>

              {/* 日時 */}
              <span className="text-gray-400 text-xs ml-auto flex-shrink-0">
                {formatRelativeTime(log.executed_at)}
                <span className="hidden sm:inline ml-1.5 text-gray-300 dark:text-gray-500">
                  ({new Date(log.executed_at).toLocaleString('ja-JP')})
                </span>
              </span>
            </div>

            {/* エラー詳細（展開時） */}
            {isExpanded && hasError && (
              <div className="px-4 pb-3 pt-0 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-mono whitespace-pre-wrap">
                  {log.error_message}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import FetchLogList from '@/components/dashboard/FetchLogList';
import FetchLogFilters from '@/components/dashboard/FetchLogFilters';
import type { FetchLog } from '@/types/monitor';
import type { Platform, FetchLogStatus } from '@/types/common';

const LOGS_PER_PAGE = 20;

export default function LogsPage() {
  const [logs, setLogs] = useState<FetchLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [status, setStatus] = useState<FetchLogStatus | ''>('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LOGS_PER_PAGE),
      });
      if (platform) params.set('platform', platform);
      if (status) params.set('status', status);

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();

      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, platform, status]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePlatformChange = (value: Platform | '') => {
    setPlatform(value);
    setPage(1);
  };

  const handleStatusChange = (value: FetchLogStatus | '') => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          取得ログ
          {totalCount > 0 && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              {totalCount}件
            </span>
          )}
        </h2>
      </div>

      {/* フィルタ */}
      <FetchLogFilters
        platform={platform}
        status={status}
        onPlatformChange={handlePlatformChange}
        onStatusChange={handleStatusChange}
      />

      {/* ログ一覧 */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
        </div>
      ) : (
        <FetchLogList logs={logs} variant="full" />
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

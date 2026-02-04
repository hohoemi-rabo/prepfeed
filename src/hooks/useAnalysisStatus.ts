'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { JobStatus } from '@/types/common';
import type { DetailedAnalysisResult } from '@/types/analysis';

const POLL_INTERVAL = 2000;

interface UseAnalysisStatusReturn {
  status: JobStatus | null;
  result: DetailedAnalysisResult | null;
  error: string | null;
  isPolling: boolean;
}

export function useAnalysisStatus(
  analysisId: string | null
): UseAnalysisStatusReturn {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [result, setResult] = useState<DetailedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/analysis/status/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'ステータスの取得に失敗しました');
        stopPolling();
        return;
      }

      setStatus(data.status);

      if (data.status === 'completed') {
        setResult(data.result ?? null);
        stopPolling();
      } else if (data.status === 'failed') {
        setError(data.error_message || '分析に失敗しました');
        stopPolling();
      }
    } catch {
      setError('ネットワークエラーが発生しました');
      stopPolling();
    }
  }, [stopPolling]);

  useEffect(() => {
    if (!analysisId) {
      setStatus(null);
      setResult(null);
      setError(null);
      setIsPolling(false);
      return;
    }

    // 初回即時実行
    setIsPolling(true);
    setError(null);
    setResult(null);
    poll(analysisId);

    // 2秒間隔でポーリング
    intervalRef.current = setInterval(() => {
      poll(analysisId);
    }, POLL_INTERVAL);

    return () => {
      stopPolling();
    };
  }, [analysisId, poll, stopPolling]);

  return { status, result, error, isPolling };
}

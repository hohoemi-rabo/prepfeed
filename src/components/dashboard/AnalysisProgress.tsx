'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAnalysisStatus } from '@/hooks/useAnalysisStatus';

interface AnalysisProgressProps {
  analysisId: string;
  onComplete: (analysisId: string) => void;
  onError: (error: string) => void;
}

const STATUS_CONFIG: Record<string, { progress: number; message: string; color: string }> = {
  queued: { progress: 25, message: '分析リクエストを受け付けました...', color: '#FF0000' },
  processing: { progress: 60, message: 'AIが分析中です...', color: '#FF0000' },
  completed: { progress: 100, message: '分析が完了しました！', color: '#22c55e' },
  failed: { progress: 0, message: '分析に失敗しました', color: '#ef4444' },
};

export default function AnalysisProgress({
  analysisId,
  onComplete,
  onError,
}: AnalysisProgressProps) {
  const { status, error } = useAnalysisStatus(analysisId);

  const config = (status && STATUS_CONFIG[status]) || STATUS_CONFIG.queued;

  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => onComplete(analysisId), 1500);
      return () => clearTimeout(timer);
    }
    if (status === 'failed' && error) {
      onError(error);
    }
  }, [status, error, analysisId, onComplete, onError]);

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        {status === 'completed' ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : status === 'failed' ? (
          <AlertCircle className="w-6 h-6 text-red-500" />
        ) : (
          <Loader2 className="w-6 h-6 animate-spin text-[#FF0000]" />
        )}
        <div>
          <h3 className="font-bold">詳細分析</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{config.message}</p>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: config.color }}
          initial={{ width: '0%' }}
          animate={{ width: `${config.progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-3">{error}</p>
      )}

      {status !== 'completed' && status !== 'failed' && (
        <div className="flex items-start gap-2 mt-4 text-xs text-gray-400">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>ページを離れても分析は継続されます。完了後にダッシュボードで結果を確認できます。</p>
        </div>
      )}
    </div>
  );
}

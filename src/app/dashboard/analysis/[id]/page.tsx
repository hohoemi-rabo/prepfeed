'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import DetailedReport from '@/components/dashboard/DetailedReport';
import AnalysisProgress from '@/components/dashboard/AnalysisProgress';
import type { AnalysisResult, DetailedAnalysisResult } from '@/types/analysis';

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analysis/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || '分析結果の取得に失敗しました');
          return;
        }

        setAnalysis(data.analysis);
      } catch {
        setError('ネットワークエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleProgressComplete = () => {
    // 完了後にリロードして結果を表示
    setIsLoading(true);
    setError(null);
    const refetch = async () => {
      try {
        const response = await fetch(`/api/analysis/${id}`);
        const data = await response.json();
        if (response.ok) {
          setAnalysis(data.analysis);
        }
      } catch {
        setError('結果の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    refetch();
  };

  const handleProgressError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const renderContent = () => {
    if (!analysis) {
      return (
        <div className="card text-center py-12">
          <p className="text-gray-400">分析結果が見つかりません</p>
        </div>
      );
    }

    const status = analysis.status as string;

    if (status === 'completed' && analysis.result) {
      return (
        <DetailedReport
          result={analysis.result as DetailedAnalysisResult}
          generatedAt={analysis.completed_at || analysis.created_at}
        />
      );
    }

    if (status === 'queued' || status === 'processing') {
      return (
        <AnalysisProgress
          analysisId={analysis.id}
          onComplete={handleProgressComplete}
          onError={handleProgressError}
        />
      );
    }

    if (status === 'failed') {
      return (
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-gray-500">
            {analysis.error_message || '分析に失敗しました'}
          </p>
        </div>
      );
    }

    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">分析結果が見つかりません</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        <p className="mt-4 text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* 戻るリンク */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        ダッシュボードに戻る
      </Link>

      <h2 className="text-2xl font-bold mb-6">詳細分析レポート</h2>

      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

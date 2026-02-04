'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Play,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import AnalysisCard from '@/components/dashboard/AnalysisCard';
import AnalysisProgress from '@/components/dashboard/AnalysisProgress';
import SettingsCompactList from '@/components/dashboard/SettingsCompactList';
import FetchLogList from '@/components/dashboard/FetchLogList';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import type { MonitorSetting, FetchLog } from '@/types/monitor';
import type { AnalysisResult } from '@/types/analysis';

export default function DashboardPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<MonitorSetting[]>([]);
  const [simpleAnalyses, setSimpleAnalyses] = useState<AnalysisResult[]>([]);
  const [detailedAnalyses, setDetailedAnalyses] = useState<AnalysisResult[]>([]);
  const [logs, setLogs] = useState<FetchLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true);
  const [runningAnalysisId, setRunningAnalysisId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, simpleRes, detailedRes, logsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/analysis?type=simple'),
        fetch('/api/analysis?type=detailed'),
        fetch('/api/logs?limit=5'),
      ]);

      if (settingsRes.status === 401) {
        setError('ログインが必要です');
        return;
      }

      const [settingsData, simpleData, detailedData, logsData] = await Promise.all([
        settingsRes.json(),
        simpleRes.json(),
        detailedRes.json(),
        logsRes.json(),
      ]);

      setSettings(settingsData.settings || []);
      setSimpleAnalyses(simpleData.results || []);
      setDetailedAnalyses(detailedData.results || []);
      setLogs(logsData.logs || []);

      // 実行中の詳細分析があるか確認
      const running = (detailedData.results || []).find(
        (a: AnalysisResult) => a.status === 'queued' || a.status === 'processing'
      );
      if (running) {
        setRunningAnalysisId(running.id);
      }

      // プレミアムチェック（設定が1件でもあればプレミアム、またはAPIが403を返さない）
      setIsPremium(settingsRes.ok);
      setError(null);
    } catch {
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunDetailedAnalysis = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/analysis/detailed', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.status === 409) {
        // 既に実行中
        setRunningAnalysisId(data.analysisId);
        return;
      }

      if (!response.ok) {
        setError(data.error || '詳細分析の開始に失敗しました');
        return;
      }

      setRunningAnalysisId(data.analysisId);
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalysisComplete = (analysisId: string) => {
    setRunningAnalysisId(null);
    router.push(`/dashboard/analysis/${analysisId}`);
  };

  const handleAnalysisError = (errorMsg: string) => {
    setRunningAnalysisId(null);
    setError(errorMsg);
    fetchData();
  };

  // 簡易分析を setting_id でマッピング
  const analysisMap = new Map<string, AnalysisResult>();
  for (const a of simpleAnalyses) {
    if (a.setting_id && a.status === 'completed') {
      const existing = analysisMap.get(a.setting_id);
      if (!existing || a.created_at > existing.created_at) {
        analysisMap.set(a.setting_id, a);
      }
    }
  }

  // 完了した詳細分析
  const completedDetailedAnalyses = detailedAnalyses.filter(
    (a) => a.status === 'completed'
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        <p className="mt-4 text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {!isPremium && <UpgradeBanner />}

      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* 分析結果セクション */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">分析結果</h2>
          {settings.length > 0 && !runningAnalysisId && (
            <button
              onClick={handleRunDetailedAnalysis}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              詳細分析を実行
            </button>
          )}
        </div>

        {/* 実行中プログレス */}
        {runningAnalysisId && (
          <div className="mb-6">
            <AnalysisProgress
              analysisId={runningAnalysisId}
              onComplete={handleAnalysisComplete}
              onError={handleAnalysisError}
            />
          </div>
        )}

        {/* 簡易分析カード一覧 */}
        {settings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.map((setting) => (
              <AnalysisCard
                key={setting.id}
                setting={setting}
                analysis={analysisMap.get(setting.id) ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-2">監視設定がありません</p>
            <p className="text-sm text-gray-400">
              監視設定を追加すると、自動でデータ収集と簡易分析が実行されます。
            </p>
          </div>
        )}

        {/* 過去の詳細分析リンク */}
        {completedDetailedAnalyses.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              過去の詳細分析レポート
            </h3>
            <div className="space-y-2">
              {completedDetailedAnalyses.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/analysis/${a.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    詳細分析レポート
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(a.completed_at || a.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 下段: 設定サマリー + 取得ログ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 監視設定セクション */}
        <section className="card">
          <h2 className="text-lg font-bold mb-4">
            監視設定
            {settings.length > 0 && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                {settings.length}件
              </span>
            )}
          </h2>
          <SettingsCompactList settings={settings} />
        </section>

        {/* 取得ログセクション */}
        <section className="card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            取得ログ
          </h2>
          <FetchLogList logs={logs} />
        </section>
      </div>
    </div>
  );
}

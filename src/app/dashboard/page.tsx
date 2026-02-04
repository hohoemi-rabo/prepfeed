'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Settings, Loader2 } from 'lucide-react';
import MonitorWizard from '@/components/dashboard/MonitorWizard';
import MonitorSettingCard from '@/components/dashboard/MonitorSettingCard';
import MonitorEditModal from '@/components/dashboard/MonitorEditModal';
import type { MonitorSetting } from '@/types/monitor';

type ViewMode = 'list' | 'wizard';

export default function DashboardPage() {
  const [settings, setSettings] = useState<MonitorSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editTarget, setEditTarget] = useState<MonitorSetting | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('ログインが必要です');
          return;
        }
        throw new Error(data.error);
      }

      setSettings(data.settings || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('監視設定の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleDelete = async (setting: MonitorSetting) => {
    if (!window.confirm(`「${setting.display_name || setting.value}」を削除しますか？\n関連する収集データも削除されます。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/${setting.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '削除に失敗しました');
        return;
      }

      await fetchSettings();
    } catch {
      alert('削除中にエラーが発生しました');
    }
  };

  const handleWizardComplete = () => {
    setViewMode('list');
    fetchSettings();
  };

  const handleEditSaved = () => {
    setEditTarget(null);
    fetchSettings();
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ダッシュボード
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            監視設定の管理
          </p>
        </div>

        {viewMode === 'list' && (
          <button
            onClick={() => setViewMode('wizard')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            監視設定を追加
          </button>
        )}
      </div>

      {error && (
        <div className="card mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* メインコンテンツ */}
      {viewMode === 'wizard' ? (
        <MonitorWizard
          onComplete={handleWizardComplete}
          onCancel={() => setViewMode('list')}
        />
      ) : (
        <>
          {settings.length === 0 ? (
            // 空状態
            <div className="card text-center py-16">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h2 className="text-xl font-bold mb-2">監視設定がありません</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                YouTube・Qiita・Zennのキーワードやチャンネルを監視設定に追加して、
                <br className="hidden sm:inline" />
                自動でデータを収集・分析しましょう。
              </p>
              <button
                onClick={() => setViewMode('wizard')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                最初の監視設定を追加
              </button>
            </div>
          ) : (
            // 設定一覧
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  監視設定 ({settings.length}件)
                </h2>
              </div>
              {settings.map((setting) => (
                <MonitorSettingCard
                  key={setting.id}
                  setting={setting}
                  onEdit={setEditTarget}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 編集モーダル */}
      {editTarget && (
        <MonitorEditModal
          setting={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}

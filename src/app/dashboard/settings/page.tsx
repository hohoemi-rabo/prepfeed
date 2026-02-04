'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Filter } from 'lucide-react';
import MonitorWizard from '@/components/dashboard/MonitorWizard';
import MonitorSettingCard from '@/components/dashboard/MonitorSettingCard';
import MonitorEditModal from '@/components/dashboard/MonitorEditModal';
import type { MonitorSetting } from '@/types/monitor';
import type { Platform } from '@/types/common';

type ViewMode = 'list' | 'wizard';
type FilterPlatform = Platform | 'all';
type FilterActive = 'all' | 'active' | 'inactive';

export default function SettingsPage() {
  const [settings, setSettings] = useState<MonitorSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editTarget, setEditTarget] = useState<MonitorSetting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<FilterPlatform>('all');
  const [filterActive, setFilterActive] = useState<FilterActive>('all');

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

  // フィルタリング
  const filteredSettings = settings.filter((s) => {
    if (filterPlatform !== 'all' && s.platform !== filterPlatform) return false;
    if (filterActive === 'active' && !s.is_active) return false;
    if (filterActive === 'inactive' && s.is_active) return false;
    return true;
  });

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
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">
          監視設定
          {settings.length > 0 && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              {settings.length}件
            </span>
          )}
        </h2>

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

      {viewMode === 'wizard' ? (
        <MonitorWizard
          onComplete={handleWizardComplete}
          onCancel={() => setViewMode('list')}
        />
      ) : (
        <>
          {settings.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-gray-400 mb-4">監視設定がありません</p>
              <button
                onClick={() => setViewMode('wizard')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                最初の監視設定を追加
              </button>
            </div>
          ) : (
            <>
              {/* フィルター */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Filter className="w-4 h-4 text-gray-400" />

                {/* プラットフォームフィルター */}
                <div className="flex gap-1">
                  {(['all', 'youtube', 'qiita', 'zenn'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPlatform(p)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filterPlatform === p
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {p === 'all' ? 'すべて' : p === 'youtube' ? 'YouTube' : p === 'qiita' ? 'Qiita' : 'Zenn'}
                    </button>
                  ))}
                </div>

                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

                {/* 有効/無効フィルター */}
                <div className="flex gap-1">
                  {(['all', 'active', 'inactive'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setFilterActive(a)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filterActive === a
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {a === 'all' ? 'すべて' : a === 'active' ? '有効' : '無効'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 設定一覧 */}
              <div className="space-y-4">
                {filteredSettings.length === 0 ? (
                  <div className="card text-center py-8">
                    <p className="text-gray-400">条件に一致する設定がありません</p>
                  </div>
                ) : (
                  filteredSettings.map((setting) => (
                    <MonitorSettingCard
                      key={setting.id}
                      setting={setting}
                      onEdit={setEditTarget}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </>
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

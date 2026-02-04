'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import type { MonitorSetting } from '@/types/monitor';
import type { FetchCount } from '@/types/common';

interface MonitorEditModalProps {
  setting: MonitorSetting;
  onClose: () => void;
  onSaved: () => void;
}

const FETCH_COUNT_OPTIONS: FetchCount[] = [50, 100, 200];

export default function MonitorEditModal({
  setting,
  onClose,
  onSaved,
}: MonitorEditModalProps) {
  const [displayName, setDisplayName] = useState(setting.display_name || '');
  const [fetchCount, setFetchCount] = useState<FetchCount>(setting.fetch_count);
  const [isActive, setIsActive] = useState(setting.is_active);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/settings/${setting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          fetch_count: fetchCount,
          is_active: isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '更新に失敗しました');
        return;
      }

      onSaved();
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* オーバーレイ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* モーダル */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">監視設定を編集</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* フォーム */}
          <div className="space-y-5">
            {/* 表示名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                表示名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={setting.value}
                className="input-field"
              />
            </div>

            {/* 取得件数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                取得件数
              </label>
              <div className="flex gap-3">
                {FETCH_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setFetchCount(count)}
                    className={`flex-1 py-2 rounded-lg border-2 font-medium transition-all ${
                      fetchCount === count
                        ? 'border-[#FF0000] bg-[#FF0000]/10 text-[#FF0000]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {count}件
                  </button>
                ))}
              </div>
            </div>

            {/* 有効/無効 */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                監視を有効にする
              </label>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* エラー */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* アクション */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-lg bg-[#FF0000] text-white font-medium hover:bg-[#CC0000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

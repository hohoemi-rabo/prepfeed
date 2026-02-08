'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube,
  Code2,
  BookOpen,
  StickyNote,
  Search,
  Users,
  User,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import type { Platform, MonitorType, FetchCount } from '@/types/common';

interface YouTubeChannelResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
}

interface MonitorWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface WizardState {
  platform: Platform | null;
  type: MonitorType | null;
  value: string;
  displayName: string;
  fetchCount: FetchCount;
}

const PLATFORM_CONFIG = {
  youtube: {
    label: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    description: '動画・チャンネルのトレンドを監視',
    types: [
      { value: 'keyword' as MonitorType, label: 'キーワード', icon: Search, description: 'キーワードに関連する動画を監視' },
      { value: 'channel' as MonitorType, label: 'チャンネル', icon: Users, description: '特定チャンネルの新着動画を監視' },
    ],
  },
  qiita: {
    label: 'Qiita',
    icon: Code2,
    color: '#55C500',
    description: '技術記事のトレンドを監視',
    types: [
      { value: 'keyword' as MonitorType, label: 'キーワード', icon: Search, description: 'キーワードに関連する記事を監視' },
      { value: 'user' as MonitorType, label: 'ユーザー', icon: User, description: '特定ユーザーの投稿を監視' },
    ],
  },
  zenn: {
    label: 'Zenn',
    icon: BookOpen,
    color: '#3EA8FF',
    description: '技術記事・スクラップを監視',
    types: [
      { value: 'keyword' as MonitorType, label: 'キーワード', icon: Search, description: 'トピックに関連する記事を監視' },
      { value: 'user' as MonitorType, label: 'ユーザー', icon: User, description: '特定ユーザーの投稿を監視' },
    ],
  },
  note: {
    label: 'note',
    icon: StickyNote,
    color: '#41C9B4',
    description: 'クリエイターの記事を監視',
    types: [
      { value: 'keyword' as MonitorType, label: 'キーワード', icon: Search, description: 'キーワードに関連する記事を監視' },
      { value: 'user' as MonitorType, label: 'ユーザー', icon: User, description: '特定クリエイターの投稿を監視' },
    ],
  },
};

const FETCH_COUNT_OPTIONS: { value: FetchCount; label: string; description: string }[] = [
  { value: 50, label: 'Lite', description: '最新50件を取得' },
  { value: 100, label: 'Deep', description: '最新100件を取得' },
  { value: 200, label: 'Max', description: '最新200件を取得' },
];

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function MonitorWizard({ onComplete, onCancel }: MonitorWizardProps) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>({
    platform: null,
    type: null,
    value: '',
    displayName: '',
    fetchCount: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    count?: number;
    error?: string;
  } | null>(null);

  // チャンネル検索用
  const [channelQuery, setChannelQuery] = useState('');
  const [channelResults, setChannelResults] = useState<YouTubeChannelResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannelResult | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchChannels = useCallback(async (query: string) => {
    if (query.length < 2) {
      setChannelResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setChannelResults(data.channels || []);
        setShowDropdown(true);
      }
    } catch {
      // エラー時は候補を空に
      setChannelResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChannelQueryChange = (value: string) => {
    setChannelQuery(value);
    setSelectedChannel(null);
    setState((prev) => ({ ...prev, value: '', displayName: '' }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchChannels(value), 300);
  };

  const handleSelectChannel = (channel: YouTubeChannelResult) => {
    setSelectedChannel(channel);
    setChannelQuery(channel.title);
    setShowDropdown(false);
    setState((prev) => ({
      ...prev,
      value: channel.id,
      displayName: channel.title,
    }));
  };

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const platformConfig = state.platform ? PLATFORM_CONFIG[state.platform] : null;
  const accentColor = platformConfig?.color || '#FF0000';

  const canProceed = () => {
    switch (step) {
      case 1: return !!state.platform;
      case 2: return !!state.type;
      case 3: return state.value.trim().length > 0;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: state.platform,
          type: state.type,
          value: state.value.trim(),
          display_name: state.displayName.trim() || undefined,
          fetch_count: state.fetchCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitResult({ success: false, error: data.error });
        return;
      }

      setSubmitResult({
        success: true,
        count: data.initialFetch?.count || 0,
      });
    } catch {
      setSubmitResult({ success: false, error: 'ネットワークエラーが発生しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChannelSearch = state.platform === 'youtube' && state.type === 'channel';

  const getValuePlaceholder = () => {
    if (!state.platform || !state.type) return '';
    if (state.type === 'keyword') {
      return state.platform === 'youtube' ? '例: React チュートリアル' : '例: Next.js';
    }
    if (state.platform === 'qiita') return '例: Qiita';
    if (state.platform === 'note') return '例: nozomi_iijima';
    return '例: catnose99';
  };

  const getValueLabel = () => {
    if (state.type === 'keyword') return 'キーワード';
    if (state.platform === 'youtube') return 'チャンネル';
    return 'ユーザーID / ユーザー名';
  };

  const getTypeLabel = (type: MonitorType) => {
    switch (type) {
      case 'keyword': return 'キーワード';
      case 'channel': return 'チャンネル';
      case 'user': return 'ユーザー';
    }
  };

  return (
    <div className="card">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                s < step
                  ? 'text-white'
                  : s === step
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
              style={
                s <= step
                  ? { backgroundColor: accentColor }
                  : undefined
              }
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 5 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-1 transition-all ${
                  s < step ? '' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                style={s < step ? { backgroundColor: accentColor } : undefined}
              />
            )}
          </div>
        ))}
      </div>

      {/* ステップ内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: プラットフォーム選択 */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold mb-6">プラットフォームを選択</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG.youtube][]).map(
                  ([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = state.platform === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setState({ ...state, platform: key, type: null })}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        style={
                          isSelected
                            ? { borderColor: config.color, backgroundColor: `${config.color}10` }
                            : undefined
                        }
                      >
                        <Icon
                          className="w-8 h-8 mb-3"
                          style={{ color: config.color }}
                        />
                        <div className="font-bold text-lg">{config.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {config.description}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Step 2: タイプ選択 */}
          {step === 2 && platformConfig && (
            <div>
              <h3 className="text-xl font-bold mb-6">監視タイプを選択</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platformConfig.types.map((t) => {
                  const Icon = t.icon;
                  const isSelected = state.type === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setState({ ...state, type: t.value })}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={
                        isSelected
                          ? { borderColor: accentColor, backgroundColor: `${accentColor}10` }
                          : undefined
                      }
                    >
                      <Icon
                        className="w-8 h-8 mb-3"
                        style={{ color: accentColor }}
                      />
                      <div className="font-bold text-lg">{t.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: 値入力 */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold mb-6">{getValueLabel()}を入力</h3>
              <div className="space-y-4">
                {isChannelSearch ? (
                  /* YouTube チャンネル検索 */
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      チャンネル名で検索 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={channelQuery}
                          onChange={(e) => handleChannelQueryChange(e.target.value)}
                          onFocus={() => channelResults.length > 0 && setShowDropdown(true)}
                          placeholder="例: ヒカキン、TOKYOMX"
                          className="input-field pl-10"
                          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                          autoFocus
                        />
                        {isSearching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>

                      {/* 検索結果ドロップダウン */}
                      {showDropdown && channelResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                          {channelResults.map((ch) => (
                            <button
                              key={ch.id}
                              onClick={() => handleSelectChannel(ch)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                            >
                              {ch.thumbnail ? (
                                <Image
                                  src={ch.thumbnail}
                                  alt={ch.title}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                  <Youtube className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{ch.title}</div>
                                <div className="text-xs text-gray-400">
                                  {ch.subscriberCount > 0 && `${(ch.subscriberCount / 10000).toFixed(1)}万人`}
                                  {ch.videoCount > 0 && ` · ${ch.videoCount}本`}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {showDropdown && channelResults.length === 0 && channelQuery.length >= 2 && !isSearching && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                          <p className="text-sm text-gray-400">チャンネルが見つかりません</p>
                        </div>
                      )}
                    </div>

                    {/* 選択済みチャンネル表示 */}
                    {selectedChannel && (
                      <div className="mt-3 flex items-center gap-3 p-3 rounded-lg border-2" style={{ borderColor: accentColor, backgroundColor: `${accentColor}10` }}>
                        {selectedChannel.thumbnail ? (
                          <Image
                            src={selectedChannel.thumbnail}
                            alt={selectedChannel.title}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Youtube className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{selectedChannel.title}</div>
                          <div className="text-xs text-gray-400 truncate">ID: {selectedChannel.id}</div>
                        </div>
                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} />
                      </div>
                    )}
                  </div>
                ) : (
                  /* キーワード / ユーザーID 入力 */
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {getValueLabel()} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state.value}
                      onChange={(e) => setState({ ...state, value: e.target.value })}
                      placeholder={getValuePlaceholder()}
                      className="input-field"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      autoFocus
                    />
                  </div>
                )}
                {!isChannelSearch && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      表示名（任意）
                    </label>
                    <input
                      type="text"
                      value={state.displayName}
                      onChange={(e) => setState({ ...state, displayName: e.target.value })}
                      placeholder="例: AI関連キーワード"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      設定を識別しやすくするための表示名です
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: 取得件数 */}
          {step === 4 && (
            <div>
              <h3 className="text-xl font-bold mb-6">取得件数を選択</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {FETCH_COUNT_OPTIONS.map((option) => {
                  const isSelected = state.fetchCount === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setState({ ...state, fetchCount: option.value })}
                      className={`p-6 rounded-lg border-2 transition-all text-center ${
                        isSelected
                          ? 'shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={
                        isSelected
                          ? { borderColor: accentColor, backgroundColor: `${accentColor}10` }
                          : undefined
                      }
                    >
                      <div className="text-3xl font-bold mb-1" style={{ color: isSelected ? accentColor : undefined }}>
                        {option.value}
                      </div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: 確認 & 登録 */}
          {step === 5 && (
            <div>
              {submitResult ? (
                // 結果表示
                <div className="text-center py-8">
                  {submitResult.success ? (
                    <>
                      <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: accentColor }} />
                      <h3 className="text-xl font-bold mb-2">登録完了</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        監視設定を追加しました。
                      </p>
                      {submitResult.count !== undefined && submitResult.count > 0 && (
                        <p className="text-sm" style={{ color: accentColor }}>
                          初回データ取得: {submitResult.count}件
                        </p>
                      )}
                      <button
                        onClick={onComplete}
                        className="mt-6 px-6 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
                        style={{ backgroundColor: accentColor }}
                      >
                        ダッシュボードに戻る
                      </button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                      <h3 className="text-xl font-bold mb-2">エラーが発生しました</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {submitResult.error}
                      </p>
                      <button
                        onClick={() => setSubmitResult(null)}
                        className="btn-primary"
                      >
                        やり直す
                      </button>
                    </>
                  )}
                </div>
              ) : (
                // 確認画面
                <>
                  <h3 className="text-xl font-bold mb-6">設定内容の確認</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500">プラットフォーム</span>
                      <span className="font-medium" style={{ color: accentColor }}>
                        {platformConfig?.label}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500">タイプ</span>
                      <span className="font-medium">{state.type && getTypeLabel(state.type)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500">{getValueLabel()}</span>
                      <span className="font-medium">{state.value}</span>
                    </div>
                    {state.displayName && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500">表示名</span>
                        <span className="font-medium">{state.displayName}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500">取得件数</span>
                      <span className="font-medium">{state.fetchCount}件</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        登録中...初回データを取得しています
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        登録する
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ナビゲーションボタン */}
      {!submitResult && (
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? 'キャンセル' : '戻る'}
          </button>

          {step < 5 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-30"
              style={{ backgroundColor: accentColor }}
            >
              次へ
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

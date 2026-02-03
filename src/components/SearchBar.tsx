'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Search, X, Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { YouTubeChannel } from '@/types';
import { trackChannelSearch } from '@/lib/tracking';

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ className = '', autoFocus = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<YouTubeChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 検索APIを呼び出す
  const searchChannels = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        // レート制限エラーかチェック
        if (response.status === 429) {
          const waitTime = data.retryAfter || 60;
          setError(`リクエスト制限に達しました。${waitTime}秒後に再度お試しください。`);
        } else {
          setError(data.error || 'チャンネルの検索に失敗しました');
        }
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setSuggestions(data.channels || []);
      setShowDropdown(true);

      // アナリティクストラッキング
      trackChannelSearch(searchQuery, data.channels?.length || 0);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // デバウンス処理
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        searchChannels(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, searchChannels]);

  // クリック外を検出してドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // チャンネルを選択
  const handleSelectChannel = (channel: YouTubeChannel) => {
    setQuery(channel.title);
    setShowDropdown(false);
    setSelectedIndex(-1);
    // チャンネル詳細ページへ遷移
    router.push(`/youtube/channel/${channel.id}`);
  };

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectChannel(suggestions[selectedIndex]);
      } else if (query.trim() && suggestions.length > 0) {
        handleSelectChannel(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  // 入力クリア
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setError(null);
    inputRef.current?.focus();
  };

  // 数値のフォーマット
  const formatNumber = (num: number): string => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)}千万`;
    }
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder="YouTubeチャンネル名を入力"
          className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all duration-200"
          autoFocus={autoFocus}
        />

        {/* 検索アイコン */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        {/* クリアボタン */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="クリア"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className={`absolute w-full mt-2 p-3 border rounded-lg text-sm ${
          error.includes('リクエスト制限')
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          <div className="flex items-start gap-2">
            {error.includes('リクエスト制限') ? (
              <div className="flex-shrink-0 mt-0.5">
                ⏱️
              </div>
            ) : (
              <div className="flex-shrink-0 mt-0.5">
                ❌
              </div>
            )}
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* 検索候補ドロップダウン */}
      {showDropdown && suggestions.length > 0 && !error && (
        <div className="absolute w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 animate-slide-up">
          <div className="max-h-96 overflow-y-auto">
            {suggestions.map((channel, index) => (
              <button
                key={channel.id}
                onClick={() => handleSelectChannel(channel)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                  selectedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
              >
                {/* チャンネルアイコン */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF0000] to-[#CC0000] rounded-full flex items-center justify-center relative">
                  {channel.thumbnail ? (
                    <Image
                      src={channel.thumbnail}
                      alt={channel.title}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                      priority={false}
                    />
                  ) : (
                    <Users className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* チャンネル情報 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {channel.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3">
                    <span>登録者 {formatNumber(channel.subscriberCount)}</span>
                    <span>•</span>
                    <span>{channel.videoCount}本の動画</span>
                  </div>
                  {channel.customUrl && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {channel.customUrl}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* 検索候補の数 */}
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {suggestions.length}件の検索結果
          </div>
        </div>
      )}

      {/* 検索中で候補がない場合 */}
      {showDropdown && query.length >= 2 && suggestions.length === 0 && !isLoading && !error && (
        <div className="absolute w-full mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-center text-gray-500 dark:text-gray-400">
          「{query}」に一致するチャンネルが見つかりません
        </div>
      )}
    </div>
  );
}
'use client';

import { Youtube, Code2, BookOpen, StickyNote, Search, Users, User, TrendingUp } from 'lucide-react';
import type { MonitorSetting } from '@/types/monitor';
import type { AnalysisResult, SimpleAnalysisResult } from '@/types/analysis';
import type { Platform, MonitorType } from '@/types/common';
import { formatRelativeTime } from '@/lib/format-utils';

interface AnalysisCardProps {
  setting: MonitorSetting;
  analysis: AnalysisResult | null;
}

const PLATFORM_MAP: Record<Platform, { label: string; icon: typeof Youtube; color: string }> = {
  youtube: { label: 'YouTube', icon: Youtube, color: '#FF0000' },
  qiita: { label: 'Qiita', icon: Code2, color: '#55C500' },
  zenn: { label: 'Zenn', icon: BookOpen, color: '#3EA8FF' },
  note: { label: 'note', icon: StickyNote, color: '#41C9B4' },
};

const TYPE_MAP: Record<MonitorType, { label: string; icon: typeof Search }> = {
  keyword: { label: 'キーワード', icon: Search },
  channel: { label: 'チャンネル', icon: Users },
  user: { label: 'ユーザー', icon: User },
};

function getScoreColor(score: number): string {
  if (score >= 61) return 'text-green-500';
  if (score >= 31) return 'text-yellow-500';
  return 'text-red-500';
}

export default function AnalysisCard({ setting, analysis }: AnalysisCardProps) {
  const platform = PLATFORM_MAP[setting.platform];
  const type = TYPE_MAP[setting.type];
  const PlatformIcon = platform.icon;
  const TypeIcon = type.icon;

  const result = analysis?.result as SimpleAnalysisResult | undefined;
  const hasResult = analysis?.status === 'completed' && result;

  return (
    <div className="card hover:shadow-lg transition-all duration-200">
      {/* ヘッダー */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${platform.color}15` }}
        >
          <PlatformIcon className="w-5 h-5" style={{ color: platform.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: platform.color }}
            >
              {platform.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {type.label}
            </span>
          </div>
          <div className="font-bold truncate">
            {setting.display_name || setting.value}
          </div>
        </div>

        {/* トレンドスコア */}
        {hasResult && (
          <div className="flex-shrink-0 text-center">
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${getScoreColor(result.trend_score)}`}>
              <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.15" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${(result.trend_score / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-bold">{result.trend_score}</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block">スコア</span>
          </div>
        )}
      </div>

      {hasResult ? (
        <>
          {/* サマリー */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {result.summary}
          </p>

          {/* 注目コンテンツ */}
          {result.top_contents.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                <TrendingUp className="w-3 h-3" />
                注目コンテンツ
              </div>
              <ul className="space-y-1">
                {result.top_contents.slice(0, 3).map((content) => (
                  <li
                    key={content.id}
                    className="text-xs text-gray-600 dark:text-gray-400 truncate pl-3 border-l-2"
                    style={{ borderColor: platform.color }}
                  >
                    {content.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* キーワード */}
          {result.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* 更新日時 */}
          {result.generated_at && (
            <div className="text-xs text-gray-400 mt-3">
              {formatRelativeTime(result.generated_at)} に分析
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">
            {analysis?.status === 'processing' ? '分析中...' : 'まだ分析データがありません'}
          </p>
        </div>
      )}
    </div>
  );
}

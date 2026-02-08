'use client';

import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Users,
  CheckCircle2,
  Youtube,
  Code2,
  BookOpen,
  StickyNote,
  Tag,
} from 'lucide-react';
import type { DetailedAnalysisResult } from '@/types/analysis';
import type { Platform } from '@/types/common';

interface DetailedReportProps {
  result: DetailedAnalysisResult;
  generatedAt: string;
}

const PLATFORM_ICONS: Record<Platform, typeof Youtube> = {
  youtube: Youtube,
  qiita: Code2,
  zenn: BookOpen,
  note: StickyNote,
};

const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: '#FF0000',
  qiita: '#55C500',
  zenn: '#3EA8FF',
  note: '#41C9B4',
};

function PlatformBadge({ platform }: { platform: Platform }) {
  const Icon = PLATFORM_ICONS[platform];
  const color = PLATFORM_COLORS[platform];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      <Icon className="w-3 h-3" />
      {platform}
    </span>
  );
}

export default function DetailedReport({ result, generatedAt }: DetailedReportProps) {
  return (
    <div className="space-y-8">
      {/* 生成日時 */}
      <p className="text-sm text-gray-400">
        {new Date(generatedAt).toLocaleString('ja-JP')} に生成
      </p>

      {/* トレンド分析 */}
      <section className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#FF0000]" />
          トレンド分析
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {result.trend_analysis.summary}
        </p>

        {result.trend_analysis.rising_topics.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              上昇トピック
            </h3>
            <div className="space-y-3">
              {result.trend_analysis.rising_topics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-2 px-3 rounded-lg bg-green-50 dark:bg-green-900/10"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{topic.topic}</div>
                    <div className="text-xs text-gray-500 mt-1">成長率: {topic.growth}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {topic.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.trend_analysis.declining_topics.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              下降トピック
            </h3>
            <div className="space-y-3">
              {result.trend_analysis.declining_topics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-red-50 dark:bg-red-900/10"
                >
                  <span className="font-medium text-sm flex-1">{topic.topic}</span>
                  <span className="text-xs text-gray-500">{topic.decline}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ネタ提案 */}
      <section className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          ネタ提案
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.content_ideas.map((idea, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm">{idea.title}</h3>
                <PlatformBadge platform={idea.platform_recommendation} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {idea.reason}
              </p>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">
                ポテンシャル: {idea.estimated_potential}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 競合分析 */}
      <section className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          競合分析
        </h2>

        {result.competitor_analysis.top_performers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              トップパフォーマー
            </h3>
            <div className="space-y-2">
              {result.competitor_analysis.top_performers.map((performer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <PlatformBadge platform={performer.platform} />
                  <span className="font-medium text-sm flex-1">{performer.name}</span>
                  <span className="text-xs text-gray-500">{performer.stats}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.competitor_analysis.posting_patterns && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              投稿パターン
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {result.competitor_analysis.posting_patterns}
            </p>
          </div>
        )}

        {result.competitor_analysis.common_tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              よく使われるタグ
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.competitor_analysis.common_tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* レコメンデーション */}
      {result.recommendations.length > 0 && (
        <section className="card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            レコメンデーション
          </h2>
          <ol className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

'use client';

/**
 * プラットフォーム共通ユーザーカード
 * Qiita / Zenn / note のユーザー情報表示を統合
 */

import Image from 'next/image';
import { ExternalLink, Users } from 'lucide-react';
import { PLATFORM_META } from '@/lib/platform-config';
import type { Platform } from '@/types/common';
import { formatJapaneseNumber } from '@/lib/format-utils';

export interface UserStat {
  label: string;
  value: number;
}

interface PlatformUserCardProps {
  platform: Platform;
  name: string;
  handle: string;
  avatarUrl?: string;
  stats: UserStat[];
  profileUrl: string;
}

export default function PlatformUserCard({
  platform,
  name,
  handle,
  avatarUrl,
  stats,
  profileUrl,
}: PlatformUserCardProps) {
  const { color, linkLabel } = PLATFORM_META[platform];

  const handleOpenProfile = () => {
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* アバター */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* ユーザー情報 */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
            <h2 className="text-2xl font-bold">{name}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              @{handle}
            </span>
          </div>

          {/* 統計 */}
          <div className="flex items-center justify-center sm:justify-start gap-6 mb-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 text-sm">
                <span className="font-medium" style={{ color }}>
                  {formatJapaneseNumber(stat.value)}
                </span>
                <span className="text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* 外部リンク */}
          <button
            onClick={handleOpenProfile}
            className="inline-flex items-center gap-1 text-sm hover:underline transition-colors"
            style={{ color }}
          >
            <ExternalLink className="w-4 h-4" />
            {linkLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

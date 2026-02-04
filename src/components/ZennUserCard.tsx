'use client';

import Image from 'next/image';
import { ExternalLink, FileText, Users } from 'lucide-react';
import { ZennUser } from '@/types/zenn';
import { formatJapaneseNumber } from '@/lib/format-utils';

interface ZennUserCardProps {
  user: ZennUser;
}

export default function ZennUserCard({ user }: ZennUserCardProps) {
  const handleOpenZenn = () => {
    window.open(
      `https://zenn.dev/${user.username}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* アバター */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name}
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
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              @{user.username}
            </span>
          </div>

          {/* 統計 */}
          <div className="flex items-center justify-center sm:justify-start gap-6 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-[#3EA8FF]" />
              <span className="font-medium">
                {formatJapaneseNumber(user.articles_count)}
              </span>
              <span className="text-gray-500">記事</span>
            </div>
          </div>

          {/* 外部リンク */}
          <button
            onClick={handleOpenZenn}
            className="inline-flex items-center gap-1 text-sm text-[#3EA8FF] hover:underline transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Zennで見る
          </button>
        </div>
      </div>
    </div>
  );
}

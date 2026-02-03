'use client';

import { Share2 } from 'lucide-react';
import { YouTubeChannel, YouTubeVideo } from '@/types';
import { trackShare } from '@/lib/tracking';

interface ShareButtonProps {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
}

export default function ShareButton({ channel, videos }: ShareButtonProps) {
  const handleShare = () => {
    // 最高再生数を取得
    const maxViews = videos.length > 0
      ? Math.max(...videos.map(v => v.viewCount))
      : 0;

    // シェアテキストを生成
    const shareText = generateShareText(channel.title, maxViews);

    // 現在のページURLを取得
    const url = typeof window !== 'undefined' ? window.location.href : '';

    // X（Twitter）シェアURLを生成
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}&hashtags=PrepFeed`;

    // アナリティクストラッキング
    trackShare(channel.title, 'twitter');

    // 新しいウィンドウで開く
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <Share2 className="w-4 h-4" />
      <span>Xでシェア</span>
    </button>
  );
}

/**
 * シェアテキストを生成
 */
function generateShareText(channelName: string, maxViews: number): string {
  const formattedViews = formatNumber(maxViews);

  return `「${channelName}」を分析しました！\n最高再生数：${formattedViews}回`;
}

/**
 * 数値フォーマット
 */
function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}億`;
  }
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)}千万`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}
import { YouTubeVideo, SortType, SortOrder } from '@/types';

/**
 * 動画リストをソートする
 */
export function sortVideos(
  videos: YouTubeVideo[],
  sortType: SortType,
  sortOrder: SortOrder
): YouTubeVideo[] {
  const sortedVideos = [...videos].sort((a, b) => {
    let comparison = 0;

    switch (sortType) {
      case 'views':
        comparison = a.viewCount - b.viewCount;
        break;

      case 'date':
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        comparison = dateA - dateB;
        break;

      case 'growth':
        const growthA = a.growthRate || 0;
        const growthB = b.growthRate || 0;
        comparison = growthA - growthB;
        break;

      case 'comments':
        comparison = (a.commentRate || 0) - (b.commentRate || 0);
        break;

      case 'likes':
        comparison = (a.likeRate || 0) - (b.likeRate || 0);
        break;

      default:
        comparison = 0;
    }

    // ソート順序を適用
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sortedVideos;
}

/**
 * ソートタイプの表示名を取得
 */
export function getSortDisplayName(sortType: SortType): string {
  const sortNames: Record<SortType, string> = {
    views: '再生数',
    date: '投稿日',
    growth: '伸び率',
    comments: 'コメント率',
    likes: 'いいね率',
    stocks: 'ストック数',
  };

  return sortNames[sortType] || '不明';
}

/**
 * ソート順序の表示名を取得
 */
export function getSortOrderDisplayName(
  sortType: SortType,
  sortOrder: SortOrder
): string {
  if (sortType === 'date') {
    return sortOrder === 'desc' ? '新しい順' : '古い順';
  }

  return sortOrder === 'desc' ? '高い順' : '低い順';
}

/**
 * デフォルトのソート順序を取得
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDefaultSortOrder(_sortType: SortType): SortOrder {
  // 投稿日は新しい順がデフォルト、それ以外は高い順がデフォルト
  return 'desc';
}
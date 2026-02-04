import { QiitaArticle } from '@/types/qiita';
import { ZennArticle } from '@/types/zenn';

export type ArticleSortType = 'likes' | 'date' | 'stocks' | 'growth';
export type ArticleSortOrder = 'asc' | 'desc';

type Article = QiitaArticle | ZennArticle;

/**
 * いいね数を取得（プラットフォームごとにフィールド名が異なる）
 */
function getLikesCount(article: Article): number {
  if ('likes_count' in article) return article.likes_count;
  if ('liked_count' in article) return article.liked_count;
  return 0;
}

/**
 * ストック数を取得（Qiitaのみ）
 */
function getStocksCount(article: Article): number {
  if ('stocks_count' in article) return article.stocks_count;
  return 0;
}

/**
 * 記事リストをソートする
 */
export function sortArticles<T extends Article>(
  articles: T[],
  sortType: ArticleSortType,
  sortOrder: ArticleSortOrder
): T[] {
  const sorted = [...articles].sort((a, b) => {
    let comparison = 0;

    switch (sortType) {
      case 'likes':
        comparison = getLikesCount(a) - getLikesCount(b);
        break;

      case 'date': {
        const dateA = new Date(a.published_at).getTime();
        const dateB = new Date(b.published_at).getTime();
        comparison = dateA - dateB;
        break;
      }

      case 'stocks':
        comparison = getStocksCount(a) - getStocksCount(b);
        break;

      case 'growth':
        comparison = (a.growth_rate || 0) - (b.growth_rate || 0);
        break;

      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * ソートタイプの表示名を取得
 */
export function getArticleSortDisplayName(sortType: ArticleSortType): string {
  const names: Record<ArticleSortType, string> = {
    likes: 'いいね数',
    date: '投稿日',
    stocks: 'ストック数',
    growth: '伸び率',
  };
  return names[sortType] || '不明';
}

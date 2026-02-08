/**
 * 記事メトリクス計算 共通ユーティリティ
 * Qiita/Zenn/noteの各APIクライアントで使用
 */

/**
 * 公開日からの経過日数と、1日あたりのいいね増加率を計算
 */
export function calculateArticleMetrics(
  likeCount: number,
  publishedAt: string
): { daysFromPublished: number; growthRate: number } {
  const daysFromPublished = publishedAt
    ? Math.floor(
        (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  const growthRate =
    daysFromPublished > 0
      ? Number((likeCount / daysFromPublished).toFixed(2))
      : likeCount;

  return { daysFromPublished, growthRate };
}

/**
 * 数字を日本語形式（万、億）にフォーマット
 * @param num 数値
 * @param decimals 小数点以下の桁数（デフォルト: 1）
 * @returns フォーマットされた文字列
 */
export function formatJapaneseNumber(num: number, decimals: number = 1): string {
  if (num == null || isNaN(num)) return '0';
  if (num >= 100000000) {
    // 1億以上
    const value = num / 100000000;
    return value % 1 === 0
      ? `${Math.floor(value)}億`
      : `${value.toFixed(decimals)}億`;
  } else if (num >= 10000) {
    // 1万以上
    const value = num / 10000;
    return value % 1 === 0
      ? `${Math.floor(value)}万`
      : `${value.toFixed(decimals)}万`;
  } else {
    // 1万未満
    return num.toLocaleString();
  }
}

/**
 * 数字を日本語形式（万、億）にフォーマット（人を付ける）
 * @param num 数値
 * @returns フォーマットされた文字列
 */
export function formatJapaneseSubscribers(num: number): string {
  return `${formatJapaneseNumber(num)}人`;
}

/**
 * 数字を日本語形式（万、億）にフォーマット（回を付ける）
 * @param num 数値
 * @returns フォーマットされた文字列
 */
export function formatJapaneseViews(num: number): string {
  return `${formatJapaneseNumber(num)}回`;
}

/**
 * 日時を相対時間の日本語テキストに変換
 * @param dateStr ISO 8601形式の日時文字列
 * @returns 相対時間の文字列（例: 「たった今」「5分前」「3日前」）
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'たった今';
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 30) return `${diffDay}日前`;
  return date.toLocaleDateString('ja-JP');
}

/**
 * アナリティクストラッキングユーティリティ
 * Vercel Analyticsのカスタムイベント送信
 */

import { track } from '@vercel/analytics';

/**
 * チャンネル検索イベント
 */
export function trackChannelSearch(query: string, resultCount: number) {
  track('channel_search', {
    query: query.substring(0, 50), // 最初の50文字のみ
    result_count: resultCount,
  });
}

/**
 * チャンネル詳細表示イベント
 */
export function trackChannelView(channelId: string, channelName: string) {
  track('channel_view', {
    channel_id: channelId,
    channel_name: channelName.substring(0, 50),
  });
}

/**
 * ソート変更イベント
 */
export function trackSortChange(sortType: string) {
  track('sort_change', {
    sort_type: sortType,
  });
}

/**
 * シェアボタンクリックイベント
 */
export function trackShare(channelName: string, platform: 'twitter' = 'twitter') {
  track('share_click', {
    channel_name: channelName.substring(0, 50),
    platform,
  });
}

/**
 * エラー発生イベント
 */
export function trackError(errorType: string, errorMessage: string) {
  track('error_occurred', {
    error_type: errorType,
    error_message: errorMessage.substring(0, 100),
  });
}

/**
 * API制限到達イベント
 */
export function trackAPILimit(endpoint: string) {
  track('api_limit_reached', {
    endpoint,
  });
}

/**
 * ページビューイベント（自動で送信されるが、カスタムデータを追加する場合に使用）
 */
export function trackPageView(path: string, referrer?: string) {
  const data: Record<string, string> = { path };
  if (referrer) {
    data.referrer = referrer.substring(0, 100);
  }
  track('page_view', data);
}

// ─── Phase 2 トラッキング ───

/**
 * 監視設定作成イベント
 */
export function trackMonitorCreated(platform: string, type: string) {
  track('monitor_created', { platform, type });
}

/**
 * 詳細分析実行イベント
 */
export function trackDetailedAnalysis(status: 'started' | 'completed' | 'failed') {
  track('detailed_analysis', { status });
}

/**
 * バッチ処理完了イベント
 */
export function trackBatchComplete(
  succeeded: number,
  failed: number,
  skipped: number
) {
  track('batch_complete', {
    succeeded: String(succeeded),
    failed: String(failed),
    skipped: String(skipped),
  });
}

/**
 * 手動バッチ実行イベント
 */
export function trackManualBatch(settingsCount: number) {
  track('manual_batch', {
    settings_count: String(settingsCount),
  });
}

/**
 * プラットフォーム別検索イベント
 */
export function trackPlatformSearch(
  platform: string,
  searchType: string,
  resultCount: number
) {
  track('platform_search', {
    platform,
    search_type: searchType,
    result_count: String(resultCount),
  });
}
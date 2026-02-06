/**
 * データ収集ユーティリティ
 * バッチ処理用の collected_data Upsert / fetch_logs 記録
 * Supabase クライアントを引数で受け取り、Admin Client と通常 Client の両方に対応
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Platform, FetchLogStatus } from '@/types/common';
import type { CollectedDataInsert } from '@/lib/monitor';

/**
 * collected_data に差分更新（Upsert）
 * ユニーク制約 (user_id, setting_id, content_id) で競合時は更新
 */
export async function upsertCollectedData(
  supabase: SupabaseClient,
  data: CollectedDataInsert[]
): Promise<{ count: number }> {
  if (data.length === 0) {
    return { count: 0 };
  }

  const { error } = await supabase
    .from('collected_data')
    .upsert(data, {
      onConflict: 'user_id,setting_id,content_id',
    });

  if (error) {
    throw new Error(`データ保存エラー: ${error.message}`);
  }

  return { count: data.length };
}

/**
 * 監視設定の last_fetched_at を更新
 */
export async function updateLastFetchedAt(
  supabase: SupabaseClient,
  settingId: string
): Promise<void> {
  await supabase
    .from('monitor_settings')
    .update({ last_fetched_at: new Date().toISOString() })
    .eq('id', settingId);
}

/**
 * fetch_logs にバッチ実行結果を記録
 * ログ記録失敗は本処理に影響させない
 */
export async function recordBatchFetchLog(
  supabase: SupabaseClient,
  userId: string,
  settingId: string,
  platform: Platform,
  status: FetchLogStatus,
  recordsCount?: number,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase.from('fetch_logs').insert({
    user_id: userId,
    setting_id: settingId,
    platform,
    status,
    records_count: recordsCount,
    error_message: errorMessage,
  });

  if (error) {
    console.error('[DataCollector] Failed to record fetch log:', error.message);
  }
}

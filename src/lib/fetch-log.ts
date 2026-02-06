/**
 * 取得ログ ユーティリティ
 * fetch_logs テーブルの読み書き
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Platform, FetchLogStatus } from '@/types/common';
import type { FetchLog } from '@/types/monitor';

interface GetUserLogsOptions {
  page?: number;
  limit?: number;
  platform?: Platform;
  status?: FetchLogStatus;
}

interface PaginatedLogs {
  logs: FetchLog[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * ログレコードを作成
 */
export async function createFetchLog(
  supabase: SupabaseClient,
  log: {
    user_id: string;
    setting_id: string;
    platform: Platform;
    status: FetchLogStatus;
    records_count?: number;
    error_message?: string;
  }
): Promise<void> {
  const { error } = await supabase.from('fetch_logs').insert(log);

  if (error) {
    console.error('[FetchLog] Failed to create log:', error.message);
  }
}

/**
 * ユーザーのログを取得（ページネーション・フィルタ対応）
 */
export async function getUserLogs(
  supabase: SupabaseClient,
  userId: string,
  options: GetUserLogsOptions = {}
): Promise<PaginatedLogs> {
  const { page = 1, limit = 20, platform, status } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('fetch_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (platform) {
    query = query.eq('platform', platform);
  }

  if (status) {
    query = query.eq('status', status);
  }

  query = query
    .order('executed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`ログの取得に失敗: ${error.message}`);
  }

  const totalCount = count ?? 0;

  return {
    logs: (data as FetchLog[]) || [],
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
}

/**
 * 最新N件のログを取得
 */
export async function getRecentLogs(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 5
): Promise<FetchLog[]> {
  const { data, error } = await supabase
    .from('fetch_logs')
    .select('*')
    .eq('user_id', userId)
    .order('executed_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`ログの取得に失敗: ${error.message}`);
  }

  return (data as FetchLog[]) || [];
}

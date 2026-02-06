/**
 * バッチ処理プロセッサ
 * 全アクティブ監視設定のデータ取得 + 簡易分析を実行
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  fetchPlatformData,
  transformYouTubeData,
  transformQiitaData,
  transformZennData,
} from '@/lib/monitor';
import {
  upsertCollectedData,
  updateLastFetchedAt,
  recordBatchFetchLog,
} from '@/lib/data-collector';
import { runSimpleAnalysis } from '@/lib/analysis';
import type { MonitorSetting } from '@/types/monitor';
import type { CollectedData } from '@/types/collected-data';
import type { CollectedDataInsert } from '@/lib/monitor';
import type { YouTubeVideo } from '@/types';
import type { QiitaArticle } from '@/types/qiita';
import type { ZennArticle } from '@/types/zenn';

const DELAY_BETWEEN_SETTINGS_MS = 1000;
const TIME_BUDGET_MARGIN_MS = 10_000;

export interface BatchResult {
  totalSettings: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  errors: { settingId: string; error: string }[];
}

/**
 * 全アクティブ監視設定を処理
 * @param timeBudgetMs 処理に使える最大時間（ミリ秒）
 */
export async function processAllSettings(
  timeBudgetMs: number = 50_000
): Promise<BatchResult> {
  const startTime = Date.now();
  const supabase = createAdminClient();

  const result: BatchResult = {
    totalSettings: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // 全アクティブ監視設定を取得
  const { data: settings, error } = await supabase
    .from('monitor_settings')
    .select('*')
    .eq('is_active', true)
    .order('user_id')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`監視設定の取得に失敗: ${error.message}`);
  }

  if (!settings || settings.length === 0) {
    console.log('[Batch] アクティブな監視設定がありません');
    return result;
  }

  result.totalSettings = settings.length;
  console.log(`[Batch] ${settings.length}件の監視設定を処理開始`);

  // 各設定を直列で処理（APIレートリミット対策）
  for (const setting of settings as MonitorSetting[]) {
    // 時間予算チェック
    const elapsed = Date.now() - startTime;
    if (elapsed > timeBudgetMs - TIME_BUDGET_MARGIN_MS) {
      const remaining = settings.length - result.processed;
      result.skipped = remaining;
      console.log(
        `[Batch] 時間予算超過、残り${remaining}件をスキップ (${elapsed}ms経過)`
      );
      break;
    }

    try {
      await processSetting(supabase, setting);
      result.succeeded++;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '不明なエラー';
      console.error(
        `[Batch] 設定 ${setting.id} (${setting.platform}/${setting.value}) エラー:`,
        errorMessage
      );
      result.failed++;
      result.errors.push({ settingId: setting.id, error: errorMessage });
    }

    result.processed++;

    // レートリミット対策: 設定間にディレイ
    if (result.processed < settings.length) {
      await delay(DELAY_BETWEEN_SETTINGS_MS);
    }
  }

  console.log(
    `[Batch] 完了: ${result.succeeded}成功 / ${result.failed}失敗 / ${result.skipped}スキップ (${Date.now() - startTime}ms)`
  );

  return result;
}

/**
 * 特定ユーザーの全アクティブ設定を処理
 * 手動バッチ実行用
 */
export async function processUserSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<BatchResult> {
  const result: BatchResult = {
    totalSettings: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  const { data: settings, error } = await supabase
    .from('monitor_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`監視設定の取得に失敗: ${error.message}`);
  }

  if (!settings || settings.length === 0) {
    return result;
  }

  result.totalSettings = settings.length;

  for (const setting of settings as MonitorSetting[]) {
    try {
      await processSetting(supabase, setting);
      result.succeeded++;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '不明なエラー';
      console.error(
        `[Batch] 設定 ${setting.id} エラー:`,
        errorMessage
      );
      result.failed++;
      result.errors.push({ settingId: setting.id, error: errorMessage });
    }

    result.processed++;

    if (result.processed < settings.length) {
      await delay(DELAY_BETWEEN_SETTINGS_MS);
    }
  }

  return result;
}

/**
 * 1件の監視設定を処理
 * データ取得 → Upsert → 簡易分析 → 結果保存
 */
async function processSetting(
  supabase: SupabaseClient,
  setting: MonitorSetting
): Promise<void> {
  const userId = setting.user_id;

  // 1. プラットフォーム API でデータ取得
  const rawData = await fetchPlatformData(
    setting.platform,
    setting.type,
    setting.value,
    setting.fetch_count
  );

  if (rawData.length === 0) {
    await recordBatchFetchLog(
      supabase,
      userId,
      setting.id,
      setting.platform,
      'success',
      0
    );
    return;
  }

  // 2. CollectedData 形式に変換
  let collectedData: CollectedDataInsert[];
  switch (setting.platform) {
    case 'youtube':
      collectedData = transformYouTubeData(
        rawData as YouTubeVideo[],
        userId,
        setting.id
      );
      break;
    case 'qiita':
      collectedData = transformQiitaData(
        rawData as QiitaArticle[],
        userId,
        setting.id
      );
      break;
    case 'zenn':
      collectedData = transformZennData(
        rawData as ZennArticle[],
        userId,
        setting.id
      );
      break;
  }

  // 3. collected_data に Upsert
  await upsertCollectedData(supabase, collectedData);

  // 4. last_fetched_at を更新
  await updateLastFetchedAt(supabase, setting.id);

  // 5. fetch_logs に記録
  await recordBatchFetchLog(
    supabase,
    userId,
    setting.id,
    setting.platform,
    'success',
    collectedData.length
  );

  // 6. 簡易分析を実行
  try {
    await runSimpleAnalysisForSetting(supabase, setting, userId);
  } catch (analysisError) {
    // 簡易分析の失敗はデータ収集の成功に影響させない
    console.error(
      `[Batch] 簡易分析エラー (${setting.id}):`,
      analysisError instanceof Error ? analysisError.message : analysisError
    );
  }
}

/**
 * 監視設定の簡易分析を実行し、結果を保存
 * 既存の分析結果があれば更新、なければ新規作成
 */
async function runSimpleAnalysisForSetting(
  supabase: SupabaseClient,
  setting: MonitorSetting,
  userId: string
): Promise<void> {
  // 収集データを取得
  const { data: collected } = await supabase
    .from('collected_data')
    .select('*')
    .eq('setting_id', setting.id)
    .eq('user_id', userId);

  if (!collected || collected.length === 0) {
    return;
  }

  const analysisResult = await runSimpleAnalysis(
    setting.id,
    setting,
    collected as CollectedData[]
  );

  // 既存の simple 分析結果を確認
  const { data: existing } = await supabase
    .from('analysis_results')
    .select('id')
    .eq('setting_id', setting.id)
    .eq('user_id', userId)
    .eq('analysis_type', 'simple')
    .single();

  if (existing) {
    // 既存を更新
    await supabase
      .from('analysis_results')
      .update({
        result: analysisResult,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    // 新規作成
    await supabase.from('analysis_results').insert({
      user_id: userId,
      setting_id: setting.id,
      analysis_type: 'simple',
      status: 'completed',
      result: analysisResult,
      completed_at: new Date().toISOString(),
    });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

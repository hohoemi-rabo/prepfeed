/**
 * バックグラウンドジョブ管理
 * 詳細分析ジョブの作成・ステータス更新・取得を抽象化
 * 将来的な Cloudflare Workers Queue 等への移行を見据えた設計
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { JobStatus } from '@/types/common';

interface AnalysisJobRecord {
  id: string;
  user_id: string;
  analysis_id: string;
  job_type: string;
  status: JobStatus;
  priority: number;
  started_at: string | null;
  completed_at: string | null;
}

/**
 * analysis_results に pending レコードを作成
 */
export async function createAnalysisRecord(
  supabase: SupabaseClient,
  userId: string,
  analysisType: 'simple' | 'detailed'
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('analysis_results')
    .insert({
      user_id: userId,
      analysis_type: analysisType,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`分析レコードの作成に失敗: ${error?.message}`);
  }

  return { id: data.id };
}

/**
 * analysis_jobs に queued レコードを作成
 */
export async function createAnalysisJob(
  supabase: SupabaseClient,
  userId: string,
  analysisId: string,
  jobType: string = 'detailed'
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .insert({
      user_id: userId,
      analysis_id: analysisId,
      job_type: jobType,
      status: 'queued',
      priority: 0,
      payload: {},
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`ジョブの作成に失敗: ${error?.message}`);
  }

  return { id: data.id };
}

/**
 * ジョブステータスを更新
 */
export async function updateJobStatus(
  supabase: SupabaseClient,
  jobId: string,
  status: JobStatus,
  errorMessage?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };

  if (status === 'processing') {
    update.started_at = new Date().toISOString();
  }

  if (status === 'completed' || status === 'failed') {
    update.completed_at = new Date().toISOString();
  }

  await supabase
    .from('analysis_jobs')
    .update(update)
    .eq('id', jobId);

  // analysis_results のステータスも同期更新
  const { data: job } = await supabase
    .from('analysis_jobs')
    .select('analysis_id')
    .eq('id', jobId)
    .single();

  if (job) {
    const resultUpdate: Record<string, unknown> = { status };
    if (status === 'completed') {
      resultUpdate.completed_at = new Date().toISOString();
    }
    if (status === 'failed' && errorMessage) {
      resultUpdate.error_message = errorMessage;
    }

    await supabase
      .from('analysis_results')
      .update(resultUpdate)
      .eq('id', job.analysis_id);
  }
}

/**
 * ジョブステータスを取得
 */
export async function getJobStatus(
  supabase: SupabaseClient,
  jobId: string
): Promise<AnalysisJobRecord | null> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    return null;
  }

  return data as AnalysisJobRecord;
}

/**
 * 処理中の詳細分析ジョブが存在するかチェック
 */
export async function hasActiveDetailedJob(
  supabase: SupabaseClient,
  userId: string
): Promise<{ active: boolean; analysisId?: string }> {
  const { data } = await supabase
    .from('analysis_results')
    .select('id')
    .eq('user_id', userId)
    .eq('analysis_type', 'detailed')
    .in('status', ['pending', 'processing'])
    .limit(1);

  if (data && data.length > 0) {
    return { active: true, analysisId: data[0].id };
  }

  return { active: false };
}

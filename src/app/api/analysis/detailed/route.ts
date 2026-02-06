/**
 * 詳細分析リクエスト API
 * POST /api/analysis/detailed
 *
 * バックグラウンドジョブとして詳細分析を起動し、即座に 202 Accepted を返す
 */

import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createClient } from '@/lib/supabase/server';
import { runDetailedAnalysis } from '@/lib/analysis';
import {
  createAnalysisRecord,
  createAnalysisJob,
  hasActiveDetailedJob,
} from '@/lib/background-jobs';

export async function POST() {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    // 既に処理中の詳細分析がないかチェック
    const { active, analysisId: existingId } = await hasActiveDetailedJob(
      supabase,
      user.id
    );

    if (active) {
      return NextResponse.json(
        {
          error: '既に分析が実行中です。完了後に再度お試しください。',
          analysisId: existingId,
        },
        { status: 409 }
      );
    }

    // analysis_results に pending レコード作成
    const analysisRecord = await createAnalysisRecord(
      supabase,
      user.id,
      'detailed'
    );

    // analysis_jobs に queued レコード作成
    let jobRecord: { id: string };
    try {
      jobRecord = await createAnalysisJob(
        supabase,
        user.id,
        analysisRecord.id
      );
    } catch (jobError) {
      console.error(
        '[Detailed Analysis API] Job creation error:',
        jobError instanceof Error ? jobError.message : jobError
      );
      // ジョブ未作成のため analysis_results を直接 failed に更新
      await supabase
        .from('analysis_results')
        .update({ status: 'failed', error_message: 'ジョブの作成に失敗しました' })
        .eq('id', analysisRecord.id);
      return NextResponse.json(
        { error: 'ジョブの作成に失敗しました' },
        { status: 500 }
      );
    }

    // バックグラウンドで詳細分析を実行
    waitUntil(
      runDetailedAnalysis(user.id, analysisRecord.id, jobRecord.id)
    );

    // 即座に 202 Accepted を返却
    return NextResponse.json(
      {
        analysisId: analysisRecord.id,
        jobId: jobRecord.id,
        status: 'queued',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[Detailed Analysis API] Error:', error);
    return NextResponse.json(
      { error: '詳細分析のリクエスト中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

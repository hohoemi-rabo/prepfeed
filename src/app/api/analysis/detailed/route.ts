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
    const { data: existingJobs } = await supabase
      .from('analysis_results')
      .select('id')
      .eq('user_id', user.id)
      .eq('analysis_type', 'detailed')
      .in('status', ['pending', 'processing'])
      .limit(1);

    if (existingJobs && existingJobs.length > 0) {
      return NextResponse.json(
        {
          error: '既に分析が実行中です。完了後に再度お試しください。',
          analysisId: existingJobs[0].id,
        },
        { status: 409 }
      );
    }

    // analysis_results に pending レコード作成
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('analysis_results')
      .insert({
        user_id: user.id,
        analysis_type: 'detailed',
        status: 'pending',
      })
      .select('id')
      .single();

    if (analysisError || !analysisRecord) {
      console.error('[Detailed Analysis API] Insert analysis error:', analysisError?.message);
      return NextResponse.json(
        { error: '分析レコードの作成に失敗しました' },
        { status: 500 }
      );
    }

    // analysis_jobs に queued レコード作成
    const { data: jobRecord, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert({
        user_id: user.id,
        analysis_id: analysisRecord.id,
        job_type: 'detailed',
        status: 'queued',
        priority: 0,
        payload: {},
      })
      .select('id')
      .single();

    if (jobError || !jobRecord) {
      console.error('[Detailed Analysis API] Insert job error:', jobError?.message);
      // 分析レコードを failed に更新
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

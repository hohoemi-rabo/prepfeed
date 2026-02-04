/**
 * 分析ステータス確認 API
 * GET /api/analysis/status/[id]
 *
 * フロントエンドからのポーリング用
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '分析IDが必要です' },
        { status: 400 }
      );
    }

    // 分析結果のステータスを取得
    const { data: analysis, error } = await supabase
      .from('analysis_results')
      .select('id, status, result, error_message, created_at, completed_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '分析結果が見つかりません' },
          { status: 404 }
        );
      }
      console.error('[Analysis Status API] DB Error:', error.message);
      return NextResponse.json(
        { error: 'ステータスの取得に失敗しました' },
        { status: 500 }
      );
    }

    // completed の場合は result も返す
    const response: Record<string, unknown> = {
      status: analysis.status,
      created_at: analysis.created_at,
    };

    if (analysis.status === 'completed') {
      response.result = analysis.result;
      response.completed_at = analysis.completed_at;
    }

    if (analysis.status === 'failed') {
      response.error_message = analysis.error_message;
    }

    return NextResponse.json(response, {
      headers: {
        // ポーリング用のためキャッシュしない
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Analysis Status API] Error:', error);
    return NextResponse.json(
      { error: 'ステータスの確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

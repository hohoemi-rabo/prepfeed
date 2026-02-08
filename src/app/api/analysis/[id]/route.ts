/**
 * 分析結果詳細 API
 * GET /api/analysis/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '分析IDが必要です' },
        { status: 400 }
      );
    }

    // 分析結果を取得（result JSONB含む）
    const { data: result, error } = await supabase
      .from('analysis_results')
      .select('*')
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
      console.error('[Analysis Detail API] DB Error:', error.message);
      return NextResponse.json(
        { error: '分析結果の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Analysis Detail API] Error:', error);
    return NextResponse.json(
      { error: '分析結果の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

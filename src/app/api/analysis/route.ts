/**
 * 分析結果一覧 API
 * GET /api/analysis?type=simple|detailed
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import type { AnalysisType } from '@/types/common';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const { supabase, user } = auth;

    // クエリパラメータ
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as AnalysisType | null;

    // 分析結果を取得（type=simple の場合は result も含める）
    const selectFields = type === 'simple'
      ? 'id, user_id, setting_id, analysis_type, status, result, error_message, created_at, completed_at'
      : 'id, user_id, setting_id, analysis_type, status, error_message, created_at, completed_at';

    let query = supabase
      .from('analysis_results')
      .select(selectFields)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (type && (type === 'simple' || type === 'detailed')) {
      query = query.eq('analysis_type', type);
    }

    const { data: results, error } = await query;

    if (error) {
      console.error('[Analysis List API] DB Error:', error.message);
      return NextResponse.json(
        { error: '分析結果の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ results: results || [] });
  } catch (error) {
    console.error('[Analysis List API] Error:', error);
    return NextResponse.json(
      { error: '分析結果の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

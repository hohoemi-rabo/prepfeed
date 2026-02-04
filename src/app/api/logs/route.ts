/**
 * 取得ログ一覧 API
 * GET /api/logs?limit=5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '10', 10);
    const limit = Math.min(Math.max(limitParam, 1), 50);

    const { data: logs, error } = await supabase
      .from('fetch_logs')
      .select('id, setting_id, platform, status, records_count, error_message, executed_at')
      .eq('user_id', user.id)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Logs API] DB Error:', error.message);
      return NextResponse.json(
        { error: '取得ログの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error('[Logs API] Error:', error);
    return NextResponse.json(
      { error: '取得ログの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

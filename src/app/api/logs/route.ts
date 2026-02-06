/**
 * 取得ログ一覧 API
 * GET /api/logs?limit=20&page=1&platform=youtube&status=success
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserLogs } from '@/lib/fetch-log';
import type { Platform, FetchLogStatus } from '@/types/common';

const VALID_PLATFORMS: Platform[] = ['youtube', 'qiita', 'zenn'];
const VALID_STATUSES: FetchLogStatus[] = ['success', 'error'];

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

    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.min(Math.max(limitParam, 1), 50);

    const platformParam = searchParams.get('platform');
    const platform =
      platformParam && VALID_PLATFORMS.includes(platformParam as Platform)
        ? (platformParam as Platform)
        : undefined;

    const statusParam = searchParams.get('status');
    const status =
      statusParam && VALID_STATUSES.includes(statusParam as FetchLogStatus)
        ? (statusParam as FetchLogStatus)
        : undefined;

    const result = await getUserLogs(supabase, user.id, {
      page,
      limit,
      platform,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Logs API] Error:', error);
    return NextResponse.json(
      { error: '取得ログの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 取得ログ一覧 API
 * GET /api/logs?limit=20&page=1&platform=youtube&status=success
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { getUserLogs } from '@/lib/fetch-log';
import type { Platform, FetchLogStatus } from '@/types/common';

const VALID_PLATFORMS: Platform[] = ['youtube', 'qiita', 'zenn', 'note'];
const VALID_STATUSES: FetchLogStatus[] = ['success', 'error'];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const { supabase, user } = auth;

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

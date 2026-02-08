/**
 * 手動バッチ実行 API
 * POST /api/batch/manual — ログインユーザー自身の監視設定を手動で再取得+分析
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase/admin';
import { processUserSettings } from '@/lib/batch-processor';

export async function POST() {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;
    const { user } = auth;

    // Admin Client でバッチ処理を実行（RLS バイパスが必要）
    const adminSupabase = createAdminClient();
    const result = await processUserSettings(adminSupabase, user.id);

    return NextResponse.json({
      message: 'バッチ処理が完了しました',
      result,
    });
  } catch (error) {
    console.error('[Manual Batch API] Error:', error);
    return NextResponse.json(
      { error: 'バッチ処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

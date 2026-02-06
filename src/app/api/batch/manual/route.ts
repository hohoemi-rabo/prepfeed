/**
 * 手動バッチ実行 API
 * POST /api/batch/manual — ログインユーザー自身の監視設定を手動で再取得+分析
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { processUserSettings } from '@/lib/batch-processor';

export async function POST() {
  try {
    // 通常の認証チェック（cookieベース）
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

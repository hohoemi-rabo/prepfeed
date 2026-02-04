/**
 * 監視設定 個別操作 API
 * PUT    /api/settings/[id] — 設定更新
 * DELETE /api/settings/[id] — 設定削除
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateFetchCount } from '@/lib/monitor';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '設定IDが必要です' },
        { status: 400 }
      );
    }

    // 自分の設定か確認
    const { data: existing, error: fetchError } = await supabase
      .from('monitor_settings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: '監視設定が見つかりません' },
        { status: 404 }
      );
    }

    // リクエストボディ
    const body = await request.json();
    const { display_name, fetch_count, is_active } = body;

    // 更新対象の構築
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (display_name !== undefined) {
      updates.display_name = display_name?.trim() || null;
    }

    if (fetch_count !== undefined) {
      if (!validateFetchCount(fetch_count)) {
        return NextResponse.json(
          { error: 'fetch_count は 50, 100, 200 のいずれかです' },
          { status: 400 }
        );
      }
      updates.fetch_count = fetch_count;
    }

    if (is_active !== undefined) {
      if (typeof is_active !== 'boolean') {
        return NextResponse.json(
          { error: 'is_active は boolean 値です' },
          { status: 400 }
        );
      }
      updates.is_active = is_active;
    }

    // 更新対象がない場合
    if (Object.keys(updates).length === 1) {
      return NextResponse.json(
        { error: '更新するフィールドがありません' },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('monitor_settings')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('[Settings API] Update Error:', updateError.message);
      return NextResponse.json(
        { error: '監視設定の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ setting: updated });
  } catch (error) {
    console.error('[Settings API] PUT Error:', error);
    return NextResponse.json(
      { error: '監視設定の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '設定IDが必要です' },
        { status: 400 }
      );
    }

    // 自分の設定か確認
    const { data: existing, error: fetchError } = await supabase
      .from('monitor_settings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: '監視設定が見つかりません' },
        { status: 404 }
      );
    }

    // 関連する collected_data を先に削除（FK制約）
    await supabase
      .from('collected_data')
      .delete()
      .eq('setting_id', id)
      .eq('user_id', user.id);

    // 監視設定を削除
    const { error: deleteError } = await supabase
      .from('monitor_settings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[Settings API] Delete Error:', deleteError.message);
      return NextResponse.json(
        { error: '監視設定の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Settings API] DELETE Error:', error);
    return NextResponse.json(
      { error: '監視設定の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

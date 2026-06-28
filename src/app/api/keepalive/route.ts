/**
 * Keepalive API
 * GET /api/keepalive — Vercel Cron から1日1回呼び出される
 *
 * Supabase 無料プランは7日間 DB アクティビティがないと自動で一時停止される。
 * これを防ぐため、軽量な count クエリ（head:true で行データは取得しない）を
 * 投げて実際の DB アクティビティを発生させる。
 *
 * 認証: Vercel Cron が自動付与する `Authorization: Bearer ${CRON_SECRET}` を検証。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// キャッシュさせない（毎回実際に DB へアクセスする必要があるため）
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // CRON_SECRET による認証チェック
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Keepalive API] CRON_SECRET が設定されていません');
    return NextResponse.json(
      { ok: false, error: 'サーバー設定エラー' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { ok: false, error: '認証に失敗しました' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();

    // 軽量クエリ: head:true で行データは転送せず件数のみ取得し DB をピングする。
    // RLS 有効テーブルでも count クエリは Postgres 上で評価されるため、
    // 行が見えなくても「DB アクティビティ」として有効。
    const { error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[Keepalive API] Supabase クエリエラー:', error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      count: count ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Keepalive API] Error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/**
 * バッチ処理 API
 * POST /api/batch — Vercel Cron から呼び出される定期バッチ
 *
 * 毎日 UTC 18:00 (JST 03:00) に実行
 * CRON_SECRET による認証保護
 */

import { NextRequest, NextResponse } from 'next/server';
import { processAllSettings } from '@/lib/batch-processor';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // CRON_SECRET による認証チェック
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Batch API] CRON_SECRET が設定されていません');
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    // maxDuration からマージンを引いた時間予算を設定
    const timeBudgetMs = (maxDuration - 10) * 1000;
    const result = await processAllSettings(timeBudgetMs);

    return NextResponse.json({
      message: 'バッチ処理が完了しました',
      result,
    });
  } catch (error) {
    console.error('[Batch API] Error:', error);
    return NextResponse.json(
      { error: 'バッチ処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

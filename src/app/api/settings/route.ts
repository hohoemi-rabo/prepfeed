/**
 * 監視設定 API
 * GET  /api/settings — 設定一覧取得
 * POST /api/settings — 新規設定作成（初回データ取得含む）
 */

import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createClient } from '@/lib/supabase/server';
import {
  validatePlatformType,
  validateFetchCount,
  fetchInitialData,
} from '@/lib/monitor';
import { runSimpleAnalysis } from '@/lib/analysis';
import type { MonitorSetting } from '@/types/monitor';
import type { CollectedData } from '@/types/collected-data';

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

    // クエリパラメータ
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let query = supabase
      .from('monitor_settings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (active === 'true') {
      query = query.eq('is_active', true);
    } else if (active === 'false') {
      query = query.eq('is_active', false);
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('[Settings API] DB Error:', error.message);
      return NextResponse.json(
        { error: '監視設定の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: settings || [] });
  } catch (error) {
    console.error('[Settings API] GET Error:', error);
    return NextResponse.json(
      { error: '監視設定の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // TODO: プレミアムチェック（現段階では全ユーザーに開放）
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('is_premium')
    //   .eq('id', user.id)
    //   .single();
    //
    // if (!profile?.is_premium) {
    //   return NextResponse.json(
    //     { error: 'この機能は有料プランのみ利用可能です' },
    //     { status: 403 }
    //   );
    // }

    // リクエストボディ
    const body = await request.json();
    const { platform, type, value, display_name, fetch_count } = body;

    // バリデーション: 必須フィールド
    if (!platform || !type || !value) {
      return NextResponse.json(
        { error: 'platform, type, value は必須です' },
        { status: 400 }
      );
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      return NextResponse.json(
        { error: '検索値を入力してください' },
        { status: 400 }
      );
    }

    if (value.length > 200) {
      return NextResponse.json(
        { error: '検索値が長すぎます（200文字以内）' },
        { status: 400 }
      );
    }

    // バリデーション: platform + type 組合せ
    const validation = validatePlatformType(platform, type);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // バリデーション: fetch_count
    const resolvedFetchCount = fetch_count || 50;
    if (!validateFetchCount(resolvedFetchCount)) {
      return NextResponse.json(
        { error: 'fetch_count は 50, 100, 200 のいずれかです' },
        { status: 400 }
      );
    }

    // 監視設定を作成
    const { data: setting, error: insertError } = await supabase
      .from('monitor_settings')
      .insert({
        user_id: user.id,
        platform,
        type,
        value: value.trim(),
        display_name: display_name?.trim() || null,
        fetch_count: resolvedFetchCount,
      })
      .select('*')
      .single();

    if (insertError || !setting) {
      console.error('[Settings API] Insert Error:', insertError?.message);
      return NextResponse.json(
        { error: '監視設定の作成に失敗しました' },
        { status: 500 }
      );
    }

    // 初回データ取得
    const fetchResult = await fetchInitialData(
      setting as MonitorSetting,
      user.id
    );

    // 簡易分析をバックグラウンドで実行（データがある場合のみ）
    if (fetchResult.count > 0) {
      const userId = user.id;
      const settingId = setting.id;

      waitUntil(
        (async () => {
          try {
            const innerSupabase = await createClient();

            // 収集データを取得
            const { data: collectedData } = await innerSupabase
              .from('collected_data')
              .select('*')
              .eq('setting_id', settingId)
              .eq('user_id', userId);

            if (collectedData && collectedData.length > 0) {
              const result = await runSimpleAnalysis(
                settingId,
                setting as MonitorSetting,
                collectedData as CollectedData[]
              );

              // 分析結果を保存
              await innerSupabase.from('analysis_results').insert({
                user_id: userId,
                setting_id: settingId,
                analysis_type: 'simple',
                status: 'completed',
                result,
                completed_at: new Date().toISOString(),
              });
            }
          } catch (err) {
            console.error('[Settings API] Simple analysis error:', err);
          }
        })()
      );
    }

    return NextResponse.json(
      {
        setting,
        initialFetch: {
          count: fetchResult.count,
          error: fetchResult.error || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Settings API] POST Error:', error);
    return NextResponse.json(
      { error: '監視設定の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

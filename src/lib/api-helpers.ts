/**
 * APIルート共通ユーティリティ
 * レート制限・認証・クエリバリデーション・OPTIONSハンドラ
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { createClient } from '@/lib/supabase/server';

/**
 * レート制限チェック
 * 超過時は429レスポンスを返す、OK時はnullを返す
 */
export function checkRateLimit(request: NextRequest): NextResponse | null {
  const clientIp = getClientIp(request);
  if (!apiRateLimiter.checkLimit(clientIp)) {
    const resetTime = apiRateLimiter.getResetTime(clientIp);
    return NextResponse.json(
      {
        error: 'リクエストが多すぎます。しばらく待ってからお試しください。',
        retryAfter: resetTime,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(resetTime),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetTime),
        },
      }
    );
  }
  return null;
}

/**
 * 認証チェック
 * 成功時は { supabase, user } を返す
 * 失敗時は { response: 401 } を返す
 *
 * Usage:
 *   const auth = await requireAuth();
 *   if ('response' in auth) return auth.response;
 *   const { supabase, user } = auth;
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      response: NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      ),
    };
  }

  return { supabase, user };
}

/**
 * 検索クエリバリデーション（'q' パラメータ + 'limit' パラメータ）
 *
 * Usage:
 *   const validated = validateSearchQuery(request);
 *   if ('response' in validated) return validated.response;
 *   const { query, limit } = validated;
 */
export function validateSearchQuery(
  request: NextRequest,
  defaultLimit = 50,
  maxLimit = 100
): { query: string; limit: number } | { response: NextResponse } {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = Math.min(
    Number(searchParams.get('limit')) || defaultLimit,
    maxLimit
  );

  if (!query || query.trim().length === 0) {
    return {
      response: NextResponse.json(
        { error: '検索キーワードが必要です' },
        { status: 400 }
      ),
    };
  }
  if (query.length > 100) {
    return {
      response: NextResponse.json(
        { error: '検索キーワードが長すぎます' },
        { status: 400 }
      ),
    };
  }

  return { query: query.trim(), limit };
}

/**
 * CORS OPTIONS レスポンス
 */
export function optionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

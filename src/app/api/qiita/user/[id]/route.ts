/**
 * Qiita ユーザー記事取得 API
 * GET /api/qiita/user/[id]?limit=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { qiitaClient } from '@/lib/qiita';
import { generateCacheKey, getCachedData } from '@/lib/cache';
import { apiRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { QiitaUserResponse } from '@/types/qiita';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // レート制限
    const clientIp = getClientIp(request);
    if (!apiRateLimiter.checkLimit(clientIp)) {
      const resetTime = apiRateLimiter.getResetTime(clientIp);
      return NextResponse.json(
        {
          error:
            'リクエストが多すぎます。しばらく待ってからお試しください。',
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

    const { id: userId } = await params;

    // バリデーション
    if (!userId || userId.trim().length === 0) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }
    if (userId.length > 100) {
      return NextResponse.json(
        { error: 'ユーザーIDが長すぎます' },
        { status: 400 }
      );
    }

    // クエリパラメータ
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    // キャッシュ（30分TTL）
    const cacheKey = generateCacheKey(
      'qiita-user',
      `${userId.toLowerCase()}-${limit}`
    );

    const response = await getCachedData<QiitaUserResponse>(
      cacheKey,
      async () => {
        const [user, articles] = await Promise.all([
          qiitaClient.getUserInfo(userId),
          qiitaClient.getUserArticles(userId, limit),
        ]);
        return { user, articles };
      },
      30 * 60
    );

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    console.error('[Qiita User API] Error:', errorMessage);

    if (errorMessage.includes('Not found')) {
      return NextResponse.json(
        { error: '指定されたQiitaユーザーが見つかりません' },
        { status: 404 }
      );
    }

    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json(
        {
          error:
            'Qiita APIのレートリミットに達しました。しばらく待ってからお試しください。',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Qiitaユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

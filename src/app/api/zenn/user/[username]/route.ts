/**
 * Zenn ユーザー記事取得 API
 * GET /api/zenn/user/[username]?limit=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { zennClient } from '@/lib/zenn';
import { generateCacheKey, getCachedData } from '@/lib/cache';
import { checkRateLimit, optionsResponse } from '@/lib/api-helpers';
import { ZennUserResponse } from '@/types/zenn';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const rateLimited = checkRateLimit(request);
    if (rateLimited) return rateLimited;

    const { username } = await params;

    // バリデーション
    if (!username || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'ユーザー名が必要です' },
        { status: 400 }
      );
    }
    if (username.length > 100) {
      return NextResponse.json(
        { error: 'ユーザー名が長すぎます' },
        { status: 400 }
      );
    }

    // クエリパラメータ
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    // キャッシュ（30分TTL）
    const cacheKey = generateCacheKey(
      'zenn-user',
      `${username.toLowerCase()}-${limit}`
    );

    const response = await getCachedData<ZennUserResponse>(
      cacheKey,
      async () => {
        const [user, articles] = await Promise.all([
          zennClient.getUserInfo(username),
          zennClient.getUserArticles(username, limit),
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
    console.error('[Zenn User API] Error:', errorMessage);

    if (errorMessage.includes('Not found')) {
      return NextResponse.json(
        { error: '指定されたZennユーザーが見つかりません' },
        { status: 404 }
      );
    }

    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json(
        {
          error:
            'リクエストが多すぎます。しばらく待ってからお試しください。',
        },
        { status: 429 }
      );
    }

    if (errorMessage.includes('レスポンス形式が変更')) {
      return NextResponse.json(
        {
          error:
            'Zenn APIの仕様が変更された可能性があります。しばらくしてからお試しください。',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Zennユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return optionsResponse();
}

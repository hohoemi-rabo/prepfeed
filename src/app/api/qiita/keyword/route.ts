/**
 * Qiita キーワード検索 API
 * GET /api/qiita/keyword?q=React&limit=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { qiitaClient } from '@/lib/qiita';
import { generateCacheKey, getCachedData } from '@/lib/cache';
import { apiRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { QiitaKeywordResponse } from '@/types/qiita';

export async function GET(request: NextRequest) {
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

    // クエリパラメータ
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    // バリデーション
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '検索キーワードが必要です' },
        { status: 400 }
      );
    }
    if (query.length > 100) {
      return NextResponse.json(
        { error: '検索キーワードが長すぎます' },
        { status: 400 }
      );
    }

    // キャッシュ（30分TTL）
    const cacheKey = generateCacheKey(
      'qiita-keyword',
      `${query.toLowerCase().trim()}-${limit}`
    );

    const articles = await getCachedData(
      cacheKey,
      () => qiitaClient.searchArticles(query, limit),
      30 * 60
    );

    const response: QiitaKeywordResponse = {
      articles,
      query,
      count: articles.length,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    console.error('[Qiita Keyword API] Error:', errorMessage);

    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json(
        {
          error:
            'Qiita APIのレートリミットに達しました。しばらく待ってからお試しください。',
        },
        { status: 429 }
      );
    }

    if (
      errorMessage.includes('Invalid') ||
      errorMessage.includes('Bad Request')
    ) {
      return NextResponse.json(
        { error: '無効な検索クエリです' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Qiita記事の検索中にエラーが発生しました' },
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

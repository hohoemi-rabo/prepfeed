/**
 * note.com キーワード検索 API
 * GET /api/note/keyword?q=nextjs&limit=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { noteClient } from '@/lib/note';
import { generateCacheKey, getCachedData } from '@/lib/cache';
import { apiRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { NoteKeywordResponse } from '@/types/note';

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
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 20);

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

    // キャッシュ（60分TTL — note.comへの負荷軽減）
    const cacheKey = generateCacheKey(
      'note-keyword',
      `${query.toLowerCase().trim()}-${limit}`
    );

    const articles = await getCachedData(
      cacheKey,
      () => noteClient.searchArticles(query, limit),
      60 * 60
    );

    const response: NoteKeywordResponse = {
      articles,
      query,
      count: articles.length,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    console.error('[note Keyword API] Error:', errorMessage);

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
            'note.com APIの仕様が変更された可能性があります。しばらくしてからお試しください。',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'note記事の検索中にエラーが発生しました' },
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

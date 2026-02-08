/**
 * Zenn トピック検索 API
 * GET /api/zenn/keyword?q=nextjs&limit=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { zennClient } from '@/lib/zenn';
import { generateCacheKey, getCachedData } from '@/lib/cache';
import { checkRateLimit, validateSearchQuery, optionsResponse } from '@/lib/api-helpers';
import { ZennKeywordResponse } from '@/types/zenn';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request);
    if (rateLimited) return rateLimited;

    const validated = validateSearchQuery(request);
    if ('response' in validated) return validated.response;
    const { query, limit } = validated;

    // キャッシュ（30分TTL）
    const cacheKey = generateCacheKey(
      'zenn-keyword',
      `${query.toLowerCase()}-${limit}`
    );

    const articles = await getCachedData(
      cacheKey,
      () => zennClient.searchArticlesByTopic(query, limit),
      30 * 60
    );

    const response: ZennKeywordResponse = {
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
    console.error('[Zenn Keyword API] Error:', errorMessage);

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
      { error: 'Zenn記事の検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return optionsResponse();
}

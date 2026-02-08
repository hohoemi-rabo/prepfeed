/**
 * Qiita キーワード検索 API
 * GET /api/qiita/keyword?q=React&limit=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { qiitaClient } from '@/lib/qiita';
import { generateCacheKey, getCachedData } from '@/lib/cache';
import { checkRateLimit, validateSearchQuery, optionsResponse } from '@/lib/api-helpers';
import { QiitaKeywordResponse } from '@/types/qiita';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request);
    if (rateLimited) return rateLimited;

    const validated = validateSearchQuery(request);
    if ('response' in validated) return validated.response;
    const { query, limit } = validated;

    // キャッシュ（30分TTL）
    const cacheKey = generateCacheKey(
      'qiita-keyword',
      `${query.toLowerCase()}-${limit}`
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
  return optionsResponse();
}

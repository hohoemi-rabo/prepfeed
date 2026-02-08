/**
 * note.com キーワード検索 API
 * GET /api/note/keyword?q=nextjs&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { noteClient } from '@/lib/note';
import { generateCacheKey, getCachedData } from '@/lib/cache';
import { checkRateLimit, validateSearchQuery, optionsResponse } from '@/lib/api-helpers';
import { NoteKeywordResponse } from '@/types/note';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request);
    if (rateLimited) return rateLimited;

    const validated = validateSearchQuery(request, 20, 20);
    if ('response' in validated) return validated.response;
    const { query, limit } = validated;

    // キャッシュ（60分TTL — note.comへの負荷軽減）
    const cacheKey = generateCacheKey(
      'note-keyword',
      `${query.toLowerCase()}-${limit}`
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
  return optionsResponse();
}

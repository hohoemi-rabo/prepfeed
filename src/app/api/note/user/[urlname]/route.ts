/**
 * note.com ユーザー記事取得 API
 * GET /api/note/user/[urlname]?limit=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { noteClient } from '@/lib/note';
import { generateCacheKey, getCachedData } from '@/lib/cache';
import { checkRateLimit, optionsResponse } from '@/lib/api-helpers';
import { NoteUserResponse } from '@/types/note';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ urlname: string }> }
) {
  const { urlname: rawUrlname } = await params;
  const urlname = decodeURIComponent(rawUrlname);

  try {
    const rateLimited = checkRateLimit(request);
    if (rateLimited) return rateLimited;

    // バリデーション
    if (!urlname || urlname.trim().length === 0) {
      return NextResponse.json(
        { error: 'クリエイター名が必要です' },
        { status: 400 }
      );
    }
    if (urlname.length > 100) {
      return NextResponse.json(
        { error: 'クリエイター名が長すぎます' },
        { status: 400 }
      );
    }

    // クエリパラメータ
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 20);

    // キャッシュ（60分TTL — note.comへの負荷軽減）
    const cacheKey = generateCacheKey(
      'note-user',
      `${urlname.toLowerCase()}-${limit}`
    );

    const response = await getCachedData<NoteUserResponse>(
      cacheKey,
      async () => {
        return noteClient.getUserWithArticles(urlname, limit);
      },
      60 * 60
    );

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    console.error('[note User API] Error:', errorMessage);

    if (errorMessage.includes('Not found')) {
      // クリエイター名で検索して候補を返す
      try {
        const suggestions = await noteClient.searchCreators(urlname);
        if (suggestions.length > 0) {
          return NextResponse.json(
            { error: '指定されたnoteクリエイターが見つかりません', suggestions },
            { status: 404 }
          );
        }
      } catch {
        // 候補検索失敗は無視
      }
      return NextResponse.json(
        { error: '指定されたnoteクリエイターが見つかりません' },
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
            'note.com APIの仕様が変更された可能性があります。しばらくしてからお試しください。',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'noteクリエイター情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return optionsResponse();
}

import { NextRequest, NextResponse } from 'next/server';
import youtubeClient from '@/lib/youtube';
import { ChannelSearchResponse } from '@/types';
import { getCachedData, generateCacheKey } from '@/lib/cache';
import { checkRateLimit, validateSearchQuery, optionsResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request);
    if (rateLimited) return rateLimited;

    const validated = validateSearchQuery(request);
    if ('response' in validated) return validated.response;
    const { query } = validated;

    // キャッシュキーを生成
    const cacheKey = generateCacheKey('search', query.toLowerCase());

    // キャッシュ付きでYouTube APIを呼び出し
    const channels = await getCachedData(
      cacheKey,
      () => youtubeClient.searchChannels(query),
      30 * 60 // 30分
    );

    const response: ChannelSearchResponse = {
      channels,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Search API Error:', error);

    // エラーメッセージの判定
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';

    // API制限エラーの判定
    if (errorMessage.includes('quotaExceeded')) {
      return NextResponse.json(
        { error: '現在アクセスが集中しています。5分後に再度お試しください。' },
        { status: 429 }
      );
    }

    // API キー関連のエラー
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'サーバー設定エラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'チャンネルの検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return optionsResponse();
}

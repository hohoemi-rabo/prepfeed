/**
 * 監視設定ビジネスロジック
 * バリデーション、初回データ取得、データ変換
 */

import { createClient } from '@/lib/supabase/server';
import youtubeClient from '@/lib/youtube';
import { qiitaClient } from '@/lib/qiita';
import { zennClient } from '@/lib/zenn';
import type { Platform, MonitorType, FetchCount, FetchLogStatus } from '@/types/common';
import type { MonitorSetting } from '@/types/monitor';
import type { YouTubeVideo } from '@/types';
import type { QiitaArticle } from '@/types/qiita';
import type { ZennArticle } from '@/types/zenn';

// ─── バリデーション ───

const VALID_PLATFORM_TYPES: Record<Platform, MonitorType[]> = {
  youtube: ['keyword', 'channel'],
  qiita: ['keyword', 'user'],
  zenn: ['keyword', 'user'],
};

/**
 * プラットフォームとタイプの組合せをバリデーション
 */
export function validatePlatformType(
  platform: string,
  type: string
): { valid: boolean; error?: string } {
  if (!['youtube', 'qiita', 'zenn'].includes(platform)) {
    return { valid: false, error: `無効なプラットフォーム: ${platform}` };
  }
  if (!['keyword', 'channel', 'user'].includes(type)) {
    return { valid: false, error: `無効な監視タイプ: ${type}` };
  }

  const allowedTypes = VALID_PLATFORM_TYPES[platform as Platform];
  if (!allowedTypes.includes(type as MonitorType)) {
    return {
      valid: false,
      error: `${platform} では ${type} タイプは使用できません。許可: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * fetch_count のバリデーション
 */
export function validateFetchCount(count: unknown): count is FetchCount {
  return count === 50 || count === 100 || count === 200;
}

// ─── データ変換 ───

export interface CollectedDataInsert {
  user_id: string;
  setting_id: string;
  platform: Platform;
  content_id: string;
  title: string;
  url: string;
  published_at: string;
  author_id?: string;
  author_name?: string;
  views?: number;
  likes?: number;
  comments?: number;
  stocks?: number;
  duration?: string;
  tags?: string[];
  growth_rate?: number;
}

export function transformYouTubeData(
  videos: YouTubeVideo[],
  userId: string,
  settingId: string
): CollectedDataInsert[] {
  return videos.map((v) => ({
    user_id: userId,
    setting_id: settingId,
    platform: 'youtube' as Platform,
    content_id: v.id,
    title: v.title,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    published_at: v.publishedAt,
    author_id: v.channelId,
    author_name: v.channelTitle,
    views: v.viewCount,
    likes: v.likeCount,
    comments: v.commentCount,
    duration: v.duration,
    tags: v.tags,
    growth_rate: v.growthRate,
  }));
}

export function transformQiitaData(
  articles: QiitaArticle[],
  userId: string,
  settingId: string
): CollectedDataInsert[] {
  return articles.map((a) => ({
    user_id: userId,
    setting_id: settingId,
    platform: 'qiita' as Platform,
    content_id: a.id,
    title: a.title,
    url: a.url,
    published_at: a.published_at,
    author_id: a.author_id,
    author_name: a.author_name,
    likes: a.likes_count,
    stocks: a.stocks_count,
    tags: a.tags,
    growth_rate: a.growth_rate,
  }));
}

export function transformZennData(
  articles: ZennArticle[],
  userId: string,
  settingId: string
): CollectedDataInsert[] {
  return articles.map((a) => ({
    user_id: userId,
    setting_id: settingId,
    platform: 'zenn' as Platform,
    content_id: a.id,
    title: a.title,
    url: a.url,
    published_at: a.published_at,
    author_id: a.author_username,
    author_name: a.author_name,
    likes: a.liked_count,
    growth_rate: a.growth_rate,
  }));
}

// ─── 初回データ取得 ───

/**
 * 監視設定に基づいて初回データ取得を実行
 * 取得結果を collected_data に upsert し、fetch_logs に記録
 */
export async function fetchInitialData(
  setting: MonitorSetting,
  userId: string
): Promise<{ count: number; error?: string }> {
  const supabase = await createClient();

  try {
    const data = await fetchPlatformData(
      setting.platform,
      setting.type,
      setting.value,
      setting.fetch_count
    );

    if (data.length === 0) {
      await recordFetchLog(
        supabase,
        userId,
        setting.id,
        setting.platform,
        'success',
        0
      );
      return { count: 0 };
    }

    // CollectedData 形式に変換
    let collectedData: CollectedDataInsert[];
    switch (setting.platform) {
      case 'youtube':
        collectedData = transformYouTubeData(
          data as YouTubeVideo[],
          userId,
          setting.id
        );
        break;
      case 'qiita':
        collectedData = transformQiitaData(
          data as QiitaArticle[],
          userId,
          setting.id
        );
        break;
      case 'zenn':
        collectedData = transformZennData(
          data as ZennArticle[],
          userId,
          setting.id
        );
        break;
    }

    // collected_data に upsert
    const { error: upsertError } = await supabase
      .from('collected_data')
      .upsert(collectedData, {
        onConflict: 'user_id,setting_id,content_id',
      });

    if (upsertError) {
      throw new Error(`データ保存エラー: ${upsertError.message}`);
    }

    // last_fetched_at を更新
    await supabase
      .from('monitor_settings')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', setting.id);

    // fetch_logs に成功を記録
    await recordFetchLog(
      supabase,
      userId,
      setting.id,
      setting.platform,
      'success',
      collectedData.length
    );

    return { count: collectedData.length };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '不明なエラー';
    console.error('[Monitor] fetchInitialData error:', errorMessage);

    // fetch_logs にエラーを記録
    await recordFetchLog(
      supabase,
      userId,
      setting.id,
      setting.platform,
      'error',
      undefined,
      errorMessage
    );

    return { count: 0, error: errorMessage };
  }
}

/**
 * プラットフォーム別にデータを取得
 */
export async function fetchPlatformData(
  platform: Platform,
  type: MonitorType,
  value: string,
  fetchCount: FetchCount
): Promise<YouTubeVideo[] | QiitaArticle[] | ZennArticle[]> {
  switch (platform) {
    case 'youtube':
      if (type === 'channel') {
        return youtubeClient.getChannelVideos(value, fetchCount);
      }
      return youtubeClient.searchVideos(value, fetchCount);

    case 'qiita':
      if (type === 'user') {
        return qiitaClient.getUserArticles(value, Math.min(fetchCount, 100));
      }
      return qiitaClient.searchArticles(value, Math.min(fetchCount, 100));

    case 'zenn':
      if (type === 'user') {
        return zennClient.getUserArticles(value, Math.min(fetchCount, 100));
      }
      return zennClient.searchArticlesByTopic(value, Math.min(fetchCount, 100));

    default:
      throw new Error(`未対応のプラットフォーム: ${platform}`);
  }
}

// ─── Fetch Log ───

export async function recordFetchLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  settingId: string,
  platform: Platform,
  status: FetchLogStatus,
  recordsCount?: number,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase.from('fetch_logs').insert({
    user_id: userId,
    setting_id: settingId,
    platform,
    status,
    records_count: recordsCount,
    error_message: errorMessage,
  });

  if (error) {
    console.error('[Monitor] Failed to record fetch log:', error.message);
  }
}

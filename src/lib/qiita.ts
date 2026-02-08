/**
 * Qiita API v2 クライアント
 * シングルトンパターンでQiita API v2との通信を管理
 */

import { QiitaUser, QiitaArticle } from '@/types/qiita';
import { calculateArticleMetrics } from '@/lib/article-metrics';

const QIITA_API_BASE = 'https://qiita.com/api/v2';

// Qiita API生レスポンスの型定義
interface QiitaRawTag {
  name: string;
  versions: string[];
}

interface QiitaRawUser {
  id: string;
  name: string;
  profile_image_url: string;
  items_count: number;
  followers_count: number;
}

interface QiitaRawItem {
  id: string;
  title: string;
  url: string;
  created_at: string;
  likes_count: number;
  stocks_count: number;
  tags: QiitaRawTag[];
  user: {
    id: string;
    name: string;
  };
}

class QiitaAPIClient {
  private accessToken: string | undefined;

  constructor() {
    this.accessToken = process.env.QIITA_ACCESS_TOKEN;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async fetchAPI<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${QIITA_API_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    console.log(
      `[Qiita API] GET ${endpoint}`,
      params ? `params: ${JSON.stringify(params)}` : ''
    );

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Qiita API] Error ${response.status}: ${errorText}`);

      if (response.status === 404) {
        throw new Error('Not found');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      if (response.status === 403) {
        throw new Error('Forbidden: Access denied');
      }

      throw new Error(
        `Qiita API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * ユーザー情報を取得
   */
  async getUserInfo(userId: string): Promise<QiitaUser> {
    const raw = await this.fetchAPI<QiitaRawUser>(
      `/users/${encodeURIComponent(userId)}`
    );

    return {
      id: raw.id,
      name: raw.name || raw.id,
      profile_image_url: raw.profile_image_url,
      items_count: raw.items_count,
      followers_count: raw.followers_count,
    };
  }

  /**
   * ユーザーの記事一覧を取得
   */
  async getUserArticles(
    userId: string,
    limit: number = 50
  ): Promise<QiitaArticle[]> {
    const perPage = Math.min(limit, 100);
    const raw = await this.fetchAPI<QiitaRawItem[]>(
      `/users/${encodeURIComponent(userId)}/items`,
      {
        page: '1',
        per_page: String(perPage),
      }
    );

    return raw.map((item) => this.enrichArticle(item));
  }

  /**
   * キーワードで記事を検索
   */
  async searchArticles(
    keyword: string,
    limit: number = 50
  ): Promise<QiitaArticle[]> {
    const perPage = Math.min(limit, 100);
    const raw = await this.fetchAPI<QiitaRawItem[]>('/items', {
      query: keyword,
      page: '1',
      per_page: String(perPage),
    });

    return raw.map((item) => this.enrichArticle(item));
  }

  /**
   * 生記事データに分析指標を付与
   */
  private enrichArticle(raw: QiitaRawItem): QiitaArticle {
    const publishedAt = raw.created_at;
    const { daysFromPublished, growthRate } = calculateArticleMetrics(
      raw.likes_count,
      publishedAt
    );

    return {
      id: raw.id,
      title: raw.title,
      url: raw.url,
      published_at: publishedAt,
      likes_count: raw.likes_count,
      stocks_count: raw.stocks_count,
      tags: raw.tags.map((t) => t.name),
      author_id: raw.user.id,
      author_name: raw.user.name || raw.user.id,
      days_from_published: daysFromPublished,
      growth_rate: growthRate,
    };
  }
}

export const qiitaClient = new QiitaAPIClient();

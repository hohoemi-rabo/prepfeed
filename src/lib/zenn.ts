/**
 * Zenn 内部APIクライアント
 * シングルトンパターンでZenn非公式APIとの通信を管理
 *
 * 注意: Zenn APIは非公式のため、予告なく仕様変更される可能性がある
 */

import { ZennUser, ZennArticle } from '@/types/zenn';
import { calculateArticleMetrics } from '@/lib/article-metrics';

const ZENN_API_BASE = 'https://zenn.dev/api';

// Zenn API生レスポンスの型定義
interface ZennRawUser {
  username: string;
  name: string;
  avatar_small_url: string;
  articles_count: number;
}

interface ZennRawArticle {
  id: number;
  title: string;
  slug: string;
  path: string;
  published_at: string;
  liked_count: number;
  user: {
    username: string;
    name: string;
  };
}

interface ZennArticlesResponse {
  articles: ZennRawArticle[];
  next_page: number | null;
}

interface ZennUserResponse {
  user: ZennRawUser;
}

class ZennAPIClient {
  private async fetchAPI<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${ZENN_API_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    console.log(
      `[Zenn API] GET ${endpoint}`,
      params ? `params: ${JSON.stringify(params)}` : ''
    );

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Zenn API] Network error:', error);
      throw new Error('Zenn APIへの接続に失敗しました');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Zenn API] Error ${response.status}: ${errorText}`);

      if (response.status === 404) {
        throw new Error('Not found');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      throw new Error(
        `Zenn API error (${response.status}): ${errorText}`
      );
    }

    let data: T;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        'Zenn APIのレスポンス形式が変更された可能性があります'
      );
    }

    return data;
  }

  /**
   * ユーザー情報を取得
   */
  async getUserInfo(username: string): Promise<ZennUser> {
    const raw = await this.fetchAPI<ZennUserResponse>(
      `/users/${encodeURIComponent(username)}`
    );

    if (!raw.user) {
      throw new Error('Not found');
    }

    return {
      username: raw.user.username,
      name: raw.user.name || raw.user.username,
      avatar_url: raw.user.avatar_small_url,
      articles_count: raw.user.articles_count,
    };
  }

  /**
   * ユーザーの記事一覧を取得
   */
  async getUserArticles(
    username: string,
    limit: number = 50
  ): Promise<ZennArticle[]> {
    const count = Math.min(limit, 100);
    const raw = await this.fetchAPI<ZennArticlesResponse>('/articles', {
      username: username,
      order: 'latest',
      count: String(count),
    });

    if (!raw.articles || !Array.isArray(raw.articles)) {
      console.warn(
        '[Zenn API] Unexpected response format for user articles'
      );
      return [];
    }

    return raw.articles.map((item) => this.enrichArticle(item));
  }

  /**
   * トピック名で記事を検索
   */
  async searchArticlesByTopic(
    topicName: string,
    limit: number = 50
  ): Promise<ZennArticle[]> {
    const count = Math.min(limit, 100);
    const raw = await this.fetchAPI<ZennArticlesResponse>('/articles', {
      topicname: topicName,
      order: 'latest',
      count: String(count),
    });

    if (!raw.articles || !Array.isArray(raw.articles)) {
      console.warn(
        '[Zenn API] Unexpected response format for topic search'
      );
      return [];
    }

    return raw.articles.map((item) => this.enrichArticle(item));
  }

  /**
   * 生記事データに分析指標を付与
   */
  private enrichArticle(raw: ZennRawArticle): ZennArticle {
    const publishedAt = raw.published_at;
    const { daysFromPublished, growthRate } = calculateArticleMetrics(
      raw.liked_count,
      publishedAt
    );

    return {
      id: String(raw.id),
      title: raw.title,
      url: `https://zenn.dev${raw.path}`,
      published_at: publishedAt,
      liked_count: raw.liked_count,
      author_username: raw.user.username,
      author_name: raw.user.name || raw.user.username,
      days_from_published: daysFromPublished,
      growth_rate: growthRate,
    };
  }
}

export const zennClient = new ZennAPIClient();

/**
 * note.com 内部APIクライアント
 * シングルトンパターンでnote.com非公式APIとの通信を管理
 *
 * 注意:
 * - note.com APIは非公式のため、予告なく仕様変更される可能性がある
 * - サーバー負荷軽減のため、リクエスト間にスロットリングを挿入
 * - APIレスポンスはcamelCase（likeCount, publishAt 等）
 */

import { NoteUser, NoteArticle } from '@/types/note';

const NOTE_API_BASE = 'https://note.com/api';
const MIN_REQUEST_INTERVAL_MS = 1500;
// note.com APIは1ページ約6件固定
// 表示用は20件（APIルート側で制限）、分析用は50件まで取得可能
const MAX_ARTICLES_PER_REQUEST = 50;

// note.com API 生レスポンスの型定義
// v2 contentsはcamelCase、v3 searchesはsnake_case混在のため両方定義
interface NoteRawArticle {
  id: number;
  name: string;
  key: string;
  // v2: publishAt / v3: publish_at
  publishAt?: string;
  publish_at?: string;
  // v2: likeCount / v3: like_count
  likeCount?: number;
  like_count?: number;
  // v2: commentCount / v3: comment_count
  commentCount?: number;
  comment_count?: number;
  note_url?: string;
  user: {
    urlname: string;
    nickname?: string;
    name?: string;
    // v2: userProfileImagePath / v3: user_profile_image_path
    userProfileImagePath?: string;
    user_profile_image_path?: string;
  };
}

interface NoteUserContentsResponse {
  data: {
    contents: NoteRawArticle[];
    totalCount: number;
    isLastPage: boolean;
  };
}

interface NoteSearchResponse {
  data: {
    notes: {
      contents: NoteRawArticle[];
      totalCount: number;
    };
  };
}

class NoteAPIClient {
  private lastRequestTime = 0;

  /**
   * リクエスト間隔を制御（サーバー負荷軽減）
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed)
      );
    }
    this.lastRequestTime = Date.now();
  }

  private async fetchAPI<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    await this.throttle();

    const url = new URL(`${NOTE_API_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    console.log(
      `[note API] GET ${endpoint}`,
      params ? `params: ${JSON.stringify(params)}` : ''
    );

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PrepFeed/1.0 (Personal Tool)',
        },
      });
    } catch (error) {
      console.error('[note API] Network error:', error);
      throw new Error('note.com APIへの接続に失敗しました');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[note API] Error ${response.status}: ${errorText}`);

      if (response.status === 404) {
        throw new Error('Not found');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      throw new Error(
        `note.com API error (${response.status}): ${errorText}`
      );
    }

    let data: T;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        'note.com APIのレスポンス形式が変更された可能性があります'
      );
    }

    return data;
  }

  /**
   * ユーザー情報を取得
   * プロフィールエンドポイント → 記事一覧フォールバック
   * 大文字小文字の違いも自動リトライ
   */
  async getUserInfo(urlname: string): Promise<NoteUser> {
    // 入力そのまま → 小文字の順で試す
    const candidates = [urlname];
    const lower = urlname.toLowerCase();
    if (lower !== urlname) candidates.push(lower);

    for (const name of candidates) {
      const result = await this.tryGetUserInfo(name);
      if (result) return result;
    }

    throw new Error('Not found');
  }

  /**
   * 指定urlnameでユーザー情報取得を試みる（null返却=失敗）
   */
  private async tryGetUserInfo(urlname: string): Promise<NoteUser | null> {
    // 1. プロフィールエンドポイント
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profileData: any = null;
    try {
      const profileRaw = await this.fetchAPI<Record<string, unknown>>(
        `/v2/creators/${encodeURIComponent(urlname)}`
      );
      profileData = profileRaw.data || profileRaw;
    } catch (profileError) {
      const msg = profileError instanceof Error ? profileError.message : String(profileError);
      if (!msg.includes('Not found')) {
        console.warn('[note API] Profile endpoint error:', msg);
      }
    }

    if (profileData && typeof profileData === 'object') {
      const p = profileData;
      return {
        urlname: p.urlname || urlname,
        name: p.nickname || p.name || p.urlname || urlname,
        profile_image_path: p.profileImageUrl || p.userProfileImagePath || '',
        note_count: p.noteCount ?? p.note_count ?? 0,
        follower_count: p.followerCount ?? p.follower_count,
      };
    }

    // 2. 記事一覧フォールバック
    try {
      const raw = await this.fetchAPI<NoteUserContentsResponse>(
        `/v2/creators/${encodeURIComponent(urlname)}/contents`,
        { kind: 'note', page: '1' }
      );

      if (raw.data?.contents && raw.data.contents.length > 0) {
        const u = raw.data.contents[0].user;
        return {
          urlname: u.urlname,
          name: u.nickname || u.name || u.urlname,
          profile_image_path: u.userProfileImagePath || '',
          note_count: raw.data.totalCount ?? 0,
        };
      }
    } catch {
      // この候補では見つからない
    }

    return null;
  }

  /**
   * ユーザー情報と記事一覧を一括取得
   * プロフィール → 記事一覧の順で取得（存在確認を先に行う）
   */
  async getUserWithArticles(
    urlname: string,
    limit: number = 20
  ): Promise<{ user: NoteUser; articles: NoteArticle[] }> {
    // 1. まずユーザー存在確認（プロフィール取得）
    const user = await this.getUserInfo(urlname);

    // 2. 記事一覧を取得（ユーザーは存在するが記事0件でもOK）
    const count = Math.min(limit, MAX_ARTICLES_PER_REQUEST);
    const articles: NoteArticle[] = [];

    try {
      let page = 1;
      while (articles.length < count) {
        const raw = await this.fetchAPI<NoteUserContentsResponse>(
          `/v2/creators/${encodeURIComponent(user.urlname)}/contents`,
          { kind: 'note', page: String(page) }
        );

        if (!raw.data?.contents || raw.data.contents.length === 0) break;

        for (const item of raw.data.contents) {
          if (articles.length >= count) break;
          articles.push(this.enrichArticle(item));
        }

        if (raw.data.isLastPage) break;
        page++;
      }
    } catch (contentsError) {
      // ユーザーは存在するが記事取得に失敗 → 空記事で返す
      console.warn(
        '[note API] Contents fetch failed for existing user:',
        contentsError instanceof Error ? contentsError.message : contentsError
      );
    }

    return { user, articles };
  }

  /**
   * ユーザーの記事一覧を取得
   */
  async getUserArticles(
    urlname: string,
    limit: number = 20
  ): Promise<NoteArticle[]> {
    const count = Math.min(limit, MAX_ARTICLES_PER_REQUEST);
    const articles: NoteArticle[] = [];
    let page = 1;
    while (articles.length < count) {
      const raw = await this.fetchAPI<NoteUserContentsResponse>(
        `/v2/creators/${encodeURIComponent(urlname)}/contents`,
        { kind: 'note', page: String(page) }
      );

      if (!raw.data?.contents || !Array.isArray(raw.data.contents)) {
        console.warn('[note API] Unexpected response format for user articles');
        break;
      }

      if (raw.data.contents.length === 0) break;

      for (const item of raw.data.contents) {
        if (articles.length >= count) break;
        articles.push(this.enrichArticle(item));
      }

      if (raw.data.isLastPage) break;
      page++;
    }

    return articles;
  }

  /**
   * クリエイター名で検索（記事検索結果からユニークなクリエイターを抽出）
   */
  async searchCreators(
    query: string,
    limit: number = 10
  ): Promise<NoteUser[]> {
    const raw = await this.fetchAPI<NoteSearchResponse>(
      '/v3/searches',
      { context: 'note', q: query, size: '50', start: '0' }
    );

    if (!raw.data?.notes?.contents || raw.data.notes.contents.length === 0) {
      return [];
    }

    const creatorMap = new Map<string, NoteUser>();
    for (const article of raw.data.notes.contents) {
      const u = article.user;
      if (creatorMap.has(u.urlname)) continue;
      creatorMap.set(u.urlname, {
        urlname: u.urlname,
        name: u.nickname || u.name || u.urlname,
        profile_image_path: u.userProfileImagePath || u.user_profile_image_path || '',
        note_count: 0,
      });
      if (creatorMap.size >= limit) break;
    }

    return Array.from(creatorMap.values());
  }

  /**
   * キーワードで記事を検索
   */
  async searchArticles(
    keyword: string,
    limit: number = 20
  ): Promise<NoteArticle[]> {
    const size = Math.min(limit, MAX_ARTICLES_PER_REQUEST);

    const raw = await this.fetchAPI<NoteSearchResponse>(
      '/v3/searches',
      {
        context: 'note',
        q: keyword,
        size: String(size),
        start: '0',
      }
    );

    if (!raw.data?.notes?.contents || !Array.isArray(raw.data.notes.contents)) {
      console.warn('[note API] Unexpected response format for keyword search');
      return [];
    }

    return raw.data.notes.contents.map((item) => this.enrichArticle(item));
  }

  /**
   * 生記事データに分析指標を付与
   */
  private enrichArticle(raw: NoteRawArticle): NoteArticle {
    const publishedAt = raw.publishAt || raw.publish_at || '';
    const likeCount = raw.likeCount ?? raw.like_count ?? 0;
    const commentCount = raw.commentCount ?? raw.comment_count ?? 0;
    const daysFromPublished = publishedAt
      ? Math.floor(
          (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
    const growthRate =
      daysFromPublished > 0
        ? Number((likeCount / daysFromPublished).toFixed(2))
        : likeCount;

    const authorName = raw.user.nickname || raw.user.name || raw.user.urlname;

    return {
      id: String(raw.id),
      title: raw.name,
      url: raw.note_url || `https://note.com/${raw.user.urlname}/n/${raw.key}`,
      published_at: publishedAt,
      like_count: likeCount,
      comment_count: commentCount,
      author_urlname: raw.user.urlname,
      author_name: authorName,
      days_from_published: daysFromPublished,
      growth_rate: growthRate,
    };
  }
}

export const noteClient = new NoteAPIClient();

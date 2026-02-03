// Qiita Types

export interface QiitaUser {
  id: string;
  name: string;
  profile_image_url: string;
  items_count: number;
  followers_count: number;
}

export interface QiitaArticle {
  id: string;
  title: string;
  url: string;
  published_at: string;
  likes_count: number;
  stocks_count: number;
  tags: string[];
  author_id: string;
  author_name: string;
  days_from_published?: number;
  growth_rate?: number;
}

export interface QiitaUserResponse {
  user: QiitaUser;
  articles: QiitaArticle[];
}

export interface QiitaKeywordResponse {
  articles: QiitaArticle[];
  query: string;
  count: number;
}

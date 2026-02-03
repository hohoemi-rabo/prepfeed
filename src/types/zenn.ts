// Zenn Types

export interface ZennUser {
  username: string;
  name: string;
  avatar_url: string;
  articles_count: number;
}

export interface ZennArticle {
  id: string;
  title: string;
  url: string;
  published_at: string;
  liked_count: number;
  author_username: string;
  author_name: string;
  days_from_published?: number;
  growth_rate?: number;
}

export interface ZennUserResponse {
  user: ZennUser;
  articles: ZennArticle[];
}

export interface ZennKeywordResponse {
  articles: ZennArticle[];
  query: string;
  count: number;
}

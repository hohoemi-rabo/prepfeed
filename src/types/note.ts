// note.com Types

export interface NoteUser {
  urlname: string;
  name: string;
  profile_image_path: string;
  note_count: number;
  follower_count?: number;
}

export interface NoteArticle {
  id: string;
  title: string;
  url: string;
  published_at: string;
  like_count: number;
  comment_count?: number;
  author_urlname: string;
  author_name: string;
  days_from_published?: number;
  growth_rate?: number;
}

export interface NoteUserResponse {
  user: NoteUser;
  articles: NoteArticle[];
}

export interface NoteKeywordResponse {
  articles: NoteArticle[];
  query: string;
  count: number;
}

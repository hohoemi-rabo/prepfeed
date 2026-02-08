// Re-export Phase 2 types
export * from './common';
export * from './qiita';
export * from './zenn';
export * from './note';
export * from './monitor';
export * from './user';
export * from './collected-data';
export * from './analysis';

// YouTube API Types
export interface YouTubeChannel {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  customUrl?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
}

export interface YouTubeVideo {
  id: string;
  channelId: string;
  channelTitle?: string;
  title: string;
  description?: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags?: string[];
  // 分析用の追加フィールド
  daysFromPublished?: number;
  growthRate?: number;
  commentRate?: number;
  likeRate?: number;
  engagementRate?: number;
  isTrending?: boolean;
  isNew?: boolean;
}

export interface VideoStatistics {
  viewCount: string;
  likeCount?: string;
  commentCount?: string;
}

export interface VideoContentDetails {
  duration: string;
  dimension?: string;
  definition?: string;
}

// API Response Types
export interface ChannelSearchResponse {
  channels: YouTubeChannel[];
  nextPageToken?: string;
}

export interface ChannelDetailsResponse {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
}

export interface KeywordSearchResponse {
  videos: YouTubeVideo[];
  query: string;
  count: number;
}

// UI State Types
export type SortType = 'views' | 'date' | 'growth' | 'comments' | 'likes' | 'stocks';
export type SortOrder = 'asc' | 'desc';

export interface SortState {
  type: SortType;
  order: SortOrder;
}

// Error Types
export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

// Badge Types
export type BadgeType = 'new' | 'trending' | 'popular';

export interface Badge {
  type: BadgeType;
  label: string;
  color: string;
}
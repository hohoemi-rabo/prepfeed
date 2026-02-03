// Collected Data Types

import type { Platform } from './common';

export interface CollectedData {
  id: string;
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
  collected_at: string;
}

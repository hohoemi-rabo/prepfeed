/**
 * プラットフォーム設定の一元管理
 * 色・アイコン・ラベル等のメタ情報を単一ソースで定義
 */

import { Youtube, Code2, BookOpen, StickyNote } from 'lucide-react';
import type { Platform } from '@/types/common';
import type { LucideIcon } from 'lucide-react';

export interface PlatformMeta {
  label: string;
  color: string;
  colorDark: string;
  icon: LucideIcon;
  linkLabel: string;
  profileUrl: (id: string) => string;
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    colorDark: '#CC0000',
    icon: Youtube,
    linkLabel: 'YouTubeで見る',
    profileUrl: (id) => `https://www.youtube.com/channel/${id}`,
  },
  qiita: {
    label: 'Qiita',
    color: '#55C500',
    colorDark: '#449E00',
    icon: Code2,
    linkLabel: 'Qiitaで読む',
    profileUrl: (id) => `https://qiita.com/${id}`,
  },
  zenn: {
    label: 'Zenn',
    color: '#3EA8FF',
    colorDark: '#2B8AD9',
    icon: BookOpen,
    linkLabel: 'Zennで読む',
    profileUrl: (id) => `https://zenn.dev/${id}`,
  },
  note: {
    label: 'note',
    color: '#41C9B4',
    colorDark: '#2FA898',
    icon: StickyNote,
    linkLabel: 'noteで読む',
    profileUrl: (id) => `https://note.com/${id}`,
  },
};

/** プラットフォーム一覧（順序保証付き） */
export const PLATFORM_LIST = (
  ['youtube', 'qiita', 'zenn', 'note'] as const
).map((id) => ({ id, ...PLATFORM_META[id] }));

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Domain-specific rules are in `.claude/rules/` and loaded conditionally by file path.

## Project Overview

**PrepFeed** — 集めて、分析して、ネタにする。

YouTube・Qiita・Zennの公開データを分析し、コンテンツ企画のネタ出しをサポートするツール。
Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + Supabase で構築。

**旧名称**: チャンネルスコープ → YouTubeスコープ → PrepFeed

## Essential Commands

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production with Turbopack
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Key Technologies

- **Next.js 15.5.11** - App Router, API Routes, Server/Client Components
- **React 19.1.0** - UI Components
- **TypeScript 5** - Strict mode
- **Tailwind CSS 3.4.17** - Styling with CSS variables for theming
- **Zustand** - Sort state management
- **Recharts** - Data visualization (dynamic import)
- **Supabase** - Auth, PostgreSQL database, RLS
- **Vercel Analytics / OG / KV** - Analytics, OGP, Caching

## Path Aliases

- `@/*` → `./src/*` (tsconfig.json)

## Directory Structure

```
/src
├── app/                    # Next.js App Router
│   ├── api/youtube/        # YouTube API (search, channel/[id], keyword)
│   ├── api/qiita/          # Qiita API (user/[id], keyword)
│   ├── api/og/             # Dynamic OGP image generation
│   ├── auth/               # Auth pages (login, callback)
│   ├── youtube/channel/[id]/   # Channel detail page
│   ├── youtube/keyword/[query]/ # Keyword search results page
│   ├── dashboard/          # Dashboard (authenticated)
│   ├── contact/            # Contact page
│   ├── disclaimer/         # Disclaimer page
│   ├── privacy/            # Privacy policy
│   ├── layout.tsx          # Root layout (fetches user for Header)
│   └── page.tsx            # Home page (3-platform tabs)
├── components/             # React components
│   ├── Header.tsx          # Sticky header with auth UI
│   ├── Footer.tsx          # Footer with 3-platform disclaimer
│   └── UserMenu.tsx        # Avatar dropdown (authenticated)
├── lib/                    # Utilities
│   ├── supabase/           # Supabase client (client.ts, server.ts)
│   ├── youtube.ts          # YouTube API client (singleton)
│   ├── qiita.ts            # Qiita API client (singleton)
│   ├── cache.ts            # Cache (Vercel KV / in-memory)
│   └── rate-limiter.ts     # Rate limiting
├── types/                  # TypeScript types
│   ├── index.ts            # YouTube types
│   └── qiita.ts            # Qiita types
└── middleware.ts            # Session refresh + protected routes
/docs                       # チケット管理（001-045）
```

## Search Methods (3 Platforms)

### YouTube
- **チャンネル分析**: `/` → `/youtube/channel/[id]` | Red gradient | SearchBar component
- **キーワード検索**: `/` → `/youtube/keyword/[query]` | Blue gradient | dedicated input (NOT SearchBar)

### Qiita
- **ユーザー検索**: `/` → `/qiita/user/[id]` | Green gradient (#55C500)
- **キーワード検索**: `/` → `/qiita/keyword/[query]` | Green gradient (#55C500)

### Zenn (UI実装済み、API未実装)
- **ユーザー検索**: `/` → `/zenn/user/[id]` | Blue gradient (#3EA8FF)
- **キーワード検索**: `/` → `/zenn/keyword/[query]` | Blue gradient (#3EA8FF)

## Authentication (Supabase Auth)

- **Google OAuth** (PKCE flow via `@supabase/ssr`)
- Login: `/auth/login` → Google OAuth → `/auth/callback` → `/dashboard`
- Protected routes: `/dashboard/*` (middleware redirect to `/auth/login`)
- Server-side user fetch in `layout.tsx` → props to Header
- Sign out: Server Action in `auth/actions.ts`

## Environment Variables

Required:
```bash
YOUTUBE_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Production: actual URL
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional:
```bash
QIITA_ACCESS_TOKEN=...     # Qiita API (なし: 60req/h, あり: 1,000req/h)
KV_REST_API_URL=...        # Vercel KV (production)
KV_REST_API_TOKEN=...      # Vercel KV (production)
```

## Supabase

- **Project ID**: `raxaakwoaodfrkkxlgpv`
- **Region**: ap-northeast-1 (Tokyo)
- Browser client: `src/lib/supabase/client.ts` → `createClient()`
- Server client: `src/lib/supabase/server.ts` → `createClient()` (async)
- Middleware: `src/middleware.ts` — session refresh

## Production Deployment

- **Platform**: Vercel | **Region**: hnd1 (Tokyo)
- **URL**: https://prepfeed.vercel.app

## Ticket管理ルール

- チケットファイル（`docs/`配下）内のTODOチェックリストを進捗管理に使用
- 完了した項目は `- [ ]` → `- [x]` に更新する
- チケット実装完了時、対応するチェックリストをすべて `- [x]` にする

## Project Status

**Phase 1 Complete** — Phase 2 実装中（026-045チケット）

Phase 2 完了チケット:
- 026: プロジェクトリネーム（YouTubeスコープ → PrepFeed）
- 027: Phase 2用TypeScript型定義（Qiita/Zenn/Monitoring/AI）
- 028: Supabase DB設計・セットアップ（6テーブル、RLS、クライアント初期化）
- 029: Supabase Auth認証フロー（Google OAuth、middleware、UserMenu）
- 030: ログインページUI（機能紹介、ローディング状態）
- 031: ヘッダー・フッター・ホームページ更新（3プラットフォームタブUI）
- 032: Qiita APIクライアント & APIルート

Phase 1 完了機能:
- Channel search with autocomplete, Latest 50 videos analysis
- Multi-criteria sorting (5 types), Data visualization with charts
- SNS sharing with dynamic OGP, Caching and rate limiting
- Keyword search (top 50 videos), Video tags display (clickable)
- Japanese number formatting (万/億), Error handling and analytics
- Contact page, Legal pages (disclaimer, privacy)

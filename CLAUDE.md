# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Domain-specific rules are in `.claude/rules/` and loaded conditionally by file path.

## Project Overview

**PrepFeed** - YouTube・Qiita・Zennの分析で企画のネタ出しをサポートするツール

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSSで構築されたフルスタックWebアプリケーション。YouTube Data API v3を使用してチャンネル分析・キーワード検索による動画統計を提供。Phase 2でQiita/Zenn対応とGemini AI分析を追加予定。

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
│   ├── api/og/             # Dynamic OGP image generation
│   ├── youtube/channel/[id]/   # Channel detail page
│   ├── youtube/keyword/[query]/ # Keyword search results page
│   ├── contact/            # Contact page
│   ├── disclaimer/         # Disclaimer page
│   ├── privacy/            # Privacy policy
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (2 search types)
├── components/             # React components
├── lib/                    # Utilities
│   └── supabase/           # Supabase client (client.ts, server.ts)
└── types/                  # TypeScript types
/docs                       # チケット管理（001-045）
```

## Two Search Methods

### 1. Channel Analysis
- Page: `/` → `/youtube/channel/[id]` | UI: Red gradient | API: search → channel/[id]
- Features: Latest 50 videos, charts, SNS sharing

### 2. Keyword Search
- Page: `/` → `/youtube/keyword/[query]` | UI: Blue gradient | API: keyword?q=
- Features: Top 50 videos by views, tags display
- **Important**: Uses dedicated input (NOT SearchBar component)

## Environment Variables

Required:
```bash
YOUTUBE_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Production: actual URL
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional (production):
```bash
KV_REST_API_URL=...        # Vercel KV
KV_REST_API_TOKEN=...      # Vercel KV
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

Phase 1 完了機能:
- Channel search with autocomplete, Latest 50 videos analysis
- Multi-criteria sorting (5 types), Data visualization with charts
- SNS sharing with dynamic OGP, Caching and rate limiting
- Keyword search (top 50 videos), Video tags display (clickable)
- Japanese number formatting (万/億), Error handling and analytics
- Contact page, Legal pages (disclaimer, privacy)

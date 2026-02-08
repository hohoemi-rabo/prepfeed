# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Domain-specific rules are in `.claude/rules/` and loaded conditionally by file path.

## Project Overview

**PrepFeed** — 集めて、分析して、ネタにする。

YouTube・Qiita・Zenn・noteの公開データを分析し、コンテンツ企画のネタ出しをサポートするツール。
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

- **Next.js 15.5.12** - App Router, API Routes, Server/Client Components
- **React 19.1.0** - UI Components
- **TypeScript 5** - Strict mode
- **Tailwind CSS 3.4.17** - Styling with CSS variables for theming
- **Zustand** - Sort state management
- **Recharts** - Data visualization (dynamic import)
- **Supabase** - Auth, PostgreSQL database, RLS
- **Gemini 3 Flash Preview** - AI分析（簡易分析・詳細分析）
- **Vercel Analytics / OG / KV / Functions** - Analytics, OGP, Caching, Background Jobs

## Path Aliases

- `@/*` → `./src/*` (tsconfig.json)

## Directory Structure

```
/src
├── app/                    # Next.js App Router
│   ├── api/youtube/        # YouTube API (search, channel/[id], keyword)
│   ├── api/qiita/          # Qiita API (user/[id], keyword)
│   ├── api/zenn/           # Zenn API (user/[username], keyword)
│   ├── api/note/           # note API (user/[urlname], keyword)
│   ├── api/settings/       # 監視設定 CRUD API
│   ├── api/analysis/       # 分析結果 API (list, detail, detailed, status)
│   ├── api/logs/           # 取得ログ API (pagination, filters)
│   ├── api/batch/          # バッチ処理 (Vercel Cron + manual)
│   ├── api/og/             # Dynamic OGP image generation
│   ├── auth/               # Auth pages (login, callback)
│   ├── youtube/channel/[id]/    # Channel detail page
│   ├── youtube/keyword/[query]/ # Keyword search results page
│   ├── dashboard/               # Dashboard (authenticated, tab navigation)
│   │   ├── layout.tsx           # DashboardNav + container
│   │   ├── page.tsx             # 分析結果一覧 + 詳細分析実行
│   │   ├── analysis/[id]/       # 詳細分析レポートページ
│   │   ├── settings/            # 監視設定管理ページ
│   │   ├── logs/                # 取得ログ一覧ページ（フィルタ・ページネーション）
│   │   └── export/              # エクスポート（プレースホルダー）
│   ├── contact/            # Contact page
│   ├── disclaimer/         # Disclaimer page
│   ├── privacy/            # Privacy policy
│   ├── layout.tsx          # Root layout (fetches user for Header)
│   ├── note/user/[urlname]/       # note user page
│   ├── note/keyword/[query]/      # note keyword search page
│   └── page.tsx            # Home page (4-platform tabs)
├── components/             # React components
│   ├── Header.tsx          # Sticky header with auth UI
│   ├── Footer.tsx          # Footer with 4-platform disclaimer
│   ├── NoteUserCard.tsx    # note user profile card
│   ├── UserMenu.tsx        # Avatar dropdown (authenticated)
│   └── dashboard/          # Dashboard components
│       ├── DashboardNav.tsx       # タブナビ（分析/設定/エクスポート）
│       ├── MonitorWizard.tsx      # 5ステップ監視設定ウィザード
│       ├── MonitorSettingCard.tsx  # 監視設定カード（編集/削除）
│       ├── MonitorEditModal.tsx   # 設定編集モーダル
│       ├── AnalysisCard.tsx       # 簡易分析カード（スコア/サマリー）
│       ├── AnalysisProgress.tsx   # 分析プログレスバー（ポーリング）
│       ├── DetailedReport.tsx     # 詳細分析レポート（4セクション）
│       ├── FetchLogList.tsx       # 取得ログ一覧（compact/full variant）
│       ├── FetchLogFilters.tsx    # ログフィルタ（platform/status）
│       ├── SettingsCompactList.tsx # 設定コンパクト表示
│       └── UpgradeBanner.tsx      # プレミアムバナー（現在非表示）
├── hooks/                  # Custom React Hooks
│   └── useAnalysisStatus.ts # 分析ステータスポーリング（2秒間隔）
├── lib/                    # Utilities
│   ├── supabase/           # Supabase client (client.ts, server.ts, admin.ts)
│   ├── youtube.ts          # YouTube API client (singleton)
│   ├── qiita.ts            # Qiita API client (singleton)
│   ├── zenn.ts             # Zenn API client (singleton, 非公式API)
│   ├── note.ts             # note API client (singleton, 非公式API, 1500msスロットリング)
│   ├── gemini.ts           # Gemini AI client (singleton, retry付き)
│   ├── monitor.ts          # 監視設定ビジネスロジック
│   ├── analysis.ts         # AI分析ビジネスロジック
│   ├── data-collector.ts   # データ収集（upsert, fetch log記録）
│   ├── batch-processor.ts  # バッチ処理（全設定一括 / ユーザー別）
│   ├── background-jobs.ts  # ジョブ管理ユーティリティ
│   ├── fetch-log.ts        # 取得ログユーティリティ
│   ├── error-handler.ts    # エラー分類（16種別）
│   ├── tracking.ts         # Vercel Analytics イベント追跡
│   ├── format-utils.ts     # 数値・日時フォーマット
│   ├── cache.ts            # Cache (Vercel KV / in-memory)
│   └── rate-limiter.ts     # Rate limiting
├── types/                  # TypeScript types
│   ├── index.ts            # YouTube types + Phase 2 re-exports
│   ├── qiita.ts            # Qiita types
│   ├── zenn.ts             # Zenn types
│   ├── note.ts             # note types
│   ├── common.ts           # Platform, MonitorType, JobStatus, FetchCount
│   ├── monitor.ts          # MonitorSetting, FetchLog
│   ├── analysis.ts         # AnalysisResult, SimpleAnalysisResult, DetailedAnalysisResult
│   ├── collected-data.ts   # CollectedData
│   └── user.ts             # UserProfile
└── middleware.ts            # Session refresh + protected routes
/docs                       # チケット管理（001-045）
```

## Search Methods (4 Platforms)

### YouTube
- **チャンネル分析**: `/` → `/youtube/channel/[id]` | Red gradient | SearchBar component
- **キーワード検索**: `/` → `/youtube/keyword/[query]` | Blue gradient | dedicated input (NOT SearchBar)

### Qiita
- **ユーザー検索**: `/` → `/qiita/user/[id]` | Green gradient (#55C500)
- **キーワード検索**: `/` → `/qiita/keyword/[query]` | Green gradient (#55C500)

### Zenn
- **ユーザー検索**: `/` → `/zenn/user/[id]` | Blue gradient (#3EA8FF)
- **キーワード検索**: `/` → `/zenn/keyword/[query]` | Blue gradient (#3EA8FF)

### note
- **ユーザー検索**: `/` → `/note/user/[urlname]` | Teal gradient (#41C9B4)
- **キーワード検索**: `/` → `/note/keyword/[query]` | Teal gradient (#41C9B4)
- **注意**: 非公式API使用、1500msスロットリング、キャッシュ60分、取得上限50件/回

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
GEMINI_API_KEY=...             # Gemini AI (分析機能に必須)
QIITA_ACCESS_TOKEN=...         # Qiita API (なし: 60req/h, あり: 1,000req/h)
KV_REST_API_URL=...            # Vercel KV (production)
KV_REST_API_TOKEN=...          # Vercel KV (production)
SUPABASE_SERVICE_ROLE_KEY=...  # バッチ処理用 Admin Client (RLSバイパス)
CRON_SECRET=...                # Vercel Cronアクセス保護 (Bearer token)
```

## Supabase

- **Project ID**: `raxaakwoaodfrkkxlgpv`
- **Region**: ap-northeast-1 (Tokyo)
- Browser client: `src/lib/supabase/client.ts` → `createClient()`
- Server client: `src/lib/supabase/server.ts` → `createClient()` (async)
- Admin client: `src/lib/supabase/admin.ts` → `createAdminClient()` (service role, RLSバイパス)
- Middleware: `src/middleware.ts` — session refresh

### Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | ユーザープロフィール（auth.users トリガー自動作成） |
| `monitor_settings` | 監視設定（platform, type, value, fetch_count） |
| `collected_data` | 収集データ（プラットフォーム横断の統一フォーマット） |
| `analysis_results` | 分析結果（simple/detailed、JSONB result） |
| `analysis_jobs` | バックグラウンドジョブ管理 |
| `fetch_logs` | データ取得ログ（status, records_count） |

### Key Relationships
- `monitor_settings` → `collected_data` (1:N, setting_id)
- `monitor_settings` → `analysis_results` (1:N, setting_id, simple分析のみ)
- `analysis_results` → `analysis_jobs` (1:1, analysis_id, detailed分析のみ)
- 監視設定削除時: `analysis_results` → `collected_data` → `monitor_settings` の順で削除
- `fetch_logs` は設定削除時も保持（監査ログとして）

## Production Deployment

- **Platform**: Vercel | **Region**: hnd1 (Tokyo)
- **URL**: https://prepfeed.vercel.app

## Ticket管理ルール

- チケットファイル（`docs/`配下）内のTODOチェックリストを進捗管理に使用
- 完了した項目は `- [ ]` → `- [x]` に更新する
- チケット実装完了時、対応するチェックリストをすべて `- [x]` にする

## Dashboard Architecture

### タブナビゲーション
- `/dashboard` — 分析結果一覧 + 詳細分析実行
- `/dashboard/settings` — 監視設定管理（ウィザード + 一覧）
- `/dashboard/analysis/[id]` — 詳細分析レポート表示
- `/dashboard/logs` — 取得ログ一覧（フィルタ + ページネーション）
- `/dashboard/export` — エクスポート（プレースホルダー）

### データフロー
```
監視設定作成 → 初回データ取得 → 簡易分析（バックグラウンド）
                                    ↓
ダッシュボード ← AnalysisCard表示 ← analysis_results (simple)
      ↓
詳細分析実行 → analysis_jobs → Gemini AI → analysis_results (detailed)
      ↓                                         ↓
AnalysisProgress（ポーリング2秒） → DetailedReport表示
```

### バックグラウンドジョブ
- `@vercel/functions` の `waitUntil()` でレスポンス返却後に実行
- 簡易分析: 設定作成時に自動実行（同一リクエスト内）
- 詳細分析: POST → 202 Accepted → クライアントがポーリング
- ジョブ管理ユーティリティ: `background-jobs.ts`（レコード作成・ステータス更新・重複チェック）

### バッチ処理 (Vercel Cron)
- `POST /api/batch` — 全ユーザーの全設定を処理（CRON_SECRET認証）
- `POST /api/batch/manual` — ログインユーザー自身の設定のみ処理
- Vercel Cron: 毎日 UTC 18:00 (JST 03:00) に自動実行
- 時間予算: maxDuration - 10秒で打ち切り（Vercel Functions timeout対策）
- 設定間1秒ディレイ（APIレートリミット対策）
- Admin Client使用（RLSバイパスで全ユーザーデータにアクセス）

### プレミアム機能
- 現段階では全ユーザーに開放（`isPremium = true` ハードコード）
- TODO: プレミアムチェック再有効化時は `profiles.is_premium` を参照

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
- 033: Zenn APIクライアント & APIルート
- 034: 記事カードコンポーネント（Qiita/Zenn共通）
- 035: Qiita検索ページ（ユーザー/キーワード）
- 036: Zenn検索ページ（ユーザー/キーワード）
- 037: Gemini AIクライアント & 分析ロジック
- 038: 監視設定API（CRUD + 初回データ取得）
- 039: 監視設定UIウィザード（5ステップ + チャンネル検索）
- 040: ダッシュボード分析結果UI（タブナビ・詳細レポート）
- 041: バッチ処理（Vercel Cron + Admin Client + 手動実行）
- 042: バックグラウンドジョブ管理ユーティリティ
- 043: 取得ログ（ストレージ・表示・フィルタ・ページネーション）
- 044: エラーハンドリング強化（15種別 + Phase 2トラッキング）
- 045: note.comプラットフォーム追加（非公式API、スロットリング、4プラットフォーム対応）

Phase 1 完了機能:
- Channel search with autocomplete, Latest 50 videos analysis
- Multi-criteria sorting (5 types), Data visualization with charts
- SNS sharing with dynamic OGP, Caching and rate limiting
- Keyword search (top 50 videos), Video tags display (clickable)
- Japanese number formatting (万/億), Error handling and analytics
- Contact page, Legal pages (disclaimer, privacy)

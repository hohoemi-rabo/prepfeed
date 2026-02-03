# 028: Supabase DB設計 & セットアップ

## 概要

Supabase プロジェクトにテーブル作成、RLS ポリシー設定、インデックス作成、トリガー設定を行う。

## 背景

Phase 2 の認証・監視設定・データ収集・AI分析・取得ログに必要なデータベース基盤を構築する。

## 要件

### テーブル作成

#### profiles テーブル

- [x] `id` (uuid, PK, FK→auth.users)
- [x] `email` (text, NOT NULL)
- [x] `display_name` (text)
- [x] `avatar_url` (text)
- [x] `google_refresh_token` (text) — Sheetsエクスポート用トークン（暗号化）
- [x] `is_premium` (boolean, DEFAULT false)
- [x] `created_at` (timestamptz, DEFAULT now())
- [x] `updated_at` (timestamptz, DEFAULT now())

#### monitor_settings テーブル

- [x] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [x] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [x] `platform` (text, NOT NULL, CHECK: youtube/qiita/zenn)
- [x] `type` (text, NOT NULL, CHECK: keyword/channel/user)
- [x] `value` (text, NOT NULL) — 検索値
- [x] `display_name` (text) — 表示名
- [x] `fetch_count` (integer, DEFAULT 50, CHECK: 50/100/200)
- [x] `is_active` (boolean, DEFAULT true)
- [x] `last_fetched_at` (timestamptz)
- [x] `created_at` (timestamptz, DEFAULT now())
- [x] `updated_at` (timestamptz, DEFAULT now())

#### collected_data テーブル（収集データ）

- [x] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [x] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [x] `setting_id` (uuid, FK→monitor_settings.id)
- [x] `platform` (text, NOT NULL)
- [x] `content_id` (text, NOT NULL) — 動画ID / 記事ID
- [x] `title` (text, NOT NULL)
- [x] `url` (text, NOT NULL)
- [x] `published_at` (timestamptz)
- [x] `author_id` (text)
- [x] `author_name` (text)
- [x] `views` (integer) — YouTube再生数
- [x] `likes` (integer)
- [x] `comments` (integer)
- [x] `stocks` (integer) — Qiitaストック数
- [x] `duration` (text) — YouTube動画時間
- [x] `tags` (text[])
- [x] `growth_rate` (numeric)
- [x] `collected_at` (timestamptz, DEFAULT now())
- [x] UNIQUE制約: `(user_id, setting_id, content_id)`

#### analysis_results テーブル（AI分析結果）

- [x] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [x] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [x] `setting_id` (uuid, FK→monitor_settings.id) — NULLなら総合分析
- [x] `analysis_type` (text, CHECK: simple/detailed)
- [x] `status` (text, CHECK: pending/processing/completed/failed)
- [x] `result` (jsonb) — 分析結果JSON
- [x] `error_message` (text)
- [x] `created_at` (timestamptz, DEFAULT now())
- [x] `completed_at` (timestamptz)

#### analysis_jobs テーブル（分析ジョブキュー）

- [x] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [x] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [x] `analysis_id` (uuid, FK→analysis_results.id)
- [x] `job_type` (text, CHECK: simple/detailed)
- [x] `status` (text, CHECK: queued/processing/completed/failed)
- [x] `priority` (integer, DEFAULT 0)
- [x] `payload` (jsonb)
- [x] `started_at` (timestamptz)
- [x] `completed_at` (timestamptz)
- [x] `created_at` (timestamptz, DEFAULT now())

#### fetch_logs テーブル

- [x] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [x] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [x] `setting_id` (uuid, FK→monitor_settings.id)
- [x] `platform` (text, NOT NULL)
- [x] `status` (text, NOT NULL, CHECK: success/error)
- [x] `records_count` (integer)
- [x] `error_message` (text)
- [x] `executed_at` (timestamptz, DEFAULT now())

### RLS ポリシー

- [x] profiles: 自分のプロファイルのみ SELECT / UPDATE 可能
- [x] monitor_settings: 自分の設定のみ CRUD 可能
- [x] collected_data: 自分のデータのみ CRUD 可能
- [x] analysis_results: 自分の分析結果のみ CRUD 可能
- [x] fetch_logs: 自分のログのみ SELECT 可能

### インデックス

- [x] `idx_monitor_settings_user_active` ON monitor_settings(user_id) WHERE is_active = true
- [x] `idx_collected_data_user_setting` ON collected_data(user_id, setting_id)
- [x] `idx_collected_data_content` ON collected_data(user_id, content_id)
- [x] `idx_analysis_results_user` ON analysis_results(user_id, created_at DESC)
- [x] `idx_analysis_jobs_status` ON analysis_jobs(status) WHERE status IN ('queued', 'processing')
- [x] `idx_fetch_logs_user` ON fetch_logs(user_id, executed_at DESC)

### トリガー

- [x] auth.users INSERT 時に profiles レコードを自動作成するトリガー
- [x] updated_at を自動更新するトリガー（profiles, monitor_settings）

### クライアントセットアップ

- [x] `@supabase/supabase-js` と `@supabase/ssr` パッケージインストール
- [x] `src/lib/supabase/client.ts` — ブラウザクライアント
- [x] `src/lib/supabase/server.ts` — サーバークライアント
- [x] `src/middleware.ts` — セッションリフレッシュ用ミドルウェア
- [x] 環境変数設定（`.env.local`, `.env.example`, `.env.local.example`）

## 受け入れ条件

- [x] 6テーブルがSupabaseに作成されている
- [x] RLSが全テーブルで有効になっている
- [x] 認証ユーザーが自分のデータのみアクセスできることを確認
- [x] インデックスが作成されている
- [x] ユーザー登録時にprofilesレコードが自動作成される
- [x] `npm run build` で型エラーが発生しない

## 依存関係

- Supabaseプロジェクト作成済み（手動）

## 関連ファイル

- Supabase マイグレーション SQL（MCP経由で適用済み）
- `src/lib/supabase/client.ts`（ブラウザクライアント — 新規）
- `src/lib/supabase/server.ts`（サーバークライアント — 新規）
- `src/middleware.ts`（セッションリフレッシュ — 新規）

## 参照

- phase2_v2-requirements.md セクション 6（データベース設計）

## Supabase プロジェクト情報

- **Project ID**: `raxaakwoaodfrkkxlgpv`
- **Region**: ap-northeast-1 (Tokyo)
- **URL**: `https://raxaakwoaodfrkkxlgpv.supabase.co`

## 適用済みマイグレーション

1. `create_profiles_table` — profiles + RLS + handle_updated_at + handle_new_user trigger
2. `create_monitor_settings_table` — monitor_settings + RLS + updated_at trigger + partial index
3. `create_collected_data_table` — collected_data + RLS + UNIQUE + indexes
4. `create_analysis_tables` — analysis_results + analysis_jobs + RLS + indexes
5. `create_fetch_logs_table` — fetch_logs + RLS + index
6. `fix_function_search_path` — セキュリティ修正（search_path固定）

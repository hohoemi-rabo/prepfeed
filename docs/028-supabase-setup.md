# 028: Supabase DB設計 & セットアップ

## 概要

Supabase プロジェクトにテーブル作成、RLS ポリシー設定、インデックス作成、トリガー設定を行う。

## 背景

Phase 2 の認証・監視設定・データ収集・AI分析・取得ログに必要なデータベース基盤を構築する。

## 要件

### テーブル作成

#### profiles テーブル

- [ ] `id` (uuid, PK, FK→auth.users)
- [ ] `email` (text, NOT NULL)
- [ ] `display_name` (text)
- [ ] `avatar_url` (text)
- [ ] `google_refresh_token` (text) — Sheetsエクスポート用トークン（暗号化）
- [ ] `is_premium` (boolean, DEFAULT false)
- [ ] `created_at` (timestamptz, DEFAULT now())
- [ ] `updated_at` (timestamptz, DEFAULT now())

#### monitor_settings テーブル

- [ ] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [ ] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [ ] `platform` (text, NOT NULL, CHECK: youtube/qiita/zenn)
- [ ] `type` (text, NOT NULL, CHECK: keyword/channel/user)
- [ ] `value` (text, NOT NULL) — 検索値
- [ ] `display_name` (text) — 表示名
- [ ] `fetch_count` (integer, DEFAULT 50, CHECK: 50/100/200)
- [ ] `is_active` (boolean, DEFAULT true)
- [ ] `last_fetched_at` (timestamptz)
- [ ] `created_at` (timestamptz, DEFAULT now())
- [ ] `updated_at` (timestamptz, DEFAULT now())

#### collected_data テーブル（収集データ）

- [ ] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [ ] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [ ] `setting_id` (uuid, FK→monitor_settings.id)
- [ ] `platform` (text, NOT NULL)
- [ ] `content_id` (text, NOT NULL) — 動画ID / 記事ID
- [ ] `title` (text, NOT NULL)
- [ ] `url` (text, NOT NULL)
- [ ] `published_at` (timestamptz)
- [ ] `author_id` (text)
- [ ] `author_name` (text)
- [ ] `views` (integer) — YouTube再生数
- [ ] `likes` (integer)
- [ ] `comments` (integer)
- [ ] `stocks` (integer) — Qiitaストック数
- [ ] `duration` (text) — YouTube動画時間
- [ ] `tags` (text[])
- [ ] `growth_rate` (numeric)
- [ ] `collected_at` (timestamptz, DEFAULT now())
- [ ] UNIQUE制約: `(user_id, setting_id, content_id)`

#### analysis_results テーブル（AI分析結果）

- [ ] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [ ] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [ ] `setting_id` (uuid, FK→monitor_settings.id) — NULLなら総合分析
- [ ] `analysis_type` (text, CHECK: simple/detailed)
- [ ] `status` (text, CHECK: pending/processing/completed/failed)
- [ ] `result` (jsonb) — 分析結果JSON
- [ ] `error_message` (text)
- [ ] `created_at` (timestamptz, DEFAULT now())
- [ ] `completed_at` (timestamptz)

#### analysis_jobs テーブル（分析ジョブキュー）

- [ ] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [ ] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [ ] `analysis_id` (uuid, FK→analysis_results.id)
- [ ] `job_type` (text, CHECK: simple/detailed)
- [ ] `status` (text, CHECK: queued/processing/completed/failed)
- [ ] `priority` (integer, DEFAULT 0)
- [ ] `payload` (jsonb)
- [ ] `started_at` (timestamptz)
- [ ] `completed_at` (timestamptz)
- [ ] `created_at` (timestamptz, DEFAULT now())

#### fetch_logs テーブル

- [ ] `id` (uuid, PK, DEFAULT uuid_generate_v4())
- [ ] `user_id` (uuid, FK→profiles.id, NOT NULL)
- [ ] `setting_id` (uuid, FK→monitor_settings.id)
- [ ] `platform` (text, NOT NULL)
- [ ] `status` (text, NOT NULL, CHECK: success/error)
- [ ] `records_count` (integer)
- [ ] `error_message` (text)
- [ ] `executed_at` (timestamptz, DEFAULT now())

### RLS ポリシー

- [ ] profiles: 自分のプロファイルのみ SELECT / UPDATE 可能
- [ ] monitor_settings: 自分の設定のみ CRUD 可能
- [ ] collected_data: 自分のデータのみ CRUD 可能
- [ ] analysis_results: 自分の分析結果のみ CRUD 可能
- [ ] fetch_logs: 自分のログのみ SELECT 可能

### インデックス

- [ ] `idx_monitor_settings_user_active` ON monitor_settings(user_id) WHERE is_active = true
- [ ] `idx_collected_data_user_setting` ON collected_data(user_id, setting_id)
- [ ] `idx_collected_data_content` ON collected_data(user_id, content_id)
- [ ] `idx_analysis_results_user` ON analysis_results(user_id, created_at DESC)
- [ ] `idx_analysis_jobs_status` ON analysis_jobs(status) WHERE status IN ('queued', 'processing')
- [ ] `idx_fetch_logs_user` ON fetch_logs(user_id, executed_at DESC)

### トリガー

- [ ] auth.users INSERT 時に profiles レコードを自動作成するトリガー
- [ ] updated_at を自動更新するトリガー（profiles, monitor_settings）

## 受け入れ条件

- [ ] 6テーブルがSupabaseに作成されている
- [ ] RLSが全テーブルで有効になっている
- [ ] 認証ユーザーが自分のデータのみアクセスできることを確認
- [ ] インデックスが作成されている
- [ ] ユーザー登録時にprofilesレコードが自動作成される

## 依存関係

- Supabaseプロジェクト作成済み（手動）

## 関連ファイル

- Supabase マイグレーション SQL
- `src/lib/supabase.ts`（クライアント初期化 — 新規）

## 参照

- phase2_v2-requirements.md セクション 6（データベース設計）

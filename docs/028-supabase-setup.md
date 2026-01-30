# 028: Supabase DB設計 & セットアップ

## 概要

Supabase プロジェクトにテーブル作成、RLS ポリシー設定、インデックス作成、トリガー設定を行う。

## 背景

Phase 2 の認証・監視設定・取得ログに必要なデータベース基盤を構築する。

## 要件

### テーブル作成

#### profiles テーブル

- [ ] `id` (uuid, PK, FK→auth.users)
- [ ] `email` (text, NOT NULL)
- [ ] `display_name` (text)
- [ ] `avatar_url` (text)
- [ ] `spreadsheet_id` (text) — Google SpreadsheetのID
- [ ] `google_refresh_token` (text) — 暗号化されたリフレッシュトークン
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
- [ ] monitor_settings: 自分の設定のみ SELECT / INSERT / UPDATE / DELETE 可能
- [ ] fetch_logs: 自分のログのみ SELECT 可能

### インデックス

- [ ] `idx_monitor_settings_user_id` ON monitor_settings(user_id)
- [ ] `idx_monitor_settings_active` ON monitor_settings(is_active) WHERE is_active = true
- [ ] `idx_fetch_logs_user_id` ON fetch_logs(user_id)
- [ ] `idx_fetch_logs_executed_at` ON fetch_logs(executed_at DESC)

### トリガー

- [ ] auth.users INSERT 時に profiles レコードを自動作成するトリガー
- [ ] updated_at を自動更新するトリガー（profiles, monitor_settings）

## 受け入れ条件

- [ ] 3テーブルがSupabaseに作成されている
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

- phase2-requirements.md セクション 7（データベース設計）

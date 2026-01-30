# 027: TypeScript型定義の拡張

## 概要

Phase 2 で必要となる全型定義を追加・更新する。Qiita / Zenn の記事型、プラットフォーム共通型、監視設定型、取得ログ型を定義する。

## 背景

マルチプラットフォーム対応と有料機能（監視・バッチ）のために、既存の型定義を大幅に拡張する必要がある。

## 要件

### プラットフォーム共通型

- [ ] `Platform` 型: `'youtube' | 'qiita' | 'zenn'`
- [ ] `MonitorType` 型: `'keyword' | 'channel' | 'user'`
- [ ] `FetchCount` 型: `50 | 100 | 200`

### Qiita関連型

- [ ] `QiitaUser` インターフェース（id, name, profile_image_url, items_count, followers_count）
- [ ] `QiitaArticle` インターフェース（id, title, url, published_at, likes_count, stocks_count, tags, author_id, author_name, days_from_published, growth_rate）
- [ ] `QiitaUserResponse` / `QiitaKeywordResponse` レスポンス型

### Zenn関連型

- [ ] `ZennUser` インターフェース（username, name, avatar_url, articles_count）
- [ ] `ZennArticle` インターフェース（id, title, url, published_at, liked_count, author_username, author_name, days_from_published, growth_rate）
- [ ] `ZennUserResponse` / `ZennKeywordResponse` レスポンス型

### 監視設定型

- [ ] `MonitorSetting` インターフェース（id, user_id, platform, type, value, display_name, fetch_count, is_active, last_fetched_at, created_at, updated_at）
- [ ] `CreateMonitorSettingRequest` / `UpdateMonitorSettingRequest` 型

### 取得ログ型

- [ ] `FetchLog` インターフェース（id, user_id, setting_id, platform, status, records_count, error_message, executed_at）

### ユーザープロファイル型

- [ ] `UserProfile` インターフェース（id, email, display_name, avatar_url, spreadsheet_id, google_refresh_token, is_premium, created_at, updated_at）

### 既存型の更新

- [ ] Qiita / Zenn 用の `SortType` 追加（`'likes' | 'date' | 'stocks'` 等）

## 受け入れ条件

- [ ] 全型定義が `src/types/` 配下に整理されている
- [ ] `npm run build` で型エラーが発生しない
- [ ] 既存のYouTube型に影響がない

## 依存関係

- なし（並行して実施可能）

## 関連ファイル

- `src/types/index.ts`（既存の拡張）
- `src/types/qiita.ts`（新規）
- `src/types/zenn.ts`（新規）
- `src/types/monitor.ts`（新規）
- `src/types/user.ts`（新規）

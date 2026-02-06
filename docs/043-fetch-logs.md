# 043: 取得ログ（保存・表示・API）

## 概要

バッチ処理・初回取得の実行結果をログとして保存し、ダッシュボードで表示するためのAPI・UIを実装する。

## 背景

ユーザーがデータ取得の成功/失敗を確認できる透明性が必要。トラブルシューティングにも活用する。

## 要件

### ログ保存ユーティリティ（`lib/fetch-log.ts`）

- [x] `createFetchLog(log)` — ログレコードの作成
- [x] `getUserLogs(userId, options)` — ユーザーのログ取得（ページネーション対応）
- [x] `getRecentLogs(userId, limit)` — 最新N件取得

### APIルート

#### `GET /api/logs`

- [x] 認証済みユーザーのログ一覧を返す
- [x] クエリパラメータ:
  - `page` / `limit` — ページネーション
  - `platform` — プラットフォームフィルタ
  - `status` — ステータスフィルタ（success / error）
- [x] 降順（新しい順）

### ログ表示コンポーネント

#### FetchLogList

- [x] ログのカード/テーブル形式表示
- [x] 各ログに表示:
  - 実行日時（相対日付 + 絶対日時）
  - プラットフォームアイコン
  - 監視設定の値（キーワード or ユーザー名）
  - ステータスバッジ（成功 / エラー）
  - 取得件数
- [x] エラーログのエラーメッセージ展開

#### FetchLogFilters

- [x] プラットフォームフィルタ（All / YouTube / Qiita / Zenn）
- [x] ステータスフィルタ（All / 成功 / エラー）

## 受け入れ条件

- [x] バッチ処理の結果がfetch_logsテーブルに記録される
- [x] `GET /api/logs` でログ一覧が取得できる
- [x] ダッシュボードに最新ログが表示される
- [x] ダッシュボード内でフィルタリング付きログ一覧が表示される
- [x] エラーログにエラーメッセージが表示される
- [x] ページネーションが機能する

## 依存関係

- 028（Supabase DB — fetch_logs テーブル）
- 029（Supabase Auth — 認証必須）
- 040（ダッシュボードページ — 表示先）

## 関連ファイル

- `src/lib/fetch-log.ts`（新規）
- `src/app/api/logs/route.ts`（更新 — フィルタ・ページネーション対応）
- `src/components/dashboard/FetchLogList.tsx`（更新 — compact/full variant）
- `src/components/dashboard/FetchLogFilters.tsx`（新規）
- `src/app/dashboard/logs/page.tsx`（新規 — ログ一覧ページ）
- `src/app/dashboard/page.tsx`（更新 — 「すべて見る」リンク追加）

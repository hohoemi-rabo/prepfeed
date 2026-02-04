# 038: 監視設定API（CRUD）

## 概要

監視設定の作成・取得・更新・削除を行うAPIルートを実装する。設定登録時には初回データ取得も実行する。

## 背景

有料ユーザーが監視対象（キーワード / チャンネル / ユーザー）を登録・管理するためのAPI基盤。

## 要件

### APIルート

#### `GET /api/settings`

- [x] 認証済みユーザーの監視設定一覧を返す
- [x] `is_active` でフィルタリングオプション
- [x] `last_fetched_at` 含む

#### `POST /api/settings`

- [x] 新規監視設定を作成
- [x] リクエストボディ:
  ```typescript
  {
    platform: "youtube" | "qiita" | "zenn",
    type: "keyword" | "channel" | "user",
    value: string,
    display_name?: string,
    fetch_count: 50 | 100 | 200
  }
  ```
- [x] バリデーション（platform, type の組合せチェック）
- [x] 有料ユーザーのみ利用可能（`is_premium` チェック）
- [x] 登録後に初回データ取得を実行（非同期）
- [x] レスポンスに初回取得結果を含む

#### `PUT /api/settings/[id]`

- [x] 監視設定の更新（fetch_count, is_active, display_name）
- [x] 自分の設定のみ更新可能（RLS）

#### `DELETE /api/settings/[id]`

- [x] 監視設定の削除
- [x] 自分の設定のみ削除可能（RLS）
- [x] 関連する fetch_logs は保持（FK制約考慮）

### バリデーションルール

| プラットフォーム | 許可されるタイプ |
|---|---|
| YouTube | keyword, channel |
| Qiita | keyword, user |
| Zenn | keyword, user |

### 初回取得処理

- [x] 設定登録直後にデータ取得を実行
- [x] 取得結果を `collected_data` テーブルに Upsert
- [x] Gemini API で簡易分析を実行 → `analysis_results` に保存
- [x] `last_fetched_at` を更新
- [x] `fetch_logs` に記録
- [x] 失敗時もエラーログを記録（設定自体は保存）

## 受け入れ条件

- [x] `GET /api/settings` で設定一覧が取得できる
- [x] `POST /api/settings` で新規設定が作成できる
- [x] 設定作成後に初回データ取得が実行される
- [x] `PUT /api/settings/[id]` で設定を更新できる
- [x] `DELETE /api/settings/[id]` で設定を削除できる
- [x] 他ユーザーの設定にはアクセスできない
- [x] 無料ユーザーは設定作成できない（403エラー）
- [x] バリデーションエラー時に適切なメッセージが返る

## 依存関係

- 028（Supabase DB — monitor_settings, collected_data テーブル）
- 029（Supabase Auth — 認証必須）
- 037（Gemini AI分析 — 簡易分析実行）

## 関連ファイル

- `src/app/api/settings/route.ts`（新規）
- `src/app/api/settings/[id]/route.ts`（新規）
- `src/lib/monitor.ts`（新規 — 監視設定ビジネスロジック）

## 参照

- phase2_v2-requirements.md セクション 7.2（監視設定API）

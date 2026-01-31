# 038: 監視設定API（CRUD）

## 概要

監視設定の作成・取得・更新・削除を行うAPIルートを実装する。設定登録時には初回データ取得も実行する。

## 背景

有料ユーザーが監視対象（キーワード / チャンネル / ユーザー）を登録・管理するためのAPI基盤。

## 要件

### APIルート

#### `GET /api/settings`

- [ ] 認証済みユーザーの監視設定一覧を返す
- [ ] `is_active` でフィルタリングオプション
- [ ] `last_fetched_at` 含む

#### `POST /api/settings`

- [ ] 新規監視設定を作成
- [ ] リクエストボディ:
  ```typescript
  {
    platform: "youtube" | "qiita" | "zenn",
    type: "keyword" | "channel" | "user",
    value: string,
    display_name?: string,
    fetch_count: 50 | 100 | 200
  }
  ```
- [ ] バリデーション（platform, type の組合せチェック）
- [ ] 有料ユーザーのみ利用可能（`is_premium` チェック）
- [ ] 登録後に初回データ取得を実行（非同期）
- [ ] レスポンスに初回取得結果を含む

#### `PUT /api/settings/[id]`

- [ ] 監視設定の更新（fetch_count, is_active, display_name）
- [ ] 自分の設定のみ更新可能（RLS）

#### `DELETE /api/settings/[id]`

- [ ] 監視設定の削除
- [ ] 自分の設定のみ削除可能（RLS）
- [ ] 関連する fetch_logs は保持（FK制約考慮）

### バリデーションルール

| プラットフォーム | 許可されるタイプ |
|---|---|
| YouTube | keyword, channel |
| Qiita | keyword, user |
| Zenn | keyword, user |

### 初回取得処理

- [ ] 設定登録直後にデータ取得を実行
- [ ] 取得結果を `collected_data` テーブルに Upsert
- [ ] Gemini API で簡易分析を実行 → `analysis_results` に保存
- [ ] `last_fetched_at` を更新
- [ ] `fetch_logs` に記録
- [ ] 失敗時もエラーログを記録（設定自体は保存）

## 受け入れ条件

- [ ] `GET /api/settings` で設定一覧が取得できる
- [ ] `POST /api/settings` で新規設定が作成できる
- [ ] 設定作成後に初回データ取得が実行される
- [ ] `PUT /api/settings/[id]` で設定を更新できる
- [ ] `DELETE /api/settings/[id]` で設定を削除できる
- [ ] 他ユーザーの設定にはアクセスできない
- [ ] 無料ユーザーは設定作成できない（403エラー）
- [ ] バリデーションエラー時に適切なメッセージが返る

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

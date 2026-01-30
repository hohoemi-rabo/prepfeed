# 041: バッチ処理（Vercel Cron）

## 概要

毎日午前3時（JST）に全アクティブ監視設定のデータを自動取得するバッチ処理を実装する。

## 背景

PrepFeed のコア機能は「自動でデータを収集・蓄積する」こと。Vercel Cron を使って定期的にデータ取得を実行する。

## 要件

### Vercel Cron 設定

- [ ] `vercel.json` に Cron 設定追加
  ```json
  {
    "crons": [
      {
        "path": "/api/batch",
        "schedule": "0 18 * * *"
      }
    ]
  }
  ```
  （UTC 18:00 = JST 03:00）

### バッチAPIルート

#### `POST /api/batch`

- [ ] `CRON_SECRET` 環境変数によるアクセス保護
- [ ] Vercel Cron の `Authorization` ヘッダー検証
- [ ] 処理フロー:
  1. アクティブな監視設定を全件取得
  2. ユーザーごとにグループ化
  3. 各ユーザーの処理:
     - Google トークンをリフレッシュ
     - 監視設定ごとにデータ取得
     - Google Sheets に Upsert
     - fetch_logs に記録
  4. 処理完了ログ出力

#### `POST /api/batch/manual`

- [ ] 管理者用の手動バッチ実行エンドポイント
- [ ] 認証 + is_premium チェック
- [ ] 特定ユーザーの設定のみ実行可能

### データ取得ロジック（`lib/batch-processor.ts`）

- [ ] `processAllSettings()` — 全設定の処理
- [ ] `processUserSettings(userId, settings)` — ユーザー単位の処理
- [ ] `fetchData(setting)` — プラットフォーム別のデータ取得
  - YouTube: 既存の youtube.ts を利用
  - Qiita: qiita.ts を利用
  - Zenn: zenn.ts を利用
- [ ] 取得件数対応（50/100/200）
  - APIの1回あたり取得上限に応じてページネーション

### エラーハンドリング

- [ ] 個別設定の失敗が他の設定に影響しない
- [ ] Google トークンの期限切れ対応（リフレッシュ失敗時はスキップ）
- [ ] APIレートリミット時の待機処理
- [ ] タイムアウト対策（Vercel Functions の制限: 60秒）
  - 設定数が多い場合の分割実行を考慮

### ログ記録

- [ ] 各設定の実行結果を `fetch_logs` テーブルに記録
- [ ] ステータス: `success` / `error`
- [ ] 取得件数・エラーメッセージを記録
- [ ] `last_fetched_at` を更新

## 受け入れ条件

- [ ] `POST /api/batch` でバッチ処理が実行される
- [ ] `CRON_SECRET` なしではアクセスが拒否される
- [ ] アクティブな監視設定ごとにデータが取得される
- [ ] 取得データが Google Sheets に書き込まれる
- [ ] `fetch_logs` に実行結果が記録される
- [ ] 個別エラーが他の処理に影響しない
- [ ] Vercel Functions のタイムアウト内で完了する

## 依存関係

- 028（Supabase DB — monitor_settings, fetch_logs）
- 032（Qiita APIクライアント）
- 033（Zenn APIクライアント）
- 037（Google OAuth — トークンリフレッシュ）
- 042（Google Sheets Upsert）

## 関連ファイル

- `src/app/api/batch/route.ts`（新規）
- `src/app/api/batch/manual/route.ts`（新規）
- `src/lib/batch-processor.ts`（新規）
- `vercel.json`（更新）

## 参照

- phase2-requirements.md セクション 9（バッチ処理設計）

## 注意事項

- Vercel Hobby プランでは Cron は1日1回まで
- Vercel Functions のタイムアウトは60秒（Hobby）/ 300秒（Pro）
- 大量の監視設定がある場合、バッチを分割する設計を検討すること

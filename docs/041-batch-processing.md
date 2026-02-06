# 041: バッチ処理（Vercel Cron）

## 概要

毎日午前3時（JST）に全アクティブ監視設定のデータを自動取得し、collected_data に保存、簡易分析を実行するバッチ処理を実装する。

## 背景

PrepFeed のコア機能は「自動でデータを収集・蓄積・分析する」こと。Vercel Cron を使って定期的にデータ取得 + Gemini 簡易分析を実行する。

## 要件

### Vercel Cron 設定

- [x] `vercel.json` に Cron 設定追加
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

- [x] `CRON_SECRET` 環境変数によるアクセス保護
- [x] Vercel Cron の `Authorization` ヘッダー検証
- [x] 処理フロー:
  1. アクティブな監視設定を全件取得
  2. ユーザーごとにグループ化
  3. 各ユーザー × 各監視設定の処理:
     a. プラットフォームAPIでデータ取得
     b. `collected_data` に Upsert
     c. Gemini API で簡易分析
     d. `analysis_results` に保存
     e. `fetch_logs` に記録
     f. `last_fetched_at` を更新
  4. 処理完了ログ出力

#### `POST /api/batch/manual`

- [x] 管理者用の手動バッチ実行エンドポイント
- [x] 認証 + is_premium チェック
- [x] 特定ユーザーの設定のみ実行可能

### データ取得ロジック（`lib/batch-processor.ts`）

- [x] `processAllSettings()` — 全設定の処理
- [x] `processUserSettings(userId, settings)` — ユーザー単位の処理
- [x] `fetchData(setting)` — プラットフォーム別のデータ取得
  - YouTube: 既存の youtube.ts を利用
  - Qiita: qiita.ts を利用
  - Zenn: zenn.ts を利用
- [x] 取得件数対応（50/100/200）
  - APIの1回あたり取得上限に応じてページネーション

### Upsert ロジック（`lib/data-collector.ts`）

- [x] `upsertCollectedData(userId, settingId, data)` — collected_data への差分更新
- [x] ユニーク制約 `(user_id, setting_id, content_id)` を利用した ON CONFLICT UPSERT
- [x] 変動値（views, likes, comments, stocks, growth_rate）のみ更新

### エラーハンドリング

- [x] 個別設定の失敗が他の設定に影響しない
- [x] Gemini API のレートリミット対応（簡易分析失敗時はデータ収集のみで続行）
- [x] 外部APIレートリミット時の待機処理
- [x] タイムアウト対策（Vercel Functions の制限: 60秒）
  - 設定数が多い場合の分割実行を考慮

### ログ記録

- [x] 各設定の実行結果を `fetch_logs` テーブルに記録
- [x] ステータス: `success` / `error`
- [x] 取得件数・エラーメッセージを記録
- [x] `last_fetched_at` を更新

## 受け入れ条件

- [x] `POST /api/batch` でバッチ処理が実行される
- [x] `CRON_SECRET` なしではアクセスが拒否される
- [x] アクティブな監視設定ごとにデータが取得される
- [x] 取得データが `collected_data` テーブルに保存される
- [x] 各監視設定の簡易分析が `analysis_results` に保存される
- [x] `fetch_logs` に実行結果が記録される
- [x] 個別エラーが他の処理に影響しない
- [x] Vercel Functions のタイムアウト内で完了する

## 依存関係

- 028（Supabase DB — monitor_settings, collected_data, analysis_results, fetch_logs）
- 032（Qiita APIクライアント）
- 033（Zenn APIクライアント）
- 037（Gemini AI分析 — 簡易分析実行）

## 関連ファイル

- `src/app/api/batch/route.ts`（新規）
- `src/app/api/batch/manual/route.ts`（新規）
- `src/lib/batch-processor.ts`（新規）
- `src/lib/data-collector.ts`（新規 — collected_data Upsert ロジック）
- `src/lib/supabase/admin.ts`（新規 — Service Role Client）
- `src/lib/monitor.ts`（修正 — 関数 export 追加）
- `vercel.json`（更新）

## 参照

- phase2_v2-requirements.md セクション 10（バッチ処理設計）

## 注意事項

- Vercel Hobby プランでは Cron は1日1回まで
- Vercel Functions のタイムアウトは60秒（Hobby）/ 300秒（Pro）
- 大量の監視設定がある場合、バッチを分割する設計を検討すること
- 環境変数 `SUPABASE_SERVICE_ROLE_KEY` と `CRON_SECRET` の追加が必要

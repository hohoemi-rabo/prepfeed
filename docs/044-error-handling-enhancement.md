# 044: エラーハンドリング強化

## 概要

Phase 2 で追加された全APIルート・バッチ処理のエラーハンドリングを統一的に強化する。

## 背景

Phase 2 で Qiita / Zenn / Gemini AI / バッチ処理 / Google Sheets エクスポートなど多くの外部連携が追加されたため、エラーハンドリングの網羅的な整備が必要。

## 要件

### エラー種別の拡張（`lib/error-handler.ts`）

既存の6種類に加えて以下を追加:

- [x] `QIITA_API_ERROR` — Qiita APIのエラー
- [x] `ZENN_API_ERROR` — Zenn APIのエラー（仕様変更含む）
- [x] `GEMINI_API_ERROR` — Gemini API呼び出しエラー
- [x] `GEMINI_PARSE_ERROR` — Gemini応答のJSONパースエラー
- [x] `ANALYSIS_TIMEOUT_ERROR` — 分析処理タイムアウト
- [x] `GOOGLE_AUTH_ERROR` — Google OAuthトークンエラー（エクスポート用）
- [x] `GOOGLE_SHEETS_ERROR` — Google Sheets エクスポートエラー
- [x] `BATCH_TIMEOUT_ERROR` — バッチ処理タイムアウト
- [x] `PREMIUM_REQUIRED` — 有料機能へのアクセス

### 各APIルートのエラー対応

- [x] Qiita API: レートリミット（1,000/時）超過、404
- [x] Zenn API: API仕様変更、レスポンス形式変更
- [x] Gemini API: レートリミット（15 RPM無料枠）、タイムアウト、不正JSON応答
- [x] 分析ジョブ: バックグラウンド処理失敗、ジョブステータス管理
- [x] Google OAuth: トークン期限切れ、リフレッシュ失敗（エクスポート時）
- [x] Google Sheets: セル数上限、APIクォータ超過（エクスポート時）
- [x] 監視設定API: バリデーションエラー、権限エラー
- [x] バッチ処理: 個別失敗の隔離、タイムアウト

### ユーザー向けエラーメッセージ

- [x] 各エラー種別に日本語のユーザーフレンドリーメッセージ
- [x] リトライ可否の表示
- [x] 対処方法のヒント表示

### エラートラッキング

- [x] 新規エラー種別の Vercel Analytics 追跡追加
- [x] バッチ処理のエラー率モニタリング

## 受け入れ条件

- [x] 全API ルートで適切なHTTPステータスコードが返る
- [x] 各エラーに日本語メッセージが設定されている
- [x] 外部API障害時にアプリが落ちない
- [x] バッチ処理で個別エラーが他の処理に影響しない
- [x] エラーがVercel Analyticsで追跡される

## 依存関係

- 032〜046 の各チケット完了後に横断的に実施

## 関連ファイル

- `src/lib/error-handler.ts`（更新 — 9種別追加 + hint フィールド + 分類ロジック拡張）
- `src/lib/tracking.ts`（更新 — Phase 2 トラッキングイベント追加）
- 各APIルートファイル（既にインラインで適切なエラーハンドリング実装済み）

# 044: エラーハンドリング強化

## 概要

Phase 2 で追加された全APIルート・バッチ処理のエラーハンドリングを統一的に強化する。

## 背景

Phase 2 で Qiita / Zenn / Google Sheets / バッチ処理など多くの外部連携が追加されたため、エラーハンドリングの網羅的な整備が必要。

## 要件

### エラー種別の拡張（`lib/error-handler.ts`）

既存の6種類に加えて以下を追加:

- [ ] `QIITA_API_ERROR` — Qiita APIのエラー
- [ ] `ZENN_API_ERROR` — Zenn APIのエラー（仕様変更含む）
- [ ] `GOOGLE_AUTH_ERROR` — Google OAuthトークンエラー
- [ ] `GOOGLE_SHEETS_ERROR` — Google Sheets 書込エラー
- [ ] `BATCH_TIMEOUT_ERROR` — バッチ処理タイムアウト
- [ ] `PREMIUM_REQUIRED` — 有料機能へのアクセス

### 各APIルートのエラー対応

- [ ] Qiita API: レートリミット（1,000/時）超過、404
- [ ] Zenn API: API仕様変更、レスポンス形式変更
- [ ] Google OAuth: トークン期限切れ、リフレッシュ失敗、権限不足
- [ ] Google Sheets: セル数上限、APIクォータ超過
- [ ] 監視設定API: バリデーションエラー、権限エラー
- [ ] バッチ処理: 個別失敗の隔離、タイムアウト

### ユーザー向けエラーメッセージ

- [ ] 各エラー種別に日本語のユーザーフレンドリーメッセージ
- [ ] リトライ可否の表示
- [ ] 対処方法のヒント表示

### エラートラッキング

- [ ] 新規エラー種別の Vercel Analytics 追跡追加
- [ ] バッチ処理のエラー率モニタリング

## 受け入れ条件

- [ ] 全API ルートで適切なHTTPステータスコードが返る
- [ ] 各エラーに日本語メッセージが設定されている
- [ ] 外部API障害時にアプリが落ちない
- [ ] バッチ処理で個別エラーが他の処理に影響しない
- [ ] エラーがVercel Analyticsで追跡される

## 依存関係

- 032〜043 の各チケット完了後に横断的に実施

## 関連ファイル

- `src/lib/error-handler.ts`（更新）
- `src/lib/tracking.ts`（更新）
- 各APIルートファイル（更新）

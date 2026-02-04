# 040: ダッシュボード & 分析結果UI

## 概要

有料ユーザー向けのダッシュボードページを実装する。AI分析結果の閲覧がメイン機能。監視設定一覧・取得ログも統合表示する。

## 背景

v2仕様により、ダッシュボードの中心はAI分析結果の表示に変更。簡易分析のカード表示、詳細分析の実行・閲覧、監視設定の管理を一元化する。

## 要件

### ダッシュボードレイアウト（`/dashboard`）

#### 分析結果セクション（メイン）

- [x] 「詳細分析を実行」ボタン → POST /api/analysis/detailed
- [x] 簡易分析結果のカード一覧（監視設定ごと）
- [x] 各カードに表示:
  - プラットフォームアイコン + 監視タイプ + 検索値
  - 最終更新日時
  - トレンドスコア（0-100）
  - サマリー（100文字以内）
  - 注目コンテンツ上位2-3件
  - 関連キーワード
- [x] 過去の詳細分析結果リンク一覧

#### 監視設定セクション

- [x] 設定件数の表示
- [x] 「+ 設定を追加」ボタン → MonitorWizard 起動
- [x] 設定のコンパクトリスト表示（プラットフォーム / タイプ / 値 / 件数 / 有効状態）
- [x] 空状態:「監視設定を追加してデータ収集を開始しましょう」

#### 取得ログセクション（インライン）

- [x] 最新ログ5件の表示
- [x] 各ログ: 実行日時 / プラットフォーム / ステータス / 件数

### 詳細分析結果ページ（`/dashboard/analysis/[id]`）

- [x] 「← 戻る」ナビゲーション
- [x] 生成日時表示
- [x] トレンド分析セクション
  - 今週のトレンド総括
  - 上昇トピック（トピック名、成長率、プラットフォーム）
  - 下降トピック
- [x] ネタ提案セクション
  - 提案タイトル、理由、推奨プラットフォーム、ポテンシャル
- [x] 競合分析セクション
  - トップパフォーマー、投稿パターン、よく使われるタグ
- [x] レコメンデーションセクション
  - 具体的なアドバイス一覧

### 詳細分析実行中の表示

- [x] プログレスバー（ステータスに応じて更新）
- [x] ステータスメッセージ（データ収集中... → AIが分析中...）
- [x] 「ページを離れても分析は継続されます」注意書き
- [x] ポーリング（2秒間隔）で完了検知 → 結果ページへ遷移

### 監視設定ページ（`/dashboard/settings`）

- [x] 監視設定の全一覧表示
- [x] フィルタリング（プラットフォーム、有効/無効）
- [x] 編集・削除操作

### エクスポートページ（`/dashboard/export`）

- [x] Google Sheets連携状態の表示
- [x] 連携 / 連携解除ボタン
- [x] エクスポート対象選択（全データ / 特定監視設定 / 期間指定）
- [x] 「Sheetsにエクスポート」ボタン
- [x] CSVダウンロードボタン

### ポーリングフック（`hooks/useAnalysisStatus.ts`）

```typescript
export function useAnalysisStatus(analysisId: string | null) {
  // 2秒ごとにGET /api/analysis/status/{id}
  // completed → 結果を返す、failed → エラー表示
}
```

### アクセス制御

- [x] 未認証ユーザーは `/auth/login` にリダイレクト
- [x] 無料ユーザーはダッシュボードにアクセス可能だがアップグレード案内を表示

## 受け入れ条件

- [x] `/dashboard` にログイン済みでアクセスできる
- [x] 未ログインでリダイレクトされる
- [x] 簡易分析結果カードが監視設定ごとに表示される
- [x] 「詳細分析を実行」で分析が開始し、プログレスが表示される
- [x] 分析完了後に結果ページに遷移できる
- [x] `/dashboard/analysis/[id]` で詳細分析レポートが表示される
- [x] 監視設定一覧が表示される
- [x] 取得ログがインライン表示される
- [x] `/dashboard/export` でエクスポート設定が表示される
- [x] レスポンシブ対応

## 依存関係

- 029（Supabase Auth）
- 030（認証UI）
- 037（Gemini AI分析 — 分析結果データ）
- 039（監視設定UI — 設定カード・ウィザード）
- 042（バックグラウンドジョブ — 詳細分析の非同期実行）

## 関連ファイル

- `src/app/dashboard/page.tsx`（新規）
- `src/app/dashboard/layout.tsx`（新規）
- `src/app/dashboard/analysis/[id]/page.tsx`（新規）
- `src/app/dashboard/settings/page.tsx`（新規）
- `src/app/dashboard/export/page.tsx`（新規）
- `src/components/dashboard/AnalysisCard.tsx`（新規）
- `src/components/dashboard/AnalysisProgress.tsx`（新規）
- `src/components/dashboard/DetailedReport.tsx`（新規）
- `src/components/dashboard/GoogleSheetsStatus.tsx`（新規）
- `src/hooks/useAnalysisStatus.ts`（新規）

## 参照

- phase2_v2-requirements.md セクション 12（ページ・UI設計）

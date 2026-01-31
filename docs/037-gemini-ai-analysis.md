# 037: Gemini AI分析クライアント & 分析APIルート

## 概要

Gemini 2.5 Flash を使用したAI分析機能を実装する。簡易分析（監視設定ごと・自動）と詳細分析（全データ横断・手動）の2段階構成。

## 背景

v2仕様変更により、PrepFeed内でAI分析まで完結する。NotebookLMへの委譲ではなく、Gemini APIを直接利用して分析結果を提供する。

## 要件

### Gemini APIクライアント（`lib/gemini.ts`）

- [ ] `@google/generative-ai` パッケージインストール
- [ ] `GEMINI_API_KEY` 環境変数対応
- [ ] モデル: `gemini-2.5-flash`
- [ ] JSON出力モード（structured output）
- [ ] エラーハンドリング（レートリミット、タイムアウト、不正JSON応答）
- [ ] リトライロジック（指数バックオフ）

### 簡易分析（Simple Analysis）

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| タイミング | バッチ処理時に自動実行         |
| 対象       | 各監視設定の収集データ（個別） |
| 処理時間   | 5〜15秒                        |
| 実行方法   | バッチ処理内で同期実行         |

- [ ] `runSimpleAnalysis(settingId, data)` — 監視設定ごとの簡易分析
- [ ] 出力: `SimpleAnalysisResult` （トレンドスコア、サマリー、注目コンテンツ、キーワード）

**出力スキーマ（JSONB）**:

```json
{
  "trend_score": 78,
  "summary": "AI関連の動画投稿が増加傾向。特にClaude関連が注目。",
  "top_contents": [
    { "id": "xxx", "title": "...", "reason": "急激な再生数増加" }
  ],
  "keywords": ["Claude", "Gemini", "ChatGPT"],
  "generated_at": "2026-01-30T03:00:00Z"
}
```

### 詳細分析（Detailed Analysis）

| 項目       | 内容                       |
| ---------- | -------------------------- |
| タイミング | ユーザーが手動でリクエスト |
| 対象       | 全監視設定のデータを横断   |
| 処理時間   | 30〜60秒                   |
| 実行方法   | バックグラウンドジョブ     |

- [ ] `runDetailedAnalysis(userId, data)` — 全データ横断の詳細分析
- [ ] 出力: `DetailedAnalysisResult`（トレンド分析、ネタ提案、競合分析、レコメンデーション）

**出力スキーマ（JSONB）**:

```json
{
  "trend_analysis": {
    "summary": "今週のトレンド総括...",
    "rising_topics": [{ "topic": "Claude Code", "growth": "+120%", "platforms": ["youtube", "qiita"] }],
    "declining_topics": [...]
  },
  "content_ideas": [
    {
      "title": "Claude Code vs Cursor 徹底比較",
      "reason": "両方のキーワードが急上昇中",
      "platform_recommendation": "YouTube",
      "estimated_potential": "高"
    }
  ],
  "competitor_analysis": {
    "top_performers": [...],
    "posting_patterns": "週3回、火木土が多い",
    "common_tags": [...]
  },
  "recommendations": ["AI×プログラミングの切り口が伸びている", "..."],
  "generated_at": "2026-01-30T10:30:00Z"
}
```

### プロンプト設計

- [ ] 簡易分析プロンプト（プラットフォーム別データ → トレンドスコア + サマリー + 注目コンテンツ + キーワード）
- [ ] 詳細分析プロンプト（全プラットフォーム横断データ → トレンド分析 + ネタ提案 + 競合分析 + レコメンデーション）
- [ ] JSON出力を強制するシステムプロンプト
- [ ] 日本語出力指定

### 分析APIルート

| エンドポイント              | メソッド | 説明               |
| --------------------------- | -------- | ------------------ |
| `/api/analysis`             | GET      | 分析結果一覧取得   |
| `/api/analysis/[id]`        | GET      | 分析結果詳細取得   |
| `/api/analysis/detailed`    | POST     | 詳細分析リクエスト |
| `/api/analysis/status/[id]` | GET      | 分析ステータス確認 |

#### `GET /api/analysis`

- [ ] 認証済みユーザーの分析結果一覧を返す
- [ ] `analysis_type` でフィルタリング（simple / detailed）
- [ ] 新しい順で返す

#### `GET /api/analysis/[id]`

- [ ] 特定の分析結果を返す（result JSONB含む）

#### `POST /api/analysis/detailed`

- [ ] 詳細分析のリクエスト
- [ ] `analysis_results` に pending レコード作成
- [ ] `analysis_jobs` に queued レコード作成
- [ ] バックグラウンドジョブを起動（042参照）
- [ ] 即座に 202 Accepted を返却

#### `GET /api/analysis/status/[id]`

- [ ] 分析ジョブのステータスを返す（queued / processing / completed / failed）
- [ ] completed の場合は結果も含む（ポーリング用）

### エラーハンドリング

| エラー         | 対応                                   |
| -------------- | -------------------------------------- |
| レートリミット | リトライ（指数バックオフ）             |
| タイムアウト   | ジョブをfailedに更新、ユーザーに通知   |
| 不正なJSON応答 | パース試行、失敗時はエラー保存         |
| APIエラー      | エラーメッセージを保存、ユーザーに表示 |

## 受け入れ条件

- [ ] Gemini APIクライアントが正しく動作する
- [ ] 簡易分析でトレンドスコア・サマリーが生成される
- [ ] 詳細分析でトレンド分析・ネタ提案・競合分析が生成される
- [ ] 分析結果がanalysis_resultsテーブルに保存される
- [ ] `GET /api/analysis` で分析結果一覧が取得できる
- [ ] `POST /api/analysis/detailed` で202が返り、バックグラウンドジョブが起動する
- [ ] `GET /api/analysis/status/[id]` でステータスが確認できる
- [ ] Gemini APIエラー時にアプリが落ちない

## 依存関係

- 027（型定義 — AI分析関連型）
- 028（Supabase DB — analysis_results, analysis_jobs テーブル）
- 029（Supabase Auth — 認証必須）

## 関連ファイル

- `src/lib/gemini.ts`（新規）
- `src/lib/analysis.ts`（新規 — 分析ビジネスロジック）
- `src/app/api/analysis/route.ts`（新規）
- `src/app/api/analysis/[id]/route.ts`（新規）
- `src/app/api/analysis/detailed/route.ts`（新規）
- `src/app/api/analysis/status/[id]/route.ts`（新規）

## 参照

- phase2_v2-requirements.md セクション 8（Gemini AI 分析設計）
- phase2_v2-requirements.md セクション 13.1（Gemini API 仕様）

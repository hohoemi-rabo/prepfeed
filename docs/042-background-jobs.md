# 042: バックグラウンドジョブ（詳細分析）

## 概要

詳細分析（30〜60秒）をバックグラウンドジョブとして実行する仕組みを実装する。Vercel Functions の `waitUntil` を使用し、レスポンスを即座に返しつつバックグラウンドで処理を継続する。

## 背景

詳細分析は全データを横断してGemini APIを呼び出すため、通常のリクエスト/レスポンスのタイムアウト内では完了しない。バックグラウンドジョブとして実行し、フロントエンドはポーリングで完了を検知する。

## 要件

### バックグラウンドジョブ実行（Vercel waitUntil）

- [ ] `@vercel/functions` パッケージの `waitUntil` を使用
- [ ] `POST /api/analysis/detailed` でジョブ登録 + バックグラウンド起動
- [ ] 即座に 202 Accepted を返却

### ジョブ処理フロー

```
1. POST /api/analysis/detailed
   ├── analysis_results に pending レコード作成
   ├── analysis_jobs に queued レコード作成
   ├── waitUntil(runDetailedAnalysis(...))
   └── return 202 { analysisId, status: 'queued' }

2. バックグラウンド処理
   ├── analysis_jobs.status → 'processing'
   ├── 全監視設定のcollected_dataを取得
   ├── Gemini API呼び出し（詳細分析プロンプト）
   ├── analysis_results.result に結果保存
   ├── analysis_results.status → 'completed'
   └── analysis_jobs.status → 'completed'

3. フロントエンド（ポーリング）
   ├── GET /api/analysis/status/{id} （2秒間隔）
   ├── status: 'processing' → プログレス表示
   ├── status: 'completed' → 結果ページへ遷移
   └── status: 'failed' → エラー表示
```

### ジョブ管理ロジック（`lib/background-jobs.ts`）

- [ ] `createAnalysisJob(userId, analysisId, type)` — ジョブレコード作成
- [ ] `updateJobStatus(jobId, status, error?)` — ステータス更新
- [ ] `getJobStatus(jobId)` — ステータス取得
- [ ] `runDetailedAnalysis(userId, analysisId, jobId)` — メイン処理

### 実装例

```typescript
// app/api/analysis/detailed/route.ts
import { waitUntil } from '@vercel/functions';

export async function POST(request: Request) {
  const { userId } = await getSession(request);

  // 1. 分析レコード作成
  const analysis = await createAnalysisRecord(userId, 'detailed', 'pending');
  const job = await createJobRecord(userId, analysis.id, 'detailed', 'queued');

  // 2. バックグラウンドで実行
  waitUntil(runDetailedAnalysis(userId, analysis.id, job.id));

  // 3. 即座にレスポンス
  return Response.json(
    { analysisId: analysis.id, status: 'queued' },
    { status: 202 }
  );
}
```

### Cloudflare移行時の対応

- [ ] Cloudflare Workers Queue への移行を見据えた抽象化
- [ ] `lib/background-jobs.ts` にプラットフォーム差分を閉じ込める

### エラーハンドリング

- [ ] Gemini APIタイムアウト → ジョブを failed に更新
- [ ] 不正なJSON応答 → パース試行、失敗時はエラー保存
- [ ] 予期しない例外 → ジョブを failed に更新 + エラーメッセージ保存
- [ ] Vercel Functions タイムアウト（300秒 Pro / 60秒 Hobby）への対応

### タイムアウト対策

- [ ] 処理開始時刻を記録
- [ ] 残り時間に応じてGemini API呼び出しの制限
- [ ] Hobbyプランでは簡易版の詳細分析にフォールバック

## 受け入れ条件

- [ ] `POST /api/analysis/detailed` が即座に 202 を返す
- [ ] バックグラウンドでGemini API呼び出しが実行される
- [ ] analysis_jobs のステータスが queued → processing → completed と遷移する
- [ ] analysis_results に分析結果が保存される
- [ ] `GET /api/analysis/status/[id]` でステータス確認ができる
- [ ] エラー発生時にジョブが failed になりエラーメッセージが保存される
- [ ] Vercel Functions のタイムアウト内で完了する

## 依存関係

- 028（Supabase DB — analysis_results, analysis_jobs テーブル）
- 037（Gemini AI分析 — 分析ロジック）

## 関連ファイル

- `src/lib/background-jobs.ts`（新規）
- `src/app/api/analysis/detailed/route.ts`（037で作成、ここでwaitUntil統合）
- `src/app/api/analysis/status/[id]/route.ts`（037で作成）

## 参照

- phase2_v2-requirements.md セクション 9（バックグラウンドジョブ設計）

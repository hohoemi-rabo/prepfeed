# PrepFeed 機能仕様書

> 最終更新: 2026-02-13
> バージョン: 0.1.0 (Phase 2 完了)

---

## 1. プロジェクト概要

**PrepFeed** — 集めて、分析して、ネタにする。

YouTube・Qiita・Zenn・note の公開データを分析し、コンテンツ企画のネタ出しをサポートするツール。

### 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15.5.12 (App Router, Turbopack) |
| UI | React 19.1.0 + Tailwind CSS 3.4.17 |
| 言語 | TypeScript 5 (strict mode) |
| 状態管理 | Zustand (ソート状態) |
| データ可視化 | Recharts (動的インポート) |
| 認証 | Supabase Auth (Google OAuth, PKCE) |
| データベース | Supabase PostgreSQL + RLS |
| AI 分析 | Google Gemini 3 Flash Preview |
| キャッシュ | Vercel KV (本番) / In-Memory (開発) |
| デプロイ | Vercel (hnd1 / Tokyo) |
| アナリティクス | Vercel Analytics |
| アニメーション | Framer Motion |

### 本番環境

- **URL**: https://prepfeed.vercel.app
- **Supabase Region**: ap-northeast-1 (Tokyo)
- **Vercel Region**: hnd1 (Tokyo)

---

## 2. 対応プラットフォーム

| プラットフォーム | API | テーマカラー | アイコン | 検索タイプ |
|----------------|-----|------------|---------|-----------|
| YouTube | YouTube Data API v3 (公式) | `#FF0000` | Youtube | チャンネル分析 / キーワード検索 |
| Qiita | Qiita API v2 (公式) | `#55C500` | Code2 | ユーザー検索 / キーワード検索 |
| Zenn | Zenn API (非公式) | `#3EA8FF` | BookOpen | ユーザー検索 / キーワード検索 |
| note | note API (非公式) | `#41C9B4` | StickyNote | クリエイター検索 / キーワード検索 |

### プラットフォーム別制約

- **YouTube**: API クォータ制限あり (1日15,000ユニット)。キーワード検索は150ユニット/回
- **Qiita**: トークンなし60req/h、トークンあり1,000req/h
- **Zenn**: 非公式 API のため仕様変更リスクあり
- **note**: 非公式 API、1500ms スロットリング必須、キャッシュ 60 分、取得上限 50 件/回

---

## 3. ページ・ルート一覧

### 3.1 公開ページ（認証不要）

#### ホームページ (`/`)

4 プラットフォームのタブナビゲーションを備えた検索ポータル。

- **YouTube タブ**: チャンネル名検索 (SearchBar + オートコンプリート) + キーワード検索
- **Qiita タブ**: ユーザー ID 検索 + キーワード検索
- **Zenn タブ**: ユーザー名検索 + キーワード検索
- **note タブ**: クリエイター名検索 + キーワード検索
- 無料・プレミアム機能の説明セクション
- PrepFeed の特徴紹介 (4つの主要機能)
- ログイン促進 CTA

#### YouTube チャンネル詳細 (`/youtube/channel/[id]`)

YouTube チャンネルの詳細分析ページ。

- **チャンネル情報**: プロフィール画像、説明文、登録者数、総再生数
- **統計サマリー**: 動画数 / 登録者数 / 総再生数 (3カラム)
- **再生数推移グラフ**: 直近10本の動画 (Recharts LineChart、動的インポート)
- **動画リスト**: 最新50本、5種ソート対応
- **シェアボタン**: Twitter/X シェア + 動的 OGP
- **再検索バー**: SearchBar コンポーネント

#### YouTube キーワード検索 (`/youtube/keyword/[query]`)

YouTube 動画のキーワード検索結果ページ。

- **取得件数**: 上位50件 (search.list + videos.list、API 150ユニット消費)
- **再検索フォーム**: 別キーワードでの再検索
- **検索結果ヘッダー**: グラデーションアイコン + 件数表示
- **動画リスト**: 5種ソート対応 (SortTabs + VideoList)

#### Qiita ユーザーページ (`/qiita/user/[id]`)

Qiita ユーザーの記事分析ページ。

- **ユーザーカード**: PlatformUserCard (プロフィール画像、記事数、フォロワー数)
- **統計サマリー**: 記事数 / フォロワー数
- **記事一覧**: ソート対応 (日付 / いいね / ストック / コメント、昇降順)

#### Qiita キーワード検索 (`/qiita/keyword/[query]`)

- **表示**: 検索結果ヘッダー + 再検索フォーム + 記事一覧
- **ソート**: ArticleSortTabs (likes デフォルト)

#### Zenn ユーザーページ (`/zenn/user/[username]`)

- **ユーザーカード**: PlatformUserCard (プロフィール画像、記事数)
- **統計サマリー**: 記事数
- **記事一覧**: ソート対応

#### Zenn キーワード検索 (`/zenn/keyword/[query]`)

- **表示**: 検索結果ヘッダー + 再検索フォーム + 記事一覧

#### note クリエイターページ (`/note/user/[urlname]`)

- **ユーザーカード**: PlatformUserCard (プロフィール画像、記事数、フォロワー数)
- **統計サマリー**: 記事数
- **記事一覧**: ソート対応
- **特殊機能**: クリエイター未検出時にクリエイター候補を検索・表示 (グリッド)

#### note キーワード検索 (`/note/keyword/[query]`)

- **表示**: 検索結果ヘッダー + 再検索フォーム + 記事一覧

#### 法的ページ

| パス | 内容 |
|-----|------|
| `/disclaimer` | 利用規約 + 各プラットフォームの著作権表示 |
| `/privacy` | プライバシーポリシー |
| `/contact` | お問い合わせページ |

### 3.2 認証ページ

#### ログインページ (`/auth/login`)

- Google OAuth ログインボタン (ローディング状態対応)
- プレミアム機能紹介 (3つのアイコン付き説明)
- エラーメッセージ表示
- 利用規約・プライバシーポリシーへのリンク
- 認証済みユーザーは `/dashboard` に自動リダイレクト

#### 認証コールバック (`/auth/callback`)

- Supabase OAuth コールバック処理
- セッション確立後 `/dashboard` またはクエリパラメータ `next` で指定されたパスにリダイレクト

### 3.3 保護ページ（認証必須）

#### ダッシュボード (`/dashboard`)

分析結果の一覧表示とアクション実行のメインページ。

- **分析結果セクション**:
  - 実行中の詳細分析プログレス表示 (2秒間隔ポーリング)
  - 簡易分析カード一覧 (AnalysisCard、グリッド1-2カラム)
  - 「詳細分析を実行」ボタン (簡易分析がある場合のみ表示)
  - 過去の詳細分析レポートへのリンク
- **サイドセクション** (lgブレークポイント以上で2カラム):
  - 監視設定サマリー (SettingsCompactList)
  - 取得ログサマリー (FetchLogList compact、直近5件)

#### 監視設定ページ (`/dashboard/settings`)

監視設定の管理ページ。

- **ウィザード** (MonitorWizard、5ステップ):
  1. プラットフォーム選択 (YouTube / Qiita / Zenn / note)
  2. 監視タイプ選択 (keyword / channel / user、プラットフォームにより異なる)
  3. 検索値入力 + バリデーション
  4. YouTube チャンネル検索 (YouTube + channel タイプのみ)
  5. 確認 + 作成
- **設定一覧** (MonitorSettingCard):
  - プラットフォームアイコン + ラベル
  - 最終取得時刻
  - 有効/無効ステータス
  - 編集ボタン → MonitorEditModal (display_name / fetch_count / is_active)
  - 削除ボタン (確認付き)

#### 取得ログページ (`/dashboard/logs`)

データ取得の履歴ログ一覧。

- **フィルター**: プラットフォーム (YouTube / Qiita / Zenn / note) + ステータス (success / error)
- **ログ一覧**: FetchLogList (full variant)
- **ページネーション**: 1ページ20件、最大50件
- **ログ件数**: 合計表示

#### 詳細分析レポート (`/dashboard/analysis/[id]`)

AI による詳細分析レポート表示ページ。

- **ステータス表示**: 実行中 / 完了 / エラー
- **レポート内容** (DetailedReport、4セクション):
  1. **トレンド分析**: サマリー + 上昇トピック + 下降トピック
  2. **コンテンツアイデア**: 企画案 (タイトル / 理由 / プラットフォーム推奨 / ポテンシャル)
  3. **競合分析**: トップパフォーマー / 投稿パターン / 共通タグ
  4. **レコメンデーション**: 実装提案リスト

#### エクスポートページ (`/dashboard/export`)

- 現在はプレースホルダー (Coming Soon)
- 計画中: Google Sheets 連携 / CSV ダウンロード

---

## 4. API エンドポイント

### 4.1 公開 API（レート制限あり）

すべての公開 API は IP ベースのレート制限 (60 req/min) と CORS OPTIONS 対応を含む。

#### YouTube API

| メソッド | パス | 説明 | キャッシュ |
|---------|------|------|----------|
| GET | `/api/youtube/channel/[id]` | チャンネル情報 + 最新50動画 | 30分 |
| GET | `/api/youtube/keyword?q=<キーワード>&limit=50` | キーワード検索 (上位50件) | 30分 |
| GET | `/api/youtube/search?q=<チャンネル名>` | チャンネル名検索 (オートコンプリート用) | 30分 |

#### Qiita API

| メソッド | パス | 説明 | キャッシュ |
|---------|------|------|----------|
| GET | `/api/qiita/user/[id]?limit=50` | ユーザー情報 + 記事一覧 | 30分 |
| GET | `/api/qiita/keyword?q=<キーワード>&limit=50` | キーワード検索 | 30分 |

#### Zenn API

| メソッド | パス | 説明 | キャッシュ |
|---------|------|------|----------|
| GET | `/api/zenn/user/[username]?limit=100` | ユーザー情報 + 記事一覧 | 30分 |
| GET | `/api/zenn/keyword?q=<キーワード>&limit=50` | キーワード検索 | 30分 |

#### note API

| メソッド | パス | 説明 | キャッシュ |
|---------|------|------|----------|
| GET | `/api/note/user/[urlname]?limit=20` | ユーザー情報 + 記事一覧 (404時は候補返却) | 60分 |
| GET | `/api/note/keyword?q=<キーワード>&limit=50` | キーワード検索 | 60分 |

### 4.2 認証必須 API

すべての認証 API は Supabase JWT による認証チェックを含む。

#### 監視設定 API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/settings?active=true` | 監視設定一覧取得 (オプション: active フィルター) |
| POST | `/api/settings` | 監視設定作成 + 初回データ取得 + 簡易分析実行 |
| GET | `/api/settings/[id]` | 特定の監視設定取得 |
| PATCH | `/api/settings/[id]` | 監視設定更新 (display_name / fetch_count / is_active) |
| DELETE | `/api/settings/[id]` | 監視設定削除 (関連データも CASCADE 削除) |

**POST `/api/settings` の処理フロー:**
1. バリデーション (platform, type, value, fetch_count)
2. `monitor_settings` にレコード作成
3. `fetchInitialData()` で各プラットフォーム API からデータ取得
4. `collected_data` に Upsert
5. `createFetchLog()` でログ記録
6. バックグラウンドで `runSimpleAnalysis()` 実行 (`waitUntil()`)
7. 201 Created + `{ setting, initialFetch: { count, error } }` を返却

#### 分析結果 API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/analysis?type=simple\|detailed` | 分析結果一覧 (type フィルターオプション) |
| GET | `/api/analysis/[id]` | 分析結果詳細取得 |
| POST | `/api/analysis/detailed` | 詳細分析実行 (202 Accepted、バックグラウンド処理) |
| GET | `/api/analysis/status/[id]` | 分析ジョブ進行状況ポーリング |

**POST `/api/analysis/detailed` の処理フロー:**
1. 処理中の詳細分析がないかチェック (409 Conflict)
2. `analysis_results` に pending レコード作成
3. `analysis_jobs` に queued レコード作成
4. `waitUntil()` でバックグラウンド処理起動
5. 即座に 202 Accepted + `{ analysisId, jobId, status: 'queued' }` を返却

#### 取得ログ API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/logs?page=1&limit=20&platform=youtube&status=success` | ログ一覧 (ページネーション + フィルター) |

- `page`: ページ番号 (デフォルト 1)
- `limit`: 1ページの件数 (最大 50、デフォルト 20)
- `platform`: youtube / qiita / zenn / note (オプション)
- `status`: success / error (オプション)

#### バッチ処理 API

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| POST | `/api/batch` | CRON_SECRET (Bearer) | 全ユーザーの全設定を一括処理 |
| POST | `/api/batch/manual` | Supabase JWT | ログインユーザー自身の設定のみ処理 |

### 4.3 その他の API

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/og` | 動的 OGP 画像生成 (@vercel/og) |
| GET | `/api/keepalive` | ヘルスチェック |

---

## 5. 認証フロー

### Google OAuth (Supabase Auth PKCE)

```
ユーザー → /auth/login
  → Google OAuth ログインボタンクリック
  → supabase.auth.signInWithOAuth({ provider: 'google' })
  → Google 認証画面
  → /auth/callback
  → セッション確立
  → /dashboard にリダイレクト
```

### ミドルウェア (`src/middleware.ts`)

- **保護ルート** (`/dashboard/*`): 未認証 → `/auth/login?next=<元のパス>` にリダイレクト
- **認証ページ** (`/auth/login`): 認証済み → `/dashboard` にリダイレクト
- **全リクエスト**: Supabase セッション自動更新

### ログアウト

- UserMenu ドロップダウンからサーバーアクション実行
- `supabase.auth.signOut()` でセッション削除

---

## 6. データベース設計

### テーブル一覧

| テーブル | 目的 | RLS |
|---------|------|-----|
| `profiles` | ユーザープロフィール (auth.users トリガー自動作成) | 自分のみ |
| `monitor_settings` | 監視設定 (platform, type, value, fetch_count) | 自分のみ |
| `collected_data` | 収集データ (プラットフォーム横断の統一フォーマット) | 自分のみ |
| `analysis_results` | 分析結果 (simple/detailed, JSONB result) | 自分のみ |
| `analysis_jobs` | バックグラウンドジョブ管理 | 自分のみ |
| `fetch_logs` | データ取得ログ (status, records_count) | 自分のみ |

### リレーション

```
profiles (1)
  └── monitor_settings (N)
        ├── collected_data (N)    ← CASCADE DELETE
        ├── analysis_results (N)  ← CASCADE DELETE (simple分析のみ)
        └── fetch_logs (N)        ← 設定削除時も保持（監査ログ）

analysis_results (1)
  └── analysis_jobs (1)           ← CASCADE DELETE (detailed分析のみ)
```

### 削除時の順序

監視設定削除時: `analysis_results` → `collected_data` → `monitor_settings` の順で削除。
`fetch_logs` は監査ログとして保持。

### 主要テーブル定義

#### `monitor_settings`

| カラム | 型 | 説明 |
|-------|----|----|
| id | UUID (PK) | |
| user_id | UUID (FK → auth.users) | |
| platform | TEXT | youtube / qiita / zenn / note |
| type | TEXT | keyword / channel / user |
| value | TEXT | チャンネルID / キーワード / ユーザー名 |
| display_name | TEXT | 表示名 (オプション) |
| fetch_count | INTEGER | 50 (default) / 100 / 200 |
| is_active | BOOLEAN | 有効フラグ (default: true) |
| last_fetched_at | TIMESTAMP | 最終取得時刻 |
| UNIQUE | | (user_id, platform, type, value) |

#### `collected_data`

| カラム | 型 | 説明 |
|-------|----|----|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| setting_id | UUID (FK → monitor_settings) | |
| platform | TEXT | |
| content_id | TEXT | 動画ID / 記事ID等 |
| title | TEXT | |
| url | TEXT | |
| published_at | TIMESTAMP | |
| author_id / author_name | TEXT | |
| views / likes / comments / stocks | INTEGER | |
| duration | TEXT | |
| tags | TEXT[] | |
| growth_rate | DECIMAL(5,2) | |
| UNIQUE | | (user_id, setting_id, content_id) |

#### `analysis_results`

| カラム | 型 | 説明 |
|-------|----|----|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| setting_id | UUID (FK、simple分析のみ) | |
| analysis_type | TEXT | simple / detailed |
| status | TEXT | pending / queued / processing / completed / failed |
| result | JSONB | SimpleAnalysisResult / DetailedAnalysisResult |
| error_message | TEXT | |
| completed_at | TIMESTAMP | |

---

## 7. AI 分析機能

### 7.1 簡易分析 (Simple Analysis)

- **トリガー**: 監視設定作成時 + バッチ処理時に自動実行
- **スコープ**: 監視設定単位 (1つの設定のデータのみ)
- **AI モデル**: Gemini 3 Flash Preview
- **出力**:

```typescript
interface SimpleAnalysisResult {
  trend_score: number;       // 0-100のトレンドスコア
  summary: string;           // 100文字以内の要約
  top_contents: Array<{      // 上位3件のコンテンツ
    id: string;
    title: string;
    reason: string;
  }>;
  keywords: string[];        // 関連キーワード (5個程度)
  generated_at: string;
}
```

### 7.2 詳細分析 (Detailed Analysis)

- **トリガー**: ダッシュボードから手動実行
- **スコープ**: ユーザーの全監視設定データを横断的に分析
- **処理方式**: バックグラウンドジョブ (202 Accepted → ポーリング)
- **ポーリング間隔**: 2秒
- **出力**:

```typescript
interface DetailedAnalysisResult {
  trend_analysis: {
    summary: string;
    rising_topics: Array<{ topic: string; growth: string; platforms: Platform[] }>;
    declining_topics: Array<{ topic: string; decline: string }>;
  };
  content_ideas: Array<{
    title: string;
    reason: string;
    platform_recommendation: Platform;
    estimated_potential: string;
  }>;
  competitor_analysis: {
    top_performers: Array<{ name: string; platform: Platform; stats: string }>;
    posting_patterns: string;
    common_tags: string[];
  };
  recommendations: string[];
  generated_at: string;
}
```

### 7.3 Gemini クライアント

- **シングルトンパターン**
- **レスポンス形式**: `responseMimeType: 'application/json'` を強制
- **リトライロジック**: 指数バックオフ (最大3回)
  - 429 (Rate Limit) → リトライ
  - 503 (Server Error) → リトライ
  - JSON パースエラー → リトライ
- **バックオフ**: 1秒 → 2秒 → 4秒

---

## 8. バッチ処理

### 8.1 自動バッチ (Vercel Cron)

- **スケジュール**: 毎日 UTC 18:00 (JST 03:00)
- **認証**: `CRON_SECRET` (Bearer token)
- **処理対象**: 全ユーザーの全アクティブ監視設定
- **クライアント**: Supabase Admin Client (RLS バイパス)

**処理フロー (設定ごと):**
1. `fetchPlatformData()` で各プラットフォーム API からデータ取得
2. `transformPlatformData()` でデータ変換
3. `upsertCollectedData()` で Upsert (content_id による重複排除)
4. `runSimpleAnalysis()` で簡易分析
5. `createFetchLog()` でログ記録
6. 次の設定まで 1秒ディレイ (API レートリミット対策)

**時間管理:**
- 最大実行時間: `maxDuration` (60秒) - 10秒マージン = 50秒
- タイムアウト時は残りの設定をスキップ

**エラーハンドリング:**
- 個別設定のエラーは記録してスキップ
- 全体処理は続行

### 8.2 手動バッチ

- **トリガー**: POST `/api/batch/manual`
- **認証**: Supabase JWT
- **処理対象**: ログインユーザー自身の設定のみ

---

## 9. キャッシュ戦略

### 9.1 アプリケーションキャッシュ

| 対象 | TTL | ストレージ |
|------|-----|----------|
| YouTube チャンネル / キーワード | 30分 | Vercel KV / In-Memory |
| Qiita ユーザー / キーワード | 30分 | Vercel KV / In-Memory |
| Zenn ユーザー / キーワード | 30分 | Vercel KV / In-Memory |
| note ユーザー / キーワード | 60分 | Vercel KV / In-Memory |

**キャッシュキー形式**: `prepfeed:<prefix>:<identifier>`

### 9.2 CDN キャッシュ

vercel.json で API レスポンスに設定:
```
Cache-Control: s-maxage=1800, stale-while-revalidate=3600
```

---

## 10. レート制限

- **方式**: IP ベース
- **制限値**: 60 req/min per IP
- **ストレージ**: Vercel KV / In-Memory
- **適用**: 全公開 API エンドポイント
- **共通化**: `checkRateLimit()` ヘルパー関数

---

## 11. エラーハンドリング

### エラー分類 (16種別)

| カテゴリ | エラータイプ | 説明 |
|---------|------------|------|
| Phase 1 | CHANNEL_NOT_FOUND | チャンネル未検出 |
| Phase 1 | API_QUOTA_EXCEEDED | YouTube API クォータ超過 |
| Phase 1 | NETWORK_ERROR | ネットワークエラー |
| Phase 1 | RATE_LIMITED | レート制限 |
| Phase 1 | INVALID_REQUEST | 不正なリクエスト |
| Phase 2 | QIITA_API_ERROR | Qiita API エラー |
| Phase 2 | ZENN_API_ERROR | Zenn API エラー |
| Phase 2 | NOTE_API_ERROR | note API エラー |
| Phase 2 | GEMINI_API_ERROR | Gemini API エラー |
| Phase 2 | GEMINI_PARSE_ERROR | Gemini レスポンスパース失敗 |
| Phase 2 | GEMINI_TIMEOUT | Gemini タイムアウト |
| Phase 2 | BATCH_TIMEOUT | バッチ処理タイムアウト |
| Phase 2 | AUTH_REQUIRED | 認証必要 |
| Phase 2 | PREMIUM_REQUIRED | プレミアム必要 |
| 将来 | SHEETS_API_ERROR | Google Sheets API エラー |

### AppError インターフェース

```typescript
interface AppError {
  type: ErrorType;
  message: string;        // 技術的メッセージ
  userMessage: string;    // ユーザー向けメッセージ
  canRetry: boolean;      // リトライ可能フラグ
  retryAfter?: number;    // リトライ待機時間 (秒)
  hint?: string;          // 対処方法のヒント
}
```

---

## 12. UI コンポーネント

### 12.1 共通コンポーネント

| コンポーネント | 用途 |
|-------------|------|
| `Header` | スティッキーヘッダー (ロゴ + 認証 UI) |
| `Footer` | フッター (4プラットフォーム免責事項 + リンク) |
| `LoadingState` | ローディング表示 (プラットフォーム色対応) |
| `ErrorState` | エラー表示 (再試行 + ホームリンク) |
| `PlatformUserCard` | 統合ユーザーカード (Qiita / Zenn / note 共通) |
| `UserMenu` | ユーザーアバター + ドロップダウンメニュー |

### 12.2 検索・表示コンポーネント

| コンポーネント | 用途 |
|-------------|------|
| `SearchBar` | YouTube チャンネル検索 (オートコンプリート付き) |
| `ArticleCard` | 記事カード (Qiita / Zenn / note 共通) |
| `ArticleList` | 記事一覧 (ソート対応) |
| `ArticleSortTabs` | 記事ソートタブ (日付 / いいね / ストック / コメント) |
| `VideoCard` | YouTube 動画カード |
| `VideoList` | 動画一覧 (ソート対応) |
| `VideoChart` | 再生数推移グラフ (Recharts、動的インポート) |
| `ChannelCard` | YouTube チャンネル情報カード |
| `SortTabs` | YouTube 動画ソートタブ (5種) |
| `ShareButton` | Twitter/X シェアボタン + OGP |

### 12.3 ダッシュボードコンポーネント

| コンポーネント | 用途 |
|-------------|------|
| `DashboardNav` | タブナビゲーション (5タブ) |
| `MonitorWizard` | 監視設定ウィザード (5ステップ) |
| `MonitorSettingCard` | 監視設定カード (編集 / 削除) |
| `MonitorEditModal` | 設定編集モーダル |
| `AnalysisCard` | 簡易分析カード (スコア / サマリー / トップ3) |
| `AnalysisProgress` | 詳細分析プログレスバー (ポーリング) |
| `DetailedReport` | 詳細分析レポート (4セクション) |
| `FetchLogList` | 取得ログ一覧 (compact / full variant) |
| `FetchLogFilters` | ログフィルター (プラットフォーム / ステータス) |
| `SettingsCompactList` | 監視設定コンパクト表示 |
| `UpgradeBanner` | プレミアムバナー (現在非表示) |

---

## 13. カスタムフック

| フック | 用途 |
|-------|------|
| `useFetch<T>` | データフェッチ共通化 (URL / キャンセル / エラーハンドリング) |
| `useAnalysisStatus` | 詳細分析ステータスポーリング (2秒間隔) |

### `useFetch<T>`

```typescript
function useFetch<T>(
  url: string | null,       // null でスキップ
  errorPrefix?: string
): { data: T | null; isLoading: boolean; error: string | null }
```

- キャンセル処理 (コンポーネントアンマウント時)
- エラーハンドリング
- 5ページで使用 (Qiita/Zenn/note keyword + Qiita/Zenn user)

### `useAnalysisStatus`

```typescript
function useAnalysisStatus(
  analysisId: string | null
): { status: JobStatus | null; result: DetailedAnalysisResult | null; error: string | null; isPolling: boolean }
```

- 2秒間隔ポーリング
- 完了/失敗時に自動停止
- クリーンアップ処理

---

## 14. ソート機能

### YouTube 動画ソート (5種)

Zustand ストアで状態管理。

| ソートキー | 説明 |
|-----------|------|
| latest | 最新順 |
| popular | 再生数順 |
| growth | 伸び率順 |
| comment_rate | コメント率順 |
| engagement | エンゲージメント順 |

### 記事ソート (4種)

コンポーネントの useState で状態管理。

| ソートキー | 説明 |
|-----------|------|
| date | 投稿日順 |
| likes | いいね数順 |
| stocks | ストック数順 (Qiita のみ) |
| comments | コメント数順 |

各ソートは昇順 (asc) / 降順 (desc) の切り替えに対応。

---

## 15. アナリティクストラッキング

Vercel Analytics によるイベントトラッキング。

| イベント | トリガー |
|---------|---------|
| `channel_search` | チャンネル検索実行 |
| `channel_view` | チャンネルページ表示 |
| `sort_change` | ソート変更 |
| `share_click` | シェアボタンクリック |
| `error_occurred` | エラー発生 |
| `api_limit_reached` | API 制限到達 |
| `page_view` | ページ表示 |
| `monitor_created` | 監視設定作成 |
| `detailed_analysis` | 詳細分析実行 |
| `batch_complete` | バッチ完了 |
| `manual_batch` | 手動バッチ実行 |
| `platform_search` | プラットフォーム検索 |

---

## 16. 数値フォーマット

| 関数 | 入力例 | 出力例 |
|------|-------|-------|
| `formatJapaneseNumber` | 15000 | 1.5万 |
| `formatJapaneseNumber` | 120000000 | 1.2億 |
| `formatJapaneseSubscribers` | 1500000 | 150万人 |
| `formatJapaneseViews` | 45000 | 4.5万回 |

---

## 17. 環境変数

### 必須

| 変数 | 説明 |
|------|------|
| `YOUTUBE_API_KEY` | YouTube Data API キー |
| `NEXT_PUBLIC_SITE_URL` | サイト URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

### AI 分析に必須

| 変数 | 説明 |
|------|------|
| `GEMINI_API_KEY` | Google Generative AI API キー |

### オプション

| 変数 | 説明 |
|------|------|
| `QIITA_ACCESS_TOKEN` | Qiita API トークン (レート向上: 60 → 1,000 req/h) |
| `KV_REST_API_URL` | Vercel KV URL (本番環境) |
| `KV_REST_API_TOKEN` | Vercel KV トークン (本番環境) |
| `SUPABASE_SERVICE_ROLE_KEY` | バッチ処理用 Admin Client |
| `CRON_SECRET` | Vercel Cron アクセス保護トークン |

---

## 18. 現在の制限事項

| 項目 | 状態 | 備考 |
|------|------|------|
| プレミアム機能 | 全ユーザーに開放 | `isPremium = true` ハードコード |
| エクスポート | Coming Soon | Google Sheets / CSV 計画中 |
| note API | 非公式 API 使用 | 仕様変更リスクあり |
| Zenn API | 非公式 API 使用 | 仕様変更リスクあり |
| バッチ処理 | 60秒制限 | Vercel Functions タイムアウト |

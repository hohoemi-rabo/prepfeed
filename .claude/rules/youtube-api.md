---
paths:
  - "src/lib/youtube.ts"
  - "src/lib/qiita.ts"
  - "src/lib/zenn.ts"
  - "src/lib/note.ts"
  - "src/lib/gemini.ts"
  - "src/lib/monitor.ts"
  - "src/lib/analysis.ts"
  - "src/lib/analytics.ts"
  - "src/lib/cache.ts"
  - "src/lib/tracking.ts"
---

# API Client 統合ルール

## YouTube API Client (`lib/youtube.ts`)

- Singleton pattern - single instance across requests
- **Two-step video fetching**: playlistItems API → fallback to search API
- Automatic analytics enrichment (growth rate, engagement, etc.)
- **Keyword search**: search.list (100 units) + videos.list (50 units) = 150 units total
- Comprehensive error handling and logging

## Analytics Functions (`lib/analytics.ts`)

- `calculateGrowthRate()` - views per day since publish
- `isTrending()` - published within 7 days AND growth >= 10,000/day
- `isNew()` - published within last 3 days
- `calculateEngagementRate()` - (likes + comments) / views
- `calculateCommentRate()` - comments / views (2 decimal)
- `calculateLikeRate()` - likes / views (2 decimal)

## Sorting (`lib/sort-utils.ts`)

- `sortVideos(videos, sortType, sortOrder)` - main sorting logic
- Smart defaults: date → desc (newest first), others → desc (highest first)

## Qiita API Client (`lib/qiita.ts`)

- Singleton pattern — `qiitaClient` export
- Optional `QIITA_ACCESS_TOKEN` for higher rate limit (60 → 1,000 req/h)
- `getUserInfo(userId)` → `QiitaUser`
- `getUserArticles(userId, limit)` → `QiitaArticle[]`
- `searchArticles(keyword, limit)` → `QiitaArticle[]`
- `enrichArticle()` — adds `days_from_published`, `growth_rate` (likes/day)
- Raw API response mapping: `created_at` → `published_at`, `tags[].name` → `string[]`

## Zenn API Client (`lib/zenn.ts`)

- Singleton pattern — `zennClient` export
- No authentication required (非公式API)
- `getUserInfo(username)` → `ZennUser` (via `/api/users/{username}`)
- `getUserArticles(username, limit)` → `ZennArticle[]`
- `searchArticlesByTopic(topicName, limit)` → `ZennArticle[]`
- `enrichArticle()` — adds `days_from_published`, `growth_rate` (likes/day)
- Raw API response mapping: `path` → full URL, `id` (number) → string
- API仕様変更時のフォールバック: JSON parse error → 502, empty articles → `[]`

## note.com API Client (`lib/note.ts`)

- Singleton pattern — `noteClient` export
- No authentication required (非公式API)
- **スロットリング**: 1500msリクエスト間隔（サーバー負荷軽減）
- `getUserInfo(urlname)` → `NoteUser` (プロフィール → 記事一覧フォールバック、大文字小文字リトライ)
- `getUserWithArticles(urlname, limit)` → `{ user, articles }` (ユーザー存在確認 → 記事取得)
- `getUserArticles(urlname, limit)` → `NoteArticle[]`
- `searchArticles(keyword, limit)` → `NoteArticle[]` (v3 search API)
- `searchCreators(query, limit)` → `NoteUser[]` (記事検索結果からユニーククリエイター抽出)
- `enrichArticle()` — adds `days_from_published`, `growth_rate` (likes/day)

**APIエンドポイント**:
- ユーザー記事: `GET /v2/creators/{urlname}/contents?kind=note&page={page}` (camelCase)
- キーワード検索: `GET /v3/searches?context=note&q={keyword}&size={size}&start=0` (snake_case混在)
- プロフィール: `GET /v2/creators/{urlname}` (camelCase)

**フィールド名の注意** (v2: camelCase / v3: snake_case混在):
- `publishAt` / `publish_at`, `likeCount` / `like_count`, `commentCount` / `comment_count`
- `isLastPage` / `totalCount`, `userProfileImagePath` / `user_profile_image_path`
- `enrichArticle()` は両方のフィールド名にフォールバック対応

**制約**:
- 1ページ約6件固定（`per_page` パラメータ非対応）
- 表示用: 20件（APIルート側制限）、分析用: 最大50件
- キャッシュTTL: 60分（他プラットフォームの30分より長め）

## Gemini AI Client (`lib/gemini.ts`)

- Singleton pattern — `GeminiClient` class
- Model: `gemini-3-flash-preview`
- `generateJSON<T>(prompt)` — JSONレスポンスをパース
- リトライ: 最大3回、指数バックオフ（1s → 2s → 4s）
- 429 (rate limit), 503 (server error) でリトライ
- 環境変数: `GEMINI_API_KEY`

## Monitor Business Logic (`lib/monitor.ts`)

- `validatePlatformType(platform, type)` — platform + type 組合せバリデーション
- `validateFetchCount(count)` — 50 / 100 / 200 のみ許可
- `fetchInitialData(setting, userId)` — 初回データ取得 + collected_data upsert
- `transformYouTubeData()` / `transformQiitaData()` / `transformZennData()` / `transformNoteData()` — プラットフォーム横断変換
- `recordFetchLog()` — fetch_logs にログ記録

## Analysis Business Logic (`lib/analysis.ts`)

- `runSimpleAnalysis(settingId, setting, data)` — Gemini で簡易分析 → SimpleAnalysisResult
- `runDetailedAnalysis(analysisId, userId)` — Gemini で詳細分析 → DetailedAnalysisResult
- `buildSimpleAnalysisPrompt()` / `buildDetailedAnalysisPrompt()` — プロンプト生成
- 詳細分析は全設定のデータを横断的に分析

## Tracking (`lib/tracking.ts`)

Vercel Analytics event tracking:
- Phase 1: `trackChannelSearch()`, `trackChannelView()`, `trackSortChange()`, `trackShare()`, `trackError()`, `trackAPILimit()`, `trackPageView()`
- Phase 2: `trackMonitorCreated()`, `trackDetailedAnalysis()`, `trackBatchComplete()`, `trackManualBatch()`, `trackPlatformSearch()`

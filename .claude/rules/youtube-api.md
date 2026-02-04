---
paths:
  - "src/lib/youtube.ts"
  - "src/lib/qiita.ts"
  - "src/lib/zenn.ts"
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

## Tracking (`lib/tracking.ts`)

Vercel Analytics event tracking:
- `trackChannelSearch()`, `trackChannelView()`, `trackSortChange()`, `trackShare()`, `trackError()`

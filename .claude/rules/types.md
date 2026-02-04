---
paths:
  - "src/types/**/*"
  - "src/lib/format-utils.ts"
  - "src/lib/monitor.ts"
  - "src/lib/analysis.ts"
  - "src/lib/gemini.ts"
---

# TypeScript 型定義ルール

## Key Interfaces

### YouTube (`types/index.ts`)
- `YouTubeChannel` - Channel metadata (id, title, subscriberCount, etc.)
- `YouTubeVideo` - Video with analytics (viewCount, likeRate, growthRate, isTrending, tags, etc.)
- `SortType` - 'views' | 'date' | 'growth' | 'comments' | 'likes'
- `KeywordSearchResponse` - Keyword search API response (videos, query, count)

### Qiita (`types/qiita.ts`)
- `QiitaUser` - User profile (id, name, profile_image_url, items_count, followers_count)
- `QiitaArticle` - Article with analytics (likes_count, stocks_count, tags, days_from_published, growth_rate)
- `QiitaUserResponse` - User API response (user + articles)
- `QiitaKeywordResponse` - Keyword search response (articles, query, count)

### Zenn (`types/zenn.ts`)
- `ZennUser` - User profile (username, name, avatar_url, articles_count)
- `ZennArticle` - Article with analytics (liked_count, days_from_published, growth_rate)
- `ZennUserResponse` - User API response (user + articles)
- `ZennKeywordResponse` - Keyword search response (articles, query, count)

### Common (`types/common.ts`)
- `Platform` - `'youtube' | 'qiita' | 'zenn'`
- `MonitorType` - `'keyword' | 'channel' | 'user'`
- `FetchCount` - `50 | 100 | 200`
- `AnalysisType` - `'simple' | 'detailed'`
- `JobStatus` - `'queued' | 'processing' | 'completed' | 'failed'` (**注意**: `'pending'` は含まない)
- `FetchLogStatus` - `'success' | 'error'`

### Monitor (`types/monitor.ts`)
- `MonitorSetting` - 監視設定（platform, type, value, display_name, fetch_count, is_active）
- `CreateMonitorSettingRequest` / `UpdateMonitorSettingRequest`
- `FetchLog` - 取得ログ（status, records_count, error_message, executed_at）

### Analysis (`types/analysis.ts`)
- `SimpleAnalysisResult` - 簡易分析（trend_score, summary, top_contents, keywords）
- `DetailedAnalysisResult` - 詳細分析（trend_analysis, content_ideas, competitor_analysis, recommendations）
- `AnalysisResult` - DB行（analysis_type, status, result as JSONB, error_message）
- `AnalysisJob` - バックグラウンドジョブ管理

### Collected Data (`types/collected-data.ts`)
- `CollectedData` - プラットフォーム横断の統一フォーマット（views, likes, comments, stocks, growth_rate）

### User (`types/user.ts`)
- `UserProfile` - ユーザープロフィール（email, display_name, avatar_url, is_premium）

## Number & Date Formatting (`format-utils.ts`)

**Critical**: Always use these for consistency
- `formatJapaneseNumber(num)` - 1,570,000 → "157万"
- `formatJapaneseSubscribers(num)` - adds "人" suffix
- `formatJapaneseViews(num)` - adds "回" suffix
- `formatRelativeTime(dateStr)` - ISO日時 → "5分前", "3時間前", "2日前"
- Handles: 万 (10,000+), 億 (100,000,000+)

## Pattern: 新規数値表示追加

```typescript
import { formatJapaneseNumber } from '@/lib/format-utils';
<span>{formatJapaneseNumber(value)}</span>  // "157万"
```

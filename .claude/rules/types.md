---
paths:
  - "src/types/**/*"
  - "src/lib/format-utils.ts"
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

## Number Formatting (`format-utils.ts`)

**Critical**: Always use these for consistency
- `formatJapaneseNumber(num)` - 1,570,000 → "157万"
- `formatJapaneseSubscribers(num)` - adds "人" suffix
- `formatJapaneseViews(num)` - adds "回" suffix
- Handles: 万 (10,000+), 億 (100,000,000+)

## Pattern: 新規数値表示追加

```typescript
import { formatJapaneseNumber } from '@/lib/format-utils';
<span>{formatJapaneseNumber(value)}</span>  // "157万"
```

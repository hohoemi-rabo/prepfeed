---
paths:
  - "src/types/**/*"
  - "src/lib/format-utils.ts"
---

# TypeScript 型定義ルール

## Key Interfaces

- `YouTubeChannel` - Channel metadata (id, title, subscriberCount, etc.)
- `YouTubeVideo` - Video with analytics (viewCount, likeRate, growthRate, isTrending, tags, etc.)
- `SortType` - 'views' | 'date' | 'growth' | 'comments' | 'likes'
- `KeywordSearchResponse` - Keyword search API response (videos, query, count)

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

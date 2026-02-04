---
paths:
  - "src/app/api/**/*"
  - "src/lib/cache.ts"
  - "src/lib/rate-limiter.ts"
  - "src/lib/error-handler.ts"
  - "src/lib/qiita.ts"
  - "src/lib/zenn.ts"
---

# API Routes 開発ルール

## 既存ルート一覧

### YouTube API Routes

| Route | Purpose | Quota Cost | Cache TTL |
|-------|---------|------------|-----------|
| `/api/youtube/search` | Channel search | 100 units | 30 min |
| `/api/youtube/channel/[id]` | Channel + videos | 103 units | 30 min |
| `/api/youtube/keyword` | Keyword search | 150 units | 30 min |

### Qiita API Routes

| Route | Purpose | Rate Limit | Cache TTL |
|-------|---------|------------|-----------|
| `/api/qiita/user/[id]` | User profile + articles | 60/h (token: 1,000/h) | 30 min |
| `/api/qiita/keyword` | Keyword search (`?q=`) | 60/h (token: 1,000/h) | 30 min |

### Zenn API Routes (非公式API)

| Route | Purpose | Cache TTL |
|-------|---------|-----------|
| `/api/zenn/user/[username]` | User profile + articles | 30 min |
| `/api/zenn/keyword` | Topic search (`?q=`) | 30 min |

## Caching Strategy (`lib/cache.ts`)

- **Production**: Vercel KV with 30-minute TTL
- **Development**: In-memory Map with automatic cleanup
- Cache key format: `prepfeed:{prefix}:{id}`
- HTTP cache headers: `s-maxage=1800, stale-while-revalidate=3600`

## Rate Limiting (`lib/rate-limiter.ts`)

- 10 requests per minute per IP
- In-memory tracking with automatic cleanup
- Returns 429 with retry-after header when exceeded

## Error Handling (`lib/error-handler.ts`)

- 6 error types: NOT_FOUND, QUOTA_EXCEEDED, NETWORK, RATE_LIMIT, INVALID, UNKNOWN
- Each type has retry logic and user-friendly messages
- Exponential backoff: 1s → 2s → 4s → 8s (max 30s)

## Pattern: 新規APIルート追加手順

1. Create route in `/src/app/api/`
2. Use `getCachedData()` wrapper for API calls
3. Add rate limiting with `checkLimit()`
4. Classify errors with `classifyError()`
5. Add HTTP cache headers

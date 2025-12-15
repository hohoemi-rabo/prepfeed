# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YouTubeスコープ (YouTubeScope)** - YouTubeチャンネル分析とキーワード検索による動画企画支援ツール

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSSで構築されたフルスタックWebアプリケーション。YouTube Data API v3を使用してチャンネル分析・キーワード検索による動画統計を提供。

**旧名称**: チャンネルスコープ（Phase 5でYouTubeスコープに改名）

## Essential Commands

```bash
# Development
npm run dev        # Start development server with Turbopack at http://localhost:3000

# Production
npm run build      # Build for production with Turbopack
npm run start      # Start production server

# Code Quality
npm run lint       # Run ESLint
```

## Architecture Overview

### Data Flow
```
User → SearchBar → API Routes → YouTube API Client → Cache Layer → YouTube Data API v3
                                      ↓
                            Analytics Processing
                                      ↓
                            Zustand Store (Sort State)
                                      ↓
                            React Components
```

### Key Technologies
- **Next.js 15.5.7** - App Router, API Routes, Server/Client Components
- **React 19.1.0** - UI Components
- **TypeScript 5** - Strict mode
- **Tailwind CSS 3.4.17** - Styling with CSS variables for theming
- **Zustand** - Sort state management
- **Recharts** - Data visualization (動的インポート)
- **Vercel Analytics** - Usage tracking
- **Vercel OG** - Dynamic OGP image generation
- **Vercel KV** - Caching (production), in-memory fallback (development)

### Path Aliases
- `@/*` → `./src/*` (tsconfig.json)

### Directory Structure
```
/src
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── youtube/       # YouTube API integration
│   │   │   ├── search/route.ts      # Channel search
│   │   │   ├── channel/[id]/route.ts # Channel details + videos
│   │   │   └── keyword/route.ts     # Keyword search
│   │   └── og/route.tsx   # Dynamic OGP image generation
│   ├── channel/[id]/      # Channel detail page
│   ├── keyword/[query]/   # Keyword search results page
│   ├── contact/           # Contact page (GitHub Issues + Instagram DM)
│   ├── disclaimer/        # Disclaimer page
│   ├── privacy/           # Privacy policy
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (2 search types)
│   └── icon.svg           # Favicon
├── components/            # React components
├── lib/                   # Utilities
└── types/                 # TypeScript types
/docs                      # チケット管理（001-025）
```

## API Routes Architecture

### YouTube API Integration

#### Routes
| Route | Purpose | Quota Cost | Cache TTL |
|-------|---------|------------|-----------|
| `/api/youtube/search` | Channel search | 100 units | 30 min |
| `/api/youtube/channel/[id]` | Channel + videos | 103 units | 30 min |
| `/api/youtube/keyword` | Keyword search | 150 units | 30 min |

#### YouTube API Client (`lib/youtube.ts`)
- Singleton pattern - single instance across requests
- **Two-step video fetching**: playlistItems API → fallback to search API
- Automatic analytics enrichment (growth rate, engagement, etc.)
- **Keyword search**: search.list (100 units) + videos.list (50 units) = 150 units total
- Comprehensive error handling and logging

#### Caching Strategy (`lib/cache.ts`)
- **Production**: Vercel KV with 30-minute TTL
- **Development**: In-memory Map with automatic cleanup
- Cache key format: `channel-scope:{prefix}:{id}`
- HTTP cache headers: `s-maxage=1800, stale-while-revalidate=3600`

#### Rate Limiting (`lib/rate-limiter.ts`)
- 10 requests per minute per IP
- In-memory tracking with automatic cleanup
- Returns 429 with retry-after header when exceeded

#### Error Handling (`lib/error-handler.ts`)
- 6 error types: NOT_FOUND, QUOTA_EXCEEDED, NETWORK, RATE_LIMIT, INVALID, UNKNOWN
- Each type has retry logic and user-friendly messages
- Exponential backoff: 1s → 2s → 4s → 8s (max 30s)

## Component Architecture

### Server vs Client Components
- **Server Components** (default): layout, pages
- **Client Components** (`'use client'`): Header, Footer, SearchBar, VideoList, SortTabs, VideoChart, VideoCard
  - Use when: event handlers, hooks, browser APIs needed

### Layout Components

**Header** (`components/Header.tsx`)
- Client component with mobile menu state
- SNS links: X, Instagram, GitHub (with custom X icon SVG)
- Sticky positioning with responsive navigation
- Links to: https://x.com/masayuki_kiwami, https://www.instagram.com/masayuki.kiwami/, https://github.com/hohoemi-rabo/youtube-scope

**Footer** (`components/Footer.tsx`)
- Client component (uses hooks for current year)
- SNS icons with hover effects (brand colors)
- Links to disclaimer, privacy policy, contact page
- Same SNS links as Header

### Key Components

**SearchBar** (`components/SearchBar.tsx`)
- Debounced search with 300ms delay
- Keyboard navigation (↑/↓/Enter/Esc)
- Click-outside detection
- Loading states and error handling
- **Used for**: Channel search (not keyword search)

**VideoCard** (`components/VideoCard.tsx`)
- Displays: thumbnail, title, stats (views, likes, comments, growth)
- Badges: "新着" (New), "急上昇" (Trending)
- **Tags display**: Shows up to 8 tags, clickable to search by tag
- Uses `formatJapaneseNumber()` for all numbers

**VideoChart** (`components/VideoChart.tsx`)
- **Dynamically imported** with `next/dynamic` (heavy Recharts dependency)
- Shows latest 10 videos' view counts
- Green gradient theme (#10b981)

**SortTabs** (`components/SortTabs.tsx`)
- Controls: sortType (views/date/growth/comments/likes)
- sortOrder (asc/desc) with smart defaults
- Integrated with Zustand store
- **Shared between**: Channel analysis and keyword search pages

### State Management (Zustand)

**Single Store**: `useSortStore` (`lib/store.ts`)
```typescript
{
  sortType: 'views' | 'date' | 'growth' | 'comments' | 'likes'
  sortOrder: 'asc' | 'desc'
  setSortType() / setSortOrder() / toggleSortOrder()
}
```

**Design Philosophy**: Minimal global state
- Only persistent UI state (sort preferences) in Zustand
- Channel/video data in local component state
- No need for complex state management

## Utility Functions (`/src/lib/`)

### Number Formatting (`format-utils.ts`)
**Critical**: Always use these for consistency
- `formatJapaneseNumber(num)` - 1,570,000 → "157万"
- `formatJapaneseSubscribers(num)` - adds "人" suffix
- `formatJapaneseViews(num)` - adds "回" suffix
- Handles: 万 (10,000+), 億 (100,000,000+)

### Analytics (`analytics.ts`)
Functions to calculate video metrics:
- `calculateGrowthRate()` - views per day since publish
- `isTrending()` - growth > 10% of total views per day
- `isNew()` - published within last 7 days
- `calculateEngagementRate()` - (likes + comments) / views

### Sorting (`sort-utils.ts`)
- `sortVideos(videos, sortType, sortOrder)` - main sorting logic
- Smart defaults: date → desc (newest first), others → desc (highest first)

### Tracking (`tracking.ts`)
Vercel Analytics event tracking:
- `trackChannelSearch()`, `trackChannelView()`, `trackSortChange()`, `trackShare()`, `trackError()`

## Two Search Methods (Phase 5)

### 1. Channel Analysis
- **Page**: `/` (home) → `/channel/[id]`
- **UI**: Red gradient card with SearchBar component
- **API**: `/api/youtube/search` → `/api/youtube/channel/[id]`
- **Features**: Latest 50 videos, charts, SNS sharing

### 2. Keyword Search
- **Page**: `/` (home) → `/keyword/[query]`
- **UI**: Blue gradient card with simple input form
- **API**: `/api/youtube/keyword?q={keyword}`
- **Features**: Top 50 videos by views, tags display, same sorting as channel analysis

**Important**: The keyword search page uses a dedicated keyword search input (NOT SearchBar component) to maintain search context.

## Styling Conventions

### Tailwind CSS
- Theme colors via CSS variables in `globals.css`: `--background`, `--foreground`
- Dark mode support with `dark:` prefix
- **Brand colors**:
  - Channel analysis: Red (#FF0000) → Red-dark (#CC0000) gradient
  - Keyword search: Blue (#00D4FF) → Blue-dark (#0099CC) gradient
  - Instagram: Pink (#E4405F)
  - X (Twitter): Light blue (#1DA1F2)
- Green theme for charts/success: #10b981 (emerald-500)

### Custom CSS Classes
- `.card` - Standard card with padding, rounded corners, shadow
- `.btn-primary` - Primary button (gradient background)
- `.btn-secondary` - Secondary button (outlined)
- `.container-custom` - Max-width container with responsive padding

## Development Workflow

### Environment Variables
Required for development:
```bash
YOUTUBE_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Production: actual URL
```

Optional (production only):
```bash
KV_REST_API_URL=...        # Vercel KV
KV_REST_API_TOKEN=...      # Vercel KV
```

### Common Patterns

**Adding a new number display:**
```typescript
import { formatJapaneseNumber } from '@/lib/format-utils';
<span>{formatJapaneseNumber(value)}</span>  // "157万"
```

**Adding a new API route:**
1. Create route in `/src/app/api/`
2. Use `getCachedData()` wrapper for YouTube API calls
3. Add rate limiting with `checkLimit()`
4. Classify errors with `classifyError()`
5. Add HTTP cache headers

**Adding a new sort type:**
1. Update `SortType` type in `types/index.ts`
2. Add case in `sortVideos()` in `sort-utils.ts`
3. Add option in `sortOptions` array in `SortTabs.tsx`

**Using custom X (Twitter) icon:**
```typescript
// X icon is not available in lucide-react, use custom SVG
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
```

## TypeScript Types (`/src/types/`)

### Key Interfaces
- `YouTubeChannel` - Channel metadata (id, title, subscriberCount, etc.)
- `YouTubeVideo` - Video with analytics (viewCount, likeRate, growthRate, isTrending, tags, etc.)
- `SortType` - 'views' | 'date' | 'growth' | 'comments' | 'likes'
- `KeywordSearchResponse` - Keyword search API response (videos, query, count)

## Performance Optimizations

1. **Dynamic Imports** - VideoChart loaded only when needed
2. **Debouncing** - SearchBar waits 300ms before API call
3. **Memoization** - `useMemo` for sorted lists, `useCallback` for event handlers
4. **Caching** - 30-minute cache for all YouTube API responses
5. **Image Optimization** - `next/image` for all thumbnails with lazy loading

## Project Management

### Ticket System
- All features tracked in `/docs/NNN-*.md` (001-025)
- **Phase 5 completed**: Tickets 020-025
- Each ticket contains Todo checklist with `[x]` for completed items

### Phases
- **Phase 1-4**: ✅ Complete (Channel analysis, sorting, caching, OGP, deployment)
- **Phase 5**: ✅ Complete (Keyword search, project rename, tags display)

## Production Deployment

- **Platform**: Vercel
- **Region**: hnd1 (Tokyo)
- **Environment**: YOUTUBE_API_KEY, KV credentials, NEXT_PUBLIC_SITE_URL
- Deployment URL: https://channel-scope.vercel.app (to be updated to youtube-scope)

## Project Status

**Phase 5 Complete (2025-01)**

### All Features
- ✅ Channel search with autocomplete
- ✅ Latest 50 videos analysis
- ✅ Multi-criteria sorting (5 types)
- ✅ Data visualization with charts
- ✅ SNS sharing with dynamic OGP
- ✅ Caching and rate limiting
- ✅ Error handling and analytics
- ✅ Contact page (2 methods: GitHub Issues + Instagram DM)
- ✅ Legal pages (disclaimer, privacy)
- ✅ Japanese number formatting (万/億)
- ✅ **Keyword search** (search by keyword, top 50 videos)
- ✅ **Video tags display** (clickable, up to 8 per video)
- ✅ **Two search methods** (channel analysis + keyword search)
- ✅ **Project rename** (ChannelScope → YouTubeScope)
- ✅ **SNS integration** (Header/Footer with X, Instagram, GitHub links)

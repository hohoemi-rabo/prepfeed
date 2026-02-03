---
paths:
  - "src/components/**/*"
  - "src/lib/store.ts"
  - "src/lib/sort-utils.ts"
  - "src/app/**/page.tsx"
  - "src/app/**/loading.tsx"
  - "src/app/**/error.tsx"
---

# React Component ルール

## Data Flow

```
User → SearchBar → API Routes → API Client (YouTube/Qiita) → Cache Layer → External API
                                      ↓
                            Analytics Processing
                                      ↓
                            Zustand Store (Sort State)
                                      ↓
                            React Components
```

## Layout Components

**Header** (`components/Header.tsx`)
- Client component with mobile menu state
- Accepts `user` prop from layout.tsx (server-side auth)
- Auth UI: login button (unauthenticated) / UserMenu (authenticated)
- Nav links: ホーム, ダッシュボード (auth-only), お問い合わせ
- SNS links: X, Instagram, GitHub (with custom X icon SVG)
- Sticky positioning with responsive navigation

**Footer** (`components/Footer.tsx`)
- Server component (static render)
- SNS icons with hover effects (brand colors)
- 3プラットフォーム対応の注意事項テキスト
- Links to disclaimer, privacy policy

**UserMenu** (`components/UserMenu.tsx`)
- Client component with dropdown (click-outside close)
- Avatar (next/image), name/email display
- Links: ダッシュボード, ログアウト (Server Action)

## Key Components

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
- Controls: sortType (views/date/growth/comments/likes), sortOrder (asc/desc)
- Integrated with Zustand store
- **Shared between**: Channel analysis and keyword search pages

## State Management (Zustand)

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

## Performance Optimizations

1. **Dynamic Imports** - VideoChart loaded only when needed
2. **Debouncing** - SearchBar waits 300ms before API call
3. **Memoization** - `useMemo` for sorted lists, `useCallback` for event handlers
4. **Caching** - 30-minute cache for all YouTube API responses
5. **Image Optimization** - `next/image` for all thumbnails with lazy loading

## Pattern: 新規ソートタイプ追加手順

1. Update `SortType` type in `types/index.ts`
2. Add case in `sortVideos()` in `sort-utils.ts`
3. Add option in `sortOptions` array in `SortTabs.tsx`

## Custom X (Twitter) Icon

```typescript
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
```

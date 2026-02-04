---
paths:
  - "src/components/**/*"
  - "src/hooks/**/*"
  - "src/lib/store.ts"
  - "src/lib/sort-utils.ts"
  - "src/app/**/page.tsx"
  - "src/app/**/layout.tsx"
  - "src/app/**/loading.tsx"
  - "src/app/**/error.tsx"
---

# React Component ルール

## Data Flow

### 公開ページ（検索）
```
User → SearchBar → API Routes → API Client (YouTube/Qiita/Zenn) → Cache Layer → External API
                                      ↓
                            Analytics Processing
                                      ↓
                            Zustand Store (Sort State)
                                      ↓
                            React Components
```

### ダッシュボード（分析）
```
User → MonitorWizard → POST /api/settings → fetchInitialData → runSimpleAnalysis (background)
                                                                       ↓
Dashboard ← AnalysisCard ← GET /api/analysis?type=simple ← analysis_results
    ↓
詳細分析実行 → POST /api/analysis/detailed → Gemini AI (background)
    ↓
AnalysisProgress (polling 2s) → GET /api/analysis/status/[id]
    ↓
DetailedReport ← GET /api/analysis/[id] ← analysis_results (detailed)
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

## Dashboard Components (`components/dashboard/`)

**DashboardNav** — タブナビゲーション
- 3タブ: 分析(`/dashboard`), 設定(`/dashboard/settings`), エクスポート(`/dashboard/export`)
- `usePathname()` でアクティブ判定（`/dashboard/analysis/*` は分析タブに属する）

**MonitorWizard** — 5ステップ監視設定ウィザード
- Step 1: プラットフォーム選択 (YouTube/Qiita/Zenn)
- Step 2: 監視タイプ選択 (keyword/channel/user)
- Step 3: 値入力（YouTube channel は検索オートコンプリート付き、300msデバウンス）
- Step 4: 取得件数選択 (50/100/200)
- Step 5: 確認 → POST /api/settings

**MonitorSettingCard** — 設定カード
- プラットフォームアイコン + カラー、タイプ、値、取得件数、有効/無効
- 編集・削除アクション
- `PLATFORM_MAP`, `TYPE_MAP` をエクスポート（他コンポーネントで再利用）

**MonitorEditModal** — 設定編集モーダル
- display_name, fetch_count, is_active の変更

**AnalysisCard** — 簡易分析結果カード
- 円形SVGスコアインジケータ（trend_score 0-100、色分け）
- サマリー、トップコンテンツ3件、キーワードバッジ

**AnalysisProgress** — 分析プログレスバー
- `useAnalysisStatus` フック内蔵（2秒ポーリング）
- framer-motion アニメーション
- STATUS_CONFIG は `Record<string, ...>` 型（JobStatus の型収束問題回避）

**DetailedReport** — 詳細分析レポート（4セクション）
- トレンド分析（上昇/下降トピック）
- コンテンツ企画案（タイトル/理由/プラットフォーム推奨/ポテンシャル）
- 競合分析（トップパフォーマー、投稿パターン、共通タグ）
- レコメンデーション（番号付きリスト）

**FetchLogList** — 取得ログ一覧（最新5件）

**SettingsCompactList** — 設定コンパクト表示（最大5件 + "すべて見る"リンク）

**UpgradeBanner** — プレミアムバナー（現在非表示: isPremium=true）

## Custom Hooks (`hooks/`)

**useAnalysisStatus** (`hooks/useAnalysisStatus.ts`)
- `useAnalysisStatus(analysisId: string | null)` → `{ status, result, error, isPolling }`
- 2秒間隔ポーリング、completed/failed で自動停止

## Custom X (Twitter) Icon

```typescript
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
```

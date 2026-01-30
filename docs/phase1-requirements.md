# YouTubeScope Phase1 要件定義書：基盤機能

## 1. 概要

### 1-1. 目的

YouTube チャンネルの動画統計分析と、キーワードによる動画検索を提供し、動画企画の意思決定を支援する。

### 1-2. 背景

YouTube Data API v3 を活用し、チャンネル単位・キーワード単位で動画のパフォーマンスを可視化するツールを構築する。

### 1-3. 技術方針

- **フレームワーク**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **スタイリング**: Tailwind CSS 3.4
- **状態管理**: Zustand（ソート状態のみ）
- **キャッシュ**: Vercel KV（本番）/ インメモリ（開発）
- **デプロイ**: Vercel（東京リージョン hnd1）
- **API**: YouTube Data API v3

---

## 2. 機能要件

### 2-1. チャンネル分析機能

| 機能 | 説明 |
|------|------|
| チャンネル検索 | 名前でチャンネルを検索、オートコンプリート表示 |
| チャンネル詳細 | チャンネル情報（名前、登録者数、動画数、総再生数）表示 |
| 動画一覧 | 最新50件の動画をカード形式で表示 |
| 動画分析指標 | 再生数、いいね率、コメント率、伸び率、エンゲージメント率 |
| バッジ表示 | 「NEW」（3日以内）、「急上昇」（7日以内＋伸び率1万/日以上） |
| チャート | 直近10件の動画再生数を面グラフで可視化 |
| SNS共有 | X（Twitter）へのシェアボタン + 動的OGP画像生成 |

### 2-2. キーワード検索機能

| 機能 | 説明 |
|------|------|
| キーワード検索 | キーワードで動画を検索、再生数順に上位50件を表示 |
| タグ表示 | 各動画に最大8件のタグを表示、クリックで再検索 |
| ソート | チャンネル分析と同じ5種類のソートを適用 |

### 2-3. ソート機能（共通）

| ソート種類 | デフォルト順 | 説明 |
|-----------|-------------|------|
| 投稿日 | 降順（新しい順） | 公開日時 |
| 再生数 | 降順（多い順） | 総再生回数 |
| 伸び率 | 降順（高い順） | 1日あたりの再生数 |
| コメント率 | 降順（高い順） | コメント数 / 再生数 |
| いいね率 | 降順（高い順） | いいね数 / 再生数 |

### 2-4. 情報ページ

| ページ | パス | 内容 |
|--------|------|------|
| お問い合わせ | `/contact` | GitHub Issues + Instagram DM の2つの連絡方法 |
| 免責事項 | `/disclaimer` | サービスの性質、データ精度、API制限等 |
| プライバシーポリシー | `/privacy` | 収集情報、Cookie、Google Analytics、YouTube API使用 |

---

## 3. 画面・UI仕様

### 3-1. ページ構成

| ページ | パス | 種類 | 説明 |
|--------|------|------|------|
| ホーム | `/` | Server | 2つの検索方法（チャンネル分析・キーワード検索） |
| チャンネル詳細 | `/channel/[id]` | Client | チャンネル情報 + 動画一覧 + チャート |
| キーワード結果 | `/keyword/[query]` | Client | キーワード検索結果の動画一覧 |
| お問い合わせ | `/contact` | Server | 連絡方法の案内 |
| 免責事項 | `/disclaimer` | Server | 免責事項 |
| プライバシー | `/privacy` | Server | プライバシーポリシー |

### 3-2. レイアウト構成

- **Header**: スティッキーナビゲーション、モバイルメニュー、SNSリンク（X, Instagram, GitHub）
- **Footer**: サービス説明、リンク集、SNSアイコン、コピーライト

### 3-3. ホームページ レイアウト

- 赤グラデーションカード：チャンネル分析（SearchBarコンポーネント使用）
- 青グラデーションカード：キーワード検索（シンプルinput使用）
- 機能紹介セクション
- 使い方セクション
- 人気チャンネルクイックリンク

### 3-4. ブランドカラー

| 用途 | カラー |
|------|--------|
| チャンネル分析 | #FF0000 → #CC0000（赤グラデーション） |
| キーワード検索 | #00D4FF → #0099CC（青グラデーション） |
| チャート | #10b981（エメラルド） |
| Instagram | #E4405F |
| X (Twitter) | #1DA1F2 |

### 3-5. フォント

- Noto Sans JP（Google Fonts）
- ウェイト: 400, 500, 700

---

## 4. API Routes 設計

### 4-1. エンドポイント一覧

| ルート | メソッド | 用途 | API消費 | キャッシュ |
|--------|---------|------|---------|-----------|
| `/api/youtube/search` | GET | チャンネル検索 | 100 units | 30分 |
| `/api/youtube/channel/[id]` | GET | チャンネル詳細＋動画 | 103 units | 30分 |
| `/api/youtube/keyword` | GET | キーワード検索 | 150 units | 30分 |
| `/api/og` | GET | OGP画像生成 | - | - |

### 4-2. YouTube APIクライアント（`lib/youtube.ts`）

- シングルトンパターン
- **2段階動画取得**: playlistItems API → search API へフォールバック
- 分析指標の自動付与（伸び率、エンゲージメント等）
- ISO 8601 動画時間のパース
- タグ情報の抽出

### 4-3. キャッシュ戦略（`lib/cache.ts`）

| 環境 | ストレージ | TTL |
|------|-----------|-----|
| 本番 | Vercel KV | 30分 |
| 開発 | インメモリMap | 30分（自動クリーンアップ） |

- キーフォーマット: `channel-scope:{prefix}:{identifier}`
- HTTPキャッシュヘッダー: `s-maxage=1800, stale-while-revalidate=3600`

### 4-4. レートリミット（`lib/rate-limiter.ts`）

- IP単位で10リクエスト/分
- インメモリトラッキング（60秒ごと自動クリーンアップ）
- 超過時: 429レスポンス + retry-afterヘッダー

### 4-5. エラーハンドリング（`lib/error-handler.ts`）

| エラー種別 | 説明 | リトライ |
|-----------|------|---------|
| CHANNEL_NOT_FOUND | チャンネル未検出 | 不可 |
| API_QUOTA_EXCEEDED | API上限到達 | 不可 |
| NETWORK_ERROR | ネットワーク障害 | 可 |
| RATE_LIMIT_EXCEEDED | レート制限超過 | 可 |
| INVALID_REQUEST | 不正なリクエスト | 不可 |
| UNKNOWN_ERROR | 不明なエラー | 可 |

- 指数バックオフ: 1s → 2s → 4s → 8s（最大30s）

---

## 5. コンポーネント設計

### 5-1. コンポーネント一覧

| コンポーネント | 種別 | 役割 |
|---------------|------|------|
| Header | Client | スティッキーナビ、モバイルメニュー、SNSリンク |
| Footer | Server | フッター、リンク集、SNSアイコン |
| SearchBar | Client | チャンネル検索オートコンプリート |
| VideoList | Client | 動画一覧表示（遅延ローディング対応） |
| VideoCard | Client | 動画カード（統計、バッジ、タグ） |
| VideoChart | Client（動的import） | 再生数チャート（Recharts） |
| SortTabs | Client | 5種類のソート切替 |
| ChannelCard | Server | チャンネル情報カード |
| ShareButton | Client | X共有ボタン |
| Badge | Client | NEW / 急上昇バッジ（Framer Motion） |

### 5-2. SearchBar 仕様

- デバウンス: 300ms
- キーボードナビゲーション: ↑/↓/Enter/Esc
- クリック外検出で候補閉じ
- ローディングスピナー表示
- エラー・レートリミット表示

### 5-3. VideoCard 仕様

- サムネイル（ホバーで拡大）
- タイトル、公開日、動画時間
- 統計グリッド: 再生数、いいね率、コメント率、伸び率、エンゲージメント率
- バッジ: 「NEW」（青）、「急上昇」（赤、アニメーション付き）
- タグ表示: 最大8件、クリックでキーワード検索へ遷移
- 相対日付表示（例: 「2日前」）

### 5-4. VideoList 仕様

- 「もっと見る」ボタンで+10件ずつ読み込み
- ソート変更時のアニメーション遷移
- メモ化されたソートロジック

---

## 6. 状態管理（Zustand）

### 6-1. useSortStore（`lib/store.ts`）

```typescript
interface SortStore {
  sortType: 'views' | 'date' | 'growth' | 'comments' | 'likes';
  sortOrder: 'asc' | 'desc';
  setSortType: (type: SortType) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
}
```

- デフォルト: sortType='views', sortOrder='desc'
- チャンネル分析・キーワード検索で共有
- データはコンポーネントローカルstate管理（Zustandに入れない）

---

## 7. ユーティリティ関数

### 7-1. 数値フォーマット（`lib/format-utils.ts`）

| 関数 | 入力例 | 出力例 |
|------|--------|--------|
| `formatJapaneseNumber` | 1,570,000 | "157万" |
| `formatJapaneseSubscribers` | 1,570,000 | "157万人" |
| `formatJapaneseViews` | 1,570,000 | "157万回" |

- 万（10,000以上）、億（100,000,000以上）に対応

### 7-2. 分析指標（`lib/analytics.ts`）

| 関数 | 説明 |
|------|------|
| `calculateGrowthRate` | 1日あたりの再生数（整数丸め） |
| `calculateCommentRate` | コメント数/再生数 %（小数2桁） |
| `calculateLikeRate` | いいね数/再生数 %（小数2桁） |
| `calculateEngagementRate` | (いいね+コメント)/再生数 %（小数2桁） |
| `isTrending` | 公開7日以内 かつ 伸び率1万/日以上 |
| `isNew` | 公開3日以内 |

### 7-3. ソート（`lib/sort-utils.ts`）

- `sortVideos(videos, sortType, sortOrder)` — メインソートロジック
- `getSortDisplayName(sortType)` — 日本語ラベル取得
- `getSortOrderDisplayName(sortType, sortOrder)` — 順序ラベル取得
- `getDefaultSortOrder(sortType)` — 全て 'desc'

### 7-4. トラッキング（`lib/tracking.ts`）

Vercel Analytics によるイベント追跡:
- `trackChannelSearch` / `trackChannelView` / `trackSortChange` / `trackShare` / `trackError` / `trackAPILimit` / `trackPageView`

---

## 8. TypeScript 型定義（`types/index.ts`）

### 8-1. YouTube API 型

```typescript
interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  customUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
}

interface YouTubeVideo {
  id: string;
  channelId: string;
  channelTitle: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  // 算出指標
  daysFromPublished: number;
  growthRate: number;
  commentRate: number;
  likeRate: number;
  engagementRate: number;
  isTrending: boolean;
  isNew: boolean;
}
```

### 8-2. レスポンス型

```typescript
interface ChannelSearchResponse {
  channels: YouTubeChannel[];
  nextPageToken?: string;
}

interface ChannelDetailsResponse {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
}

interface KeywordSearchResponse {
  videos: YouTubeVideo[];
  query: string;
  count: number;
}
```

### 8-3. UI型

```typescript
type SortType = 'views' | 'date' | 'growth' | 'comments' | 'likes';
type SortOrder = 'asc' | 'desc';
type BadgeType = 'new' | 'trending';

interface APIError {
  message: string;
  code?: string;
  status?: number;
}
```

---

## 9. パフォーマンス最適化

| 手法 | 対象 | 効果 |
|------|------|------|
| 動的インポート | VideoChart（Recharts） | 初期バンドルサイズ削減 |
| デバウンス | SearchBar（300ms） | API呼び出し削減 |
| メモ化 | useMemo / useCallback | 不要な再計算防止 |
| キャッシュ | 全YouTube APIレスポンス（30分） | API quota節約 |
| 画像最適化 | next/image + lazy loading | 表示速度向上 |
| 遅延ローディング | VideoList（+10件ずつ） | 初期描画高速化 |

---

## 10. 環境変数

### 10-1. 必須

```bash
YOUTUBE_API_KEY=your_api_key_here
```

### 10-2. オプション（本番環境）

```bash
NEXT_PUBLIC_SITE_URL=https://channel-scope.vercel.app
KV_REST_API_URL=...        # Vercel KV
KV_REST_API_TOKEN=...      # Vercel KV
```

---

## 11. 依存パッケージ

### 11-1. ランタイム

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| next | 15.5.7 | フレームワーク |
| react / react-dom | 19.1.0 | UI |
| zustand | ^5.0.8 | 状態管理 |
| recharts | ^3.2.1 | チャート |
| lucide-react | ^0.544.0 | アイコン |
| framer-motion | ^12.23.22 | アニメーション（Badge） |
| @vercel/analytics | ^1.5.0 | アクセス解析 |
| @vercel/kv | ^3.0.0 | Redisキャッシュ |
| @vercel/og | ^0.8.5 | OGP画像生成 |

### 11-2. 開発

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| typescript | ^5 | 型チェック |
| tailwindcss | ^3.4.17 | スタイリング |
| eslint / eslint-config-next | ^9 / 15.5.7 | コード品質 |
| postcss / autoprefixer | ^8.5.6 / ^10.4.21 | CSS処理 |

---

## 12. ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   ├── youtube/
│   │   │   ├── search/route.ts        # チャンネル検索API
│   │   │   ├── channel/[id]/route.ts  # チャンネル詳細API
│   │   │   └── keyword/route.ts       # キーワード検索API
│   │   └── og/route.tsx               # OGP画像生成API
│   ├── channel/[id]/page.tsx          # チャンネル詳細ページ
│   ├── keyword/[query]/page.tsx       # キーワード結果ページ
│   ├── contact/page.tsx               # お問い合わせページ
│   ├── disclaimer/page.tsx            # 免責事項ページ
│   ├── privacy/page.tsx               # プライバシーポリシーページ
│   ├── layout.tsx                     # ルートレイアウト
│   ├── page.tsx                       # ホームページ
│   ├── not-found.tsx                  # 404ページ
│   ├── error.tsx                      # エラーページ
│   ├── globals.css                    # グローバルCSS
│   └── icon.svg                       # ファビコン
├── components/
│   ├── Header.tsx                     # ヘッダー
│   ├── Footer.tsx                     # フッター
│   ├── SearchBar.tsx                  # チャンネル検索バー
│   ├── VideoList.tsx                  # 動画一覧
│   ├── VideoCard.tsx                  # 動画カード
│   ├── VideoChart.tsx                 # 再生数チャート
│   ├── SortTabs.tsx                   # ソートタブ
│   ├── ChannelCard.tsx                # チャンネル情報カード
│   ├── ShareButton.tsx                # X共有ボタン
│   └── Badge.tsx                      # NEW/急上昇バッジ
├── lib/
│   ├── youtube.ts                     # YouTube APIクライアント
│   ├── cache.ts                       # キャッシュ層
│   ├── rate-limiter.ts                # レートリミッター
│   ├── error-handler.ts               # エラーハンドラー
│   ├── format-utils.ts                # 数値フォーマット
│   ├── analytics.ts                   # 分析指標計算
│   ├── sort-utils.ts                  # ソートロジック
│   ├── tracking.ts                    # Vercel Analytics
│   └── store.ts                       # Zustand Store
└── types/
    └── index.ts                       # TypeScript型定義
```

---

## 13. 非対象（Phase1では実装しない）

- ログイン・認証機能
- データ保存機能（LocalStorage / DB）
- クラウド同期
- 検索履歴の保存
- ユーザー設定
- 多言語対応

→ Phase2以降で段階的に実装予定

---

## 14. SNSリンク

| プラットフォーム | URL |
|-----------------|-----|
| X (Twitter) | https://x.com/masayuki_kiwami |
| Instagram | https://www.instagram.com/masayuki.kiwami/ |
| GitHub | https://github.com/hohoemi-rabo/youtube-scope |

---

## 15. デプロイ情報

- **プラットフォーム**: Vercel
- **リージョン**: hnd1（東京）
- **URL**: https://channel-scope.vercel.app
- **ビルド**: `next build --turbopack`
- **開発**: `next dev --turbopack`（http://localhost:3000）

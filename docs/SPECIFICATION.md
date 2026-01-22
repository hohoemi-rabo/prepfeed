# YouTubeスコープ 仕様書

**バージョン**: 1.0.0
**最終更新**: 2025年1月
**ステータス**: Phase 5 完了 / Phase 2 未着手

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [アーキテクチャ](#3-アーキテクチャ)
4. [ディレクトリ構成](#4-ディレクトリ構成)
5. [API仕様](#5-api仕様)
6. [ページ仕様](#6-ページ仕様)
7. [コンポーネント仕様](#7-コンポーネント仕様)
8. [ユーティリティ関数](#8-ユーティリティ関数)
9. [状態管理](#9-状態管理)
10. [キャッシュシステム](#10-キャッシュシステム)
11. [エラーハンドリング](#11-エラーハンドリング)
12. [スタイリング](#12-スタイリング)
13. [環境変数](#13-環境変数)
14. [パフォーマンス最適化](#14-パフォーマンス最適化)
15. [デプロイメント](#15-デプロイメント)
16. [実装済み機能一覧](#16-実装済み機能一覧)

---

## 1. プロジェクト概要

### 1.1 サービス名
**YouTubeスコープ** (旧称: チャンネルスコープ)

### 1.2 概要
YouTubeチャンネル分析とキーワード検索による動画企画支援ツール。コンテンツクリエイターがYouTubeチャンネルを分析し、キーワード検索で動画トレンドを発見するための無料Webアプリケーション。

### 1.3 主要機能
- **チャンネル分析**: YouTubeチャンネルの詳細分析（最新50本の動画統計）
- **キーワード検索**: キーワードによる動画検索（上位50本を表示）
- **多軸ソート**: 5種類の指標でソート可能（再生数、投稿日、伸び率、コメント、いいね）
- **データ可視化**: 最新動画の再生数推移をグラフ表示
- **SNSシェア**: 動的OGP画像付きでX(Twitter)にシェア

### 1.4 ターゲットユーザー
- YouTubeコンテンツクリエイター
- 動画マーケティング担当者
- トレンド調査を行うリサーチャー

---

## 2. 技術スタック

### 2.1 コア技術

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 15.5.7 |
| UI | React | 19.1.0 |
| 言語 | TypeScript | 5.x (strict mode) |
| スタイリング | Tailwind CSS | 3.4.17 |
| 状態管理 | Zustand | 5.0.8 |
| チャート | Recharts | 3.2.1 |
| アニメーション | Framer Motion | 12.23.22 |
| アイコン | Lucide React | 0.544.0 |
| フォント | Noto Sans JP | Google Fonts |

### 2.2 インフラ・サービス

| サービス | 用途 |
|---------|------|
| Vercel | ホスティング・デプロイ |
| Vercel KV | キャッシュ（本番環境） |
| Vercel Analytics | アクセス解析 |
| Vercel OG | 動的OGP画像生成 |
| YouTube Data API v3 | 動画・チャンネルデータ取得 |

### 2.3 開発ツール

| ツール | 用途 |
|--------|------|
| ESLint | コード品質チェック |
| Turbopack | 高速ビルド |
| PostCSS + Autoprefixer | CSS処理 |

---

## 3. アーキテクチャ

### 3.1 全体構成図

```
┌─────────────────────────────────────────────────────────────┐
│                        クライアント                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  SearchBar  │  │  SortTabs   │  │    VideoList/Card   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          │                                  │
│                   ┌──────▼──────┐                           │
│                   │   Zustand   │                           │
│                   │   Store     │                           │
│                   └─────────────┘                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      API Routes                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │  /search   │  │ /channel/  │  │      /keyword          │ │
│  │            │  │   [id]     │  │                        │ │
│  └─────┬──────┘  └─────┬──────┘  └───────────┬────────────┘ │
│        └───────────────┼─────────────────────┘              │
│                        │                                    │
│              ┌─────────▼─────────┐                          │
│              │   Rate Limiter    │                          │
│              │  (10 req/min/IP)  │                          │
│              └─────────┬─────────┘                          │
│                        │                                    │
│              ┌─────────▼─────────┐                          │
│              │   Cache Layer     │                          │
│              │  (Vercel KV/Mem)  │                          │
│              └─────────┬─────────┘                          │
│                        │                                    │
│              ┌─────────▼─────────┐                          │
│              │  YouTube Client   │                          │
│              │   (Singleton)     │                          │
│              └─────────┬─────────┘                          │
└────────────────────────┼────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │  YouTube Data API   │
              │       v3            │
              └─────────────────────┘
```

### 3.2 データフロー

```
ユーザー入力
    ↓
SearchBar（300msデバウンス）
    ↓
API Route（/api/youtube/xxx）
    ↓
レートリミッターチェック（10リクエスト/分/IP）
    ↓
キャッシュ確認（Vercel KV or メモリ）
    ├── キャッシュあり → キャッシュ返却
    └── キャッシュなし
            ↓
        YouTube APIクライアント
            ↓
        YouTube Data API v3
            ↓
        分析指標計算（growthRate, likeRate等）
            ↓
        キャッシュ保存（30分TTL）
            ↓
        レスポンス返却
            ↓
Zustand Store（ソート状態管理）
    ↓
Reactコンポーネント（表示）
```

---

## 4. ディレクトリ構成

```
/youtube-scope
├── /docs                    # チケット管理（001-032）
├── /public                  # 静的ファイル
├── /src
│   ├── /app                 # Next.js App Router
│   │   ├── /api            # API Routes
│   │   │   ├── /og         # OGP画像生成
│   │   │   └── /youtube    # YouTube API統合
│   │   │       ├── /channel/[id]  # チャンネル詳細
│   │   │       ├── /keyword       # キーワード検索
│   │   │       └── /search        # チャンネル検索
│   │   ├── /channel/[id]   # チャンネル分析ページ
│   │   ├── /contact        # お問い合わせページ
│   │   ├── /disclaimer     # 免責事項ページ
│   │   ├── /keyword/[query]# キーワード検索結果ページ
│   │   ├── /privacy        # プライバシーポリシー
│   │   ├── error.tsx       # エラーバウンダリ
│   │   ├── globals.css     # グローバルCSS
│   │   ├── icon.svg        # ファビコン
│   │   ├── layout.tsx      # ルートレイアウト
│   │   ├── not-found.tsx   # 404ページ
│   │   └── page.tsx        # ホームページ
│   ├── /components         # Reactコンポーネント
│   │   ├── Badge.tsx       # NEW/急上昇バッジ
│   │   ├── ChannelCard.tsx # チャンネル情報カード
│   │   ├── Footer.tsx      # フッター
│   │   ├── Header.tsx      # ヘッダー
│   │   ├── SearchBar.tsx   # 検索バー（オートコンプリート）
│   │   ├── ShareButton.tsx # シェアボタン
│   │   ├── SortTabs.tsx    # ソートタブ
│   │   ├── VideoCard.tsx   # 動画カード
│   │   ├── VideoChart.tsx  # 再生数グラフ
│   │   └── VideoList.tsx   # 動画一覧
│   ├── /lib                # ユーティリティ
│   │   ├── analytics.ts    # 分析指標計算
│   │   ├── cache.ts        # キャッシュレイヤー
│   │   ├── error-handler.ts# エラーハンドリング
│   │   ├── format-utils.ts # 数値フォーマット
│   │   ├── rate-limiter.ts # レートリミッター
│   │   ├── sort-utils.ts   # ソートロジック
│   │   ├── store.ts        # Zustandストア
│   │   ├── tracking.ts     # アナリティクス追跡
│   │   └── youtube.ts      # YouTube APIクライアント
│   └── /types              # TypeScript型定義
│       └── index.ts
├── .env.local              # 環境変数（gitignore）
├── next.config.ts          # Next.js設定
├── package.json            # 依存関係
├── tailwind.config.ts      # Tailwind設定
└── tsconfig.json           # TypeScript設定
```

---

## 5. API仕様

### 5.1 チャンネル検索 API

**エンドポイント**: `GET /api/youtube/search`

**目的**: チャンネル名で検索し、マッチするチャンネル一覧を返却

**リクエスト**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| q | string | ○ | 検索クエリ（2-100文字） |

**レスポンス**:
```typescript
{
  channels: Array<{
    id: string;              // チャンネルID
    title: string;           // チャンネル名
    description: string;     // 説明文
    thumbnail: string;       // サムネイルURL
    customUrl: string;       // カスタムURL（@xxx）
    subscriberCount: number; // 登録者数
    videoCount: number;      // 動画数
    viewCount: number;       // 総再生回数
    publishedAt: string;     // チャンネル作成日
  }>;
}
```

**仕様**:
| 項目 | 値 |
|------|-----|
| APIクォータ消費 | 100ユニット |
| キャッシュTTL | 30分 |
| HTTPキャッシュ | s-maxage=300, stale-while-revalidate=600 |
| レートリミット | 10リクエスト/分/IP |

---

### 5.2 チャンネル詳細 API

**エンドポイント**: `GET /api/youtube/channel/[id]`

**目的**: チャンネル情報と最新50本の動画データを取得

**リクエスト**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string (path) | ○ | YouTubeチャンネルID（10文字以上） |

**レスポンス**:
```typescript
{
  channel: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    customUrl: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    publishedAt: string;
  };
  videos: Array<{
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
    // 計算された指標
    daysFromPublished: number;
    growthRate: number;      // 1日あたり再生数
    commentRate: number;     // コメント率（%）
    likeRate: number;        // いいね率（%）
    engagementRate: number;  // エンゲージメント率（%）
    isTrending: boolean;     // 急上昇フラグ
    isNew: boolean;          // 新着フラグ
  }>;
}
```

**仕様**:
| 項目 | 値 |
|------|-----|
| APIクォータ消費 | 103ユニット |
| キャッシュTTL | 30分 |
| HTTPキャッシュ | s-maxage=1800, stale-while-revalidate=3600 |
| エラー | 404（チャンネル不在）、429（クォータ超過） |

---

### 5.3 キーワード検索 API

**エンドポイント**: `GET /api/youtube/keyword`

**目的**: キーワードで動画を検索し、再生数上位50本を返却

**リクエスト**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| q | string | ○ | 検索キーワード（2-100文字） |

**レスポンス**:
```typescript
{
  videos: Array<YouTubeVideo>; // 上記と同形式
  query: string;               // 検索キーワード
  count: number;               // 検索結果数
}
```

**仕様**:
| 項目 | 値 |
|------|-----|
| APIクォータ消費 | 150ユニット（search: 100 + videos: 50） |
| キャッシュTTL | 30分 |
| ソート | 再生数降順 |

---

### 5.4 OGP画像生成 API

**エンドポイント**: `GET /api/og`

**目的**: SNSシェア用の動的OGP画像を生成

**リクエスト**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| channel | string | ○ | チャンネル名 |
| subscribers | string | ○ | 登録者数 |
| videos | string | ○ | 動画数 |
| views | string | ○ | 総再生回数 |

**レスポンス**: PNG画像（1200x630px）

---

## 6. ページ仕様

### 6.1 ホームページ (/)

**構成**:
1. **ヒーローセクション**
   - グラデーションテキスト「YouTubeスコープ」
   - サブタイトル説明文

2. **検索カードセクション**
   - **チャンネル分析カード**（赤グラデーション）
     - SearchBarコンポーネント使用
     - クイックアクセスリンク（HIKAKIN TV等）
   - **キーワード検索カード**（青グラデーション）
     - フォーム入力使用
     - 例示キーワード（プログラミング、料理等）

3. **機能紹介セクション**
   - 4つの機能カード（グリッド表示）

4. **使い方セクション**
   - 2パターンの使い方をステップ説明

5. **CTAセクション**
   - 検索開始への誘導

---

### 6.2 チャンネル分析ページ (/channel/[id])

**レイアウト**:
```
┌─────────────────────────────────────┐
│ ← 戻る                    [シェア] │
├─────────────────────────────────────┤
│         [SearchBar]                 │
├─────────────────────────────────────┤
│ ┌─────┐                             │
│ │ Icon│ チャンネル名                 │
│ └─────┘ @customUrl                  │
│         説明文...                   │
├─────────────────────────────────────┤
│ ┌─────────┐┌─────────┐┌───────────┐│
│ │ 動画数  ││登録者数 ││ 総再生数  ││
│ └─────────┘└─────────┘└───────────┘│
├─────────────────────────────────────┤
│      [VideoChart - 再生数推移]      │
├─────────────────────────────────────┤
│         [SortTabs]                  │
├─────────────────────────────────────┤
│         [VideoList]                 │
│         └── [もっと見る]            │
└─────────────────────────────────────┘
```

**機能**:
- 動的OGP画像でSNSシェア
- ローディング状態表示（スピナー）
- エラー時リトライボタン
- アナリティクストラッキング

---

### 6.3 キーワード検索結果ページ (/keyword/[query])

**レイアウト**:
```
┌─────────────────────────────────────┐
│ ← ホームに戻る                      │
├─────────────────────────────────────┤
│     [キーワード検索入力]            │
├─────────────────────────────────────┤
│ 「{query}」の検索結果: {count}件    │
├─────────────────────────────────────┤
│         [SortTabs]                  │
├─────────────────────────────────────┤
│         [VideoList]                 │
│         └── [もっと見る]            │
└─────────────────────────────────────┘
```

**機能**:
- URLベースの状態管理（クエリがパスに含まれる）
- タグクリックで新しいキーワード検索へ遷移
- チャンネル分析と同じソート機能

---

### 6.4 その他のページ

| ページ | パス | 内容 |
|--------|------|------|
| お問い合わせ | /contact | GitHub Issues + Instagram DMへの誘導 |
| 免責事項 | /disclaimer | 法的免責事項 |
| プライバシーポリシー | /privacy | データ取り扱い方針 |
| 404 | /not-found | ページ未検出エラー |

---

## 7. コンポーネント仕様

### 7.1 SearchBar

**ファイル**: `components/SearchBar.tsx`

**目的**: チャンネル検索用のオートコンプリート付き検索バー

**Props**:
```typescript
{
  onChannelSelect?: (channelId: string) => void;
  initialValue?: string;
}
```

**機能**:
- **デバウンス**: 300ms遅延で入力を検出
- **キーボードナビゲーション**: ↑↓（候補移動）、Enter（選択）、Esc（閉じる）
- **クリック外検出**: ドロップダウン外クリックで閉じる
- **エラー表示**: レートリミット（黄色）、その他（赤色）
- **ローディング状態**: 検索アイコンがスピナーに変化
- **クリアボタン**: ×アイコンでリセット

**ドロップダウン**:
- 最大10件表示
- サムネイル、タイトル、登録者数、動画数、カスタムURL表示
- マウス/キーボードで選択可能

---

### 7.2 VideoCard

**ファイル**: `components/VideoCard.tsx`

**目的**: 動画情報を表示するカードコンポーネント

**Props**:
```typescript
{
  video: YouTubeVideo;
}
```

**レイアウト**:
```
┌─────────────────────────────────────────────────┐
│ ┌─────────────────┐  タイトル（2行制限）        │
│ │   サムネイル    │  X分前 / X日前              │
│ │  ┌────┐        │                             │
│ │  │NEW │        │  👁 100万  👍 5%  💬 0.5%   │
│ │  └────┘        │  📈 1万/日  ⚡ 5.5%         │
│ │      [10:30]   │                             │
│ └─────────────────┘  タグ: [tag1] [tag2] +3    │
│                                                │
│ X日経過              [YouTubeで見る →]          │
└─────────────────────────────────────────────────┘
```

**バッジ**:
| バッジ | 条件 | 色 |
|--------|------|-----|
| NEW | 3日以内 | 青 |
| 急上昇 | 7日以内 かつ 伸び率≥10,000/日 | 赤 |

**タグ表示**:
- 最大8個表示
- クリックでキーワード検索へ遷移
- 超過分は「+N more」で表示

---

### 7.3 SortTabs

**ファイル**: `components/SortTabs.tsx`

**目的**: 5種類のソート条件と昇順/降順を切り替え

**ソートオプション**:
| キー | ラベル | アイコン | デフォルト順 |
|------|--------|----------|-------------|
| date | 投稿日 | Calendar | 降順（新しい順） |
| views | 再生数 | Eye | 降順（多い順） |
| growth | 伸び率 | TrendingUp | 降順（高い順） |
| comments | コメント | MessageCircle | 降順（高い順） |
| likes | いいね | ThumbsUp | 降順（高い順） |

**UI状態**:
- アクティブタブ: 赤背景、白文字、ソート方向アイコン表示
- 非アクティブ: グレーボーダー、グレー文字
- トグルボタン: 昇順/降順切り替え

---

### 7.4 VideoChart

**ファイル**: `components/VideoChart.tsx`

**目的**: 最新10本の動画再生数推移をエリアチャートで可視化

**特徴**:
- **動的インポート**: `next/dynamic`で遅延読み込み（Rechartsが大きいため）
- **グリーンテーマ**: #10b981（emerald-500）
- **レスポンシブ**: `ResponsiveContainer`使用

---

### 7.5 Badge

**ファイル**: `components/Badge.tsx`

**目的**: アニメーション付きバッジ表示

**Props**:
```typescript
{
  type: 'new' | 'trending';
}
```

**アニメーション**: Framer Motionによるフェードイン + スケール

---

### 7.6 Header / Footer

**Header機能**:
- スティッキーポジショニング
- モバイルメニュー（ハンバーガー）
- SNSリンク（X, Instagram, GitHub）
- カスタムXアイコン（SVG）

**Footer機能**:
- SNSアイコン（ホバーでブランドカラー）
- 法的ページへのリンク
- コピーライト（動的年）

---

## 8. ユーティリティ関数

### 8.1 数値フォーマット (format-utils.ts)

| 関数 | 入力 | 出力 | 例 |
|------|------|------|-----|
| `formatJapaneseNumber` | 1570000 | "157万" | 1億超は「X億」 |
| `formatJapaneseSubscribers` | 100000 | "10万人" | 人サフィックス付き |
| `formatJapaneseViews` | 5000000 | "500万回" | 回サフィックス付き |

### 8.2 分析指標 (analytics.ts)

| 関数 | 計算式 | 説明 |
|------|--------|------|
| `calculateGrowthRate` | views ÷ (days + 1) | 1日あたり再生数 |
| `calculateLikeRate` | (likes ÷ views) × 100 | いいね率（%） |
| `calculateCommentRate` | (comments ÷ views) × 100 | コメント率（%） |
| `calculateEngagementRate` | ((likes + comments) ÷ views) × 100 | エンゲージメント率 |
| `isNew` | days ≤ 3 | 新着判定 |
| `isTrending` | days ≤ 7 AND growth ≥ 10,000 | 急上昇判定 |

### 8.3 ソート (sort-utils.ts)

```typescript
sortVideos(videos: YouTubeVideo[], sortType: SortType, sortOrder: SortOrder): YouTubeVideo[]
```

---

## 9. 状態管理

### 9.1 Zustand Store

**ファイル**: `lib/store.ts`

```typescript
interface SortStore {
  // 状態
  sortType: 'views' | 'date' | 'growth' | 'comments' | 'likes';
  sortOrder: 'asc' | 'desc';

  // アクション
  setSortType: (type: SortType) => void;  // 変更時にorderをdescにリセット
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
}
```

**設計思想**:
- 最小限のグローバル状態
- ソート設定のみZustandで管理
- チャンネル/動画データはローカルstate

---

## 10. キャッシュシステム

### 10.1 デュアルバックエンドアーキテクチャ

**本番環境 (Vercel KV)**:
```typescript
await kv.set(key, data, { ex: ttl });
await kv.get(key);
await kv.del(key);
```

**開発環境 (インメモリ)**:
```typescript
Map<string, { data: T; expiresAt: number }>
```

### 10.2 キャッシュキーフォーマット

```
channel-scope:search:{query}
channel-scope:channel:{channelId}
channel-scope:keyword-search:{keyword}
```

### 10.3 TTL設定

| 項目 | 値 |
|------|-----|
| キャッシュTTL | 30分（1800秒） |
| HTTPヘッダー | Cache-Control: public, s-maxage=300, stale-while-revalidate=600 |

---

## 11. エラーハンドリング

### 11.1 エラータイプ

| タイプ | パターンマッチ | ユーザーメッセージ | リトライ可 |
|--------|---------------|------------------|-----------|
| CHANNEL_NOT_FOUND | "not found", "該当" | 該当チャンネルが見つかりません | × |
| API_QUOTA_EXCEEDED | "quota", "exceeded" | API制限に達しました（5分後に再試行） | × |
| NETWORK_ERROR | "network", "fetch", "timeout" | ネットワーク接続を確認してください | ○ |
| RATE_LIMIT | "rate limit", "too many" | リクエスト制限中（しばらく待ってから再試行） | ○ |
| INVALID_REQUEST | "invalid", "bad request" | 入力内容を確認してください | × |
| UNKNOWN | (デフォルト) | 予期しないエラーが発生しました | ○ |

### 11.2 指数バックオフ

```
試行1: 1秒
試行2: 2秒
試行3: 4秒
試行4: 8秒
最大: 30秒
```

---

## 12. スタイリング

### 12.1 CSS変数

```css
:root {
  --primary: #FF0000;       /* YouTube Red */
  --primary-dark: #CC0000;
  --secondary: #282828;
  --accent: #00D4FF;        /* Cyan */
  --background: #ffffff;
  --foreground: #171717;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

### 12.2 カスタムクラス

| クラス | 用途 |
|--------|------|
| `.container-custom` | 最大幅コンテナ + レスポンシブパディング |
| `.btn-primary` | 赤グラデーションボタン |
| `.btn-secondary` | グレーボタン |
| `.card` | 白背景カード + ボーダー + シャドウ |
| `.input-field` | フォーム入力 + フォーカスリング |
| `.text-gradient` | 赤→シアングラデーションテキスト |

### 12.3 ブランドカラー

| 要素 | カラー |
|------|--------|
| チャンネル分析 | 赤グラデーション (#FF0000 → #CC0000) |
| キーワード検索 | 青グラデーション (#00D4FF → #0099CC) |
| チャート/成功 | グリーン (#10b981) |
| Instagram | ピンク (#E4405F) |
| X (Twitter) | ライトブルー (#1DA1F2) |

---

## 13. 環境変数

### 13.1 必須

```bash
YOUTUBE_API_KEY=your_api_key_here
```

### 13.2 オプション（本番環境）

```bash
KV_REST_API_URL=...              # Vercel KV
KV_REST_API_TOKEN=...            # Vercel KV
NEXT_PUBLIC_SITE_URL=https://youtube-scope.vercel.app
```

---

## 14. パフォーマンス最適化

| 最適化 | 実装内容 |
|--------|---------|
| 動的インポート | VideoChart (Recharts) を必要時のみ読み込み |
| デバウンス | SearchBarで300ms遅延 |
| メモ化 | useMemo（ソート済みリスト）、useCallback（イベントハンドラ） |
| キャッシュ | 30分キャッシュで重複APIコールを削減 |
| 遅延読み込み | Next.js Imageでサムネイル遅延読み込み |
| ページネーション | VideoListで10件ずつ表示、「もっと見る」ボタン |
| コード分割 | Next.jsによるルートベース自動分割 |

---

## 15. デプロイメント

| 項目 | 値 |
|------|-----|
| プラットフォーム | Vercel |
| リージョン | hnd1 (東京) |
| ビルド | Turbopack有効 |
| データベース | Vercel KV (Redis) |
| URL | https://channel-scope.vercel.app（youtube-scopeに更新予定） |

---

## 16. 実装済み機能一覧

### 16.1 コア機能

| 機能 | ステータス | 説明 |
|------|----------|------|
| チャンネル検索 | ✅ | オートコンプリート付き検索 |
| チャンネル分析 | ✅ | 最新50本の動画統計 |
| キーワード検索 | ✅ | キーワードで動画検索（上位50本） |
| 多軸ソート | ✅ | 5種類（再生数、投稿日、伸び率、コメント、いいね） |
| データ可視化 | ✅ | 再生数推移のエリアチャート |
| SNSシェア | ✅ | 動的OGP画像付きX共有 |

### 16.2 システム機能

| 機能 | ステータス | 説明 |
|------|----------|------|
| キャッシュ | ✅ | Vercel KV（本番）/ メモリ（開発） |
| レートリミット | ✅ | 10リクエスト/分/IP |
| エラーハンドリング | ✅ | 6タイプ分類 + 指数バックオフ |
| アナリティクス | ✅ | Vercel Analytics追跡 |

### 16.3 UI/UX機能

| 機能 | ステータス | 説明 |
|------|----------|------|
| 日本語数値フォーマット | ✅ | 万/億表記 |
| 動画タグ表示 | ✅ | 最大8タグ、クリックで検索 |
| アニメーションバッジ | ✅ | NEW/急上昇（Framer Motion） |
| ダークモード | ✅ | CSS変数によるテーマ切り替え |
| レスポンシブ | ✅ | モバイル対応（640px/768px/1024px） |

### 16.4 法的・情報ページ

| ページ | ステータス | 説明 |
|--------|----------|------|
| お問い合わせ | ✅ | GitHub Issues + Instagram DM |
| 免責事項 | ✅ | 法的免責事項 |
| プライバシーポリシー | ✅ | データ取り扱い方針 |

---

## 付録

### A. 型定義一覧

```typescript
// チャンネル
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

// 動画
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
  daysFromPublished: number;
  growthRate: number;
  commentRate: number;
  likeRate: number;
  engagementRate: number;
  isTrending: boolean;
  isNew: boolean;
}

// ソート
type SortType = 'views' | 'date' | 'growth' | 'comments' | 'likes';
type SortOrder = 'asc' | 'desc';

// APIレスポンス
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

### B. APIクォータ消費まとめ

| API | クォータ消費 | 用途 |
|-----|-------------|------|
| チャンネル検索 | 100ユニット | search.list |
| チャンネル詳細 | 103ユニット | channels + playlistItems + videos |
| キーワード検索 | 150ユニット | search.list + videos.list |

※ YouTube Data API v3の1日あたり上限: 10,000ユニット

---

**ドキュメント終了**

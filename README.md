# YouTubeスコープ (YouTubeScope)

YouTubeチャンネル分析とキーワード検索による動画企画支援ツール

**旧名称**: チャンネルスコープ（ChannelScope）

## 概要

YouTubeスコープは、配信者のための無料分析ツールです。チャンネルの成長を可視化し、キーワード検索で人気動画のトレンドを把握できます。

### 主要機能

#### 1. チャンネル分析
- チャンネル名の部分一致検索（最大10件の候補表示）
- 最新50本の動画データを自動取得
- 5つのソート機能（再生数、投稿日、伸び率、コメント率、いいね率）
- 最新10本の再生数推移グラフ（Recharts使用）
- SNS共有機能（X/Twitter）と動的OGP画像生成

#### 2. キーワード検索 [Phase 5追加]
- キーワードで人気動画を検索（最大50件）
- 再生数の多い順に表示
- 動画タグ表示で企画ヒントを提供
- チャンネル分析と同じソート機能

## 技術スタック

- **Framework**: Next.js 15.5.4 (App Router)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: Zustand
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Fonts**: Noto Sans JP (Google Fonts)
- **Analytics**: Vercel Analytics
- **API**: YouTube Data API v3
- **Cache**: Vercel KV (30分間保持)
- **OGP Generation**: @vercel/og

## セットアップ

### 前提条件

- Node.js 20.x 以上
- npm または yarn

### 環境変数

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# YouTube Data API v3 キー
YOUTUBE_API_KEY=your_youtube_api_key_here

# Vercel KV（キャッシュ用）
KV_URL=your_kv_url_here
KV_REST_API_URL=your_kv_rest_api_url_here
KV_REST_API_TOKEN=your_kv_rest_api_token_here
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token_here

# サイトURL（本番環境）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーは http://localhost:3000 で起動します。

### ビルド

```bash
# 本番用ビルド
npm run build

# 本番サーバーの起動
npm run start
```

### コード品質チェック

```bash
# ESLintの実行
npm run lint
```

## プロジェクト構成

```
/src
  /app
    /(routes)       # Next.js App Router ページ
    /api           # API Routes
      /youtube     # YouTube関連API
        /search    # チャンネル検索
        /channel   # チャンネル詳細
        /keyword   # キーワード検索 [Phase 5]
      /og          # OGP画像生成
    /globals.css   # グローバルスタイル
    /layout.tsx    # ルートレイアウト
    /page.tsx      # ホームページ
  /components      # Reactコンポーネント
  /lib            # ユーティリティ関数
  /store          # Zustand ストア
  /types          # TypeScript型定義
/docs             # プロジェクトドキュメント・チケット
/public           # 静的ファイル
```

## API エンドポイント

### チャンネル検索
```
GET /api/youtube/search?q={チャンネル名}
```

### チャンネル詳細・動画リスト
```
GET /api/youtube/channel/{channelId}
```

### キーワード検索 [Phase 5]
```
GET /api/youtube/keyword?q={キーワード}
```

### OGP画像生成
```
GET /api/og?channel={チャンネル名}&subscribers={登録者数}&videos={動画数}&views={総再生数}
```

## API クォータ

YouTube Data API v3 の1日あたりのクォータは10,000ユニットです。

- チャンネル検索: 100 units (search.list)
- チャンネル詳細: 100 units (channels.list + videos.list)
- キーワード検索: 150 units (search.list 100 + videos.list 50)

Vercel KVで30分間キャッシュすることで、APIクォータの消費を最小限に抑えています。

## 開発フェーズ

- **Phase 1 (MVP)**: 基本UI、YouTube API連携、検索・表示機能
- **Phase 2**: 分析機能、グラフ表示、ソート機能
- **Phase 3**: キャッシュ実装、OGP生成、SNS共有
- **Phase 4**: 公開準備、Analytics設定、本番デプロイ
- **Phase 5**: キーワード検索機能追加、プロジェクト名変更 ✨ **現在のフェーズ**

詳細な要件は [REQUIREMENTS.md](./REQUIREMENTS.md) を参照してください。

## チケット管理

プロジェクトの要件と機能は `/docs` ディレクトリ内のチケットファイルで管理しています。

## デプロイ

本番環境は Vercel にデプロイされています。

🔗 **本番URL**: https://channel-scope.vercel.app

## ライセンス

Private

## 開発ガイド

詳細な開発ガイドは [CLAUDE.md](./CLAUDE.md) を参照してください。

---

**配信者のための無料分析ツール - YouTubeスコープ**

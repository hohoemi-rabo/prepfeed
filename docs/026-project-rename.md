# 026: プロジェクトリネーム & URL再構成

## 概要

YouTubeスコープ → PrepFeed へのリブランディングと、YouTube関連ルートを `/youtube/*` 配下に移動する。

## 背景

Phase 2 でマルチプラットフォーム（YouTube / Qiita / Zenn）対応するため、プロジェクト名とURL構成を変更する必要がある。

## 要件

### リブランディング

- [ ] `package.json` の name を `prepfeed` に変更
- [ ] ページタイトル・メタデータを「PrepFeed」に更新
- [ ] サブタイトル: 「集めて、分析して、ネタにする。」
- [ ] `NEXT_PUBLIC_SITE_URL` を `https://prepfeed.vercel.app` に変更
- [ ] OGP画像のブランディング更新
- [ ] ファビコン更新（必要に応じて）

### URL再構成

- [ ] `/channel/[id]` → `/youtube/channel/[id]` に移動
- [ ] `/keyword/[query]` → `/youtube/keyword/[query]` に移動
- [ ] 旧URLからのリダイレクト設定（`next.config.ts`）
- [ ] 内部リンクの一括更新

### キャッシュキー

- [ ] キャッシュキープレフィックスを `channel-scope:` → `prepfeed:` に変更

## 受け入れ条件

- [ ] 全ページのタイトル・メタデータが「PrepFeed」になっている
- [ ] `/youtube/channel/[id]` でチャンネル詳細が表示される
- [ ] `/youtube/keyword/[query]` でキーワード結果が表示される
- [ ] 旧URL `/channel/[id]` が新URLにリダイレクトされる
- [ ] 旧URL `/keyword/[query]` が新URLにリダイレクトされる
- [ ] `npm run build` が成功する

## 依存関係

- なし（最初に実施）

## 関連ファイル

- `package.json`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/channel/[id]/` → `src/app/youtube/channel/[id]/`
- `src/app/keyword/[query]/` → `src/app/youtube/keyword/[query]/`
- `src/lib/cache.ts`
- `next.config.ts`
- `src/app/api/og/route.tsx`

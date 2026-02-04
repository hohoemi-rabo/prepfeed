# 034: 記事共通コンポーネント（ArticleCard・ArticleList・ソート）

## 概要

Qiita / Zenn 共通で使用する記事表示コンポーネント群を実装する。既存のVideoCard / VideoList / SortTabs のパターンを踏襲する。

## 背景

Qiita と Zenn は「記事」という共通フォーマットを持つため、共通コンポーネントとして設計し、プラットフォーム固有の差分のみ分岐する。

## 要件

### ArticleCard コンポーネント

- [x] 記事タイトル（リンク付き）
- [x] 著者名・著者アイコン
- [x] 公開日（相対日付表示）
- [x] 統計表示:
  - Qiita: いいね数、ストック数
  - Zenn: いいね数
- [x] 伸び率（1日あたりのいいね数）
- [x] タグ表示（Qiitaのみ、クリックでキーワード検索へ）
- [x] バッジ:「NEW」（3日以内）、「急上昇」（条件はプラットフォームごとに定義）
- [x] プラットフォームアイコン（Qiita / Zenn）
- [x] 「元記事を読む」外部リンク

### ArticleList コンポーネント

- [x] 記事一覧表示（カード形式）
- [x] 「もっと見る」ボタン（+10件ずつ）
- [x] ソート変更時のアニメーション
- [x] メモ化されたソートロジック
- [x] 空状態メッセージ

### ArticleSortTabs コンポーネント

- [x] Qiita ソートオプション:
  - いいね数（降順）
  - 投稿日（降順）
  - ストック数（降順）
- [x] Zenn ソートオプション:
  - いいね数（降順）
  - 投稿日（降順）
- [x] 昇順/降順トグル
- [x] Zustand store との連携（または props ベース）

### ソートロジック（`lib/article-sort-utils.ts`）

- [x] `sortArticles(articles, sortType, sortOrder)` — Qiita / Zenn 共通
- [x] Qiita用: likes / date / stocks
- [x] Zenn用: likes / date

## 受け入れ条件

- [x] ArticleCard がQiita記事を正しく表示できる
- [x] ArticleCard がZenn記事を正しく表示できる
- [x] ArticleList で「もっと見る」が機能する
- [x] ソートタブの切替で記事の並び順が変わる
- [x] 数値が日本語フォーマット（万/億）で表示される
- [x] レスポンシブ対応

## 依存関係

- 027（型定義）

## 関連ファイル

- `src/components/ArticleCard.tsx`（新規）
- `src/components/ArticleList.tsx`（新規）
- `src/components/ArticleSortTabs.tsx`（新規）
- `src/lib/article-sort-utils.ts`（新規）

# 034: 記事共通コンポーネント（ArticleCard・ArticleList・ソート）

## 概要

Qiita / Zenn 共通で使用する記事表示コンポーネント群を実装する。既存のVideoCard / VideoList / SortTabs のパターンを踏襲する。

## 背景

Qiita と Zenn は「記事」という共通フォーマットを持つため、共通コンポーネントとして設計し、プラットフォーム固有の差分のみ分岐する。

## 要件

### ArticleCard コンポーネント

- [ ] 記事タイトル（リンク付き）
- [ ] 著者名・著者アイコン
- [ ] 公開日（相対日付表示）
- [ ] 統計表示:
  - Qiita: いいね数、ストック数
  - Zenn: いいね数
- [ ] 伸び率（1日あたりのいいね数）
- [ ] タグ表示（Qiitaのみ、クリックでキーワード検索へ）
- [ ] バッジ:「NEW」（3日以内）、「急上昇」（条件はプラットフォームごとに定義）
- [ ] プラットフォームアイコン（Qiita / Zenn）
- [ ] 「元記事を読む」外部リンク

### ArticleList コンポーネント

- [ ] 記事一覧表示（カード形式）
- [ ] 「もっと見る」ボタン（+10件ずつ）
- [ ] ソート変更時のアニメーション
- [ ] メモ化されたソートロジック
- [ ] 空状態メッセージ

### ArticleSortTabs コンポーネント

- [ ] Qiita ソートオプション:
  - いいね数（降順）
  - 投稿日（降順）
  - ストック数（降順）
- [ ] Zenn ソートオプション:
  - いいね数（降順）
  - 投稿日（降順）
- [ ] 昇順/降順トグル
- [ ] Zustand store との連携（または props ベース）

### ソートロジック（`lib/article-sort-utils.ts`）

- [ ] `sortArticles(articles, sortType, sortOrder)` — Qiita / Zenn 共通
- [ ] Qiita用: likes / date / stocks
- [ ] Zenn用: likes / date

## 受け入れ条件

- [ ] ArticleCard がQiita記事を正しく表示できる
- [ ] ArticleCard がZenn記事を正しく表示できる
- [ ] ArticleList で「もっと見る」が機能する
- [ ] ソートタブの切替で記事の並び順が変わる
- [ ] 数値が日本語フォーマット（万/億）で表示される
- [ ] レスポンシブ対応

## 依存関係

- 027（型定義）

## 関連ファイル

- `src/components/ArticleCard.tsx`（新規）
- `src/components/ArticleList.tsx`（新規）
- `src/components/ArticleSortTabs.tsx`（新規）
- `src/lib/article-sort-utils.ts`（新規）

# 032: Qiita APIクライアント & APIルート

## 概要

Qiita API v2 を利用したAPIクライアントと、Next.js APIルート（ユーザー記事取得・キーワード検索）を実装する。

## 背景

Phase 2 で技術トレンドの収集対象として Qiita を追加する。YouTube APIクライアントと同様のパターンで実装する。

## 要件

### Qiita APIクライアント（`lib/qiita.ts`）

- [ ] シングルトンパターン
- [ ] `QIITA_ACCESS_TOKEN` 環境変数対応（認証あり: 1,000リクエスト/時）
- [ ] `getUserArticles(userId, limit)` — ユーザーの記事一覧取得
- [ ] `searchArticles(keyword, limit)` — キーワード検索
- [ ] 記事データへの分析指標付与（growth_rate, days_from_published）
- [ ] エラーハンドリング（レートリミット、404等）

### Qiita API外部仕様

| エンドポイント | 用途 |
|---|---|
| `GET /api/v2/users/:user_id/items` | ユーザー記事一覧 |
| `GET /api/v2/items?query=tag:{tag}` | キーワード（タグ）検索 |

### Next.js APIルート

#### `/api/qiita/user/[id]` (GET)

- [ ] ユーザーIDからプロフィール + 記事一覧を返す
- [ ] クエリパラメータ: `limit`（デフォルト50）
- [ ] キャッシュ: 30分 TTL
- [ ] レートリミット適用

#### `/api/qiita/keyword` (GET)

- [ ] キーワードで記事検索
- [ ] クエリパラメータ: `q`, `limit`（デフォルト50）
- [ ] キャッシュ: 30分 TTL
- [ ] レートリミット適用

### レスポンス形式

```typescript
// ユーザー記事
{
  user: QiitaUser,
  articles: QiitaArticle[]
}

// キーワード検索
{
  articles: QiitaArticle[],
  query: string,
  count: number
}
```

## 受け入れ条件

- [ ] `/api/qiita/user/[id]` でユーザー記事が取得できる
- [ ] `/api/qiita/keyword?q=React` でキーワード検索結果が返る
- [ ] 各記事に `days_from_published`, `growth_rate` が付与されている
- [ ] キャッシュが機能している（2回目のリクエストが高速）
- [ ] レートリミットが適用されている
- [ ] 存在しないユーザーIDで適切なエラーレスポンスが返る

## 依存関係

- 027（型定義）

## 関連ファイル

- `src/lib/qiita.ts`（新規）
- `src/app/api/qiita/user/[id]/route.ts`（新規）
- `src/app/api/qiita/keyword/route.ts`（新規）

## 参照

- phase2_v2-requirements.md セクション 7.2（Qiita API）
- phase2_v2-requirements.md セクション 13.3（Qiita API v2 仕様）

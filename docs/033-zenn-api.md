# 033: Zenn APIクライアント & APIルート

## 概要

Zenn 内部API（非公式）を利用したAPIクライアントと、Next.js APIルート（ユーザー記事取得・キーワード検索）を実装する。

## 背景

Phase 2 で技術トレンドの収集対象として Zenn を追加する。非公式APIのため、仕様変更への耐性を考慮した実装が必要。

## 要件

### Zenn APIクライアント（`lib/zenn.ts`）

- [ ] シングルトンパターン
- [ ] 認証不要（非公式API）
- [ ] `getUserArticles(username, limit)` — ユーザーの記事一覧取得
- [ ] `searchArticlesByTopic(topicName, limit)` — トピック別記事検索
- [ ] 記事データへの分析指標付与（growth_rate, days_from_published）
- [ ] 適度なリクエスト間隔（非公式APIへの配慮）
- [ ] エラーハンドリング（API仕様変更時のフォールバック）

### Zenn API外部仕様（非公式）

| エンドポイント | 用途 |
|---|---|
| `GET /api/articles?username={username}` | ユーザー記事一覧 |
| `GET /api/articles?topicname={topic}` | トピック別記事一覧 |

### Next.js APIルート

#### `/api/zenn/user/[username]` (GET)

- [ ] ユーザー名からプロフィール + 記事一覧を返す
- [ ] クエリパラメータ: `limit`（デフォルト50）
- [ ] キャッシュ: 30分 TTL
- [ ] レートリミット適用

#### `/api/zenn/keyword` (GET)

- [ ] トピック名で記事検索
- [ ] クエリパラメータ: `q`, `limit`（デフォルト50）
- [ ] キャッシュ: 30分 TTL
- [ ] レートリミット適用

### レスポンス形式

```typescript
// ユーザー記事
{
  user: ZennUser,
  articles: ZennArticle[]
}

// キーワード検索
{
  articles: ZennArticle[],
  query: string,
  count: number
}
```

## 受け入れ条件

- [ ] `/api/zenn/user/[username]` でユーザー記事が取得できる
- [ ] `/api/zenn/keyword?q=Next.js` でトピック検索結果が返る
- [ ] 各記事に `days_from_published`, `growth_rate` が付与されている
- [ ] キャッシュが機能している
- [ ] レートリミットが適用されている
- [ ] API仕様変更時にアプリが落ちない（適切なエラーレスポンス）

## 依存関係

- 027（型定義）

## 関連ファイル

- `src/lib/zenn.ts`（新規）
- `src/app/api/zenn/user/[username]/route.ts`（新規）
- `src/app/api/zenn/keyword/route.ts`（新規）

## 参照

- phase2-requirements.md セクション 8.2（Zenn API）
- phase2-requirements.md セクション 12.3（Zenn 内部API仕様）

## 注意事項

- Zenn APIは非公式のため、予告なく仕様変更される可能性がある
- レスポンス構造が変わった場合のフォールバック処理を実装すること

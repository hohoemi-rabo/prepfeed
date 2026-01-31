# 046: Google Sheetsエクスポート（オプション）

## 概要

Google OAuth 2.0 連携と、収集データの Google Sheets へのエクスポート機能を実装する。これはオプション機能であり、ユーザーが明示的にエクスポートを実行した時のみ動作する。

## 背景

v2仕様により、データの主な蓄積先は Supabase の collected_data テーブルに変更された。Google Sheets は「エクスポート先」としてオプション提供する。

## 要件

### Google OAuth連携（エクスポート用）

#### 必要スコープ

```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.file
```

#### 環境変数

- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REDIRECT_URI`

#### Google連携APIルート

| エンドポイント           | メソッド | 説明              |
| ------------------------ | -------- | ----------------- |
| `/api/google/auth`       | GET      | OAuth認証開始     |
| `/api/google/callback`   | GET      | OAuthコールバック |
| `/api/google/disconnect` | POST     | 連携解除          |

- [ ] `/api/google/auth` — Google OAuth同意画面へリダイレクト + CSRF state
- [ ] `/api/google/callback` — コード交換 → トークン取得 → 暗号化保存
- [ ] `/api/google/disconnect` — トークン無効化 + DB削除

### トークン管理（`lib/google-auth.ts`）

- [ ] `getAccessToken(userId)` — リフレッシュトークンからアクセストークン取得
- [ ] `encryptToken(token)` / `decryptToken(encrypted)` — 暗号化
- [ ] `revokeToken(token)` — トークン無効化

### エクスポートAPIルート

| エンドポイント       | メソッド | 説明                        |
| -------------------- | -------- | --------------------------- |
| `/api/export/sheets` | POST     | Google Sheetsへエクスポート |
| `/api/export/csv`    | GET      | CSVダウンロード             |

#### `POST /api/export/sheets`

- [ ] リクエストボディ:
  ```typescript
  {
    setting_ids?: string[]  // 未指定なら全データ
    date_from?: string      // 期間指定（開始）
    date_to?: string        // 期間指定（終了）
  }
  ```
- [ ] collected_data からデータ取得
- [ ] 新規スプレッドシート作成 or 既存に追記
- [ ] 3シート（YouTube / Qiita / Zenn）に分けて書き出し
- [ ] スプレッドシートURLを返却

#### `GET /api/export/csv`

- [ ] 同様のフィルタリングオプション
- [ ] CSVファイルをレスポンス

### Google Sheets クライアント（`lib/google-sheets.ts`）

- [ ] `googleapis` パッケージ使用
- [ ] スプレッドシート作成 / シート追加 / ヘッダー設定 / データ書き込み

### シート列定義

#### YouTube シート

| 列 | カラム | 内容 |
|---|---|---|
| A | ID | 動画ID |
| B | Title | タイトル |
| C | URL | 動画URL |
| D | PublishedAt | 投稿日 |
| E | ChannelName | チャンネル名 |
| F | Views | 再生数 |
| G | Likes | いいね数 |
| H | Comments | コメント数 |
| I | Tags | タグ |
| J | GrowthRate | 伸び率 |
| K | Keyword | 取得キーワード |
| L | CollectedAt | 収集日時 |

#### Qiita シート

| 列 | カラム | 内容 |
|---|---|---|
| A | ID | 記事ID |
| B | Title | タイトル |
| C | URL | 記事URL |
| D | PublishedAt | 投稿日 |
| E | AuthorName | 著者名 |
| F | Likes | いいね数 |
| G | Stocks | ストック数 |
| H | Tags | タグ |
| I | GrowthRate | 伸び率 |
| J | Keyword | 取得キーワード |
| K | CollectedAt | 収集日時 |

#### Zenn シート

| 列 | カラム | 内容 |
|---|---|---|
| A | ID | 記事ID |
| B | Title | タイトル |
| C | URL | 記事URL |
| D | PublishedAt | 投稿日 |
| E | AuthorName | 著者名 |
| F | Likes | いいね数 |
| G | GrowthRate | 伸び率 |
| H | Keyword | 取得キーワード |
| I | CollectedAt | 収集日時 |

### エクスポートUI（`/dashboard/export`）

- [ ] Google Sheets連携状態の表示
  - 未連携:「Googleドライブ連携」ボタン
  - 連携済み:「連携解除」ボタン
- [ ] エクスポート対象選択
  - 全データ / 特定監視設定 / 期間指定
- [ ] 「Sheetsにエクスポート」ボタン
- [ ] CSVダウンロードボタン
- [ ] エクスポート完了後にスプレッドシートURLを表示

## 受け入れ条件

- [ ] 「Googleドライブ連携」でOAuth同意画面が表示される
- [ ] 連携後にトークンが暗号化保存される
- [ ] 「Sheetsにエクスポート」でデータが書き出される
- [ ] CSVダウンロードが動作する
- [ ] エクスポート対象のフィルタリングが機能する
- [ ] 連携解除でトークンが削除される
- [ ] 未連携でエクスポートボタンが無効化される

## 依存関係

- 028（Supabase DB — profiles テーブルの google_refresh_token）
- 029（Supabase Auth — ログイン済み前提）
- 038（監視設定API — collected_data にデータが存在すること）

## 関連ファイル

- `src/lib/google-auth.ts`（新規）
- `src/lib/google-sheets.ts`（新規）
- `src/lib/sheet-formatters.ts`（新規）
- `src/app/api/google/auth/route.ts`（新規）
- `src/app/api/google/callback/route.ts`（新規）
- `src/app/api/google/disconnect/route.ts`（新規）
- `src/app/api/export/sheets/route.ts`（新規）
- `src/app/api/export/csv/route.ts`（新規）

## 参照

- phase2_v2-requirements.md セクション 11（Google Sheets エクスポート）

# 037: Google OAuth連携（Sheets API用）

## 概要

Google OAuth 2.0 を利用して、ユーザーの Google Drive / Sheets へのアクセス権限を取得し、スプレッドシートの自動作成を行う。

## 背景

有料機能の中核であるデータ蓄積には、ユーザーの Google Sheets へのアクセスが必要。Supabase Auth のGoogle ログインとは別に、Sheets API用のOAuth連携を実装する。

## 要件

### OAuth スコープ

```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.file
```

### 環境変数

- [ ] `GOOGLE_CLIENT_ID` — Google OAuth クライアントID
- [ ] `GOOGLE_CLIENT_SECRET` — Google OAuth クライアントシークレット
- [ ] `GOOGLE_REDIRECT_URI` — コールバックURL

### API ルート

#### `/api/google/auth` (GET)

- [ ] Google OAuth 同意画面へリダイレクト
- [ ] 必要なスコープをリクエスト
- [ ] state パラメータでCSRF対策

#### `/api/google/callback` (GET)

- [ ] 認可コードを受け取り、トークンを取得
- [ ] アクセストークン + リフレッシュトークンを取得
- [ ] リフレッシュトークンを暗号化して profiles テーブルに保存
- [ ] ダッシュボードにリダイレクト

#### `/api/google/disconnect` (POST)

- [ ] リフレッシュトークンを無効化（Google API呼び出し）
- [ ] profiles テーブルからトークン・スプレッドシートIDを削除

### スプレッドシート自動作成

- [ ] 連携完了時に「PrepFeed_データ」スプレッドシートを自動作成
- [ ] 3シート作成: YouTube / Qiita / Zenn
- [ ] 各シートにヘッダー行を設定
- [ ] スプレッドシートIDを profiles テーブルに保存

### トークン管理ユーティリティ（`lib/google-auth.ts`）

- [ ] `getAccessToken(userId)` — リフレッシュトークンからアクセストークンを取得
- [ ] `encryptToken(token)` / `decryptToken(encrypted)` — トークン暗号化
- [ ] `revokeToken(token)` — トークン無効化

## 受け入れ条件

- [ ] 「Googleドライブ連携」ボタンでGoogle OAuth同意画面が表示される
- [ ] 許可後にリフレッシュトークンがDBに保存される
- [ ] 「PrepFeed_データ」スプレッドシートがユーザーのドライブに作成される
- [ ] スプレッドシートに3つのシート（YouTube / Qiita / Zenn）が存在する
- [ ] 各シートにヘッダー行が設定されている
- [ ] 連携解除でトークンとスプレッドシートIDが削除される
- [ ] トークンが暗号化されてDBに保存されている

## 依存関係

- 028（Supabase DB セットアップ — profiles テーブル）
- 029（Supabase Auth — ログイン済みが前提）

## 関連ファイル

- `src/lib/google-auth.ts`（新規）
- `src/lib/google-sheets.ts`（新規）
- `src/app/api/google/auth/route.ts`（新規）
- `src/app/api/google/callback/route.ts`（新規）
- `src/app/api/google/disconnect/route.ts`（新規）

## 参照

- phase2-requirements.md セクション 6（Google OAuth連携）
- phase2-requirements.md セクション 10（Google Sheets設計）

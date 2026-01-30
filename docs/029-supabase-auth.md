# 029: Supabase Auth 認証実装

## 概要

Supabase Auth を使用した Google OAuth ログイン機能を実装する。セッション管理、ミドルウェアによる保護ルート、Supabase クライアントの初期化を含む。

## 背景

有料機能（監視設定・バッチ処理・Google Sheets連携）にはユーザー認証が必要。Supabase Auth + Google OAuth で実装する。

## 要件

### Supabase クライアント設定

- [ ] `@supabase/supabase-js` パッケージインストール
- [ ] `@supabase/ssr` パッケージインストール
- [ ] ブラウザ用クライアント作成（`lib/supabase/client.ts`）
- [ ] サーバー用クライアント作成（`lib/supabase/server.ts`）
- [ ] ミドルウェア用クライアント作成（`lib/supabase/middleware.ts`）

### 環境変数

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 設定
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 設定
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 設定（サーバーサイドのみ）

### 認証フロー

- [ ] Google OAuth プロバイダー設定（Supabase ダッシュボード）
- [ ] サインイン処理（`signInWithOAuth`）
- [ ] サインアウト処理（`signOut`）
- [ ] セッション確認（`getSession` / `getUser`）

### ミドルウェア

- [ ] `middleware.ts` でセッションリフレッシュ
- [ ] 保護ルートの定義（`/dashboard/*`）
- [ ] 未認証時のリダイレクト（→ `/auth/login`）
- [ ] 認証済みでログインページアクセス時のリダイレクト（→ `/dashboard`）

### コールバック処理

- [ ] `/auth/callback` ルートハンドラー
- [ ] OAuth コード交換処理
- [ ] 認証後のリダイレクト先制御

## 受け入れ条件

- [ ] 「Googleでログイン」ボタンでGoogle OAuth画面が表示される
- [ ] ログイン後にprofilesテーブルにレコードが作成される
- [ ] ログイン状態がページリロード後も維持される
- [ ] `/dashboard` に未認証でアクセスすると `/auth/login` にリダイレクトされる
- [ ] ログアウトするとセッションが破棄される
- [ ] `npm run build` が成功する

## 依存関係

- 028（Supabase DB セットアップ）

## 関連ファイル

- `src/lib/supabase/client.ts`（新規）
- `src/lib/supabase/server.ts`（新規）
- `src/lib/supabase/middleware.ts`（新規）
- `src/middleware.ts`（新規）
- `src/app/auth/callback/route.ts`（新規）

## 参照

- phase2-requirements.md セクション 5（認証・セキュリティ設計）

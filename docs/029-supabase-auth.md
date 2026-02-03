# 029: Supabase Auth 認証実装

## 概要

Supabase Auth を使用した Google OAuth ログイン機能を実装する。セッション管理、ミドルウェアによる保護ルート、Supabase クライアントの初期化を含む。

## 背景

有料機能（監視設定・バッチ処理・Google Sheets連携）にはユーザー認証が必要。Supabase Auth + Google OAuth で実装する。

## 要件

### Supabase クライアント設定

- [x] `@supabase/supabase-js` パッケージインストール（#028で完了）
- [x] `@supabase/ssr` パッケージインストール（#028で完了）
- [x] ブラウザ用クライアント作成（`lib/supabase/client.ts`）（#028で完了）
- [x] サーバー用クライアント作成（`lib/supabase/server.ts`）（#028で完了）
- [x] ミドルウェアでのセッション管理（`src/middleware.ts`に統合）

### 環境変数

- [x] `NEXT_PUBLIC_SUPABASE_URL` 設定（#028で完了）
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 設定（#028で完了）
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 設定（サーバーサイドのみ — 必要時に追加）

### 認証フロー

- [ ] Google OAuth プロバイダー設定（Supabase ダッシュボード — 手動設定が必要）
- [x] サインイン処理（`signInWithOAuth`）— `/auth/login` ページ
- [x] サインアウト処理（`signOut`）— Server Action
- [x] セッション確認（`getUser`）— layout.tsx + middleware

### ミドルウェア

- [x] `middleware.ts` でセッションリフレッシュ
- [x] 保護ルートの定義（`/dashboard/*`）
- [x] 未認証時のリダイレクト（→ `/auth/login`）
- [x] 認証済みでログインページアクセス時のリダイレクト（→ `/dashboard`）

### コールバック処理

- [x] `/auth/callback` ルートハンドラー
- [x] OAuth コード交換処理
- [x] 認証後のリダイレクト先制御

### UI

- [x] Header にログインボタン / ユーザーメニュー表示
- [x] UserMenu コンポーネント（アバター、ダッシュボードリンク、ログアウト）
- [x] モバイル対応

## 受け入れ条件

- [x] 「Googleでログイン」ボタンでGoogle OAuth画面が表示される（※Google OAuth設定後）
- [x] ログイン後にprofilesテーブルにレコードが作成される（trigger設定済み）
- [x] ログイン状態がページリロード後も維持される（middleware + SSR cookie）
- [x] `/dashboard` に未認証でアクセスすると `/auth/login` にリダイレクトされる
- [x] ログアウトするとセッションが破棄される
- [x] `npm run build` が成功する

## 残作業

- Google Cloud Console で OAuth 2.0 クライアントID を作成し、Supabase ダッシュボードの Authentication > Providers > Google に設定する
- `SUPABASE_SERVICE_ROLE_KEY` は必要時（サーバーサイド管理操作）に追加

## 依存関係

- 028（Supabase DB セットアップ）

## 関連ファイル

- `src/lib/supabase/client.ts`（#028で作成）
- `src/lib/supabase/server.ts`（#028で作成）
- `src/middleware.ts`（#028で作成、#029で保護ルート追加）
- `src/app/auth/callback/route.ts`（新規）
- `src/app/auth/login/page.tsx`（新規）
- `src/app/auth/actions.ts`（新規）
- `src/app/dashboard/page.tsx`（プレースホルダー）
- `src/components/UserMenu.tsx`（新規）
- `src/components/Header.tsx`（更新 — 認証UI追加）
- `src/app/layout.tsx`（更新 — ユーザー情報取得）
- `next.config.ts`（更新 — Google avatar remote pattern追加）

## 参照

- phase2_v2-requirements.md セクション 5（認証・セキュリティ設計）

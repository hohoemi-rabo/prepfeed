# 022: キーワード検索ページUI実装

## 概要
キーワード検索結果を表示する専用ページ `/keyword/[query]` を実装する。既存のVideoCard、SortTabs、VideoListコンポーネントを再利用し、統一感のあるUIを提供する。

## 要件
- URL: `/keyword/[query]`
- 既存コンポーネントの最大限の再利用
- レスポンシブデザイン対応
- ソート機能の統合
- ローディング・エラー状態の適切な表示

## Todo
- [x] ページファイル作成
  - [x] `/src/app/keyword/[query]/page.tsx`作成
  - [x] Client Componentとして実装（'use client'）
  - [x] 動的ルートパラメータの取得
- [x] データ取得ロジック
  - [x] useEffect でAPI呼び出し
  - [x] `/api/youtube/keyword?q={query}`からデータ取得
  - [x] ローディング状態管理（useState）
  - [x] エラー状態管理（useState）
  - [x] 取得した動画データの状態管理
- [x] 検索結果ヘッダー
  - [x] 検索キーワード表示コンポーネント
  - [x] 検索結果件数表示（「50件の動画を表示」）
  - [x] 戻るボタン（ホームに戻る）
  - [x] SearchBarコンポーネント配置（新しい検索）
- [x] 既存コンポーネント統合
  - [x] SortTabsコンポーネントの配置
  - [x] VideoListコンポーネントの使用
  - [x] VideoCardコンポーネントの表示確認
- [x] ローディングUI
  - [x] スピナーアニメーション実装
  - [x] 「{query}を検索中...」メッセージ表示
- [x] エラーUI
  - [x] エラーメッセージ表示
  - [x] 再試行ボタン
  - [x] ホームに戻るボタン
- [x] 空の検索結果UI
  - [x] 「該当する動画が見つかりません」表示
  - [x] 別のキーワードで検索を促すメッセージ
- [x] ページタイトル設定
  - [x] useEffectでdocument.title更新
- [x] レスポンシブ対応
  - [x] Tailwind CSSクラスでレスポンシブ実装
  - [x] container-customクラス使用
- [x] テスト
  - [x] 検索結果の正常表示確認（/keyword/tutorial で200 OK）
  - [x] ページコンパイル確認
  - [x] ビルド成功確認

## 備考
- Phase: 5 (キーワード検索機能追加)
- 優先度: 高
- 依存関係: 021-keyword-search-api.md
- 所要時間: 2日
- 再利用コンポーネント: VideoCard, VideoList, SortTabs

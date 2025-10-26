# 021: キーワード検索API実装

## 概要
YouTube Data API v3を使用してキーワードから動画を検索し、詳細情報（タグ含む）を取得するAPI Routeを実装する。

## 要件
- YouTube search.list APIで50件の動画を取得
- videos.list APIで統計情報・タグを取得
- 30分間のキャッシュ実装
- 既存のエラーハンドリング・レート制限機構との統合
- API クォータ: 150 units/回

## Todo
- [ ] API Route作成
  - [ ] `/api/youtube/keyword/route.ts`ファイル作成
  - [ ] GETリクエストハンドラー実装
  - [ ] クエリパラメータ検証（q: 検索キーワード）
- [ ] YouTube API統合
  - [ ] search.list API呼び出し実装
    - type=video
    - maxResults=50
    - order=viewCount（再生数順）
  - [ ] videos.list API呼び出し実装
    - part=snippet,statistics,contentDetails
    - タグ情報取得（snippet.tags）
  - [ ] APIレスポンスのデータ変換
- [ ] データ処理
  - [ ] 動画情報の統合（search結果 + videos詳細）
  - [ ] analytics.tsを使った分析指標の計算
  - [ ] タグ情報の抽出・整形
  - [ ] YouTubeVideo型への変換
- [ ] キャッシュ実装
  - [ ] キャッシュキー生成: `channel-scope:keyword-search:{query}`
  - [ ] getCachedData()ラッパー使用
  - [ ] TTL: 30分
- [ ] エラーハンドリング
  - [ ] 検索キーワード未指定エラー
  - [ ] YouTube APIエラー処理
  - [ ] classifyError()による分類
  - [ ] 適切なHTTPステータスコード返却
- [ ] レート制限
  - [ ] 既存のrate-limiter統合
  - [ ] クォータ使用量の確認
- [ ] テスト
  - [ ] 正常系テスト（検索成功）
  - [ ] エラー系テスト（無効なキーワード）
  - [ ] キャッシュ動作確認

## 備考
- Phase: 5 (キーワード検索機能追加)
- 優先度: 高
- 依存関係: 020-project-rename.md
- 所要時間: 2日
- API クォータコスト: 150 units/回（search: 100 + videos: 50）

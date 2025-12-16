# 026: Zustand Store + LocalStorage ユーティリティ実装

## 概要
保存機能の基盤となるZustand Storeと、LocalStorageの読み書きを行うユーティリティを実装する。

## 要件
- LocalStorageへの永続化機能
- 上限管理（チャンネル30件、動画50件、キーワード20件）
- エラー耐性（LocalStorage破損時も動作継続）

## Todo
- [ ] 型定義作成
  - [ ] SavedChannel インターフェース
  - [ ] SavedVideo インターフェース
  - [ ] SavedKeyword インターフェース
  - [ ] SavedState インターフェース
  - [ ] SavedActions インターフェース
- [ ] LocalStorage ユーティリティ作成 (`lib/storage.ts`)
  - [ ] LocalStorageキー定義
    - `ys_saved_channels`
    - `ys_saved_videos`
    - `ys_saved_keywords`
  - [ ] 読み取り関数（JSON パース、エラーハンドリング）
  - [ ] 書き込み関数（JSON シリアライズ、エラーハンドリング）
  - [ ] 不正データ時の初期化処理
- [ ] Zustand Store作成 (`stores/savedStore.ts`)
  - [ ] State定義（channels, videos, keywords）
  - [ ] チャンネル操作
    - [ ] saveChannel()
    - [ ] removeChannel()
    - [ ] isSavedChannel()
  - [ ] 動画操作
    - [ ] saveVideo()
    - [ ] removeVideo()
    - [ ] isSavedVideo()
  - [ ] キーワード操作
    - [ ] saveKeyword()
    - [ ] removeKeyword()
    - [ ] isSavedKeyword()
  - [ ] 永続化
    - [ ] hydrate() - LocalStorageから復元
    - [ ] persist() - LocalStorageへ保存
- [ ] 上限管理ロジック
  - [ ] MAX_CHANNELS = 30
  - [ ] MAX_VIDEOS = 50
  - [ ] MAX_KEYWORDS = 20
  - [ ] 上限到達時の古いデータ削除処理

## 技術仕様

### LocalStorageキー
| キー名 | 内容 |
|--------|------|
| `ys_saved_channels` | SavedChannel[] |
| `ys_saved_videos` | SavedVideo[] |
| `ys_saved_keywords` | SavedKeyword[] |

### 型定義
```typescript
interface SavedChannel {
  channelId: string;
  name: string;
  thumbnailUrl: string;
  subscriberCount: number;
  savedAt: string; // ISO 8601形式
}

interface SavedVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  viewCount: number;
  publishedAt: string;
  savedAt: string;
}

interface SavedKeyword {
  keyword: string;
  savedAt: string;
}
```

## 備考
- Phase: 2 (保存機能)
- 優先度: 高
- 依存関係: なし（Phase2の最初のチケット）
- 参照: phase2-requirements.md

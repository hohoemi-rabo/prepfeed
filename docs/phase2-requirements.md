# YouTubeScope Phase2 要件定義書：保存機能

## 1. 概要

### 1-1. 目的

参照頻度の高い対象（チャンネル・動画・キーワード）を保存し、再アクセスを簡単にする。

### 1-2. 背景

Phase1 で「チャンネル分析」「キーワード検索」により現状把握（観測）が可能になった。Phase2 では継続利用を促進するため、まず保存機能を実装する。

### 1-3. 技術方針

- **ストレージ**: LocalStorage（データベース不要）
- **状態管理**: Zustand
- **クラウド同期**: Phase2 では実装しない（将来 Phase3 以降で対応予定）

---

## 2. 機能要件

### 2-1. 保存対象

| 対象       | 保存上限 | 上限到達時           |
| ---------- | -------- | -------------------- |
| チャンネル | 30 件    | 古いものから自動削除 |
| 動画       | 50 件    | 古いものから自動削除 |
| キーワード | 20 件    | 古いものから自動削除 |

### 2-2. 保存データ項目

#### チャンネル

```typescript
interface SavedChannel {
  channelId: string;
  name: string;
  thumbnailUrl: string;
  subscriberCount: number;
  savedAt: string; // ISO 8601形式
}
```

#### 動画

```typescript
interface SavedVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  viewCount: number;
  publishedAt: string; // ISO 8601形式
  savedAt: string; // ISO 8601形式
}
```

#### キーワード

```typescript
interface SavedKeyword {
  keyword: string;
  savedAt: string; // ISO 8601形式
}
```

### 2-3. LocalStorage キー

| キー名              | 内容           |
| ------------------- | -------------- |
| `ys_saved_channels` | SavedChannel[] |
| `ys_saved_videos`   | SavedVideo[]   |
| `ys_saved_keywords` | SavedKeyword[] |

---

## 3. 画面・UI 仕様

### 3-1. 保存ボタン配置

| 配置場所                                | 対象       | 表示                            |
| --------------------------------------- | ---------- | ------------------------------- |
| チャンネル詳細ページ `/channel/[id]`    | チャンネル | チャンネル名付近に「⭐ 保存」   |
| キーワード結果ページ `/keyword/[query]` | キーワード | 検索キーワード付近に「⭐ 保存」 |
| 動画カード                              | 動画       | カード右上に「⭐」アイコン      |

#### 表示状態

- **未保存**: ⭐（線のみ / 白抜き）+ 「保存」
- **保存済み**: ★（塗りつぶし）+ 「保存済み」

### 3-2. 保存一覧ページ `/saved`

#### URL

```
GET /saved
```

#### レイアウト

- タブで「チャンネル / 動画 / キーワード」を切替
- **デフォルトタブ**: チャンネル

#### タブ内表示

- 各保存アイテムをカード形式で表示
- 各カードに「×」ボタン（削除用）
- 保存件数を表示

#### 空状態

- 「保存したチャンネルはありません」等のメッセージ表示
- 保存方法の簡単な説明（任意）

---

## 4. 画面遷移

```
/channel/[id]
  └─ ⭐保存/解除 → LocalStorageに反映
  └─ /saved で確認可能

/keyword/[query]
  └─ ⭐保存/解除 → LocalStorageに反映
  └─ /saved で確認可能

動画カード（どのページでも）
  └─ ⭐保存/解除 → LocalStorageに反映
  └─ /saved で確認可能

/saved
  └─ タブ切替（チャンネル/動画/キーワード）
  └─ ×ボタンで削除（即時反映・確認ダイアログなし）
  └─ カードクリックで詳細ページへ遷移
```

---

## 5. Zustand Store 設計

### 5-1. State

```typescript
interface SavedState {
  channels: SavedChannel[];
  videos: SavedVideo[];
  keywords: SavedKeyword[];
}
```

### 5-2. Actions

```typescript
interface SavedActions {
  // チャンネル
  saveChannel: (channel: Omit<SavedChannel, 'savedAt'>) => void;
  removeChannel: (channelId: string) => void;
  isSavedChannel: (channelId: string) => boolean;

  // 動画
  saveVideo: (video: Omit<SavedVideo, 'savedAt'>) => void;
  removeVideo: (videoId: string) => void;
  isSavedVideo: (videoId: string) => boolean;

  // キーワード
  saveKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  isSavedKeyword: (keyword: string) => boolean;

  // 初期化・永続化
  hydrate: () => void; // LocalStorageから復元
  persist: () => void; // LocalStorageへ保存
}
```

### 5-3. 上限管理ロジック

```typescript
// 保存時に上限チェック
const MAX_CHANNELS = 30;
const MAX_VIDEOS = 50;
const MAX_KEYWORDS = 20;

// 上限到達時は最も古いもの（savedAtが最古）を削除してから追加
```

---

## 6. 振る舞い仕様

### 6-1. 保存操作

- ⭐ 押下で保存/解除が**即時反映**
- 重複保存はしない（同一 ID は無視）
- 保存時に`savedAt`を自動付与

### 6-2. 上限到達時

- 新規保存時に上限チェック
- 上限に達している場合、`savedAt`が最も古いアイテムを削除
- その後、新規アイテムを追加

### 6-3. LocalStorage 復元

- アプリ起動時に`hydrate()`を実行
- LocalStorage が破損/読み取り不可の場合は初期化して継続（アプリを落とさない）

### 6-4. 削除操作

- 「×」ボタン押下で**即時削除**（確認ダイアログなし）
- 削除後、LocalStorage に即時反映

---

## 7. エラーハンドリング

| ケース                    | 対応                                      |
| ------------------------- | ----------------------------------------- |
| LocalStorage 読み取り失敗 | 初期状態（空配列）で継続                  |
| LocalStorage 書き込み失敗 | コンソールにエラーログ、UI は正常動作継続 |
| 不正な JSON               | 初期状態にリセット                        |
| 容量オーバー              | 古いデータから削除して再試行              |

---

## 8. 受け入れ条件（テスト観点）

### 8-1. 保存機能

- [ ] チャンネル詳細ページで ⭐ を押すと保存される
- [ ] キーワード結果ページで ⭐ を押すと保存される
- [ ] 動画カードの ⭐ を押すと保存される
- [ ] 保存済みの ⭐ を押すと解除される
- [ ] 保存/解除が即時反映される

### 8-2. 永続化

- [ ] ページリロード後も保存状態が維持される
- [ ] ブラウザを閉じて再度開いても保存が残る
- [ ] 異なるページから保存しても `/saved` に反映される

### 8-3. 保存一覧ページ

- [ ] `/saved` でチャンネル/動画/キーワードがタブで切替できる
- [ ] デフォルトでチャンネルタブが表示される
- [ ] 各カードに保存した情報が正しく表示される
- [ ] × ボタンで即時削除できる
- [ ] 空状態で適切なメッセージが表示される

### 8-4. 上限管理

- [ ] チャンネル 31 件目を保存すると最古の 1 件が削除される
- [ ] 動画 51 件目を保存すると最古の 1 件が削除される
- [ ] キーワード 21 件目を保存すると最古の 1 件が削除される

### 8-5. エラー耐性

- [ ] LocalStorage が壊れていてもアプリが落ちない
- [ ] 不正なデータがあっても初期化して継続できる

---

## 9. 実装対象ファイル（想定）

```
src/
├── stores/
│   └── savedStore.ts          # Zustand store
├── hooks/
│   └── useSaved.ts            # カスタムフック（任意）
├── components/
│   ├── SaveButton.tsx         # 保存ボタンコンポーネント
│   └── saved/
│       ├── SavedChannelCard.tsx
│       ├── SavedVideoCard.tsx
│       └── SavedKeywordCard.tsx
├── app/
│   └── saved/
│       └── page.tsx           # 保存一覧ページ
└── lib/
    └── storage.ts             # LocalStorage操作ユーティリティ
```

---

## 10. 非対象（Phase2 保存機能では実装しない）

- ログイン機能
- クラウド同期
- 検索履歴の自動保存
- 保存データのエクスポート/インポート
- 保存フォルダ/タグ分類

---

## 11. 注意事項

### LocalStorage の制限

- ブラウザを変えると保存データは引き継がれない
- 端末を変えても同様
- ブラウザのデータをクリアすると消える

→ 将来 Phase3 以降でログイン機能＋クラウド同期により解決予定

---

## 12. 参照

- Phase1 基盤機能: `/channel/[id]`, `/keyword/[query]` の UI・API 構成
- 既存テーマ: 赤（チャンネル）/ 青（キーワード）を踏襲
- 既存エラーハンドリング方針を維持

# 042: Google Sheets統合 & Upsertロジック

## 概要

Google Sheets API を使用して、取得データをスプレッドシートに書き込む機能を実装する。既存データとの差分更新（Upsert）を行う。

## 背景

PrepFeed のデータ蓄積先は Google Sheets。バッチ処理や初回取得で得たデータを、ユーザーのスプレッドシートに Upsert 方式で書き込む。

## 要件

### Google Sheets クライアント（`lib/google-sheets.ts`）

- [ ] `googleapis` パッケージ使用
- [ ] OAuth トークンによる認証
- [ ] スプレッドシート操作のラッパー関数群

### シート列定義

#### YouTube シート

| 列 | カラム | 更新対象 |
|---|---|---|
| A | ID（動画ID） | × |
| B | Title | × |
| C | URL | × |
| D | PublishedAt | × |
| E | ChannelId | × |
| F | ChannelName | × |
| G | Views | ○ |
| H | Likes | ○ |
| I | Comments | ○ |
| J | Duration | × |
| K | Tags | × |
| L | GrowthRate | ○ |
| M | LikeRate | ○ |
| N | CommentRate | ○ |
| O | Keyword | × |
| P | MonitorType | × |
| Q | LastUpdated | ○ |

#### Qiita シート

| 列 | カラム | 更新対象 |
|---|---|---|
| A | ID（記事ID） | × |
| B | Title | × |
| C | URL | × |
| D | PublishedAt | × |
| E | AuthorId | × |
| F | AuthorName | × |
| G | Likes | ○ |
| H | Stocks | ○ |
| I | Tags | × |
| J | GrowthRate | ○ |
| K | Keyword | × |
| L | MonitorType | × |
| M | LastUpdated | ○ |

#### Zenn シート

| 列 | カラム | 更新対象 |
|---|---|---|
| A | ID（記事ID） | × |
| B | Title | × |
| C | URL | × |
| D | PublishedAt | × |
| E | AuthorUsername | × |
| F | AuthorName | × |
| G | Likes | ○ |
| H | GrowthRate | ○ |
| I | Keyword | × |
| J | MonitorType | × |
| K | LastUpdated | ○ |

### Upsert ロジック

```
1. 既存データをシートから全取得
2. IDでMap化
3. 新データごとに:
   - 既存あり → 更新対象カラムのみ上書き
   - 既存なし → 新規行として末尾に追加
4. LastUpdated を現在日時で更新
```

- [ ] `upsertToSheet(sheets, spreadsheetId, sheetName, data, idColumn)` 関数
- [ ] `getSheetData(sheets, spreadsheetId, sheetName)` — 全データ取得
- [ ] `updateRow(sheets, spreadsheetId, sheetName, data, rowIndex)` — 行更新
- [ ] `appendRow(sheets, spreadsheetId, sheetName, data)` — 行追加
- [ ] `formatDataForSheet(platform, rawData)` — プラットフォーム別フォーマット

### スプレッドシート作成

- [ ] `createSpreadsheet(accessToken, title)` — 新規スプレッドシート作成
- [ ] `createSheet(spreadsheetId, sheetName)` — シート追加
- [ ] `setHeaderRow(spreadsheetId, sheetName, headers)` — ヘッダー行設定

### エラーハンドリング

- [ ] API レートリミット時のリトライ（指数バックオフ）
- [ ] トークン期限切れ時の自動リフレッシュ
- [ ] シートが存在しない場合の自動作成
- [ ] セル数上限への対応

## 受け入れ条件

- [ ] YouTube データがスプレッドシートに書き込まれる
- [ ] Qiita データがスプレッドシートに書き込まれる
- [ ] Zenn データがスプレッドシートに書き込まれる
- [ ] 既存データの再生数等が更新される（Upsert）
- [ ] 新規データが行追加される
- [ ] ヘッダー行が正しく設定されている
- [ ] LastUpdated が更新されている

## 依存関係

- 037（Google OAuth — トークン取得）

## 関連ファイル

- `src/lib/google-sheets.ts`（新規 or 拡張）
- `src/lib/sheet-formatters.ts`（新規 — プラットフォーム別フォーマット）

## 参照

- phase2-requirements.md セクション 10（Google Sheets設計）
- phase2-requirements.md セクション 9.4（Upsert ロジック）

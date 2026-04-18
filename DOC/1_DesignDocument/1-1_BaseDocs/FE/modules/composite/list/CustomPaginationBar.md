# CustomPaginationBar モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`CustomPaginationBar` は、数値ボタン・先頭/末尾移動・表示件数切替・件数表示を一体化した独自ページネーションバーを提供する。

### 1-2. 適用範囲
- 1ベースのページ番号で扱う一覧画面
- テーブルの上部または下部に配置するページング領域
- MUI 標準 `TablePagination` では表現しにくい番号ボタン付きページネーション

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `PaginationNumberButtons` を内部利用し、ページ番号ボタン群を描画する。
- 前後移動には `IconButtonBase` を利用する。
- 表示件数変更には `DropBox` を利用する。

### 2-2. 統一ルール
- `page` は 1 ベースで扱う。
- 表示件数候補は `10 / 20 / 50 / 100` を標準とする。
- 総件数が 0 の場合は `データなし` を表示する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── composite/
        └── Listview/
            └── CustomPaginationBar.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `count: number` - 総件数
- `page: number` - 現在ページ（1ベース）
- `rowsPerPage: number` - 1ページ表示件数
- `searchParams: SortParams` - 現在の検索・ソート条件
- `onPageChange(page, searchParams)` - ページ変更時処理
- `onRowsPerPageChange(event)` - 表示件数変更時処理

**仕様:**
- `totalPages = Math.ceil(count / rowsPerPage)` で総ページ数を算出する。
- 先頭・前・次・末尾のページ移動ボタンを提供する。
- 表示範囲は `開始件数 - 終了件数 / 全件数` 形式で表示する。
- `DropBox` からは文字列で返るため、内部で数値に変換して親へ通知する。


# MultiListView モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`MultiListView` は、検索条件アコーディオン、上下ページネーション、任意テーブル内容差し込み領域を持つ外部制御型一覧コンテナである。実装上の default export 名は `ControllableListView` である。

### 1-2. 適用範囲
- 複数のテーブル断片を組み合わせる一覧画面
- 親側でページング・ソート状態を保持する画面
- ListView を共通枠のみ再利用したい場面

---

## 2. 設計方針

### 2-1. アーキテクチャ
- 検索条件は `CommonAccordion` で表示する。
- ページネーションは上部・下部に `ListViewPagination` を配置する。
- テーブル中身は `children` と `childrenTop` を介して呼び出し元から受け取る。

### 2-2. 統一ルール
- `page` は 1 ベースで扱う。
- ソート変更時は横スクロール位置を先頭へ戻す。
- 表示件数変更時はページを 1 に戻す。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── composite/
        └── Listview/
            └── MultiListView.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `page: number` - 現在ページ
- `sortParams: SortParams` - ソート条件
- `rowsPerPage: number` - 表示件数
- `onTableStateChange?: (state: TableState) => void` - 状態変更通知
- `rowsPerPageOptions?: number[]` - 表示件数候補
- `rowDataLength?: number` - 行数
- `totalRowCount: number` - 総件数
- `columns?: ColumnDefinition[]` - カラム定義
- `sx?: SxProps<Theme>` - 外側スタイル
- `searchOptions?: SearchDefinition` - 検索条件表示設定
- `children?: React.ReactNode` - テーブル本体
- `childrenTop?: React.ReactNode` - テーブル直前に描画する内容
- `topPaginationHidden?: boolean` - 上部ページネーション表示制御
- `bottomPaginationHidden?: boolean` - 下部ページネーション表示制御

**仕様:**
- 検索条件は未指定でもアコーディオン枠を持つ。
- 総件数は `totalRowCount ?? rowDataLength ?? 0` の優先順で解決する。
- テーブルコンテナは `overflowX: auto` を持ち、横スクロールに対応する。
- `children` に描画責務を委譲するため、行やヘッダーの実装を固定しない。


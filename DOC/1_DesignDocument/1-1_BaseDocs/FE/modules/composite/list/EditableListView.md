# EditableListView モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`EditableListView` は、ヘッダー行・ソート・行表示に特化した軽量一覧コンポーネントである。ページネーション UI は持たず、編集可能な表形式表示や補助メッセージ表示に向く。

### 1-2. 適用範囲
- 編集可能な表形式入力エリア
- ページネーション不要の一覧表示
- `ListView` 系のヘッダー/行レンダリングを再利用したい場面

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `TableHeaderRow` `SortableTableRows` を再利用する。
- カラム幅計算には `computeColumnWidths` を利用する。
- テーブル下部には任意の補助メッセージを表示できる。

### 2-2. 統一ルール
- `sortParams` は親から受け取り、変更時は `onTableStateChange` で通知する。
- テーブルコンテナは縦横スクロールを許可する。
- メッセージは赤系ラベルで表示する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── composite/
        └── Listview/
            └── EditableListView.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `page: number` - 現在ページ
- `sortParams: SortParams` - ソート条件
- `rowsPerPage: number` - 表示件数
- `onTableStateChange?: (state: TableState) => void` - テーブル状態変更通知
- `rowData: RowDefinition[]` - 行データ
- `totalRowCount: number` - 総件数
- `columns: ColumnDefinition[]` - カラム定義
- `sx?: SxProps<Theme>` - 外側スタイル
- `itemPlaTypeMassageText?: string` - 補助メッセージ

**仕様:**
- `computeColumnWidths(columns)` により幅情報を補完する。
- ソート変更時は現在の `page` `rowsPerPage` を維持して親へ通知する。
- ページネーションコンポーネントは描画しない。
- テーブル下部にメッセージラベルを表示する。


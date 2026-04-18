# 📄 Tableモジュール仕様書

## 1. モジュール概要

### 1-1. 目的
本モジュールは、MUIの `Table` 系コンポーネントを基盤モジュールとして再利用できる形で提供し、ページ内での直接的な MUI 利用を避けることを目的とする。テーブルUIの利用箇所を統一し、ヘッダー色やホバーなどの共通スタイルを一括で適用できるようにする。

### 1-2. 適用範囲
- 画面内での表形式表示（一覧・集計・当番表など）
- ページ実装における `Table` / `TableRow` / `TableCell` などの利用

---

## 2. 設計方針

### 2-1. アーキテクチャ
- MUIの `Table` 系コンポーネントを **base モジュールから提供** する。
- `Table` は共通スタイルを付与したラップコンポーネントとし、`TableHead`/`TableRow`/`TableCell` などは再エクスポートで提供する。
- ページや業務コードからは `@/components/base` 経由で利用する。

### 2-2. 統一ルール
- 直接 `@mui/material` を import せず、`Table` モジュールを利用する。
- ヘッダー背景・フォント色・行ホバーなどの共通スタイルは `Table` で一括適用する。
- 画面固有の上書きは `sx` で調整可能とする。

---

## 3. 📂 フォルダ構成とファイルの役割

```plaintext
components/
└── base/
    └── Table/
        └── index.ts     // MUI Table 系コンポーネントの再エクスポート
```

---

## 4. 📌 ファイル詳細

### index.ts

**目的：**
MUI の `Table` 系コンポーネントを base として再利用できるように集約する。

**エクスポート対象:**
- `Table`（共通スタイル適用済み）
- `TableHead`
- `TableBody`
- `TableRow`
- `TableCell`
- `TableContainer`

**コード例:**
```ts
export { default as Table } from "./Table";
export {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
```

---

## 5. 🔍 使用例

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@/components/base";

<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>項目</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>値</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
```

---

## 6. 注意点・補足
- 表の共通スタイル（ヘッダー背景色、行ホバー等）が必要になった場合は、本モジュールの拡張として対応する。
- 直接 MUI を参照するのは原則禁止とし、例外が必要な場合は理由を明記する。

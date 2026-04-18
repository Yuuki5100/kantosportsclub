# ListView カラム幅制御（現行実装）

## 概要
`ListView` のカラム幅は、`ColumnDefinition.widthPercent`（数値%）を基に計算され、
`computedWidth`（文字列"xx%"）としてヘッダーとセルに適用されます。
未指定カラムがある場合は、残り幅を等分して割り当てます。

## 対象コンポーネント
- `ListView.tsx`
- `TableHeaderRow.tsx`
- `SortableTableRows.tsx`
- `utils/columnWidthUtils.ts`

## 仕様
### 1. カラム定義
`ColumnDefinition` に `widthPercent?: number` を指定できます。

```ts
export type ColumnDefinition = {
  id: string | number;
  label: ReactNode;
  display: boolean;
  sortable: boolean;
  align?: 'left' | 'center' | 'right';
  sortKey?: string;
  widthPercent?: number;
};
```

### 2. 幅計算ロジック
`computeColumnWidths` が以下を行います。
- `widthPercent` 指定カラムの合計を算出
- 残り幅 = `100 - 合計` を未指定カラムに等分配
- 各カラムに `computedWidth: "xx%"` を付与
- 合計が `100` を超える場合は `console.warn` を出力（正規化はしない）

```ts
const computedColumns = computeColumnWidths(columns);
```

### 3. 適用箇所
- `TableHeaderRow`:
  - `TableCell` の `width` / `maxWidth` に `computedWidth` を適用
- `SortableTableRows`:
  - 各セルの `width` / `maxWidth` に `computedWidth` を適用
- `ListView`:
  - `tableLayout: 'fixed'` を指定して幅を安定化

## 挙動の詳細
| 状況 | 挙動 |
| --- | --- |
| 全カラム未指定 | 全カラムが等分される |
| 一部指定 | 指定分を引いた残りが未指定へ等分配 |
| 合計が100%超 | 警告ログのみ。残り幅が負になる可能性あり |

## 注意点
- `computeColumnWidths` は **全カラム** を対象に計算します。
  - `display: false` のカラムも計算対象になるため、表示対象のみで幅を合わせたい場合は
    呼び出し側で `columns` を調整してください。
- `widthPercent` は **数値**で指定（例: `40`）。`"40%"` のような文字列は不可。

## 関連ファイル
- `FE/spa-next/my-next-app/src/components/composite/Listview/ListView.tsx`
- `FE/spa-next/my-next-app/src/components/composite/Listview/TableHeaderRow.tsx`
- `FE/spa-next/my-next-app/src/components/composite/Listview/SortableTableRows.tsx`
- `FE/spa-next/my-next-app/src/components/composite/Listview/utils/columnWidthUtils.ts`

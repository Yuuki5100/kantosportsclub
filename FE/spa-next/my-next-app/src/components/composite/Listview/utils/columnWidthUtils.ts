// components/composite/listview/utils/columnWidthUtils.ts

import { ColumnDefinition } from '@/components/composite/Listview/ListView';

/**
 * 計算済みのカラム幅（computedWidth: "xx%"）を持つカラム型
 */
export type ColumnWithComputedWidth = ColumnDefinition & {
  computedWidth: string;
};

/**
 * カラム定義から各カラムの幅（%）を計算する
 */
export function computeColumnWidths(columns: ColumnDefinition[]): ColumnWithComputedWidth[] {
  const specified = columns.filter(col => col.widthPercent !== undefined);
  const unspecified = columns.filter(col => col.widthPercent === undefined);

  const totalSpecified = specified.reduce((sum, col) => sum + (col.widthPercent ?? 0), 0);
  const remaining = 100 - totalSpecified;

  if (totalSpecified > 100) {
    console.warn('[computeColumnWidths] widthPercentの合計が100%を超えています。');
  }

  const defaultWidth = unspecified.length > 0 ? remaining / unspecified.length : 0;

  return columns.map(col => ({
    ...col,
    computedWidth: `${col.widthPercent ?? defaultWidth}%`,
  }));
}

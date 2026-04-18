import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Table } from '@mui/material';
import { SortableTableRows } from './SortableTableRows';
import { ColumnDefinition, RowDefinition } from './ListView';
import { computeColumnWidths } from './utils/columnWidthUtils';

/**
 * `SortableTableRows` はデータテーブルの行を表示し、ソート機能を提供するコンポーネントです。
 * このコンポーネントは、Material-UIの `TableBody`、`TableRow`、`TableCell` を使用してカスタマイズされています。
 *
 * ## 特徴
 * - カラム定義に基づく行データの表示
 * - 指定されたカラムによるソート（昇順・降順）
 * - ページネーションに対応
 * - カスタムスタイリングのサポート
 *
 * **注意**: このコンポーネントは親コンポーネントからのソートとページネーションパラメータに依存します。
 */
const meta: Meta<typeof SortableTableRows> = {
  title: 'Common-architecture/ListView/SortableTableRows',
  component: SortableTableRows,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ソート可能なテーブル行コンポーネント。データのソートとページネーション表示を行います。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Table>
        {Story()}
      </Table>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SortableTableRows>;

// サンプルデータの定義
const sampleColumns: ColumnDefinition[] = [
  { id: 'id', label: 'ID', display: true, sortable: true },
  { id: 'name', label: '名前', display: true, sortable: true },
  { id: 'age', label: '年齢', display: true, sortable: true },
  { id: 'email', label: 'メール', display: true, sortable: true },
  { id: 'hidden', label: '非表示', display: false, sortable: false },
];
const computedColumns = computeColumnWidths(sampleColumns);

const generateRows = (count: number): RowDefinition[] => {
  const names = ['田中太郎', '鈴木花子', '佐藤一郎', '山田次郎', '伊藤三郎', '渡辺四郎', '高橋五郎', '中村六郎'];
  const domains = ['example.com', 'sample.co.jp', 'test.jp', 'demo.net'];

  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const name = names[i % names.length];
    const age = 20 + (i % 50);
    const domain = domains[i % domains.length];
    const email = `${name.charAt(0)}${id}@${domain}`;

    return {
      cells: [
        { id: `row${id}-id`, columnId: 'id', cell: id.toString(), value: id },
        { id: `row${id}-name`, columnId: 'name', cell: name, value: name },
        { id: `row${id}-age`, columnId: 'age', cell: age.toString(), value: age },
        { id: `row${id}-email`, columnId: 'email', cell: email, value: email },
        { id: `row${id}-hidden`, columnId: 'hidden', cell: '非表示データ', value: '非表示データ' },
      ],
    };
  });
};

const sampleRows = generateRows(50);

/**
 * デフォルトの表示状態です。50件のデータのうち、最初のページ（10件）が表示されます。
 */
export const Default: Story = {
  args: {
    sortParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
    rowData: sampleRows,
    columnDefinition: computedColumns,
    page: 1,
    rowsPerPage: 10,
  },
};

/**
 * 名前で降順ソートした例です。
 */
export const SortByNameDescending: Story = {
  args: {
    sortParams: {
      sortColumn: 'name',
      sortOrder: 'desc',
    },
    rowData: sampleRows,
    columnDefinition: computedColumns,
    page: 1,
    rowsPerPage: 10,
  },
};

/**
 * 年齢で昇順ソートした例です。
 */
export const SortByAgeAscending: Story = {
  args: {
    sortParams: {
      sortColumn: 'age',
      sortOrder: 'asc',
    },
    rowData: sampleRows,
    columnDefinition: computedColumns,
    page: 1,
    rowsPerPage: 10,
  },
};

/**
 * 2ページ目を表示した例です。
 */
export const SecondPage: Story = {
  args: {
    sortParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
    rowData: sampleRows,
    columnDefinition: computedColumns,
    page: 2,
    rowsPerPage: 10,
  },
};

/**
 * 1ページあたりの表示件数を変更した例です（1ページに20件表示）。
 */
export const TwentyRowsPerPage: Story = {
  args: {
    sortParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
    rowData: sampleRows,
    columnDefinition: computedColumns,
    page: 1,
    rowsPerPage: 20,
  },
};

/**
 * 行にカスタムスタイルを適用した例です。
 */
export const CustomRowStyles: Story = {
  args: {
    sortParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
    rowData: sampleRows.map((row, index) => ({
      ...row,
      rowSx: index % 2 === 0
        ? { backgroundColor: '#f5f5f5' }
        : { backgroundColor: '#ffffff' },
    })),
    columnDefinition: computedColumns,
    page: 1,
    rowsPerPage: 10,
  },
};

/**
 * データがない場合の表示例です。
 */
export const NoData: Story = {
  args: {
    sortParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
    rowData: [],
    columnDefinition: computedColumns,
    page: 1,
    rowsPerPage: 10,
  },
};

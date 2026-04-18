import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Table } from '@mui/material';
import { TableHeaderRow } from './TableHeaderRow';
import { ColumnDefinition } from './ListView';
import { action } from '@storybook/addon-actions';
import { computeColumnWidths } from './utils/columnWidthUtils';

/**
 * `TableHeaderRow` はテーブルのヘッダー行を表示し、ソート機能を提供するコンポーネントです。
 * このコンポーネントは、Material-UIの `TableHead`、`TableRow`、`TableCell`、`TableSortLabel` を使用してカスタマイズされています。
 *
 * ## 特徴
 * - カラム定義に基づくヘッダーの表示
 * - ソート可能なカラムの視覚的表示
 * - ソートの昇順・降順の切り替え
 * - クリックによるソート条件の変更
 *
 * **注意**: このコンポーネントは親コンポーネントがソート状態を管理することを前提としています。
 */
const meta: Meta<typeof TableHeaderRow> = {
  title: 'Common-architecture/ListView/TableHeaderRow',
  component: TableHeaderRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'テーブルヘッダー行コンポーネント。カラム見出しの表示とソート機能を提供します。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [(Story) => <Table>{Story()}</Table>],
};

export default meta;
type Story = StoryObj<typeof TableHeaderRow>;

// サンプルデータの定義
const sampleColumns: ColumnDefinition[] = [
  { id: 'id', label: 'ID', display: true, sortable: true },
  { id: 'name', label: '名前', display: true, sortable: true },
  { id: 'age', label: '年齢', display: true, sortable: true },
  { id: 'email', label: 'メール', display: true, sortable: false },
  { id: 'hidden', label: '非表示', display: false, sortable: true },
];

const handleSortChange = action('handleSortChange');

/**
 * デフォルトの表示状態です。ソートは「ID」カラムの昇順です。
 */
export const Default: Story = {
  args: {
    columns: computeColumnWidths(sampleColumns),
    sortParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
    handleSortChange,
  },
};

/**
 * 「名前」カラムで降順ソートしている状態です。
 */
export const SortByNameDescending: Story = {
  args: {
    columns: computeColumnWidths(sampleColumns),
    sortParams: {
      sortColumn: 'name',
      sortOrder: 'desc',
    },
    handleSortChange,
  },
};

/**
 * ソート機能が無効なカラム（「メール」）を含む例です。
 * メールカラムはクリックしてもソートアイコンが表示されません。
 */
export const WithUnsortableColumn: Story = {
  args: {
    columns: computeColumnWidths(sampleColumns),
    sortParams: {
      sortColumn: 'name',
      sortOrder: 'asc',
    },
    handleSortChange,
  },
};

/**
 * ソートが適用されていない初期状態の例です。
 */
export const NoSorting: Story = {
  args: {
    columns: computeColumnWidths(sampleColumns),
    sortParams: {
      sortColumn: '',
      sortOrder: false,
    },
    handleSortChange,
  },
};

/**
 * カスタムカラム定義を持つ例です。
 */
export const CustomColumns: Story = {
  args: {
    columns: computeColumnWidths([
      { id: 'productId', label: '商品コード', display: true, sortable: true },
      { id: 'productName', label: '商品名', display: true, sortable: true },
      { id: 'price', label: '価格', display: true, sortable: true },
      { id: 'stock', label: '在庫数', display: true, sortable: true },
      { id: 'category', label: 'カテゴリ', display: true, sortable: true },
    ]),
    sortParams: {
      sortColumn: 'price',
      sortOrder: 'desc',
    },
    handleSortChange,
  },
};

/**
 * 日本語以外の言語（英語）でのカラム表示例です。
 */
export const EnglishColumns: Story = {
  args: {
    columns: computeColumnWidths([
      { id: 'id', label: 'ID', display: true, sortable: true },
      { id: 'firstName', label: 'First Name', display: true, sortable: true },
      { id: 'lastName', label: 'Last Name', display: true, sortable: true },
      { id: 'dateOfBirth', label: 'Date of Birth', display: true, sortable: true },
      { id: 'email', label: 'Email', display: true, sortable: false },
    ]),

    sortParams: {
      sortColumn: 'lastName',
      sortOrder: 'asc',
    },
    handleSortChange,
  },
};

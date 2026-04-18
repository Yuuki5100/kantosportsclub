import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { SelectChangeEvent } from '@mui/material';
import ListViewPagination from './ListViewPagination';
import { SortParams } from './SortParams';

/**
 * `ListViewPagination` は、データテーブルのページング機能を提供するコンポーネントです。
 * このコンポーネントは、Material-UIの `TablePagination` を使用してカスタマイズされています。
 *
 * ## 特徴
 * - ページ番号の表示と切り替え
 * - 1ページあたりの表示件数の変更
 * - 最初・最後のページへのジャンプ機能
 * - 日本語対応（ラベルとアクセシビリティテキスト）
 *
 * **注意**: このコンポーネントは1ベースのページネーションを使用しています。
 */
const meta: Meta<typeof ListViewPagination> = {
  title: 'Common-architecture/ListView/ListViewPagination',
  component: ListViewPagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'リストビューのページネーションコンポーネント。ページの切り替えと表示件数の変更機能を提供します。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'number' },
      description: '総アイテム数',
    },
    page: {
      control: { type: 'number' },
      description: '現在のページ番号（1ベース）',
    },
    rowsPerPage: {
      control: { type: 'select', options: [10, 20, 50, 100] },
      description: '1ページあたりの行数',
    },
    onPageChange: {
      action: 'page changed',
      description: 'ページ変更時のコールバック関数',
    },
    searchParams: {
      control: 'object',
      description: 'ソートや検索の条件',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ListViewPagination>;

/**
 * デフォルトの表示状態です。100件のアイテムがあり、現在1ページ目を表示しています。
 */
export const Default: Story = {
  args: {
    count: 100,
    page: 1,
    rowsPerPage: 10,
    searchParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
  },
};

/**
 * 多数のアイテムがある場合の表示例です。10,000件のアイテムがあり、現在5ページ目を表示しています。
 */
export const ManyItems: Story = {
  args: {
    count: 10000,
    page: 5,
    rowsPerPage: 50,
    searchParams: {
      sortColumn: 'name',
      sortOrder: 'desc',
    },
  },
};

/**
 * 表示件数を100件に設定した例です。
 */
export const LargeRowsPerPage: Story = {
  args: {
    count: 500,
    page: 1,
    rowsPerPage: 100,
    searchParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
  },
};

/**
 * 最後のページを表示している例です。
 */
export const LastPage: Story = {
  args: {
    count: 85,
    page: 9, // 10件/ページで9ページ目
    rowsPerPage: 10,
    searchParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
  },
};

/**
 * 表示するデータがない場合の例です。
 */
export const NoData: Story = {
  args: {
    count: 0,
    page: 1,
    rowsPerPage: 10,
    searchParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
  },
};

/**
 * 非表示状態の例です。hiddenプロパティでコンポーネントを非表示にします。
 */
export const Hidden: Story = {
  args: {
    count: 100,
    page: 1,
    rowsPerPage: 10,
    hidden: true,
    searchParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
  },
};

/**
 * インタラクティブなページング操作のデモです。
 * ページの切り替えや表示件数の変更ができます。
 */
const InteractiveComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchParams] = useState<SortParams>({
    sortColumn: 'id',
    sortOrder: 'asc',
  });

  const totalCount = 1000; // 総件数

  const handlePageChange = (page: number, sortParams: SortParams) => {
    setCurrentPage(page);
    console.log(`ページ変更: ${page}`, sortParams);
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    const newRowsPerPage = parseInt(event.target.value.toString(), 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // ページサイズ変更時は1ページ目に戻る
    console.log(`表示件数変更: ${newRowsPerPage}`);
  };

  return (
    <div>
      <h3>インタラクティブなページネーション</h3>
      <p>総件数: {totalCount}件</p>
      <p>現在のページ: {currentPage}</p>
      <p>表示件数: {rowsPerPage}件/ページ</p>
      <ListViewPagination
        count={totalCount}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        searchParams={searchParams}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 初期状態の確認
    await expect(canvas.getByText('1 - 10 件 / 全 1000 件')).toBeVisible();
    await expect(canvas.getByText('現在のページ: 1')).toBeVisible();

    // 次のページボタンをクリック
    const nextButton = canvas.getByLabelText('次のページ');
    await userEvent.click(nextButton);

    // ページが変更されたことを確認
    await expect(canvas.getByText('現在のページ: 2')).toBeVisible();
    await expect(canvas.getByText('11 - 20 件 / 全 1000 件')).toBeVisible();

    // 表示件数を変更
    const rowsPerPageSelect = canvas.getByRole('combobox');
    await userEvent.click(rowsPerPageSelect);

    const option20 = canvas.getByRole('option', { name: '20' });
    await userEvent.click(option20);

    // 表示件数が変更され、1ページ目に戻ることを確認
    await expect(canvas.getByText('表示件数: 20件/ページ')).toBeVisible();
    await expect(canvas.getByText('現在のページ: 1')).toBeVisible();
    await expect(canvas.getByText('1 - 20 件 / 全 1000 件')).toBeVisible();

    // 最後のページボタンをクリック
    const lastButton = canvas.getByLabelText('最後のページ');
    await userEvent.click(lastButton);

    // 最後のページに移動したことを確認（1000件、20件/ページなので50ページ目）
    await expect(canvas.getByText('現在のページ: 50')).toBeVisible();
    await expect(canvas.getByText('981 - 1000 件 / 全 1000 件')).toBeVisible();

    // 最初のページボタンをクリック
    const firstButton = canvas.getByLabelText('最初のページ');
    await userEvent.click(firstButton);

    // 最初のページに戻ったことを確認
    await expect(canvas.getByText('現在のページ: 1')).toBeVisible();
    await expect(canvas.getByText('1 - 20 件 / 全 1000 件')).toBeVisible();
  },
};

/**
 * ページ番号ボタンのクリック操作のデモです。
 */
const PageNumberInteractiveComponent = () => {
  const [currentPage, setCurrentPage] = useState(5);
  const [searchParams] = useState<SortParams>({
    sortColumn: 'name',
    sortOrder: 'desc',
  });

  const handlePageChange = (page: number, sortParams: SortParams) => {
    setCurrentPage(page);
    console.log(`ページ番号クリック: ${page}`, sortParams);
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    console.log(`表示件数変更: ${event.target.value}`);
  };

  return (
    <div>
      <h3>ページ番号ボタンの操作</h3>
      <p>現在のページ: {currentPage}</p>
      <p>ページ番号ボタンをクリックして直接ページを切り替えできます</p>
      <ListViewPagination
        count={500}
        page={currentPage}
        rowsPerPage={20}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        searchParams={searchParams}
      />
    </div>
  );
};

export const PageNumberInteractive: Story = {
  render: PageNumberInteractiveComponent,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 初期状態の確認（5ページ目）
    await expect(canvas.getByText('現在のページ: 5')).toBeVisible();
    await expect(canvas.getByText('81 - 100 件 / 全 500 件')).toBeVisible();

    // ページ番号ボタン「3」をクリック
    const pageButton3 = canvas.getByRole('button', { name: '3' });
    await userEvent.click(pageButton3);

    // 3ページ目に移動したことを確認
    await expect(canvas.getByText('現在のページ: 3')).toBeVisible();
    await expect(canvas.getByText('41 - 60 件 / 全 500 件')).toBeVisible();

    // ページ番号ボタン「7」をクリック
    const pageButton7 = canvas.getByRole('button', { name: '7' });
    await userEvent.click(pageButton7);

    // 7ページ目に移動したことを確認
    await expect(canvas.getByText('現在のページ: 7')).toBeVisible();
    await expect(canvas.getByText('121 - 140 件 / 全 500 件')).toBeVisible();
  },
};

/**
 * レスポンシブデザインのテスト用ストーリーです。
 * 画面サイズが小さい場合の表示を確認できます。
 */
export const ResponsiveDesign: Story = {
  args: {
    count: 1000,
    page: 15,
    rowsPerPage: 25,
    searchParams: {
      sortColumn: 'date',
      sortOrder: 'desc',
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * カスタム表示件数オプションの例です。
 */
const CustomRowsPerPageComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchParams] = useState<SortParams>({
    sortColumn: 'id',
    sortOrder: 'asc',
  });

  const handlePageChange = (page: number, sortParams: SortParams) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    const newRowsPerPage = parseInt(event.target.value.toString(), 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  return (
    <div>
      <h3>カスタム表示件数オプション</h3>
      <p>表示件数の選択肢をカスタマイズした例</p>
      <ListViewPagination
        count={1500}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        searchParams={searchParams}
        rowsPerPageOptions={[25, 50, 75, 100, 200]}
      />
    </div>
  );
};

export const CustomRowsPerPage: Story = {
  render: CustomRowsPerPageComponent,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 初期状態の確認
    await expect(canvas.getByText('1 - 25 件 / 全 1500 件')).toBeVisible();

    // カスタム表示件数オプションを確認
    const rowsPerPageSelect = canvas.getByRole('combobox');
    await userEvent.click(rowsPerPageSelect);

    // カスタムオプションが表示されることを確認
    await expect(canvas.getByRole('option', { name: '25' })).toBeVisible();
    await expect(canvas.getByRole('option', { name: '75' })).toBeVisible();
    await expect(canvas.getByRole('option', { name: '200' })).toBeVisible();

    // 75件を選択
    const option75 = canvas.getByRole('option', { name: '75' });
    await userEvent.click(option75);

    // 表示件数が変更されたことを確認
    await expect(canvas.getByText('1 - 75 件 / 全 1500 件')).toBeVisible();
  },
};

/**
 * エッジケース：1件のデータの場合
 */
export const SingleItem: Story = {
  args: {
    count: 1,
    page: 1,
    rowsPerPage: 10,
    searchParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
  },
};

/**
 * エッジケース：ページ番号が総ページ数と等しい場合
 */
export const ExactLastPage: Story = {
  args: {
    count: 100, // 10件/ページで丁度10ページ
    page: 10,
    rowsPerPage: 10,
    searchParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
  },
};

/**
 * 大量データのパフォーマンステスト用
 */
export const LargeDataset: Story = {
  args: {
    count: 1000000, // 100万件
    page: 50000,
    rowsPerPage: 20,
    searchParams: {
      sortColumn: 'id',
      sortOrder: 'asc',
    },
  },
};

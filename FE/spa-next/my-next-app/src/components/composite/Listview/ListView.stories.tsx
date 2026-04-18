import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Paper, Checkbox, Typography, Chip, ThemeProvider, createTheme } from '@mui/material';

import { expect, within } from '@storybook/test';

import ListView, { CellDefinition, ColumnDefinition, RowDefinition } from './ListView';
import { SortParams } from './SortParams';
import AutoResizingTextBox from '@/components/base/Input/AutoResizingTextBox';

// MUIテーマの作成
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * テーブルビューコンポーネントで、ページネーション、検索、ソート機能を提供します
 */
const meta: Meta<typeof ListView> = {
  title: 'Common-architecture/ListView/ListView',
  component: ListView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Paper elevation={2} sx={{ p: 2, maxWidth: '100%' }}>
          <Story />
        </Paper>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ListView>;

/**
 * サンプルデータの型定義
 */
interface SampleData {
  id: number;
  name: string;
  email: string;
  department: string;
  joinDate: string;
}

/**
 * テーブル表示用のサンプルデータ
 */
const sampleData: SampleData[] = [
  {
    id: 1,
    name: '山田太郎',
    email: 'taro.yamada@example.com',
    department: '営業部',
    joinDate: '2020-04-01',
  },
  {
    id: 2,
    name: '佐藤花子',
    email: 'hanako.sato@example.com',
    department: '人事部',
    joinDate: '2018-10-15',
  },
  {
    id: 3,
    name: '鈴木一郎',
    email: 'ichiro.suzuki@example.com',
    department: 'IT部',
    joinDate: '2021-07-05',
  },
  {
    id: 4,
    name: '高橋実',
    email: 'minoru.takahashi@example.com',
    department: '経理部',
    joinDate: '2019-03-20',
  },
  {
    id: 5,
    name: '田中誠',
    email: 'makoto.tanaka@example.com',
    department: '営業部',
    joinDate: '2022-01-10',
  },
  {
    id: 6,
    name: '伊藤京子',
    email: 'kyoko.ito@example.com',
    department: 'マーケティング部',
    joinDate: '2020-11-18',
  },
  {
    id: 7,
    name: '渡辺健太',
    email: 'kenta.watanabe@example.com',
    department: 'IT部',
    joinDate: '2023-02-28',
  },
  {
    id: 8,
    name: '小林優',
    email: 'yu.kobayashi@example.com',
    department: '人事部',
    joinDate: '2021-09-01',
  },
  {
    id: 9,
    name: '中村隆',
    email: 'takashi.nakamura@example.com',
    department: '営業部',
    joinDate: '2022-05-15',
  },
  {
    id: 10,
    name: '加藤美咲',
    email: 'misaki.kato@example.com',
    department: '経理部',
    joinDate: '2019-08-03',
  },
  {
    id: 11,
    name: '山本大輔',
    email: 'daisuke.yamamoto@example.com',
    department: '営業部',
    joinDate: '2020-06-12',
  },
];

/**
 * ページネーションテスト用の大量データ
 */
const generateLargeDataset = (): SampleData[] => {
  const departments = [
    '営業部',
    '人事部',
    'IT部',
    '経理部',
    'マーケティング部',
    '開発部',
    '総務部',
    '法務部',
  ];
  const names = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤'];
  const firstNames = ['太郎', '花子', '次郎', '真理', '健太', '美咲', '大輔', '恵子', '誠', '裕子'];

  return Array.from({ length: 55 }, (_, i) => {
    const nameIndex = i % 10;
    const firstNameIndex = Math.floor(i / 10) % 10;
    const deptIndex = Math.floor(i / 7) % departments.length;
    const year = 2018 + Math.floor(i / 20);
    const month = String(1 + (i % 12)).padStart(2, '0');
    const day = String(1 + (i % 28)).padStart(2, '0');

    return {
      id: i + 1,
      name: `${names[nameIndex]}${firstNames[firstNameIndex]}`,
      email: `${names[nameIndex].toLowerCase()}.${firstNames[firstNameIndex].toLowerCase()}${i + 1}@example.com`,
      department: departments[deptIndex],
      joinDate: `${year}-${month}-${day}`,
    };
  });
};

const largeDataset = generateLargeDataset();

// カラム定義
const columns: ColumnDefinition[] = [
  { id: 'id', label: 'ID', display: true, sortable: true },
  { id: 'name', label: '名前', display: true, sortable: true },
  { id: 'email', label: 'メールアドレス', display: true, sortable: true },
  { id: 'department', label: '部署', display: true, sortable: true },
  { id: 'joinDate', label: '入社日', display: true, sortable: true },
];

// チェックボックスを含むカラム定義
const columnsWithCheckbox: ColumnDefinition[] = [
  { id: 'select', label: '選択', display: true, sortable: false },
  { id: 'id', label: 'ID', display: true, sortable: true },
  { id: 'name', label: '名前', display: true, sortable: true },
  { id: 'email', label: 'メールアドレス', display: true, sortable: true },
  { id: 'department', label: '部署', display: true, sortable: true },
  { id: 'status', label: 'ステータス', display: true, sortable: true },
];

// 選択状態を管理する型
interface CheckableItem extends SampleData {
  selected?: boolean;
  status?: string;
}

// 基本的なListView用のデータ変換関数
const convertToListViewData: (items: SampleData[]) => RowDefinition[] = (items: SampleData[]) => {
  return items.map<RowDefinition>((item) => ({
    cells: [
      { id: `${item.id}-id`, columnId: 'id', cell: item.id, value: item.id },
      { id: `${item.id}-name`, columnId: 'name', cell: item.name, value: item.name },
      { id: `${item.id}-email`, columnId: 'email', cell: item.email, value: item.email },
      {
        id: `${item.id}-department`,
        columnId: 'department',
        cell: item.department,
        value: item.department,
      },
      {
        id: `${item.id}-joinDate`,
        columnId: 'joinDate',
        cell: item.joinDate,
        value: item.joinDate,
      },
    ],
  }));
};

// ListView用のサンプルデータ
const sampleListViewData = convertToListViewData(sampleData);

// 特定の条件に基づいて行スタイルを適用するためのデータ変換関数
const convertToStyledListViewData: (items: SampleData[]) => RowDefinition[] = (
  items: SampleData[]
) => {
  return items.map<RowDefinition>((item) => ({
    cells: [
      { id: `${item.id}-id`, columnId: 'id', cell: item.id, value: item.id },
      { id: `${item.id}-name`, columnId: 'name', cell: item.name, value: item.name },
      { id: `${item.id}-email`, columnId: 'email', cell: item.email, value: item.email },
      {
        id: `${item.id}-department`,
        columnId: 'department',
        cell: item.department,
        value: item.department,
      },
      {
        id: `${item.id}-joinDate`,
        columnId: 'joinDate',
        cell: item.joinDate,
        value: item.joinDate,
      },
    ],
    // 部署に基づいて行のスタイルを変更
    rowSx: (() => {
      if (item.department === '営業部') return { backgroundColor: '#e3f2fd' };
      if (item.department === 'IT部') return { backgroundColor: '#f1f8e9' };
      return undefined;
    })(),
  }));
};

// チェックボックスとReactNodeを含むデータ変換関数
const convertToCheckableListViewData = (items: CheckableItem[]): RowDefinition[] => {
  return items.map<RowDefinition>((item) => {
    // 各行のステータスに応じたバッジの表示
    const statusBadge = (() => {
      switch (item.status) {
        case '有効':
          return <Chip label="有効" color="success" size="small" />;
        case '停止中':
          return <Chip label="停止中" color="warning" size="small" />;
        case '無効':
          return <Chip label="無効" color="error" size="small" />;
        default:
          return <Chip label="不明" color="default" size="small" />;
      }
    })();

    return {
      cells: [
        {
          id: `${item.id}-select`,
          columnId: 'select',
          cell: (
            <Checkbox
              checked={item.selected || false}
              onChange={(e) => console.log(`行 ${item.id} の選択状態変更: ${e.target.checked}`)}
            />
          ),
          value: item.selected ? 1 : 0,
        },
        { id: `${item.id}-id`, columnId: 'id', cell: item.id, value: item.id },
        { id: `${item.id}-name`, columnId: 'name', cell: item.name, value: item.name },
        { id: `${item.id}-email`, columnId: 'email', cell: item.email, value: item.email },
        {
          id: `${item.id}-department`,
          columnId: 'department',
          cell: item.department,
          value: item.department,
        },
        {
          id: `${item.id}-status`,
          columnId: 'status',
          cell: statusBadge,
          value: item.status,
        },
      ],
      rowSx: item.selected ? { backgroundColor: 'rgba(25, 118, 210, 0.08)' } : undefined,
    };
  });
};

// チェックボックスとステータスを含むサンプルデータ
const checkableSampleData: CheckableItem[] = sampleData.map((item, index) => {
  const getStatus = (idx: number): string => {
    const mod = idx % 4;
    if (mod === 0) return '有効';
    if (mod === 1) return '停止中';
    if (mod === 2) return '無効';
    return '有効';
  };

  return {
    ...item,
    selected: index % 3 === 0, // 3の倍数の行を初期選択
    status: getStatus(index),
  };
});

/**
 * 標準的なListViewの使用例
 */
export const Default: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    rowData: convertToListViewData(sampleData),
    columns: columns,
  },
};

/**
 * 多数のアイテムがある場合の表示例
 * ページネーションが必要な状況を想定しています
 */
export const ManyItems: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: convertToListViewData(largeDataset),
    columns: columns,
  },
};

/**
 * データが存在しない場合のUI表示例
 */
export const NoData: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: [],
    columns: columns,
  },
};

/**
 * カスタマイズされたテーブルデザインの例
 * 注意：新しいListViewの実装ではセルのスタイリングはcolumnsとdataの中で定義する必要があります
 */
export const CustomizedDesign: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: convertToListViewData(largeDataset),
    columns: columns.map((col) => ({ ...col, sortable: true })),
  },
};

/**
 * Boxコンポーネントのsxプロパティを使用してコンテナ全体のスタイルをカスタマイズした例
 */
export const WithContainerStyling: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: convertToListViewData(sampleData),
    columns: columns,
    sx: {
      backgroundColor: '#f5f5f5',
      border: '1px solid #e0e0e0',
      borderRadius: 2,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      padding: 2,
      '& .MuiTable-root': {
        backgroundColor: 'white',
      },
      '& .MuiTableHead-root': {
        backgroundColor: '#f0f7ff',
      },
    },
  },
};

/**
 * 行ごとに条件付きでスタイルを適用する例
 * 部署ごとに異なる背景色を設定しています
 */
export const WithRowStyling: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: convertToStyledListViewData(sampleData),
    columns: columns,
    sx: {
      '& .MuiTableRow-root:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
  },
};

/**
 * コンテナスタイルと行スタイルを組み合わせた高度なカスタマイズ例
 */
export const AdvancedStyling: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: convertToStyledListViewData(largeDataset),
    columns: columns,
    sx: {
      backgroundColor: '#fcfcfc',
      borderRadius: 2,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      '& .MuiTableContainer-root': {
        maxHeight: '400px',
      },
      '& .MuiTableHead-root .MuiTableCell-root': {
        backgroundColor: '#1976d2',
        color: 'white',
        fontWeight: 'bold',
      },
      '& .MuiTablePagination-root': {
        backgroundColor: '#f5f5f5',
      },
    },
  },
};

/**
 * 検索条件が事前に設定されている場合の例
 * 「営業部」所属のスタッフのみを表示する想定
 */
export const WithPresetSearch: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: convertToListViewData(largeDataset.filter((item) => item.department === '営業部')),
    columns: columns,
  },
};

/**
 * チェックボックスを含むListView
 * ReactNodeをセルに表示する例として、チェックボックスとステータス表示用のChipを含んでいます
 */
export const WithCheckboxes: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: convertToCheckableListViewData(checkableSampleData),
    columns: columnsWithCheckbox,
    sx: {
      '& .MuiCheckbox-root': {
        padding: '4px',
      },
      '& .MuiTableCell-root': {
        padding: '8px 16px',
      },
    },
  },
};

/**
 * 選択可能な行を含む大量データの例
 */
export const WithSelectionAndPagination: Story = {
  args: {
    onPageChange: (page, SortParams) => console.log('Page changed:', page, SortParams),
    onSort: (params) => console.log('Sort:', params),
    rowData: convertToCheckableListViewData(
      largeDataset.map((item, index) => {
        const getStatusValue = (idx: number): string => {
          const mod = idx % 3;
          if (mod === 0) return '有効';
          if (mod === 1) return '停止中';
          return '無効';
        };

        return {
          ...item,
          selected: index % 5 === 0,
          status: getStatusValue(index),
        };
      })
    ),
    columns: columnsWithCheckbox,
    sx: {
      '& .MuiTableRow-root:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
  },
};

/**
 * ビジュアルテスト用のストーリー
 * 異なるデータ量での表示を確認します
 */
export const VisualTests: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ margin: '0 auto', maxWidth: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  // 単一のストーリーから複数のビジュアルスナップショットをテスト
  render: () => (
    <div data-testid="visual-tests-container">
      <Typography variant="h6" gutterBottom>
        標準的なデータ表示
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <ListView
          columns={columns}
          rowData={convertToListViewData(sampleData.slice(0, 5))}
          onSort={(_params) => {}}
        />
      </Paper>

      <Typography variant="h6" gutterBottom>
        データなし状態
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <ListView columns={columns} rowData={[]} onSort={(_params) => {}} />
      </Paper>

      <Typography variant="h6" gutterBottom>
        カスタムスタイル適用
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <ListView
          columns={columns}
          rowData={convertToStyledListViewData(sampleData.slice(0, 5))}
          onSort={(_params) => {}}
          sx={{
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
          }}
        />
      </Paper>

      <Typography variant="h6" gutterBottom>
        チェックボックス付きテーブル
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <ListView
          columns={columnsWithCheckbox}
          rowData={convertToCheckableListViewData(checkableSampleData.slice(0, 5))}
          onSort={(_params) => {}}
        />
      </Paper>
    </div>
  ),
  parameters: {
    chromatic: { disableSnapshot: false },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // すべてのセクションが正しくレンダリングされていることを確認
    await expect(canvas.getByText('標準的なデータ表示')).toBeInTheDocument();
    await expect(canvas.getByText('データなし状態')).toBeInTheDocument();
    await expect(canvas.getByText('カスタムスタイル適用')).toBeInTheDocument();
    await expect(canvas.getByText('チェックボックス付きテーブル')).toBeInTheDocument();

    // テーブルの内容をチェック
    const tables = canvas.getAllByRole('table');
    expect(tables.length).toBe(4);
  },
};

// 横スクロール機能テスト用のワイドカラム定義
const generateWideColumns = (): ColumnDefinition[] => [
  { id: 'id', label: 'ID', display: true, sortable: true, align: 'center', sortKey: 'id' },
  {
    id: 'firstName',
    label: '姓',
    display: true,
    sortable: true,
    align: 'left',
    sortKey: 'firstName',
  },
  {
    id: 'lastName',
    label: '名',
    display: true,
    sortable: true,
    align: 'left',
    sortKey: 'lastName',
  },
  {
    id: 'email',
    label: 'メールアドレス',
    display: true,
    sortable: true,
    align: 'left',
    sortKey: 'email',
  },
  {
    id: 'phone',
    label: '電話番号',
    display: true,
    sortable: true,
    align: 'left',
    sortKey: 'phone',
  },
  {
    id: 'department',
    label: '部署',
    display: true,
    sortable: true,
    align: 'left',
    sortKey: 'department',
  },
  { id: 'role', label: '役職', display: true, sortable: true, align: 'left', sortKey: 'role' },
  {
    id: 'joinDate',
    label: '入社日',
    display: true,
    sortable: true,
    align: 'center',
    sortKey: 'joinDate',
  },
  { id: 'salary', label: '給与', display: true, sortable: true, align: 'right', sortKey: 'salary' },
  {
    id: 'address',
    label: '住所',
    display: true,
    sortable: true,
    align: 'left',
    sortKey: 'address',
  },
  {
    id: 'manager',
    label: '上司',
    display: true,
    sortable: true,
    align: 'left',
    sortKey: 'manager',
  },
  {
    id: 'project',
    label: 'プロジェクト',
    display: true,
    sortable: true,
    align: 'left',
    sortKey: 'project',
  },
  { id: 'skills', label: 'スキル', display: true, sortable: false, align: 'left' },
  { id: 'comments', label: 'コメント', display: true, sortable: false, align: 'left' },
];

// 横スクロール用のワイドデータ生成関数
const generateWideRowData = (count: number = 25): RowDefinition[] => {
  const departments = ['開発部', '営業部', '人事部', '経理部', '企画部', 'マーケティング部'];
  const roles = ['マネージャー', 'シニアエンジニア', 'エンジニア', 'アシスタント'];
  const projects = ['プロジェクトA', 'プロジェクトB', 'プロジェクトC', 'プロジェクトD'];
  const managers = ['田中部長', '佐藤課長', '鈴木課長', '高橋部長'];

  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const salary = 300000 + index * 10000;
    const joinYear = 2020 + (index % 4);
    const joinMonth = (index % 12) + 1;

    const cells: CellDefinition[] = [
      { id: `${id}-id`, columnId: 'id', cell: id.toString(), value: id },
      { id: `${id}-firstName`, columnId: 'firstName', cell: `田中`, value: `田中` },
      { id: `${id}-lastName`, columnId: 'lastName', cell: `太郎${id}`, value: `太郎${id}` },
      {
        id: `${id}-email`,
        columnId: 'email',
        cell: `tanaka.taro${id}@company.co.jp`,
        value: `tanaka.taro${id}@company.co.jp`,
      },
      {
        id: `${id}-phone`,
        columnId: 'phone',
        cell: `090-${1000 + id}-${2000 + id}`,
        value: `090-${1000 + id}-${2000 + id}`,
      },
      {
        id: `${id}-department`,
        columnId: 'department',
        cell: departments[index % departments.length],
        value: departments[index % departments.length],
      },
      {
        id: `${id}-role`,
        columnId: 'role',
        cell: roles[index % roles.length],
        value: roles[index % roles.length],
      },
      {
        id: `${id}-joinDate`,
        columnId: 'joinDate',
        cell: `${joinYear}/${joinMonth.toString().padStart(2, '0')}/01`,
        value: `${joinYear}${joinMonth.toString().padStart(2, '0')}01`,
      },
      {
        id: `${id}-salary`,
        columnId: 'salary',
        cell: `¥${salary.toLocaleString()}`,
        value: salary,
      },
      {
        id: `${id}-address`,
        columnId: 'address',
        cell: `東京都渋谷区${id}-${id}-${id}`,
        value: `東京都渋谷区${id}-${id}-${id}`,
      },
      {
        id: `${id}-manager`,
        columnId: 'manager',
        cell: managers[index % managers.length],
        value: managers[index % managers.length],
      },
      {
        id: `${id}-project`,
        columnId: 'project',
        cell: projects[index % projects.length],
        value: projects[index % projects.length],
      },
      {
        id: `${id}-skills`,
        columnId: 'skills',
        cell: `React, TypeScript, Node.js`,
        value: `React, TypeScript, Node.js`,
      },
      {
        id: `${id}-comments`,
        columnId: 'comments',
        cell: `コメント${id}：優秀な社員です。`,
        value: `コメント${id}`,
      },
    ];

    return { cells };
  });
};

/**
 * 横スクロール機能のテスト - 多数の列
 */
export const HorizontalScrolling: Story = {
  name: '横スクロール（多列表示）',
  args: {
    columns: generateWideColumns(),
    rowData: generateWideRowData(20),
    onSort: (params: SortParams) => {
      console.log('Sort changed:', params);
    },
    onPageChange: (page: number, sortParams: SortParams) => {
      console.log('Page changed:', page, sortParams);
    },
    onPageSizeChange: (pageSize: number) => {
      console.log('Page size changed:', pageSize);
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Paper elevation={2} sx={{ p: 2, width: '800px' }}>
          <Typography variant="h6" gutterBottom>
            横スクロールテスト（14列表示）
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            コンテナ幅を800pxに制限し、14列の広いテーブルで横スクロール機能をテストします。
          </Typography>
          <Story />
        </Paper>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          '14列の広いテーブルで横スクロール機能をテストします。コンテナ幅を800pxに制限しているため、横スクロールが必要になります。',
      },
    },
  },
};

/**
 * 狭いコンテナでの横スクロール
 */
export const NarrowContainer: Story = {
  name: '狭いコンテナでの横スクロール',
  args: {
    columns: columns,
    rowData: sampleListViewData.slice(0, 10),
    onSort: (params: SortParams) => {
      console.log('Sort changed:', params);
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Paper elevation={2} sx={{ p: 2, width: '400px' }}>
          <Typography variant="h6" gutterBottom>
            狭いコンテナテスト
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            400px幅の狭いコンテナで基本的な列でも横スクロールが発生することを確認します。
          </Typography>
          <Story />
        </Paper>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          '400px幅の狭いコンテナで基本的な5列テーブルでも横スクロールが発生することを確認します。',
      },
    },
  },
};

export const TableWithErrorTextBoxes: Story = {
  name: 'AutoResizingTextBox付き一覧（エラー表示確認）',
  args: {
    columns: columns,
    rowData: convertToListViewData(sampleData).map((row, rowIndex) => ({
      ...row,
      cells: row.cells.map((cell, cellIndex) => {
        const isErrorFree = rowIndex === 0 && (cellIndex === 1 || cellIndex === 2); // 例：先頭行の2つのセルはエラーなし

        return {
          ...cell,
          cell: (
            <AutoResizingTextBox
              name={`${cell.id}`}
              value={String(cell.value)}
              error={!isErrorFree}
              helperText={
                !isErrorFree
                  ? `これはフィールド ${cell.columnId} に対する非常に長いエラーメッセージの例です。折り返しが正しく機能し、UIが崩れないことを確認してください。`
                  : undefined
              }
              minRows={1}
              customStyle={{ width: '100%' }}
            />
          ),
        };
      }),
    })),
    onSort: () => {},
    onPageChange: () => {},
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Paper elevation={1} sx={{ p: 2, maxWidth: '1000px', overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            各セルにAutoResizingTextBoxを使用（エラー付き）
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            各テーブルセル内にエラー付きテキストボックスが描画され、長文が折り返されて表示されるかどうかを検証します。
          </Typography>
          <Story />
        </Paper>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          '各セルにAutoResizingTextBoxを配置し、長文エラーメッセージの折り返しが機能するかどうかを検証するストーリーです。',
      },
    },
  },
};

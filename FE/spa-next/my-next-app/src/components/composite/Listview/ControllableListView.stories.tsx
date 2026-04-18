import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Paper, Checkbox, Chip, ThemeProvider, createTheme, Button, Box, SortDirection } from '@mui/material';
import ControllableListView, { TableState } from './ControllableListView';
import { ColumnDefinition, RowDefinition } from '@/components/composite/Listview/ListView';

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
 * 呼び出し元でのコントロールに特化したListViewコンポーネント
 * テーブルを表示し、ページネーション、ソートイベントを提供します
 * 呼び出し元、およびバックエンドでのソートやページネーション、データ取得を想定しています
 */
const meta: Meta<typeof ControllableListView> = {
  title: 'Common-architecture/ListView/ControllableListView',
  component: ControllableListView,
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
type Story = StoryObj<typeof ControllableListView>;

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

  return Array.from({ length: 150 }, (_, i) => {
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
  { id: 'email', label: 'メールアドレス', display: true, sortable: false },
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

// データ構造の変換関数
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
  let status = '有効';
  if (index % 4 === 1) status = '停止中';
  else if (index % 4 === 2) status = '無効';

  return {
    ...item,
    selected: index % 3 === 0, // 3の倍数の行を初期選択
    status,
  };
});

/**
 * 基本的なControllableListViewの使用例
 */
export const Basic: Story = {
  render: function BasicExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 5,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    return (
      <ControllableListView
        page={tableState.page}
        rowsPerPage={tableState.rowsPerPage}
        sortParams={tableState.sortParams}
        rowsPerPageOptions={[5, 10, 20]}
        onTableStateChange={handleTableStateChange}
        rowData={convertToListViewData(sampleData)}
        totalRowCount={sampleData.length}
        columns={columns}
      />
    );
  },
};

/**
 * ページネーションを使った大量データの表示例
 */
export const WithPagination: Story = {
  render: function WithPaginationExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 10,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    // 現在のページに表示するデータをスライス
    const startIndex = (tableState.page - 1) * tableState.rowsPerPage;
    const endIndex = startIndex + tableState.rowsPerPage;
    const currentPageData = largeDataset.slice(startIndex, endIndex);

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    return (
      <ControllableListView
        page={tableState.page}
        rowsPerPage={tableState.rowsPerPage}
        sortParams={tableState.sortParams}
        onTableStateChange={handleTableStateChange}
        rowData={convertToListViewData(currentPageData)}
        totalRowCount={largeDataset.length}
        columns={columns}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    );
  },
};

/**
 * ソート機能を含む例
 */
export const WithSorting: Story = {
  render: function WithSortingExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 10,
      sortParams: { sortColumn: 'name', sortOrder: 'asc' },
    });

    // ソート済みデータを生成
    const getSortedData = () => {
      const sortedData = [...largeDataset];

      if (tableState.sortParams.sortColumn && tableState.sortParams.sortColumn !== '' && tableState.sortParams.sortOrder !== false) {
        sortedData.sort((a, b) => {
          const sortColumn = tableState.sortParams.sortColumn as keyof SampleData;
          const aValue = a[sortColumn];
          const bValue = b[sortColumn];

          if (aValue < bValue) {
            return tableState.sortParams.sortOrder === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return tableState.sortParams.sortOrder === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      return sortedData;
    };

    const sortedData = getSortedData();
    const startIndex = (tableState.page - 1) * tableState.rowsPerPage;
    const endIndex = startIndex + tableState.rowsPerPage;
    const currentPageData = sortedData.slice(startIndex, endIndex);

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    // ソート条件の表示文字列を生成
    const getSortDisplayText = () => {
      if (!tableState.sortParams.sortColumn || tableState.sortParams.sortColumn === '' || tableState.sortParams.sortOrder === false) {
        return 'ソートなし';
      }
      const order = tableState.sortParams.sortOrder === 'asc' ? '昇順' : '降順';
      return `${tableState.sortParams.sortColumn} (${order})`;
    };

    return (
      <Box>
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <strong>現在のソート条件:</strong> {getSortDisplayText()}
        </Box>
        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={handleTableStateChange}
          rowData={convertToListViewData(currentPageData)}
          totalRowCount={sortedData.length}
          columns={columns}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Box>
    );
  },
};

/**
 * チェックボックスとステータスを含む複雑な例
 */
export const WithCheckboxAndStatus: Story = {
  render: function WithCheckboxAndStatusExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 8,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const [items, setItems] = useState<CheckableItem[]>(checkableSampleData);

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    const handleSelectAll = () => {
      setItems(prev => prev.map(item => ({ ...item, selected: true })));
    };

    const handleDeselectAll = () => {
      setItems(prev => prev.map(item => ({ ...item, selected: false })));
    };

    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={handleSelectAll}>
            全選択
          </Button>
          <Button variant="outlined" size="small" onClick={handleDeselectAll}>
            全解除
          </Button>
        </Box>
        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={handleTableStateChange}
          rowData={convertToCheckableListViewData(items)}
          totalRowCount={items.length}
          columns={columnsWithCheckbox}
          rowsPerPageOptions={[5, 8, 15]}
        />
      </Box>
    );
  },
};

/**
 * カスタムスタイリングを適用した例
 */
export const WithCustomStyling: Story = {
  render: function WithCustomStylingExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 5,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    return (
      <ControllableListView
        page={tableState.page}
        rowsPerPage={tableState.rowsPerPage}
        sortParams={tableState.sortParams}
        onTableStateChange={handleTableStateChange}
        rowData={convertToListViewData(sampleData)}
        totalRowCount={sampleData.length}
        columns={columns}
        sx={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          '& .MuiTable-root': {
            backgroundColor: 'white',
          },
          '& .MuiTableHead-root': {
            backgroundColor: '#f1f5f9',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: '#f8fafc',
          },
        }}
      />
    );
  },
};

/**
 * データが存在しない場合の表示例
 */
export const NoData: Story = {
  render: function NoDataExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 10,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    return (
      <ControllableListView
        page={tableState.page}
        rowsPerPage={tableState.rowsPerPage}
        sortParams={tableState.sortParams}
        onTableStateChange={handleTableStateChange}
        rowData={[]}
        totalRowCount={0}
        columns={columns}
      />
    );
  },
};

/**
 * 上部ページネーションを非表示にした例
 */
export const HiddenTopPagination: Story = {
  render: function HiddenTopPaginationExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 5,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    return (
      <Box>
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
          <strong>設定:</strong> 上部のページネーションが非表示になっています。下部のページネーションのみ表示されます。
        </Box>
        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={handleTableStateChange}
          rowData={convertToListViewData(sampleData)}
          totalRowCount={sampleData.length}
          columns={columns}
          rowsPerPageOptions={[5, 10, 20]}
          topPaginationHidden={true}
        />
      </Box>
    );
  },
};

/**
 * 下部ページネーションを非表示にした例
 */
export const HiddenBottomPagination: Story = {
  render: function HiddenBottomPaginationExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 5,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    return (
      <Box>
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
          <strong>設定:</strong> 下部のページネーションが非表示になっています。上部のページネーションのみ表示されます。
        </Box>
        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={handleTableStateChange}
          rowData={convertToListViewData(sampleData)}
          totalRowCount={sampleData.length}
          columns={columns}
          rowsPerPageOptions={[5, 10, 20]}
          bottomPaginationHidden={true}
        />
      </Box>
    );
  },
};

/**
 * 両方のページネーションを非表示にした例
 */
export const HiddenBothPaginations: Story = {
  render: function HiddenBothPaginationsExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 5,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    return (
      <Box>
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
          <strong>設定:</strong> 上部・下部の両方のページネーションが非表示になっています。
          <br />
          ページネーション機能は利用できませんが、テーブルのみが表示されます。
        </Box>
        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={handleTableStateChange}
          rowData={convertToListViewData(sampleData)}
          totalRowCount={sampleData.length}
          columns={columns}
          rowsPerPageOptions={[5, 10, 20]}
          topPaginationHidden={true}
          bottomPaginationHidden={true}
        />
      </Box>
    );
  },
};

/**
 * ページネーション設定の比較例
 */
export const PaginationComparison: Story = {
  render: function PaginationComparisonExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 3,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const handleTableStateChange = (newState: TableState) => {
      console.log('テーブル状態変更:', newState);
      setTableState(newState);
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* デフォルト（両方表示） */}
        <Box>
          <Box sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <strong>デフォルト:</strong> 上部・下部の両方にページネーション表示
          </Box>
          <ControllableListView
            page={tableState.page}
            rowsPerPage={tableState.rowsPerPage}
            sortParams={tableState.sortParams}
            onTableStateChange={handleTableStateChange}
            rowData={convertToListViewData(sampleData.slice(0, 6))}
            totalRowCount={6}
            columns={columns}
            rowsPerPageOptions={[3, 6]}
          />
        </Box>

        {/* 上部のみ表示 */}
        <Box>
          <Box sx={{ mb: 1, p: 1, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <strong>上部のみ:</strong> 下部のページネーションを非表示
          </Box>
          <ControllableListView
            page={tableState.page}
            rowsPerPage={tableState.rowsPerPage}
            sortParams={tableState.sortParams}
            onTableStateChange={handleTableStateChange}
            rowData={convertToListViewData(sampleData.slice(0, 6))}
            totalRowCount={6}
            columns={columns}
            rowsPerPageOptions={[3, 6]}
            bottomPaginationHidden={true}
          />
        </Box>

        {/* 下部のみ表示 */}
        <Box>
          <Box sx={{ mb: 1, p: 1, backgroundColor: '#fff3e0', borderRadius: 1 }}>
            <strong>下部のみ:</strong> 上部のページネーションを非表示
          </Box>
          <ControllableListView
            page={tableState.page}
            rowsPerPage={tableState.rowsPerPage}
            sortParams={tableState.sortParams}
            onTableStateChange={handleTableStateChange}
            rowData={convertToListViewData(sampleData.slice(0, 6))}
            totalRowCount={6}
            columns={columns}
            rowsPerPageOptions={[3, 6]}
            topPaginationHidden={true}
          />
        </Box>

        {/* 両方非表示 */}
        <Box>
          <Box sx={{ mb: 1, p: 1, backgroundColor: '#ffebee', borderRadius: 1 }}>
            <strong>両方非表示:</strong> ページネーション機能なし
          </Box>
          <ControllableListView
            page={tableState.page}
            rowsPerPage={tableState.rowsPerPage}
            sortParams={tableState.sortParams}
            onTableStateChange={handleTableStateChange}
            rowData={convertToListViewData(sampleData.slice(0, 6))}
            totalRowCount={6}
            columns={columns}
            rowsPerPageOptions={[3, 6]}
            topPaginationHidden={true}
            bottomPaginationHidden={true}
          />
        </Box>
      </Box>
    );
  },
};

const EventDemoComponent: React.FC = () => {
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 5,
    sortParams: { sortColumn: 'name', sortOrder: 'asc' as SortDirection },
  });

  const [eventLog, setEventLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  // データのソート処理
  const sortData = (data: SampleData[], sortParams: { sortColumn: string; sortOrder: SortDirection } | null): SampleData[] => {
    if (!sortParams || !sortParams.sortColumn || sortParams.sortColumn === '' || sortParams.sortOrder === false) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortParams.sortColumn as keyof SampleData];
      const bValue = b[sortParams.sortColumn as keyof SampleData];

      let comparison = 0;

      // 値の型に応じた比較処理
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        // その他の場合は文字列として比較
        const aStr = String(aValue);
        const bStr = String(bValue);
        comparison = aStr.localeCompare(bStr);
      }

      return sortParams.sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  // ページネーションとソートを適用したデータの取得
  const getCurrentPageData = (): SampleData[] => {
    const sortedData = sortData(largeDataset, tableState.sortParams);
    const startIndex = (tableState.page - 1) * tableState.rowsPerPage;
    const endIndex = startIndex + tableState.rowsPerPage;
    return sortedData.slice(startIndex, endIndex);
  };

  const handleTableStateChange = (newState: TableState) => {
    const changes: string[] = [];

    if (newState.page !== tableState.page) {
      changes.push(`ページ変更: ${tableState.page} → ${newState.page}`);
    }

    if (newState.rowsPerPage !== tableState.rowsPerPage) {
      changes.push(`表示件数変更: ${tableState.rowsPerPage} → ${newState.rowsPerPage}`);
      // 表示件数変更時はページを1にリセット
      newState.page = 1;
    }

    if (newState.sortParams?.sortColumn !== tableState.sortParams?.sortColumn ||
      newState.sortParams?.sortOrder !== tableState.sortParams?.sortOrder) {
      const oldSort = tableState.sortParams
        ? `${tableState.sortParams.sortColumn}(${tableState.sortParams.sortOrder})`
        : 'なし';
      const newSort = newState.sortParams
        ? `${newState.sortParams.sortColumn}(${newState.sortParams.sortOrder})`
        : 'なし';
      changes.push(`ソート変更: ${oldSort} → ${newSort}`);
      // ソート変更時はページを1にリセット
      newState.page = 1;
    }

    if (changes.length > 0) {
      addLog(`TableState更新: ${changes.join(', ')}`);
    }

    setTableState(newState);
  };

  const handleClearLog = () => {
    setEventLog([]);
    addLog('イベントログをクリアしました');
  };

  const handleResetState = () => {
    const initialState: TableState = {
      page: 1,
      rowsPerPage: 5,
      sortParams: { sortColumn: 'name', sortOrder: 'asc' as SortDirection },
    };
    setTableState(initialState);
    addLog('テーブル状態をリセットしました');
  };

  // 現在のページのデータを取得
  const currentPageData = getCurrentPageData();
  const totalPages = Math.ceil(largeDataset.length / tableState.rowsPerPage);

  return (
    <Box sx={{ display: 'flex', gap: 3, height: '600px' }}>
      {/* テーブル部分 */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ mb: 2, p: 1, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
          <strong>イベント発火デモ</strong>
          <br />
          テーブルを操作して、右側のログでイベントの発火を確認してください
          <br />
          <em>※ソートとページネーションは呼び出し側で制御されています</em>
        </Box>

        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={handleTableStateChange}
          rowData={convertToListViewData(currentPageData)}
          totalRowCount={largeDataset.length}
          columns={columns}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>

      {/* イベントログ部分 */}
      <Box sx={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearLog}
            sx={{ fontSize: '0.75rem' }}
          >
            ログクリア
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResetState}
            sx={{ fontSize: '0.75rem' }}
          >
            状態リセット
          </Button>
        </Box>

        <Box sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, fontSize: '0.875rem' }}>
          <strong>現在の状態:</strong>
          <br />
          ページ: {tableState.page} / {totalPages}
          <br />
          表示件数: {tableState.rowsPerPage}
          <br />
          ソート: {tableState.sortParams?.sortColumn || 'なし'}
          ({tableState.sortParams?.sortOrder || '-'})
          <br />
          表示データ: {currentPageData.length}件 / 全{largeDataset.length}件
        </Box>

        <Box sx={{
          flex: 1,
          backgroundColor: '#000',
          color: '#00ff00',
          p: 1,
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          overflow: 'auto',
          minHeight: '300px'
        }}>
          <Box sx={{ mb: 1, color: '#ffffff', borderBottom: '1px solid #333', pb: 1 }}>
            📋 イベントログ (最新10件)
          </Box>
          {eventLog.length === 0 ? (
            <Box sx={{ color: '#666' }}>イベントなし - テーブルを操作してください</Box>
          ) : (
            eventLog.map((log, index) => (
              <Box key={index} sx={{ mb: 0.5, opacity: 1 - (index * 0.1) }}>
                {log}
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ mt: 2, p: 1, backgroundColor: '#fff3e0', borderRadius: 1, fontSize: '0.75rem' }}>
          <strong>制御動作:</strong>
          <br />
          • <strong>ソート:</strong> 呼び出し側でデータを並び替え
          <br />
          • <strong>ページネーション:</strong> 呼び出し側でデータを分割
          <br />
          • <strong>件数変更:</strong> ページを1にリセット
          <br />
          • <strong>並び順変更:</strong> ページを1にリセット
          <br />
          <br />
          <strong>操作方法:</strong>
          <br />
          • ヘッダークリック: ソート切り替え
          <br />
          • ページ番号: ページ移動
          <br />
          • 表示件数選択: 件数変更
        </Box>
      </Box>
    </Box>
  );
};

/**
 * イベント発火の確認デモ
 * 各種イベントの発生をアクションログで確認できます
 * ソートとページネーションは呼び出し側で制御します
 */
export const EventDemo: Story = {
  render: () => <EventDemoComponent />,
};

const SelectionAndActionDemoComponent: React.FC = () => {
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 10,
    sortParams: { sortColumn: 'name', sortOrder: 'asc' },
  });

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [actionLog, setActionLog] = useState<string[]>([]);

  const addActionLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleTableStateChange = (newState: TableState) => {
    setTableState(newState);
  };

  const handleSelectItem = (id: number, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
    addActionLog(`アイテム${selected ? '選択' : '選択解除'}: ID=${id}`);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = sampleData.map(item => item.id);
      setSelectedItems(new Set(allIds));
      addActionLog(`全選択: ${allIds.length}件選択`);
    } else {
      setSelectedItems(new Set());
      addActionLog('全選択解除');
    }
  };

  const handleBulkAction = (action: string) => {
    const selectedCount = selectedItems.size;
    const selectedIds = Array.from(selectedItems);
    addActionLog(`${action}実行: ${selectedCount}件 (ID: ${selectedIds.join(', ')})`);
  };

  // チェックボックス付きのデータ変換
  const convertToSelectableData = (items: SampleData[]): RowDefinition[] => {
    return items.map<RowDefinition>((item) => ({
      cells: [
        {
          id: `${item.id}-select`,
          columnId: 'select',
          cell: (
            <Checkbox
              checked={selectedItems.has(item.id)}
              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
            />
          ),
          value: selectedItems.has(item.id),
        },
        { id: `${item.id}-id`, columnId: 'id', cell: item.id, value: item.id },
        { id: `${item.id}-name`, columnId: 'name', cell: item.name, value: item.name },
        { id: `${item.id}-email`, columnId: 'email', cell: item.email, value: item.email },
        { id: `${item.id}-department`, columnId: 'department', cell: item.department, value: item.department },
        {
          id: `${item.id}-status`,
          columnId: 'status',
          cell: (
            <Chip
              label={selectedItems.has(item.id) ? '選択中' : '未選択'}
              color={selectedItems.has(item.id) ? 'primary' : 'default'}
              size="small"
            />
          ),
          value: selectedItems.has(item.id) ? '選択中' : '未選択',
        },
      ],
    }));
  };

  // ヘッダーチェックボックス付きのカラム定義
  const selectableColumns: ColumnDefinition[] = [
    {
      id: 'select',
      label: (
        <Checkbox
          checked={selectedItems.size === sampleData.length && sampleData.length > 0}
          indeterminate={selectedItems.size > 0 && selectedItems.size < sampleData.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      display: true,
      sortable: false,
    },
    { id: 'id', label: 'ID', display: true, sortable: true },
    { id: 'name', label: '名前', display: true, sortable: true },
    { id: 'email', label: 'メールアドレス', display: true, sortable: false },
    { id: 'department', label: '部署', display: true, sortable: true },
    { id: 'status', label: 'ステータス', display: true, sortable: false },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 3, height: '600px' }}>
      {/* テーブル部分 */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ mb: 2, p: 1, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
          <strong>選択・アクションデモ</strong>
          <br />
          チェックボックスで項目を選択し、アクションボタンでイベントを発火してください
        </Box>

        {/* アクションボタン */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            disabled={selectedItems.size === 0}
            onClick={() => handleBulkAction('編集')}
            size="small"
          >
            編集 ({selectedItems.size})
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={selectedItems.size === 0}
            onClick={() => handleBulkAction('削除')}
            size="small"
          >
            削除 ({selectedItems.size})
          </Button>
          <Button
            variant="outlined"
            disabled={selectedItems.size === 0}
            onClick={() => handleBulkAction('エクスポート')}
            size="small"
          >
            エクスポート ({selectedItems.size})
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedItems(new Set());
              addActionLog('選択をクリア');
            }}
            size="small"
          >
            選択クリア
          </Button>
        </Box>

        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={handleTableStateChange}
          rowData={convertToSelectableData(sampleData)}
          totalRowCount={sampleData.length}
          columns={selectableColumns}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      {/* アクションログ部分 */}
      <Box sx={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setActionLog([])}
            fullWidth
          >
            ログクリア
          </Button>
        </Box>

        <Box sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, fontSize: '0.875rem' }}>
          <strong>選択状況:</strong>
          <br />
          選択件数: {selectedItems.size} / {sampleData.length}
          <br />
          選択ID: {selectedItems.size > 0 ? Array.from(selectedItems).join(', ') : 'なし'}
        </Box>

        <Box sx={{
          flex: 1,
          backgroundColor: '#001f3f',
          color: '#7FDBFF',
          p: 1,
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          overflow: 'auto',
          minHeight: '300px'
        }}>
          <Box sx={{ mb: 1, color: '#ffffff', borderBottom: '1px solid #333', pb: 1 }}>
            🎯 アクションログ (最新10件)
          </Box>
          {actionLog.length === 0 ? (
            <Box sx={{ color: '#666' }}>アクションなし - 項目を選択してください</Box>
          ) : (
            actionLog.map((log, index) => (
              <Box key={index} sx={{ mb: 0.5, opacity: 1 - (index * 0.1) }}>
                {log}
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ mt: 2, p: 1, backgroundColor: '#fff3e0', borderRadius: 1, fontSize: '0.75rem' }}>
          <strong>操作方法:</strong>
          <br />
          • ヘッダーチェックボックス: 全選択/全解除
          <br />
          • 行チェックボックス: 個別選択
          <br />
          • アクションボタン: 選択項目に対する処理
        </Box>
      </Box>
    </Box>
  );
};

/**
 * 列幅のwidthPercent指定がTableに正しく反映されるか確認するストーリー
 */
export const WidthPercentDemo: Story = {
  render: () => {
    const columns: ColumnDefinition[] = [
      { id: 'id', label: 'ID', display: true, sortable: false, widthPercent: 20 },
      { id: 'name', label: '名前（50%指定）', display: true, sortable: false, widthPercent: 50 },
      { id: 'email', label: '残り自動分配', display: true, sortable: false },
    ];

    const data: SampleData[] = [
      {
        id: 1,
        name: '山田太郎',
        email: 'taro.yamada@example.com',
        department: '',
        joinDate: '',
      },
    ];

    const rowData: RowDefinition[] = convertToListViewData(data);

    return (
      <Box sx={{ maxWidth: '100%' }}>
        <ControllableListView
          page={1}
          rowsPerPage={1}
          sortParams={{ sortColumn: '', sortOrder: false }}
          onTableStateChange={() => {}}
          rowData={rowData}
          totalRowCount={1}
          columns={columns}
          rowsPerPageOptions={[1]}
          topPaginationHidden
          bottomPaginationHidden
        />
        <Box sx={{ mt: 2, fontSize: '0.85rem', color: '#555' }}>
          ※ ヘッダーとセルの幅がそれぞれ <strong>ID: 20%</strong>, <strong>名前: 50%</strong>, <strong>メール: 30%</strong> になっていることを確認してください。
        </Box>
      </Box>
    );
  },
};

export const RowClickAlert: Story = {
  render: function RowClickAlertExample() {
    const [tableState, setTableState] = useState<TableState>({
      page: 1,
      rowsPerPage: 5,
      sortParams: { sortColumn: '', sortOrder: false },
    });

    const handleTableStateChange = (newState: TableState) => {
      setTableState(newState);
    };

    const handleRowClick = (_row: RowDefinition, rowIndex: number) => {
      alert(`行 ${rowIndex + 1} がクリックされました`);
    };

    return (
      <ControllableListView
        page={tableState.page}
        rowsPerPage={tableState.rowsPerPage}
        sortParams={tableState.sortParams}
        onTableStateChange={handleTableStateChange}
        rowData={convertToListViewData(sampleData)}
        totalRowCount={sampleData.length}
        columns={columns}
        rowsPerPageOptions={[5, 10, 20]}
        onRowClick={handleRowClick} // ✅ 行クリックイベントを指定
      />
    );
  },
};



/**
 * 複数選択とアクションイベントのデモ
 * チェックボックス選択とアクションボタンのイベントを確認できます
 */
export const SelectionAndActionDemo: Story = {
  render: () => <SelectionAndActionDemoComponent />,
};

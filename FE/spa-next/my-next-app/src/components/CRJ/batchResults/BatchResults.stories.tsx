import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Paper, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import dayjs from 'dayjs';
import { BatchResults } from './BatchResults';
import { BatchStatus } from '@/api/services/v1/crj/common/batchResultService';
import { BatchType } from '@/api/services/v1/crj/common/batchTypeService';
import { BaseComboListResponse } from '@/types/CRJ/BaseComboListResponse';
import { CRJApiResponse } from '@/types/CRJ/CRJApiResponse';

// MSWを初期化
initialize();

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
 * CRJ バッチ実行結果の一覧表示コンポーネント
 * バッチ処理の実行履歴を拠点・バッチ名・実行開始日で絞り込み検索できます
 */
const meta: Meta<typeof BatchResults> = {
  title: 'CRJ/BatchResults',
  component: BatchResults,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
バッチ実行結果を表示・検索するコンポーネントです。

## 機能
- バッチ実行履歴の一覧表示
- 拠点・バッチ名・実行開始日での絞り込み検索
- ページング・ソート機能
- エラー内容の表示

## 使用するAPI
- \`useFetchBatchStatus\`: バッチ実行結果の取得
- \`getBaseComboList\`: 拠点マスタの取得
- \`useFetchBatchType\`: バッチ種別マスタの取得
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    mswDecorator,
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
          },
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <Paper elevation={2} sx={{ p: 2, maxWidth: '100%' }}>
              <Story />
            </Paper>
          </ThemeProvider>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof BatchResults>;

/**
 * モックデータ: バッチ実行結果
 */
const mockBatchStatusData: BatchStatus[] = [
  {
    baseCd: 'BASE001',
    baseName: '東京本社',
    batchName: 'INVENTORY_SYNC',
    startDateAndTime: '2024-01-15 09:00:00',
    endDateAndTime: '2024-01-15 09:15:30',
    statusName: '正常終了',
    errorMessege: '',
  },
  {
    baseCd: 'BASE002',
    baseName: '大阪支社',
    batchName: 'STOCK_UPDATE',
    startDateAndTime: '2024-01-15 08:30:00',
    endDateAndTime: '2024-01-15 08:45:20',
    statusName: '正常終了',
    errorMessege: '',
  },
  {
    baseCd: 'BASE001',
    baseName: '東京本社',
    batchName: 'REPORT_GENERATION',
    startDateAndTime: '2024-01-15 07:00:00',
    endDateAndTime: '',
    statusName: 'エラー終了',
    errorMessege: 'データベース接続エラーが発生しました',
  },
  {
    baseCd: 'BASE003',
    baseName: '名古屋支店',
    batchName: 'DATA_BACKUP',
    startDateAndTime: '2024-01-15 06:00:00',
    endDateAndTime: '2024-01-15 06:30:45',
    statusName: '正常終了',
    errorMessege: '',
  },
  {
    baseCd: 'BASE002',
    baseName: '大阪支社',
    batchName: 'INVENTORY_SYNC',
    startDateAndTime: '2024-01-15 05:30:00',
    endDateAndTime: '',
    statusName: '実行中',
    errorMessege: '',
  },
];

/**
 * モックデータ: 拠点マスタ
 */
const mockBasesData: BaseComboListResponse = [
  {
    baseCd: 'BASE001',
    baseName: '東京本社',
    baseCategory: '本社',
  },
  {
    baseCd: 'BASE002',
    baseName: '大阪支社',
    baseCategory: '支社',
  },
  {
    baseCd: 'BASE003',
    baseName: '名古屋支店',
    baseCategory: '支店',
  },
  {
    baseCd: 'BASE004',
    baseName: '福岡営業所',
    baseCategory: '営業所',
  },
];

/**
 * モックデータ: バッチ種別マスタ
 */
const mockBatchTypeData: BatchType[] = [
  {
    batchName: 'INVENTORY_SYNC',
    displayName: '在庫同期処理',
  },
  {
    batchName: 'STOCK_UPDATE',
    displayName: '在庫更新処理',
  },
  {
    batchName: 'REPORT_GENERATION',
    displayName: 'レポート生成処理',
  },
  {
    batchName: 'DATA_BACKUP',
    displayName: 'データバックアップ',
  },
];

/**
 * 基本的な表示例
 * 通常のバッチ実行結果一覧を表示します
 */
export const Basic: Story = {
  parameters: {
    msw: {
      handlers: [
        // 拠点コンボリストAPI
        http.get('*/common/base-combo-list', ({ request }) => {
          const url = new URL(request.url);
          const searchTargetType = url.searchParams.get('searchTargetType');
          console.log('Mock: 拠点コンボリスト取得', { searchTargetType });
          
          const response: CRJApiResponse<BaseComboListResponse> = {
            result: 'Success',
            message: '',
            args: '',
            data: mockBasesData,
          };
          return HttpResponse.json(response);
        }),
        
        // バッチ種別API
        http.get('*/system-transfer/batch-list/names', () => {
          console.log('Mock: バッチ種別取得');
          
          const response: CRJApiResponse<BatchType[]> = {
            result: 'Success',
            message: '',
            args: '',
            data: mockBatchTypeData,
          };
          return HttpResponse.json(response);
        }),
        
        // バッチ実行結果API
        http.get('*/system-transfer/batch-list', ({ request }) => {
          const url = new URL(request.url);
          const pageSize = url.searchParams.get('pageSize') || '10';
          const pageNo = url.searchParams.get('pageNo') || '0';
          console.log('Mock: バッチ実行結果取得', { pageSize, pageNo });
          
          const response = {
            error: false,
            success: true,
            data: {
              totalCnt: mockBatchStatusData.length,
              baseList: mockBatchStatusData,
            },
          };
          return HttpResponse.json(response);
        }),
      ],
    },
    docs: {
      description: {
        story: `
基本的なバッチ実行結果の表示例です。

- 検索条件エリアで拠点・バッチ名・実行開始日を指定して絞り込み検索
- テーブルでバッチ実行履歴を一覧表示
- ページング・ソート機能
        `,
      },
    },
  },
};

/**
 * データなしの表示例
 * バッチ実行履歴が存在しない場合の表示
 */
export const NoData: Story = {
  parameters: {
    msw: {
      handlers: [
        // 拠点コンボリストAPI
        http.get('*/common/base-combo-list', ({ request }) => {
          const url = new URL(request.url);
          const searchTargetType = url.searchParams.get('searchTargetType');
          console.log('Mock (NoData): 拠点コンボリスト取得', { searchTargetType });
          
          const response: CRJApiResponse<BaseComboListResponse> = {
            result: 'Success',
            message: '',
            args: '',
            data: mockBasesData,
          };
          return HttpResponse.json(response);
        }),
        
        // バッチ種別API
        http.get('*/system-transfer/batch-list/names', () => {
          console.log('Mock (NoData): バッチ種別取得');
          
          const response: CRJApiResponse<BatchType[]> = {
            result: 'Success',
            message: '',
            args: '',
            data: mockBatchTypeData,
          };
          return HttpResponse.json(response);
        }),
        
        // バッチ実行結果API（空データ）
        http.get('*/system-transfer/batch-list', ({ request }) => {
          const url = new URL(request.url);
          console.log('Mock (NoData): バッチ実行結果取得（空データ）');
          
          const response = {
            error: false,
            success: true,
            data: {
              totalCnt: 0,
              baseList: [],
            },
          };
          return HttpResponse.json(response);
        }),
      ],
    },
    docs: {
      description: {
        story: `
バッチ実行履歴が存在しない場合の表示例です。

検索条件は設定できますが、テーブルにはデータが表示されません。
        `,
      },
    },
  },
};

/**
 * エラー状態の表示例
 * API通信でエラーが発生した場合の表示
 */
export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        // 拠点コンボリストAPI
        http.get('*/common/base-combo-list', ({ request }) => {
          const url = new URL(request.url);
          const searchTargetType = url.searchParams.get('searchTargetType');
          console.log('Mock (ErrorState): 拠点コンボリスト取得', { searchTargetType });
          
          const response: CRJApiResponse<BaseComboListResponse> = {
            result: 'Success',
            message: '',
            args: '',
            data: mockBasesData,
          };
          return HttpResponse.json(response);
        }),
        
        // バッチ種別API
        http.get('*/system-transfer/batch-list/names', () => {
          console.log('Mock (ErrorState): バッチ種別取得');
          
          const response: CRJApiResponse<BatchType[]> = {
            result: 'Success',
            message: '',
            args: '',
            data: mockBatchTypeData,
          };
          return HttpResponse.json(response);
        }),
        
        // バッチ実行結果API（エラー）
        http.get('*/system-transfer/batch-list', () => {
          console.log('Mock (ErrorState): バッチ実行結果取得（エラー）');
          return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }),
      ],
    },
    docs: {
      description: {
        story: `
API通信でエラーが発生した場合の表示例です。

バッチ実行結果の取得に失敗していますが、検索条件の選択肢は正常に表示されます。
        `,
      },
    },
  },
};

/**
 * 大量データの表示例
 * ページング機能のテスト用
 */
export const LargeDataSet: Story = {
  parameters: {
    msw: {
      handlers: [
        // 拠点コンボリストAPI
        http.get('*/common/base-combo-list', ({ request }) => {
          const url = new URL(request.url);
          const searchTargetType = url.searchParams.get('searchTargetType');
          console.log('Mock (LargeDataSet): 拠点コンボリスト取得', { searchTargetType });
          
          const response: CRJApiResponse<BaseComboListResponse> = {
            result: 'Success',
            message: '',
            args: '',
            data: mockBasesData,
          };
          return HttpResponse.json(response);
        }),
        
        // バッチ種別API
        http.get('*/system-transfer/batch-list/names', () => {
          console.log('Mock (LargeDataSet): バッチ種別取得');
          
          const response: CRJApiResponse<BatchType[]> = {
            result: 'Success',
            message: '',
            args: '',
            data: mockBatchTypeData,
          };
          return HttpResponse.json(response);
        }),
        
        // バッチ実行結果API（大量データ）
        http.get('*/system-transfer/batch-list', ({ request }) => {
          const url = new URL(request.url);
          console.log('Mock (LargeDataSet): バッチ実行結果取得（大量データ）');
        
          // 大量データを生成
          const generateLargeDataSet = (): BatchStatus[] => {
            const statuses = ['正常終了', 'エラー終了', '実行中', '警告終了'];
            const batchNames = ['INVENTORY_SYNC', 'STOCK_UPDATE', 'REPORT_GENERATION', 'DATA_BACKUP'];
            const baseNames = ['東京本社', '大阪支社', '名古屋支店', '福岡営業所'];
            const baseCds = ['BASE001', 'BASE002', 'BASE003', 'BASE004'];

            return Array.from({ length: 50 }, (_, i) => {
              const baseIndex = i % baseNames.length;
              const batchIndex = i % batchNames.length;
              const statusIndex = i % statuses.length;
              const date = dayjs().subtract(i, 'hours').format('YYYY-MM-DD HH:mm:ss');

              return {
                baseCd: baseCds[baseIndex],
                baseName: baseNames[baseIndex],
                batchName: batchNames[batchIndex],
                startDateAndTime: date,
                endDateAndTime: statuses[statusIndex] === '実行中' ? '' : dayjs(date).add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
                statusName: statuses[statusIndex],
                errorMessege: statuses[statusIndex] === 'エラー終了' ? `エラー詳細 ${i + 1}` : '',
              };
            });
          };

          const largeDataSet = generateLargeDataSet();
          const response = {
            error: false,
            success: true,
            data: {
              totalCnt: largeDataSet.length,
              baseList: largeDataSet,
            },
          };
          return HttpResponse.json(response);
        }),
      ],
    },
    docs: {
      description: {
        story: `
大量データでのページング機能テスト用の表示例です。

50件のバッチ実行履歴データを生成し、ページング機能が正常に動作することを確認できます。
        `,
      },
    },
  },
};
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BatchResults } from './BatchResults';

// Next.js routerのモック
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/batch-results',
    push: mockPush,
    query: {},
    asPath: '/batch-results',
    route: '/batch-results',
    back: jest.fn(),
    beforePopState: jest.fn(),
    prefetch: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isReady: true,
    isPreview: false,
  }),
}));

// PageConfigとPageLangのモック
jest.mock('@/config/PageConfig', () => ({
  getPageConfig: jest.fn(() => 'mock-config'),
}));

jest.mock('@/config/PageLang', () => ({
  pageLang: { ja: 'ja' },
}));

// API サービスのモック
jest.mock('@/api/services/v1/crj/common/batchResultService');
jest.mock('@/api/services/v1/crj/common/baseComboListService');
jest.mock('@/api/services/v1/crj/common/batchTypeService');

// モック関数の取得
import * as batchResultService from '@/api/services/v1/crj/common/batchResultService';
import * as baseComboListService from '@/api/services/v1/crj/common/baseComboListService';
import * as batchTypeService from '@/api/services/v1/crj/common/batchTypeService';

const mockGetBatchStatus = batchResultService.getBatchStatus as jest.MockedFunction<typeof batchResultService.getBatchStatus>;
const mockGetBaseComboList = baseComboListService.getBaseComboList as jest.MockedFunction<typeof baseComboListService.getBaseComboList>;
const mockGetBatchTypes = batchTypeService.getBatchTypes as jest.MockedFunction<typeof batchTypeService.getBatchTypes>;

describe('BatchResults コンポーネント', () => {
  const mockOnError = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;

  // モックデータ
  const mockBatchData = [
    {
      baseCd: '001',
      baseName: '東京本社',
      batchName: '日次在庫更新',
      startDateAndTime: '2024-01-15 09:00:00',
      endDateAndTime: '2024-01-15 09:15:00',
      statusName: '成功',
      errorMessege: ''
    }
  ];

  const mockBaseComboList = [
    { baseCd: '001', baseName: '東京本社', baseCategory: 'A' }
  ];

  const mockBatchTypes = [
    { batchName: 'DAILY_INVENTORY', displayName: '日次在庫更新' }
  ];

  beforeEach(() => {
    // モックの初期化
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // デフォルトのモック設定
    mockGetBatchStatus.mockResolvedValue({
      success: true,
      data: {
        totalCnt: 1,
        baseList: mockBatchData
      },
      error: null
    });

    mockGetBaseComboList.mockResolvedValue({
      result: 'Success',
      message: '',
      args: '',
      data: mockBaseComboList
    });

    mockGetBatchTypes.mockResolvedValue({
      result: 'Success',
      message: '',
      args: '',
      data: mockBatchTypes
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('コンポーネントが正常にレンダリングされること', async () => {
    render(<BatchResults />);
    
    // テーブルヘッダーが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('#')).toBeInTheDocument();
    });
    
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('エラー内容')).toBeInTheDocument();
  });

  test('戻るボタンがクリックされた際にナビゲーションが動作すること', async () => {
    render(<BatchResults />);

    await waitFor(() => {
      expect(screen.getByText('戻る')).toBeInTheDocument();
    });

    const backButton = screen.getByText('戻る');
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/common/top-list');
  });

  test('APIエラー時にエラーハンドリングが動作すること', async () => {
    // エラーレスポンスを設定（ApiResponse型の場合）
    mockGetBatchStatus.mockResolvedValue({
      success: false,
      data: {
        totalCnt: 0,
        baseList: []
      },
      error: 'APIエラー'
    });

    render(<BatchResults onError={mockOnError} />);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    }, { timeout: 5000 });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Batch status fetch error:',
      expect.stringContaining('APIエラー')
    );
  });

  test('モック設定が正しく動作すること', () => {
    expect(mockGetBatchStatus).toBeDefined();
    expect(mockGetBaseComboList).toBeDefined();
    expect(mockGetBatchTypes).toBeDefined();
  });

  test('検索ボタンが表示されること', async () => {
    render(<BatchResults />);

    await waitFor(() => {
      expect(screen.getByText('検索')).toBeInTheDocument();
    });
  });

  test('検索フォームの要素が表示されること', async () => {
    render(<BatchResults />);

    await waitFor(() => {
      // フォームのラベルが表示されることを確認
      const labels = screen.getAllByText('拠点');
      expect(labels.length).toBeGreaterThan(0);
    });

    expect(screen.getByText('実行開始日')).toBeInTheDocument();
  });
});

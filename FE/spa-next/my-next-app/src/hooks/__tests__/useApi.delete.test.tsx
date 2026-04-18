// Cypress環境でglobal expectがコンフリクトしないよう明示的インポートが必要
import { expect, jest, describe, test, beforeEach } from '@jest/globals';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// any型を避けるための明示的な型定義 - TypeScript strict modeでany使用は推奨されないため
type MockedApiFunction = jest.MockedFunction<(...args: unknown[]) => Promise<{ data: unknown }>>;

// テスト環境で実際のHTTPリクエストを送信しないようモック化 - 外部サーバーに依存すべきでないため
const mockDelete = jest.fn() as MockedApiFunction;

jest.mock('../../api/apiClient', () => ({
  __esModule: true,
  default: {
    delete: mockDelete,
  },
}));

// dynamic importでJestモック制約を回避

// React Query用のテストwrapper - 本番環境のQueryClientと分離してテスト間でキャッシュが共有されないようにするため
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // テスト環境でリトライするとテストが遅くなり結果が予測困難になるため
      },
      mutations: {
        retry: false, // 同上
      },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';

  return TestWrapper;
};

describe('DELETE API機能テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // テスト間でモック状態が漏洩しないよう毎回リセットが必要
  });

  test('useDeleteByIdの基本動作確認', async () => {
    // useDeleteByIdのdynamic importで取得 - static importでJestモックが困難なため
    const { useDeleteById } = await import('../useApi');
    
    const mockResponse = {
      data: { success: true, message: 'ユーザーが削除されました' },
    };
    mockDelete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () => useDeleteById<{ success: boolean; message: string }>('/api/users'),
      { wrapper: createWrapper() }
    );

    result.current.mutate('123');

    // React Queryの非同期処理が完了するまで待機が必要
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 }); // デフォルト1秒では非同期処理が間に合わない場合があるため3秒に設定

    expect(mockDelete).toHaveBeenCalledWith('/api/users/123');

    expect(result.current.data).toEqual({
      success: true,
      message: 'ユーザーが削除されました',
    });
  });

  test('DELETEリクエストでエラーが発生した場合のハンドリング', async () => {
    const { useDeleteById } = await import('../useApi');
    
    const mockError = new Error('削除に失敗しました');
    mockDelete.mockRejectedValueOnce(mockError);

    const { result } = renderHook(
      () => useDeleteById('/api/users'),
      { wrapper: createWrapper() }
    );

    result.current.mutate('123');

    // React Queryはエラー時もstateを更新するため待機が必要
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.error).toEqual(mockError);
  });

  test('adminService useDeleteUserの動作確認', async () => {
    const adminService = await import('../../api/services/v1/adminService');
    
    const mockResponse = {
      data: { success: true, message: 'ユーザーが削除されました' },
    };
    mockDelete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () => adminService.useDeleteUser(),
      { wrapper: createWrapper() }
    );

    result.current.mutate('123');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });

    // adminServiceではuseDeleteByIdを使用するためパスパラメータが自動結合される
    expect(mockDelete).toHaveBeenCalledWith('/admin/user/delete/123');

    expect(result.current.data).toEqual({
      success: true,
      message: 'ユーザーが削除されました',
    });
  });
});
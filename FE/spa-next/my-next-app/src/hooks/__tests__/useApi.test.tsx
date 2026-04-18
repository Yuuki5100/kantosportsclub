import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiMutation, useFetch } from '@/hooks/useApi';
import { expect } from '@jest/globals';

jest.mock('@/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import apiClient from '@/api/apiClient';

// --- 型定義 ---
type PostRequest = { some: string };
type PostResponse = { status: string };
type GetResponse = { message: string };

const mockPostResponse: PostResponse = { status: 'OK' };
const mockGetResponse: GetResponse = { message: 'Success' };

// --- ラッパー ---
const createWrapper = (): React.FC<PropsWithChildren<unknown>> => {
  const queryClient = new QueryClient();

  const Wrapper: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = 'TestQueryWrapper';

  return Wrapper;
};

// --- useFetch テスト ---
describe('useFetch', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should fetch data successfully', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockGetResponse });

    const { result } = renderHook(
      () => useFetch<GetResponse>('testKey', '/api/test', undefined, { useCache: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true); // ← 状態を待ってから
    });

    expect(result.current.data).toEqual(mockGetResponse);
    expect(apiClient.get).toHaveBeenCalledWith('/api/test', { params: undefined });
  });

  it('should handle fetch error', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

    const { result } = renderHook(
      () => useFetch<GetResponse>('testKey', '/api/test', undefined, { useCache: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true); // or: expect(result.current.status).toBe('error')
      },
      { timeout: 2000 }
    );

    expect(apiClient.get).toHaveBeenCalledWith('/api/test', { params: undefined });
  });
});

// --- useApiMutation テスト ---
describe('useApiMutation', () => {
  it('should mutate data successfully', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockPostResponse });

    const { result } = renderHook(
      () => useApiMutation<PostResponse, PostRequest>('post', '/api/success'),
      { wrapper: createWrapper() }
    );

    const request: PostRequest = { some: 'data' };
    const response = await result.current.mutateAsync(request);
    expect(response).toEqual(mockPostResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/api/success', request);
  });

  it('should handle mutation error', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Mutation failed'));

    const { result } = renderHook(
      () => useApiMutation<PostResponse, PostRequest>('post', '/api/error'),
      { wrapper: createWrapper() }
    );

    await expect(result.current.mutateAsync({ some: 'data' })).rejects.toThrow('Mutation failed');
    expect(apiClient.post).toHaveBeenCalledWith('/api/error', { some: 'data' });
  });
});
it('should call API again if useCache is not specified', async () => {
  const spy = jest.fn().mockResolvedValueOnce({ data: mockGetResponse }).mockResolvedValueOnce({ data: mockGetResponse });
  (apiClient.get as jest.Mock) = spy;

  const wrapper = createWrapper();

  const { unmount: unmount1 } = renderHook(
    () => useFetch<GetResponse>('testKey', '/api/test'),
    { wrapper }
  );

  await waitFor(() => {
    expect(spy).toHaveBeenCalledTimes(1);
  });

  unmount1(); // クエリを明示的に破棄

  const { unmount: unmount2 } = renderHook(
    () => useFetch<GetResponse>('testKey', '/api/test'),
    { wrapper }
  );

  await waitFor(() => {
    expect(spy).toHaveBeenCalledTimes(2); // 毎回 fetch
  });

  unmount2();
});

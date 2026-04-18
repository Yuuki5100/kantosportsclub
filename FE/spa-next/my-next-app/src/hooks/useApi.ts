import { useQuery, useMutation, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import type { QueryKey } from '@tanstack/react-query';
import { notifySessionTimeout } from '@/utils/SessionTimeoutProvider';

// デフォルトではキャッシュしない（毎回 refetch 相当）
const queryKeyDefaults: Record<string, QueryOptionsOverrides<unknown>> = {
  // キャッシュしたい key だけここで明示
  // users: {
  //   staleTime: 1000 * 60 * 10,
  //   cacheTime: 1000 * 60 * 15,
  // },
  // reports: {
  //   staleTime: 0,
  //   cacheTime: 0,
  // },
};

type QueryOptionsOverrides<T> = Partial<Pick<
  UseQueryOptions<T, Error, T, QueryKey>,
  'staleTime' | 'enabled' | 'refetchInterval'
>> & {
  cacheTime?: number;
  useCache?: boolean; // ← ★ 新オプション
};

export const useFetch = <T>(
  key: string,
  url: string,
  params?: object,
  optionsOverrides?: QueryOptionsOverrides<T>
): UseQueryResult<T, Error> => {
  const { useCache = false, ...restOverrides } = optionsOverrides ?? {};

  // params が同じなら query key も安定させ、再取得は React Query のオプションで制御する
  const queryKey: QueryKey = [key, params, useCache ? 'cache' : 'no-cache'];

  const baseOptions: QueryOptionsOverrides<T> = {
    staleTime: 0,
    cacheTime: 0,
    ...(queryKeyDefaults[key] as QueryOptionsOverrides<T> | undefined),
  };

  return useQuery<T, Error, T, QueryKey>({
    queryKey,
    queryFn: async (): Promise<T> => {
      try {
        const response = await apiClient.get<T>(url, { params });
        return response.data;
      } catch (error) {
        // エラーがセッションタイムアウトによるものか判定
        // checkSessionTimeout(error);
        notifySessionTimeout(error);
        throw error;
      }
    },
    retry: 1,
    enabled: !!url && url.trim() !== '',
    ...baseOptions,
    ...restOverrides,
  });
};


// API の POST / PUT / DELETE 用のミューテーションフック
export const useApiMutation = <T, V extends object>(
  method: 'post' | 'put',
  url: string,
  options?: UseMutationOptions<T, Error, V, unknown>
): UseMutationResult<T, Error, V, unknown> => {
  return useMutation<T, Error, V, unknown>({
    mutationFn: async (data: V): Promise<T> => {
      const response = await apiClient[method]<T>(url, data);
      return response.data;
    },
    ...options,
  });
};

/**
 * DELETEリクエスト用のフック
 * @param baseUrl
 * @param options
 * @returns
 */
export const useDeleteById = <T = unknown>(
  baseUrl: string,
  options?: UseMutationOptions<T, Error, string, unknown>
): UseMutationResult<T, Error, string, unknown> => {
  return useMutation<T, Error, string, unknown>({
    mutationFn: async (id: string): Promise<T> => {
      const response = await apiClient.delete<T>(`${baseUrl}/${id}`);
      return response.data;
    },
    ...options,
  });
};

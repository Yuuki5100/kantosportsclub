import apiClient from '@/api/apiClient';
import { CRJ_API_ENDPOINTS } from '@/api/crjApiEndpoints';
import { ApiResponse } from '@/types/api';
import { BatchTypeListResponse } from '@/types/CRJ/BatchTypeListResponse';
import { CRJApiResponse } from '@/types/CRJ/CRJApiResponse';

export const getBatchTypes = async (): Promise<CRJApiResponse<BatchTypeListResponse[]>> => {
  try {
    const response = await apiClient.get<CRJApiResponse<BatchTypeListResponse[]>>(
      `${CRJ_API_ENDPOINTS.MASTER.BATCH_TYPE_LIST}`
    );
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
  // return useFetch<BatchTypeResponse>('batch-type',API_ENDPOINTS.BATCH_TYPE);
};

export type BatchTypeResponse = ApiResponse<{ baseList: BatchType[] }>;

export type BatchType = {
  batchName: string;
  displayName: string;
};

import apiClient from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/apiEndpoints';
import { ApiResponse } from '@/types/api';
import { SortDirection } from '@mui/material';

export const getBatchStatus = async (
  req: BatchListRequest
): Promise<BatchListResponse> => {
  let url = `${API_ENDPOINTS.BATCH_LIST}?`;
  if (req.base) {
    url += `base=${req.base}&`;
  }
  if (req.batch) {
    url += `batch=${req.batch}&`;
  }
  if (req.startDate) {
    url += `startDate=${req.startDate}&`;
  }
  if (req.pageNo) {
    url += `pageNo=${req.pageNo}&`;
  }
  if (req.pageSize) {
    url += `pageSize=${req.pageSize}&`;
  }
  if (req.sortKey) {
    url += `sortKey=${req.sortKey}&`;
  }
  if (req.sortOrder) {
    url += `sortOrder=${req.sortOrder}&`;
  }
  if (req.baseExtMatFlag) {
    url += `baseExtMatFlag=${req.baseExtMatFlag}&`;
  }
  if (req.batchExtMatFlag) {
    url += `batchExtMatFlag=${req.batchExtMatFlag}`;
  }
  try {
    const response = await apiClient.get<BatchListResponse>(url);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export type BatchListRequest = {
  base?: string;
  batch?: string;
  startDate?: string;
  pageNo?: number;
  pageSize?: number;
  sortKey?: string;
  sortOrder?: SortDirection | undefined;
  baseExtMatFlag?: boolean;
  batchExtMatFlag?: boolean;
};

export type BatchListResponse = ApiResponse<{ totalCnt: number; baseList: BatchStatus[] }>;

export type BatchStatus = {
  baseCd: string;
  baseName: string;
  batchName: string;
  startDateAndTime: string;
  endDateAndTime: string;
  statusName: string;
  errorMessege: string;
};

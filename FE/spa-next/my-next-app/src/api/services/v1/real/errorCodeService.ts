import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { useFetch, useApiMutation } from "@/hooks/useApi";

export type ErrorCodePayload = {
  code: string;
  message: string;
  locale: string;
};

export type ErrorCodeResponse = {
  data: ErrorCodePayload[];
  success: boolean;
  error?: string;
};

export const useErrorCodeList = () => {
  return useFetch<ErrorCodeResponse>(
    "error-codes",
    API_ENDPOINTS.ERROR_CODES.GET_ALL,
    { limit: 180000 },
    {
      useCache: true,
    }
  );
};

export const useAddErrorCode = () => {
  return useApiMutation<unknown, ErrorCodePayload>("post", API_ENDPOINTS.ERROR_CODES.ADD);
};

export const addErrorCodeApi = async (data: ErrorCodePayload): Promise<void> => {
  await apiService.post(API_ENDPOINTS.ERROR_CODES.ADD, data);
};

export const updateErrorCodeApi = async (code: string, data: ErrorCodePayload): Promise<void> => {
  await apiService.put(`${API_ENDPOINTS.ERROR_CODES.UPDATE}${code}`, data);
};

export const reloadErrorCodesApi = async (): Promise<void> => {
  await apiService.post(API_ENDPOINTS.ERROR_CODES.RELOAD, {});
};

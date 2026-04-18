import { useMutation, useQuery } from "@tanstack/react-query";
import type { ErrorCodePayload, ErrorCodeResponse } from "../real/errorCodeService";
import {
  mockAddErrorCode,
  mockGetErrorCodes,
  mockReloadErrorCodes,
  mockUpdateErrorCode,
} from "@/mocks/errorCode/handlers";

export const useErrorCodeList = () => {
  return useQuery<ErrorCodeResponse, Error>({
    queryKey: ["error-codes", Date.now()],
    queryFn: () => mockGetErrorCodes(),
  });
};

export const useAddErrorCode = () => {
  return useMutation({
    mutationFn: async (data: ErrorCodePayload) => mockAddErrorCode(data),
  });
};

export const addErrorCodeApi = async (data: ErrorCodePayload): Promise<void> => {
  await mockAddErrorCode(data);
};

export const updateErrorCodeApi = async (_code: string, _data: ErrorCodePayload): Promise<void> => {
  await mockUpdateErrorCode();
};

export const reloadErrorCodesApi = async (): Promise<void> => {
  await mockReloadErrorCodes();
};

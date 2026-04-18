import apiClient from '@/api/apiClient';
import { CRJ_API_ENDPOINTS } from '@/api/crjApiEndpoints';
import { ApproverListResponse } from '@/types/CRJ/ApproverResponse';
import { CRJApiResponse } from '@/types/CRJ/CRJApiResponse';
import { handleApiError } from '@/utils/errorHandler';
import { getMessage, MessageCodes } from '@/message';

export const getApprovers = async (
  menuId: string
): Promise<CRJApiResponse<ApproverListResponse>> => {
  try {
    const response = await apiClient.get<CRJApiResponse<ApproverListResponse>>(
      `${CRJ_API_ENDPOINTS.COMMON.APPROVERS}?menuId=${menuId}`
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.FETCH_FAILED, '承認者一覧'));
    throw error;
  }
};

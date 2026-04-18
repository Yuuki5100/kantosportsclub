import apiClient from '@/api/apiClient';
import { CRJ_API_ENDPOINTS } from '@/api/crjApiEndpoints';
import { CRJApiResponse } from '@/types/CRJ/CRJApiResponse';
import { UserListRequest } from '@/types/CRJ/GetUserRequest';
import { UserListResponse } from '@/types/CRJ/UserListResponse';
import { handleApiError } from '@/utils/errorHandler';
import { getMessage, MessageCodes } from '@/message';

export const getUserList = async (req: UserListRequest[]): Promise<CRJApiResponse<UserListResponse[]>> => {
  try {
    const response = await apiClient.post<CRJApiResponse<UserListResponse[]>>(CRJ_API_ENDPOINTS.MASTER.USER, req);
    return response.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.FETCH_FAILED, 'ユーザーリスト'));
    throw error;
  }
};

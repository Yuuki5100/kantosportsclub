import apiClient from '@/api/apiClient';
import { CRJ_API_ENDPOINTS } from '@/api/crjApiEndpoints';
import { BaseComboListResponse } from '@/types/CRJ/BaseComboListResponse';
import { CRJApiResponse } from '@/types/CRJ/CRJApiResponse';

export const getBaseComboList = async (
  searchTargetType: string
): Promise<CRJApiResponse<BaseComboListResponse>> => {
  try {
    const response = await apiClient.get<CRJApiResponse<BaseComboListResponse>>(
      `${CRJ_API_ENDPOINTS.COMMON.BASECOMBOLIST}?searchTargetType=${searchTargetType}`
    );
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};
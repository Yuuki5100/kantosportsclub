import type { ApiResponse } from '@/types/api';
import { handleApiError } from './errorHandler';
import { uploadImportFileWithEndpoint } from '@/api/services/v1/importService';
import { getMessage, MessageCodes } from '@/message';

export const uploadFile = async <T = string>(
  file: File,
  kind: string,
  endpoint: string,
  showSuccess: (msg: string) => void,
  showError: (msg: string) => void,
  onSuccess?: () => void
): Promise<ApiResponse<T>> => {
  try {
    const result = (await uploadImportFileWithEndpoint(endpoint, file, kind)) as ApiResponse<T>;

    if (result.success) {
      showSuccess(
        typeof result.data === 'string' && result.data.trim() !== ''
          ? result.data
          : getMessage(MessageCodes.UPLOAD_SUCCESS)
      );
      onSuccess?.();
      return {
        success: true,
        data: result.data,
        error: null,
      };
    } else {
      const errors: string[] = Array.isArray(result.error)
        ? result.error
        : typeof result.error === 'object' && result.error !== null && 'message' in result.error
          ? [(result.error as { message: string }).message]
          : [String(result.error ?? getMessage(MessageCodes.UPLOAD_FAILED))];

      errors.forEach(showError);

      return {
        success: false,
        data: null as unknown as T,
        error: result.error,
      };
    }
  } catch (error) {
    let errorMessage: string | null = getMessage(MessageCodes.COMMUNICATION_ERROR_UNKNOWN);

    try {
      handleApiError(error, getMessage(MessageCodes.UPLOAD_FAILED));
      errorMessage = null; // 例外なし → showError 呼ばない
    } catch (e) {
      errorMessage = e instanceof Error ? `🚨 ${e.message}` : getMessage(MessageCodes.COMMUNICATION_ERROR_UNKNOWN);
    }

    if (errorMessage) {
      showError(errorMessage);
    }

    return {
      success: false,
      data: null as unknown as T,
      error: errorMessage,
    };
  }
};

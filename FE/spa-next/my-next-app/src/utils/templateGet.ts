import { handleApiError, isApiError } from './errorHandler';
import { initialTemplateSchema, TemplateSchemaFromYAML } from '@/utils/file';
import { getTemplateSchemaByEndpoint } from '@/api/services/v1/importService';
import { getMessage, MessageCodes } from '@/message';

export const templateGet = async (
  endpoint: string,
  kind: string,
  showSuccess: (msg: string) => void,
  showError: (msg: string, index?: number, all?: string[]) => void,
  onSuccess?: () => void
): Promise<TemplateSchemaFromYAML> => {
  try {
    const result = await getTemplateSchemaByEndpoint(endpoint, kind);

    if (result.success) {
      showSuccess(getMessage(MessageCodes.TEMPLATE_FETCH_SUCCESS));
      onSuccess?.();
      return result.data[kind];
    } else {
      const messages = Array.isArray(result.error)
        ? result.error
        : [
            isApiError(result.error)
              ? result.error.message
              : getMessage(MessageCodes.TEMPLATE_FETCH_FAILED),
          ];
      messages.forEach((msg, i, arr) => showError(msg, i, arr)); // ← 修正ポイント
      return initialTemplateSchema;
    }
  } catch (error) {
    try {
      handleApiError(error, getMessage(MessageCodes.TEMPLATE_FETCH_FAILED));
    } catch (e) {
      const msg = e instanceof Error ? `🚨 ${e.message}` : getMessage(MessageCodes.COMMUNICATION_ERROR_UNKNOWN);
      showError(msg);
      return initialTemplateSchema;
    }
    return initialTemplateSchema;
  }
};

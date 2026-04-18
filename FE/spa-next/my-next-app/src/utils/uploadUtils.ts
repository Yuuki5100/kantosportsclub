// uploadUtils.ts
import type { ApiResponse } from '@/types/api';
import type { HeaderDefinition, FileType } from '@/utils/file';
import { handleApiError } from './errorHandler';
import { uploadImportFileWithEndpoint } from '@/api/services/v1/importService';
import {
  validateFileHeaders,
  validateCsvRows,
  validateExcelWorkbook
  , // ← 追加
} from '@/utils/file';
import { resolveSchema } from '@/utils/cache/cacheUtils';
import { isApiError } from '@utils/errorHandler';
import { getMessage, MessageCodes } from '@/message';

type UploadOptions = {
  endpoint: string;
  file: File;
  kind: string;
  t: Record<string, string>;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  onSuccess?: () => void;
  validate?: boolean;
};

/**
 * ファイルアップロードを行う。アップロード前にヘッダーと行のバリデーションを実施する。
 * Excelファイルは複数シート対応。最初にエラーのあったシートで処理中断。
 */
export const uploadFileWithHandler = async ({
  endpoint,
  file,
  kind,
  t,
  showSuccess,
  showError,
  onSuccess,
  validate = true,
}: UploadOptions): Promise<void> => {
  const fileType: FileType = file.name.endsWith('.csv') ? 'csv' : 'excel';

  const headerRowIndex = 0;
  const maxRows = 1000;

  let schema: HeaderDefinition[];
  try {
    schema = resolveSchema(kind);
  } catch (e) {
    showError((e as Error).message);
    return;
  }

  if (validate) {
    const expectedHeaders = schema.map((s) => s.field);

    if (fileType === 'csv') {
      const headerErrors = await validateFileHeaders(
        file,
        'csv',
        { expectedHeaders, headerRowIndex, maxRows },
        t
      );

      if (headerErrors) {
        headerErrors.forEach(showError);
        return;
      }

      const rowResult = await validateCsvRows(file, schema, ',', maxRows, t);

      if (rowResult.errors.length > 0) {
        rowResult.errors.forEach(showError);
        rowResult.warnings.forEach(showError);
        return;
      }

      rowResult.warnings.forEach(showError);
    } else {
      // Excel: validateExcelWorkbook による複数シート検証
      const results = await validateExcelWorkbook(file, schema, expectedHeaders, maxRows, t, headerRowIndex);
      const firstResult = results[0];

      if (firstResult.headerErrors) {
        firstResult.headerErrors.forEach(showError);
        return;
      }

      const rowValidation = firstResult.rowValidation;
      if (rowValidation?.errors.length) {
        rowValidation.errors.forEach(showError);
        rowValidation.warnings.forEach(showError);
        return;
      }

      rowValidation?.warnings.forEach(showError);
    }
  }

  try {
    const result = (await uploadImportFileWithEndpoint(endpoint, file, kind)) as ApiResponse<string>;

    if (result.success) {
      const message =
        typeof result.data === 'string'
          ? result.data
          : t['upload_success'] || getMessage(MessageCodes.UPLOAD_SUCCESS);
      showSuccess(message);
      onSuccess?.();
    } else {
      const messages = Array.isArray(result.error)
        ? result.error
        : [
            isApiError(result.error)
              ? result.error.message
              : t['upload_failed'] || getMessage(MessageCodes.UPLOAD_FAILED),
          ];
      messages.forEach(showError);
    }
  } catch (error: unknown) {
    try {
      handleApiError(error, t['upload_error'] || getMessage(MessageCodes.UPLOAD_FAILED));
    } catch (e) {
      showError(e instanceof Error ? `🚨 ${e.message}` : getMessage(MessageCodes.COMMUNICATION_ERROR_UNKNOWN));
    }
  }
};

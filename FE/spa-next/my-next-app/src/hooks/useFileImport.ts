// src/hooks/useFileImport.ts
import {
  validateFileHeaders,
  validateCsvRows,
  validateExcelRows,
  FileType,
} from '@/utils/file';
import { useSnackbar } from '@/hooks/useSnackbar';
import { ApiResponse } from '@/types/api';
import { JobStatus } from '@/types/job';
import type { HeaderDefinition } from '@/utils/file';
import { useValidationLang } from '@/hooks/useValidationLang';
import { resolveSchema } from '@/utils/cache/cacheUtils';
import { uploadImportFile, useImportHistory } from '@/api/services/v1/importService';
import { getMessage, MessageCodes } from '@/message';

export const useFileImport = () => {
  const { showSnackbar } = useSnackbar();
  const t = useValidationLang(); // ✅ 多言語辞書取得

  const { data: historyResponse, refetch: fetchHistory } = useImportHistory();
  const history: JobStatus[] = Array.isArray(historyResponse?.data) ? historyResponse?.data ?? [] : [];

  /**
   * ファイルアップロード処理（バリデーション含む）
   *
   * @param file - アップロード対象のファイル
   * @param kind - スキーマ識別キー（例: 'users', 'orders'）
   */
  const uploadFile = async (file: File | null, kind?: string): Promise<void> => {
    if (!file) {
      showSnackbar(t.FILE_REQUIRED, 'ALERT');
      return;
    }

    if (!kind) {
      showSnackbar(t.KIND_REQUIRED || getMessage(MessageCodes.KIND_REQUIRED_MISSING), 'ALERT');
      return;
    }

    const fileType: FileType = file.name.endsWith('.csv') ? 'csv' : 'excel';
    const headerRowIndex = 0;
    const maxRows = 1000;

    let schema: HeaderDefinition[];
    try {
      schema = resolveSchema(kind);
    } catch (e) {
      showSnackbar((e as Error).message, 'ALERT');
      return;
    }

    // ✅ ヘッダー検証
    const headerErrors = await validateFileHeaders(file, fileType, {
      expectedHeaders: schema.map((s) => s.field),
      headerRowIndex,
      maxRows,
    }, t);

    if (headerErrors) {
      headerErrors.forEach((msg) => showSnackbar(msg, 'ALERT'));
      return;
    }

    // ✅ 行バリデーション
    const rowResult =
      fileType === 'csv'
        ? await validateCsvRows(file, schema, ',', maxRows, t)
        : await validateExcelRows(file, schema, headerRowIndex, maxRows, t);

    if (rowResult.errors.length > 0) {
      rowResult.errors.forEach((msg) => showSnackbar(msg, 'ALERT'));
      rowResult.warnings.forEach((msg) => showSnackbar(msg, 'ALERT'));
      return;
    }

    rowResult.warnings.forEach((msg) => showSnackbar(msg, 'ALERT'));

    // ✅ アップロード送信
    try {
      const result = await uploadImportFile(file, kind) as ApiResponse<string>;

      if (result.success) {
        const message =
          typeof result.data === 'string'
            ? result.data
            : t.UPLOAD_SUCCESS || getMessage(MessageCodes.UPLOAD_SUCCESS);
        showSnackbar(message, 'SUCCESS');
        fetchHistory();
      } else {
        const err = result.error;
        if (Array.isArray(err)) {
          err.forEach((msg) => showSnackbar(msg, 'ALERT'));
        } else if (typeof err === 'string') {
          showSnackbar(err, 'ALERT');
        } else if (err && typeof err === 'object' && 'message' in err) {
          showSnackbar(err.message, 'ALERT');
        } else {
          showSnackbar(t.UNKNOWN_ERROR || getMessage(MessageCodes.UPLOAD_FAILED), 'ALERT');
        }
      }
    } catch (e: unknown) {
      const detail = `${t.NETWORK_ERROR || getMessage(MessageCodes.NETWORK_ERROR_LABEL)}: ${
        e instanceof Error ? e.message : getMessage(MessageCodes.UNEXPECTED_ERROR)
      }`;
      showSnackbar(
        getMessage(MessageCodes.ERROR_OCCURRED_WITH_DETAIL, detail),
        'ALERT'
      );
    }
  };

  return {
    uploadFile,
    history,
    fetchHistory,
  };
};

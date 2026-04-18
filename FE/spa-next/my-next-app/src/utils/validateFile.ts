// src/utils/validateFile.ts
import { validateFileHeaders } from './file/validators/validateFileHeaders';
import type { FileType, HeaderValidationOptions } from './file/types';

export const validateFile = async (
  file: File,
  kind: string,
  t: Record<string, string>,
  showError: (msg: string) => void,
  // DI 用に関数を外部から渡せるようにする（テスト用）
  validateFileHeadersFn: (
    file: File,
    fileType: FileType,
    options: HeaderValidationOptions,
    t: Record<string, string>
  ) => Promise<string[] | null> = validateFileHeaders
) => {
  const options: HeaderValidationOptions = {
    expectedHeaders: [], // 必要に応じて設定
  };

  const errors = await validateFileHeadersFn(file, kind as FileType, options, t);

  if (errors?.length) {
    showError(errors[0]);
    return false;
  }

  return true;
};

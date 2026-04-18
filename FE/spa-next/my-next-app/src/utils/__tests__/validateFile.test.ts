// src/utils/__tests__/validateFile.test.ts
import { jest } from '@jest/globals';
import type { FileType, HeaderValidationOptions } from '@/utils/file';

describe('validateFile', () => {
  let validateFileModule: typeof import('@/utils/validateFile');

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    validateFileModule = await import('@/utils/validateFile');
  });

  it('CSVヘッダーエラー時は showError 呼び出しで中断', async () => {
    const showError = jest.fn();
    const t = { error1: 'エラー1' };
    const kind = 'csv';
    const file = new File(['dummy content'], 'file.csv', { type: 'text/csv' });

    // ✅ モック関数を作る
    const validateFileHeadersMock = jest.fn(async () => ['ヘッダーエラー']);

    // DI でモック関数を渡す
    const result = await validateFileModule.validateFile(
      file,
      kind,
      t,
      showError,
      validateFileHeadersMock
    );

    // ✅ モックが呼ばれたことを検証
    expect(validateFileHeadersMock).toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith('ヘッダーエラー');
    expect(result).toBe(false);
  });

  it('ヘッダーエラーなしの場合は showError 呼ばれず true を返す', async () => {
    const showError = jest.fn();
    const t = { error1: 'エラー1' };
    const kind = 'csv';
    const file = new File(['dummy content'], 'file.csv', { type: 'text/csv' });

    const validateFileHeadersMock = jest.fn(async () => null);

    const result = await validateFileModule.validateFile(
      file,
      kind,
      t,
      showError,
      validateFileHeadersMock
    );

    expect(validateFileHeadersMock).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

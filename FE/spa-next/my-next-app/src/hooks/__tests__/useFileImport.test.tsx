// src/hooks/__tests__/useFileImport.test.ts
import { FileType, HeaderValidationOptions } from '@/utils/file/types';
import { expect, jest } from '@jest/globals';

const mockShowSnackbar = jest.fn();
const mockUseImportHistory = jest.fn();
const mockUploadImportFile = jest.fn();

jest.mock('@/hooks/useSnackbar', () => ({
  __esModule: true,
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}));

jest.mock('@/api/services/v1/importService', () => ({
  __esModule: true,
  useImportHistory: mockUseImportHistory,
  uploadImportFile: mockUploadImportFile,
}));

jest.mock('@/utils/cache/cacheUtils', () => ({
  __esModule: true,
  resolveSchema: jest.fn(),
}));

jest.mock('@/utils/file', () => ({
  __esModule: true,
  validateFileHeaders: jest.fn(),
  validateCsvRows: jest.fn(),
  validateExcelRows: jest.fn(),
}));

jest.mock('@/hooks/useValidationLang', () => ({
  __esModule: true,
  useValidationLang: () => ({
    FILE_REQUIRED: 'ファイル必須',
    KIND_REQUIRED: '種別必須',
    UPLOAD_SUCCESS: 'アップロード成功',
    NETWORK_ERROR: 'ネットワークエラー',
    UNKNOWN_ERROR: '不明なエラー',
  }),
}));

describe('useFileImport (ESM dynamic import)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseImportHistory.mockReturnValue({
      data: { data: [] },
      refetch: jest.fn(),
    });
    mockUploadImportFile.mockResolvedValue({ success: true, data: 'ok', error: null });
  });

  it('should show error when file is null', async () => {
    const { useFileImport } = await import('@/hooks/useFileImport');
    const { uploadFile } = useFileImport();
    await uploadFile(null, 'users');
    expect(mockShowSnackbar).toHaveBeenCalledWith('ファイル必須', 'ALERT');
  });

  it('should show error when kind is undefined', async () => {
    const { useFileImport } = await import('@/hooks/useFileImport');
    const { uploadFile } = useFileImport();
    const dummyFile = new File(['test'], 'dummy.csv', { type: 'text/csv' });
    await uploadFile(dummyFile, undefined);
    expect(mockShowSnackbar).toHaveBeenCalledWith('種別必須', 'ALERT');
  });

  it('should show error when resolveSchema throws', async () => {
    const { resolveSchema } = await import('@/utils/cache/cacheUtils');
    const mockResolveSchema = resolveSchema as jest.Mock;
    mockResolveSchema.mockImplementation(() => {
      throw new Error('スキーマエラー');
    });

    const { useFileImport } = await import('@/hooks/useFileImport');
    const { uploadFile } = useFileImport();
    const dummyFile = new File(['test'], 'dummy.csv', { type: 'text/csv' });
    await uploadFile(dummyFile, 'users');
    expect(mockShowSnackbar).toHaveBeenCalledWith('スキーマエラー', 'ALERT');
  });

  it('should show header validation errors if present', async () => {
    const { resolveSchema } = await import('@/utils/cache/cacheUtils');
    const { validateFileHeaders } = await import('@/utils/file');

    const mockResolveSchema = resolveSchema as jest.Mock;
    mockResolveSchema.mockReturnValue([{ field: 'name' }]);

    const mockValidateFileHeaders = validateFileHeaders as jest.MockedFunction<
      (file: File, fileType: FileType, options: HeaderValidationOptions, lang: Record<string, string>) => Promise<string[] | null>
    >;
    mockValidateFileHeaders.mockResolvedValue(['ヘッダーエラー']);

    const { useFileImport } = await import('@/hooks/useFileImport');
    const { uploadFile } = useFileImport();
    const dummyFile = new File(['test'], 'dummy.csv', { type: 'text/csv' });

    await uploadFile(dummyFile, 'users');
    expect(mockShowSnackbar).toHaveBeenCalledWith('ヘッダーエラー', 'ALERT');
  });

  it('should show row validation errors and warnings if present', async () => {
    const { resolveSchema } = await import('@/utils/cache/cacheUtils');
    const { validateFileHeaders, validateCsvRows } = await import('@/utils/file');

    const mockResolveSchema = resolveSchema as jest.Mock;
    mockResolveSchema.mockReturnValue([{ field: 'name' }]);

    const mockValidateFileHeaders = validateFileHeaders as jest.MockedFunction<
      (file: File, fileType: FileType, options: HeaderValidationOptions, lang: Record<string, string>) => Promise<string[] | null>
    >;
    mockValidateFileHeaders.mockResolvedValue(null);

    const mockValidateCsvRows = validateCsvRows as jest.MockedFunction<typeof validateCsvRows>;

    mockValidateCsvRows.mockResolvedValue({
      errors: ['行エラー'],
      warnings: ['警告'],
    });

    const { useFileImport } = await import('@/hooks/useFileImport');
    const { uploadFile } = useFileImport();
    const dummyFile = new File(['test'], 'dummy.csv', { type: 'text/csv' });

    await uploadFile(dummyFile, 'users');

    expect(mockShowSnackbar).toHaveBeenCalledWith('行エラー', 'ALERT');
    expect(mockShowSnackbar).toHaveBeenCalledWith('警告', 'ALERT');
  });

  it('should handle unknown exception during API call', async () => {
    const { resolveSchema } = await import('@/utils/cache/cacheUtils');
    const { validateFileHeaders, validateCsvRows } = await import('@/utils/file');
    const mockResolveSchema = resolveSchema as jest.Mock;
    mockResolveSchema.mockReturnValue([{ field: 'name' }]);
    const mockValidateFileHeaders = validateFileHeaders as jest.MockedFunction<
      (file: File, fileType: FileType, options: HeaderValidationOptions, lang: Record<string, string>) => Promise<string[] | null>
    >;
    const mockValidateCsvRows = validateCsvRows as jest.MockedFunction<typeof validateCsvRows>;
    mockValidateFileHeaders.mockResolvedValue(null);
    mockValidateCsvRows.mockResolvedValue({ errors: [], warnings: [] });

    mockUploadImportFile.mockRejectedValue(new Error('通信失敗'));

    const { useFileImport } = await import('@/hooks/useFileImport');
    const { uploadFile } = useFileImport();
    const dummyFile = new File(['test'], 'dummy.csv', { type: 'text/csv' });
    await uploadFile(dummyFile, 'users');

    expect(mockShowSnackbar).toHaveBeenCalledWith('エラーが発生しました: ネットワークエラー: 通信失敗', 'ALERT');
  });
});

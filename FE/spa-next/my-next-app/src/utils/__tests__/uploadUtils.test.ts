import { expect, jest } from '@jest/globals';
import type { FileType, HeaderDefinition, HeaderValidationOptions } from '@/utils/file';
import type { RowValidationResult } from '@/utils/file/types';

jest.mock('@/api/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn() as unknown as jest.Mock<
      (url: string, body?: any, config?: any) => Promise<{ data: any }>
    >,
  },
}));

jest.mock('@/utils/errorHandler', () => ({
  showError: jest.fn(),
  handleApiError: jest.fn(),
}));

jest.mock('@/utils/file', () => {
  // 型キャストして spread 可能にする
  const actual = jest.requireActual('@/utils/file') as typeof import('@/utils/file');
  return {
    ...actual,
    validateFileHeaders: jest.fn(),
    validateCsvRows: jest.fn(),
    validateExcelWorkbook: jest.fn(),
  };
});

jest.mock('@/utils/cache/cacheUtils', () => ({
  setTemplateSchemaCache: jest.fn(),
  getOrFetchTemplateSchema: jest.fn(),
  clearTemplateSchemaCache: jest.fn(),
  getCachedTemplateSchema: jest.fn(),
  resolveSchema: jest.fn(),
}));

describe('uploadFileWithHandler', () => {
  let apiClient: {
    post: jest.Mock<(url: string, body?: any, config?: any) => Promise<{ data: any }>>;
  };
  let cacheUtils: typeof import('@/utils/cache/cacheUtils');
  let validateFileHeaders: typeof import('@/utils/file').validateFileHeaders;
  let validateCsvRows: typeof import('@/utils/file').validateCsvRows;
  let validateExcelWorkbook: typeof import('@/utils/file').validateExcelWorkbook;
  let handleApiError: typeof import('@/utils/errorHandler').handleApiError;
  let uploadFileWithHandler: typeof import('@/utils/uploadUtils').uploadFileWithHandler;

  const showSuccess = jest.fn();
  const onSuccess = jest.fn();
  const showError = jest.fn();
  const t = { upload_success: '成功', upload_failed: '失敗', upload_error: '通信エラー' };
  const endpoint = '/api/upload';
  const kind = 'testKind';

  beforeEach(async () => {
    jest.clearAllMocks();

    const apiClientModule = await import('@/api/apiClient');
    apiClient = apiClientModule.default as unknown as typeof apiClient;

    cacheUtils = await import('@/utils/cache/cacheUtils');
    validateFileHeaders = (await import('@/utils/file')).validateFileHeaders;
    validateCsvRows = (await import('@/utils/file')).validateCsvRows;
    validateExcelWorkbook = (await import('@/utils/file')).validateExcelWorkbook;
    handleApiError = (await import('@/utils/errorHandler')).handleApiError;
    uploadFileWithHandler = (await import('@/utils/uploadUtils')).uploadFileWithHandler;
  });

  const createFile = (name: string) => new File(['dummy content'], name, { type: 'text/plain' });

  it('スキーマ解決失敗時はshowErrorを呼び処理中断', async () => {
    (cacheUtils.resolveSchema as jest.Mock).mockImplementation(() => { throw new Error('スキーマが見つかりません'); });

    await uploadFileWithHandler({
      endpoint,
      file: createFile('file.csv'),
      kind,
      t,
      showSuccess,
      showError,
      onSuccess,
    });

    expect(cacheUtils.resolveSchema).toHaveBeenCalledWith(kind);
    expect(showError).toHaveBeenCalledWith('スキーマが見つかりません');
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it('validateFileHeadersがエラーを返した場合はshowError呼び出しで中断', async () => {
    (cacheUtils.resolveSchema as jest.Mock).mockReturnValue([{ field: 'jems', required: false, type: 'string', repository: '' }]);
    (validateFileHeaders as jest.MockedFunction<typeof validateFileHeaders>).mockResolvedValue(['ヘッダーエラー']);

    await uploadFileWithHandler({
      endpoint,
      file: createFile('file.csv'),
      kind,
      t,
      showSuccess,
      showError,
      onSuccess,
    });

    expect(showError).toHaveBeenCalledWith(
      'ヘッダーエラー',
      expect.any(Number),
      expect.any(Array)
    );
  });

  it('Excelファイルの行バリデーションでエラーがあればshowError呼び出しで中断', async () => {
    (cacheUtils.resolveSchema as jest.Mock).mockReturnValue([{ field: 'name', required: false, type: 'string', repository: '' }]);
    (validateExcelWorkbook as jest.MockedFunction<typeof validateExcelWorkbook>).mockResolvedValue([
      {
        headerErrors: undefined,
        rowValidation: { errors: ['行エラーExcel'], warnings: ['警告Excel'] } as RowValidationResult,
        sheetName: ''
      },
    ]);

    await uploadFileWithHandler({
      endpoint,
      file: createFile('file.xlsx'),
      kind,
      t,
      showSuccess,
      showError,
      onSuccess,
    });

    expect(validateExcelWorkbook).toHaveBeenCalled();
    expect(showError).toHaveBeenNthCalledWith(1, '行エラーExcel', 0, ['行エラーExcel']);
    expect(showError).toHaveBeenNthCalledWith(2, '警告Excel', 0, ['警告Excel']);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('行エラーなし警告のみの時は警告をshowErrorで通知しアップロード実行', async () => {
    (cacheUtils.resolveSchema as jest.Mock).mockReturnValue([{ field: 'name', required: false, type: 'string', repository: '' }]);
    (validateFileHeaders as jest.MockedFunction<typeof validateFileHeaders>).mockResolvedValue(null);
    (validateCsvRows as jest.MockedFunction<typeof validateCsvRows>).mockResolvedValue({ errors: [], warnings: ['警告のみ'] } as RowValidationResult);
    apiClient.post.mockResolvedValue({ data: { success: true, data: '成功メッセージ' } });

    await uploadFileWithHandler({
      endpoint,
      file: createFile('file.csv'),
      kind,
      t,
      showSuccess,
      showError,
      onSuccess,
    });

    expect(showError).toHaveBeenCalledWith("警告のみ", 0, ["警告のみ"]);
    expect(onSuccess).toHaveBeenCalled();
  });

  it('アップロード成功時はshowSuccessとonSuccessを呼ぶ', async () => {
    (cacheUtils.resolveSchema as jest.Mock).mockReturnValue([{ field: 'name', required: false, type: 'string', repository: '' }]);
    (validateFileHeaders as jest.MockedFunction<typeof validateFileHeaders>).mockResolvedValue(null);
    (validateCsvRows as jest.MockedFunction<typeof validateCsvRows>).mockResolvedValue({ errors: [], warnings: [] } as RowValidationResult);
    apiClient.post.mockResolvedValue({ data: { success: true, data: 'アップロード成功！' } });

    await uploadFileWithHandler({
      endpoint,
      file: createFile('file.csv'),
      kind,
      t,
      showSuccess,
      showError,
      onSuccess,
    });

    expect(showSuccess).toHaveBeenCalledWith('アップロード成功！');
    expect(onSuccess).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
  });

  it('アップロード失敗時はエラー内容に応じてshowErrorを呼ぶ', async () => {
    (cacheUtils.resolveSchema as jest.Mock).mockReturnValue([{ field: 'name', required: false, type: 'string', repository: '' }]);
    (validateFileHeaders as jest.MockedFunction<typeof validateFileHeaders>).mockResolvedValue(null);
    (validateCsvRows as jest.MockedFunction<typeof validateCsvRows>).mockResolvedValue({ errors: [], warnings: [] } as RowValidationResult);
    apiClient.post.mockResolvedValue({ data: { success: false, error: ['アップロード失敗エラー'] } });

    await uploadFileWithHandler({
      endpoint,
      file: createFile('file.csv'),
      kind,
      t,
      showSuccess,
      showError,
    });

    expect(showError).toHaveBeenCalledWith("アップロード失敗エラー", 0, ["アップロード失敗エラー"]);
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it('例外発生時にhandleApiErrorが例外を投げるパターン', async () => {
    const thrownError = new Error('handleApiError例外');
    (cacheUtils.resolveSchema as jest.Mock).mockReturnValue([{ field: 'name', required: false, type: 'string', repository: '' }]);
    (validateFileHeaders as jest.MockedFunction<typeof validateFileHeaders>).mockResolvedValue(null);
    (validateCsvRows as jest.MockedFunction<typeof validateCsvRows>).mockResolvedValue({ errors: [], warnings: [] } as RowValidationResult);
    apiClient.post.mockRejectedValue(new Error('通信エラー'));
    (handleApiError as unknown as jest.Mock).mockImplementation(() => { throw thrownError; });

    await uploadFileWithHandler({
      endpoint,
      file: createFile('file.csv'),
      kind,
      t,
      showSuccess,
      showError,
    });

    expect(handleApiError).toHaveBeenCalled();
  });
});

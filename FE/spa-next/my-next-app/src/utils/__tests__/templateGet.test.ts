import { expect, jest, describe, it, beforeEach } from '@jest/globals';

// モックはファイル最上部に
jest.mock('@/api/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn() as unknown as jest.Mock<
      (url: string, body?: any, config?: any) => Promise<{ data: any }>
    >,
  },
}));

jest.mock('../errorHandler', () => ({
  __esModule: true,
  handleApiError: jest.fn(),
  isApiError: jest.fn(),
}));

describe('templateGet', () => {
  let templateGet: typeof import('../templateGet').templateGet;
  let apiClient: {
    post: jest.Mock<(url: string, body?: any, config?: any) => Promise<{ data: any }>>;
  };
  let handleApiError: jest.Mock;
  let isApiError: jest.Mock;
  let initialTemplateSchema: any;

  const showSuccess = jest.fn();
  const showError = jest.fn();
  const onSuccess = jest.fn();
  const endpoint = '/some/endpoint';
  const kind = 'testKind';

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    const apiClientModule = await import('@/api/apiClient');
    apiClient = apiClientModule.default as unknown as typeof apiClient;

    const errorHandlerModule = await import('../errorHandler');
    handleApiError = errorHandlerModule.handleApiError as unknown as jest.Mock;
    isApiError = errorHandlerModule.isApiError as unknown as jest.Mock;

    const templateGetModule = await import('../templateGet');
    templateGet = templateGetModule.templateGet;

    const utilsModule = await import('@/utils/file');
    initialTemplateSchema = utilsModule.initialTemplateSchema;
  });

  it('成功時: showSuccessとonSuccessを呼び、データを返す', async () => {
    const fakeData = { [kind]: { foo: 'bar' } };
    apiClient.post.mockResolvedValue({
      data: {
        success: true,
        data: fakeData,
      },
    });

    const result = await templateGet(endpoint, kind, showSuccess, showError, onSuccess);

    expect(apiClient.post).toHaveBeenCalledWith(endpoint, null, {
      headers: { 'Content-Type': 'text/plain' },
      params: { templateId: kind },
    });
    expect(showSuccess).toHaveBeenCalledWith('テンプレートの取得が完了しました。');
    expect(onSuccess).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
    expect(result).toEqual(fakeData[kind]);
  });

  it('失敗時（配列エラー）: showErrorを複数回呼び、初期スキーマを返す', async () => {
    const errors = ['エラー1', 'エラー2'];
    apiClient.post.mockResolvedValue({
      data: {
        success: false,
        error: errors,
        data: {},
      },
    });

    const result = await templateGet(endpoint, kind, showSuccess, showError);

    expect(showSuccess).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledTimes(errors.length);
    expect(showError).toHaveBeenNthCalledWith(1, 'エラー1', 0, errors);
    expect(showError).toHaveBeenNthCalledWith(2, 'エラー2', 1, errors);
    expect(result).toEqual(initialTemplateSchema);
  });

  it('失敗時（オブジェクトエラー）: showErrorを1回呼び、初期スキーマを返す', async () => {
    const errorObj = { code: 'E001', message: 'エラーメッセージ' };
    const arr = ['エラーメッセージ'];
    isApiError.mockReturnValue(true); // ← ここが重要

    apiClient.post.mockResolvedValue({
      data: {
        success: false,
        error: errorObj,
        data: {},
      },
    });

    const result = await templateGet(endpoint, kind, showSuccess, showError);

    expect(showError).toHaveBeenNthCalledWith(1, 'エラーメッセージ', 0, arr);
    expect(result).toEqual(initialTemplateSchema);
  });

  it('失敗時（不明なエラー形式）: showErrorを1回呼び、初期スキーマを返す', async () => {
    isApiError.mockReturnValue(false); // ← 不明形式として扱わせる
    apiClient.post.mockResolvedValue({
      data: {
        success: false,
        error: null,
        data: {},
      },
    });

    const result = await templateGet(endpoint, kind, showSuccess, showError);
    const arr = ['テンプレート取得に失敗しました'];

    expect(showError).toHaveBeenCalledWith('テンプレート取得に失敗しました', 0, arr);
    expect(result).toEqual(initialTemplateSchema);
  });

  it('例外発生時: handleApiError呼び出し→例外キャッチしshowError呼び出し', async () => {
    const thrownError = new Error('ハンドルAPIエラー');
    apiClient.post.mockRejectedValue(new Error('通信エラー'));
    handleApiError.mockImplementation(() => {
      throw thrownError;
    });

    const result = await templateGet(endpoint, kind, showSuccess, showError);

    expect(handleApiError).toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith(`🚨 ${thrownError.message}`);
    expect(result).toEqual(initialTemplateSchema);
  });

  it('例外発生時: handleApiErrorが例外を投げない場合の戻り値', async () => {
    apiClient.post.mockRejectedValue(new Error('通信エラー'));
    handleApiError.mockImplementation(() => {
      // 例外を投げない
    });

    const result = await templateGet(endpoint, kind, showSuccess, showError);

    expect(handleApiError).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
    expect(result).toEqual(initialTemplateSchema);
  });
});

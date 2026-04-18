// jest.mockはトップレベルに残す（jestがモジュール全体をモックするため）
jest.mock('@/api/apiClient', () => ({
  __esModule: true,
  default: {
    // post は (url: string, body?: any, config?: any) => Promise<{ data: any }>
    post: jest.fn() as unknown as jest.Mock<
      (url: string, body?: any, config?: any) => Promise<{ data: any }>
    >,
  },
}));

jest.mock('@/utils/errorHandler');

import { expect, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-hooks'; // 必要ならインポート

describe('uploadFile', () => {
  let uploadFile: typeof import('../uploadFile').uploadFile;
  let apiClient: {
    post: jest.Mock<
      (url: string, body?: any, config?: any) => Promise<{ data: any }>
    >
  };
  let handleApiError: jest.Mock;

  const showSuccess = jest.fn();
  const showError = jest.fn();
  const onSuccess = jest.fn();
  const endpoint = '/upload/endpoint';
  const kind = 'testKind';
  const file = new File(['file content'], 'test.txt', { type: 'text/plain' });

  beforeEach(async () => {
    jest.clearAllMocks();

    // dynamic importでモジュールを取得
    const uploadModule = await import('../uploadFile');
    uploadFile = uploadModule.uploadFile;

    const apiClientModule = await import('@/api/apiClient');
    apiClient = apiClientModule.default as unknown as typeof apiClient;

    const errorHandlerModule = await import('@/utils/errorHandler');
    handleApiError = errorHandlerModule.handleApiError as unknown as jest.Mock;
  });

  it('成功時: showSuccessとonSuccessが呼ばれる', async () => {
    apiClient.post.mockResolvedValue({
      data: { success: true, data: 'アップロード成功メッセージ' },
    });

    await uploadFile(file, kind, endpoint, showSuccess, showError, onSuccess);

    expect(apiClient.post).toHaveBeenCalled();
    expect(showSuccess).toHaveBeenCalledWith('アップロード成功メッセージ');
    expect(onSuccess).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
  });

  it('成功時: dataが空の場合はデフォルトメッセージでshowSuccess呼び出し', async () => {
    apiClient.post.mockResolvedValue({
      data: { success: true, data: '' },
    });

    await uploadFile(file, kind, endpoint, showSuccess, showError);

    expect(showSuccess).toHaveBeenCalledWith('アップロードが完了しました。');
  });

  it('失敗時（配列エラー）: showErrorが複数回呼ばれる', async () => {
    const errors = [
      { code: 'E001', message: 'エラー1' },
      { code: 'E002', message: 'エラー2' }
    ];
    const arr = ["エラー1", "エラー2"];

    apiClient.post.mockResolvedValue({
      data: { success: false, error: arr },
    });

    await uploadFile(file, kind, endpoint, showSuccess, showError);

    expect(showError).toHaveBeenCalledTimes(errors.length);
    expect(showError).toHaveBeenNthCalledWith(1, "エラー1", 0, arr);
    expect(showError).toHaveBeenNthCalledWith(2, "エラー2", 1, arr);
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it('失敗時（オブジェクトエラー）: showErrorが1回呼ばれる', async () => {
    const errorObj = { code: 'E001', message: 'エラーメッセージ' };

    apiClient.post.mockResolvedValue({
      data: { success: false, error: errorObj },
    });

    await uploadFile(file, kind, endpoint, showSuccess, showError);

    const arr = [errorObj.message];
    expect(showError).toHaveBeenCalledWith(errorObj.message, 0, arr);
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it('失敗時（不明なエラー形式）: showErrorが1回呼ばれる', async () => {
    apiClient.post.mockResolvedValue({
      data: { success: false, error: null },
    });

    await uploadFile(file, kind, endpoint, showSuccess, showError);

    const arr = ['アップロードに失敗しました'];
    expect(showError).toHaveBeenCalledWith(arr[0], 0, arr);
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it('例外発生時: handleApiError呼び出し→例外投げるパターンでshowError呼び出し', async () => {
    const thrownError = new Error('handleApiError例外');
    apiClient.post.mockRejectedValue(new Error('通信エラー'));
    handleApiError.mockImplementation(() => {
      throw thrownError;
    });

    await uploadFile(file, kind, endpoint, showSuccess, showError);

    expect(handleApiError).toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith(`🚨 ${thrownError.message}`);
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it('例外発生時: handleApiErrorが例外を投げない場合はshowError呼ばれない', async () => {
    apiClient.post.mockRejectedValue(new Error('通信エラー'));
    handleApiError.mockImplementation(() => {});

    await uploadFile(file, kind, endpoint, showSuccess, showError);

    expect(handleApiError).toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
  });
});

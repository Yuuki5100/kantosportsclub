import { jest, describe, it, beforeEach, expect } from '@jest/globals';

jest.mock('@/api/services/v1/systemSettingService', () => ({
  reloadSystemSettingCacheApi: jest.fn(),
}));
jest.mock('@/api/services/v1/mailTemplateService', () => ({
  reloadMailTemplatesApi: jest.fn(),
}));
jest.mock('@/api/services/v1/errorCodeService', () => ({
  reloadErrorCodesApi: jest.fn(),
}));
jest.mock('@/store', () => ({
  __esModule: true,
  default: {
    dispatch: jest.fn(),
  },
}));
jest.mock('@/slices/snackbarSlice', () => ({
  __esModule: true,
  showSnackbar: jest.fn((payload: { message: string; type: 'SUCCESS' | 'ERROR' | 'ALERT' }) => ({
    type: 'snackbar/showSnackbar',
    payload,
  })),
}));

let cacheReloadUtils: (key: string) => Promise<void>;
let reloadSystemSettingCacheApi: jest.Mock;
let reloadMailTemplatesApi: jest.Mock;
let reloadErrorCodesApi: jest.Mock;
let dispatchMock: jest.Mock;

describe('cacheReloadUtils with dynamic import', () => {
  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    reloadSystemSettingCacheApi = (await import('@/api/services/v1/systemSettingService'))
      .reloadSystemSettingCacheApi as jest.Mock;
    reloadMailTemplatesApi = (await import('@/api/services/v1/mailTemplateService'))
      .reloadMailTemplatesApi as jest.Mock;
    reloadErrorCodesApi = (await import('@/api/services/v1/errorCodeService'))
      .reloadErrorCodesApi as jest.Mock;

    const storeModule = await import('@/store');
    dispatchMock = storeModule.default.dispatch as jest.Mock;

    const cacheReloadUtilsModule = await import('@/utils/cacheReloadUtils');
    cacheReloadUtils = cacheReloadUtilsModule.default;
  });

  it("calls correct endpoint for 'settings'", async () => {
    await cacheReloadUtils('settings');
    expect(reloadSystemSettingCacheApi).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'snackbar/showSnackbar',
      payload: { message: 'キャッシュの更新に成功しました。', type: 'SUCCESS' },
    });
  });

  it("calls correct endpoint for 'mailTemplate'", async () => {
    await cacheReloadUtils('mailTemplate');
    expect(reloadMailTemplatesApi).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'snackbar/showSnackbar',
      payload: { message: 'キャッシュの更新に成功しました。', type: 'SUCCESS' },
    });
  });

  it("calls correct endpoint for 'errorCode'", async () => {
    await cacheReloadUtils('errorCode');
    expect(reloadErrorCodesApi).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'snackbar/showSnackbar',
      payload: { message: 'キャッシュの更新に成功しました。', type: 'SUCCESS' },
    });
  });

  it('alerts when key is unknown', async () => {
    await cacheReloadUtils('unknownKey');

    expect(dispatchMock).toHaveBeenNthCalledWith(1, {
      type: 'snackbar/showSnackbar',
      payload: { message: 'キャッシュの更新に紐づくkeyが存在しません', type: 'ALERT' },
    });
    expect(dispatchMock).toHaveBeenNthCalledWith(2, {
      type: 'snackbar/showSnackbar',
      payload: { message: 'キャッシュの更新に成功しました。', type: 'SUCCESS' },
    });
    expect(reloadSystemSettingCacheApi).not.toHaveBeenCalled();
    expect(reloadMailTemplatesApi).not.toHaveBeenCalled();
    expect(reloadErrorCodesApi).not.toHaveBeenCalled();
  });

  it('handles apiService error correctly', async () => {
    reloadSystemSettingCacheApi.mockRejectedValueOnce(new Error('サーバーエラー'));
    await cacheReloadUtils('settings');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'snackbar/showSnackbar',
      payload: { message: 'エラーが発生しました: サーバーエラー', type: 'ERROR' },
    });
  });
});

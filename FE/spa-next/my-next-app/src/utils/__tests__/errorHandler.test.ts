import { expect, jest } from '@jest/globals';

// ✅ require は jest.mock より後に
import { getLogger } from '@utils/logger';
jest.mock('@utils/logger', () => ({
  getLogger: jest.fn(),
}));

// ✅ 必ず最上部でモック定義（before require）
jest.mock('@utils/teamsNotifier', () => ({
  sendErrorToTeams: jest.fn(),
}));

const mockedGetLogger = getLogger as jest.Mock;
describe('handleApiError', () => {
  let handleApiError: typeof import('@utils/errorHandler').handleApiError;
  let mockedGetLogger: jest.Mock;
  let mockLogger: { error: jest.Mock };
  let sendErrorToTeams: jest.Mock;

  beforeEach(async () => {
    jest.resetModules();  // モジュールキャッシュをリセットして動的importを正しく機能させる

    // モック関数の型取得のため一旦モックモジュールをimport
    const loggerModule = await import('@utils/logger');
    mockedGetLogger = loggerModule.getLogger as jest.Mock;

    const teamsModule = await import('@utils/teamsNotifier');
    sendErrorToTeams = teamsModule.sendErrorToTeams as jest.Mock;

    // テスト用モックロガーセット
    mockLogger = { error: jest.fn() };
    mockedGetLogger.mockReturnValue(mockLogger);

    // テスト対象モジュールを動的importする（この時点でモックが反映される）
    const errorHandlerModule = await import('@utils/errorHandler');
    handleApiError = errorHandlerModule.handleApiError;

    jest.clearAllMocks();
  });

  it('throws fallback error for non-AxiosError', () => {
    expect(() => handleApiError(new Error('Some error'))).toThrow(
      'ネットワークに問題があります。接続を確認してください。'
    );
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('handles 500 error and notifies Teams', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    };
    expect(() => handleApiError(error)).toThrow('Internal Server Error');
    expect(sendErrorToTeams).toHaveBeenCalled();
  });

  it('handles 400 error with server message', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Bad Request' },
      },
    };
    expect(() => handleApiError(error)).toThrow('Bad Request');
  });

  it('handles 401 error and dispatches logout event', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
        data: {},
      },
    };
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    expect(() => handleApiError(error)).toThrow(
      'ログインに失敗しました。ユーザーIDやパスワードをご確認ください。'
    );
    expect(dispatchSpy).toHaveBeenCalledWith(new Event('logout'));
  });

  it('handles unknown status with default message', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 999,
        data: {},
      },
    };
    expect(() => handleApiError(error)).toThrow('予期せぬエラーが発生しました。');
  });

  it('throws fallback message if no status is present', () => {
    const error = {
      isAxiosError: true,
      response: undefined,
    };
    expect(() =>
      handleApiError(error, '予期せぬエラーが発生しました。')
    ).toThrow('予期せぬエラーが発生しました。');
  });
});

// __tests__/logger.test.ts
import { jest } from '@jest/globals';

describe('logger.ts', () => {
  let initLogger: typeof import('@/utils/logger').initLogger;
  let getLogger: typeof import('@/utils/logger').getLogger;
  let logError: typeof import('@/utils/logger').logError;

  beforeAll(async () => {
    // 動的インポート
    const module = await import('@/utils/logger');
    initLogger = module.initLogger;
    getLogger = module.getLogger;
    logError = module.logError;
  });

  it('初期状態では console.error を使用する', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logError('test error');
    expect(spy).toHaveBeenCalledWith('test error');
    spy.mockRestore();
  });

  it('initLoggerを呼ぶと winston が初期化される（Node環境想定）', async () => {
    // window が undefined であることを確認して Node 環境想定
    // jsdomではwindowが存在するので、一時的に削除
    const originalWindow = globalThis.window;
    // @ts-ignore
    delete globalThis.window;

    // initLogger を呼ぶ
    await initLogger();

    // getLogger() がオブジェクトを返すことを確認
    const loggerObj = getLogger();
    expect(typeof loggerObj.error).toBe('function');

    // logger.error が呼べることを確認（mock化）
    const spy = jest.spyOn(loggerObj, 'error').mockImplementation(() => {});
    logError('another test');
    expect(spy).toHaveBeenCalledWith('another test');
    spy.mockRestore();

    // window を元に戻す
    globalThis.window = originalWindow;
  });
});

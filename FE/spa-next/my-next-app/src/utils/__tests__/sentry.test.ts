// __tests__/sentry.test.ts
import { jest } from '@jest/globals';

describe('Sentry utils', () => {
  let sentryModule: typeof import('@/utils/sentry');

  beforeEach(() => {
    jest.resetModules(); // モジュールキャッシュをクリア
    process.env.NEXT_PUBLIC_SENTRY_DSN = undefined;
  });

  it('Sentry.init は DSN が無効な場合呼ばれない', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'invalid-dsn';

    const initMock = jest.fn();

    jest.unstable_mockModule('@sentry/nextjs', () => ({
      default: { init: initMock },
    }));

    sentryModule = await import('@/utils/sentry');

    expect(initMock).not.toHaveBeenCalled();
  });
});

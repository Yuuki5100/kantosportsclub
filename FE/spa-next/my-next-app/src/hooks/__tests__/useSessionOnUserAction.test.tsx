// src/hooks/__tests__/useSessionOnUserAction.test.tsx
import { renderHook } from '@testing-library/react';
import useSessionOnUserAction from '../useSessionOnUserAction';
import { refreshAuthApi } from '@/api/services/v1/authService';

jest.mock('@/api/services/v1/authService');

describe('useSessionOnUserAction フック', () => {
  const mockRefresh = refreshAuthApi as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('クリックで refreshSession が呼ばれる', async () => {
    mockRefresh.mockResolvedValue({});

    renderHook(() => useSessionOnUserAction());

    // クリックイベントを発火
    document.body.click();

    // 非同期処理なので await act
    await new Promise(process.nextTick);

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('キー押下で refreshSession が呼ばれる', async () => {
    mockRefresh.mockResolvedValue({});

    renderHook(() => useSessionOnUserAction());

    // document に対して発火させる
    const event = new KeyboardEvent('keydown', { key: 'a' });
    document.dispatchEvent(event);

    // 非同期処理待ち
    await new Promise(process.nextTick);

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('apiService.post が失敗してもエラーはキャッチされる', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRefresh.mockRejectedValue(new Error('APIエラー'));

    renderHook(() => useSessionOnUserAction());

    document.body.click();

    await new Promise(process.nextTick);

    expect(consoleSpy).toHaveBeenCalledWith(
      'セッション更新に失敗しました:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

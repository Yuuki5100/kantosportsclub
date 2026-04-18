import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// react-redux のモックを先に登録
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

// authErrorSlice のモックを登録
jest.mock('@/slices/authErrorSlice', () => ({
  addError: jest.fn().mockReturnValue({ type: 'addError' }),
  clearErrors: jest.fn().mockReturnValue({ type: 'clearErrors' }),
}));

// RootStateの型は適宜importしてください
import type { RootState } from '@/store';

describe('useAuthError フックのテスト', () => {
  let useSelector: jest.Mock;
  let useDispatch: jest.Mock;
  let addError: jest.Mock;
  let clearErrors: jest.Mock;
  let dispatchMock: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    const reactRedux = await import('react-redux');
    const authErrorSlice = await import('@/slices/authErrorSlice');

    useSelector = reactRedux.useSelector as unknown as jest.Mock;
    useDispatch = reactRedux.useDispatch as unknown as jest.Mock;
    addError = authErrorSlice.addError as unknown as jest.Mock;
    clearErrors = authErrorSlice.clearErrors as unknown as jest.Mock;

    dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
  });

  test('authAllowed は閾値未満なら true', async () => {
    const now = Date.now();
    useSelector.mockImplementation(() => {
      const mockState = {
        authError: {
          records: [
            { timestamp: now - 1000 },
            { timestamp: now - 2000 },
          ],
        },
      } as unknown as RootState;
      return mockState.authError.records;
    });

    const { useAuthError } = await import('@/hooks/useAuthError');
    const { authAllowed, errorCount } = useAuthError();

    expect(authAllowed).toBe(true);
    expect(errorCount).toBe(2);
  });

  test('authAllowed は閾値以上なら false', async () => {
    const now = Date.now();
    useSelector.mockImplementation(() => {
      const mockState = {
        authError: {
          records: [
            { timestamp: now - 1000 },
            { timestamp: now - 2000 },
            { timestamp: now - 3000 },
            { timestamp: now - 4000 },
          ],
        },
      } as unknown as RootState;
      return mockState.authError.records;
    });

    const { useAuthError } = await import('@/hooks/useAuthError');
    const { authAllowed, errorCount } = useAuthError();

    expect(authAllowed).toBe(false);
    expect(errorCount).toBe(4);
  });

  test('recordAuthError は addError を dispatch する', async () => {
    (useSelector as jest.Mock).mockImplementation(() => {
      const mockState = { authError: { records: [] } } as unknown as RootState;
      return mockState.authError.records;
    });

    const { useAuthError } = await import('@/hooks/useAuthError');
    const { recordAuthError } = useAuthError();

    const fakeTimestamp = 123456789;
    recordAuthError(fakeTimestamp);

    expect(addError).toHaveBeenCalledWith(fakeTimestamp);
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'addError' });
  });

  test('clearAuthErrors は clearErrors を dispatch する', async () => {
    (useSelector as jest.Mock).mockImplementation(() => {
      const mockState = { authError: { records: [] } } as unknown as RootState;
      return mockState.authError.records;
    });

    const { useAuthError } = await import('@/hooks/useAuthError');
    const { clearAuthErrors } = useAuthError();

    clearAuthErrors();

    expect(clearErrors).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'clearErrors' });
  });
});

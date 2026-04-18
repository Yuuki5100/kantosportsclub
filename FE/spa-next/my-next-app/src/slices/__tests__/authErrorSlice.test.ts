import { expect, jest } from '@jest/globals';
import reducer, { addError, clearErrors, pruneErrors } from '@/slices/authErrorSlice';
import { AuthErrorState } from '@/slices/authErrorSlice';

// モック用の現在時刻
const mockNow = 1_000_000_000;

// localStorage モック用ヘルパー
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

describe('authErrorSlice', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(mockNow);
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
    });
    localStorageMock.clear();
    jest.clearAllMocks();
    process.env = { ...OLD_ENV }; // reset env
  });

  afterAll(() => {
    jest.useRealTimers();
    process.env = OLD_ENV; // restore env
  });

  it('should return initial state', () => {
    const initialState = reducer(undefined, { type: '' });
    expect(initialState.records).toEqual([]);
  });

  it('should add error timestamp', () => {
    const prevState: AuthErrorState = { records: [] };
    const nextState = reducer(prevState, addError(mockNow));

    expect(nextState.records.length).toBe(1);
    expect(nextState.records[0].timestamp).toBe(mockNow);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should prune old records on addError', () => {
    process.env.NEXT_PUBLIC_AUTH_ERROR_PERIOD = '300000'; // 5分

    const oldTimestamp = mockNow - 600_000; // 10分前
    const validTimestamp = mockNow - 100_000; // 1分40秒前
    const prevState: AuthErrorState = {
      records: [
        { timestamp: oldTimestamp },
        { timestamp: validTimestamp },
      ],
    };

    const nextState = reducer(prevState, addError(mockNow));

    // 古い記録は削除されるべき
    expect(nextState.records.length).toBe(2);
    expect(nextState.records).toEqual([
      { timestamp: validTimestamp },
      { timestamp: mockNow },
    ]);
  });

  it('should clear all errors', () => {
    const prevState: AuthErrorState = {
      records: [{ timestamp: mockNow }],
    };
    const nextState = reducer(prevState, clearErrors());

    expect(nextState.records).toEqual([]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'authErrorRecords',
      JSON.stringify([])
    );
  });

  it('should prune old errors with pruneErrors', () => {
    process.env.NEXT_PUBLIC_AUTH_ERROR_PERIOD = '300000'; // 5分

    const oldTimestamp = mockNow - 400_000; // 6分40秒前
    const validTimestamp = mockNow - 200_000; // 3分20秒前
    const prevState: AuthErrorState = {
      records: [
        { timestamp: oldTimestamp },
        { timestamp: validTimestamp },
      ],
    };

    const nextState = reducer(prevState, pruneErrors());

    expect(nextState.records).toEqual([{ timestamp: validTimestamp }]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'authErrorRecords',
      JSON.stringify([{ timestamp: validTimestamp }])
    );
  });
});

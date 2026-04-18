// src/__tests__/useError.test.tsx
import { expect, jest } from '@jest/globals';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import errorReducer from '@slices/errorSlice';
import { useError } from '@hooks/useError';

describe('useError hook', () => {
  let consoleErrorSpy: jest.SpyInstance;

  // Reduxストアをテスト用にセットアップ
  const setupStore = () => {
    const rootReducer = combineReducers({
      error: errorReducer,
    });
    return configureStore({ reducer: rootReducer });
  };

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = setupStore();
    return <Provider store={store}>{children}</Provider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return initial errorMessage as null', () => {
    const { result } = renderHook(() => useError(), { wrapper });
    expect(result.current.errorMessage).toBeNull();
  });

  it('should set error message and call console.error when showError is called', () => {
    const { result } = renderHook(() => useError(), { wrapper });

    act(() => {
      result.current.showError('Test error message');
    });

    expect(result.current.errorMessage).toBe('Test error message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ValidationError]', 'Test error message');
  });

  it('should clear error message when clearError is called', () => {
    const { result } = renderHook(() => useError(), { wrapper });

    act(() => {
      result.current.showError('Another error');
    });
    expect(result.current.errorMessage).toBe('Another error');

    act(() => {
      result.current.clearError();
    });
    expect(result.current.errorMessage).toBeNull();
  });
});

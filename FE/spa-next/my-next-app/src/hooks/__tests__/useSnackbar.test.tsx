// src/hooks/__tests__/useSnackbar.test.tsx
import { expect, jest } from '@jest/globals';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import snackbarReducer, { SnackbarType } from '@slices/snackbarSlice';
import { useSnackbar } from '@hooks/useSnackbar';

describe('useSnackbar hook', () => {
  const store = configureStore({
    reducer: {
      snackbar: snackbarReducer,
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it('should return initial snackbar state', () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });
    expect(result.current.message).toBeNull();
    expect(result.current.type).toBeNull();
  });

  it('should dispatch showSnackbar action with default type ALERT', () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('Test message');
    });

    expect(result.current.message).toBe('Test message');
    expect(result.current.type).toBe('ALERT');
  });

  it('should dispatch showSnackbar action with specified type', () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('Info message', 'INFO' as SnackbarType);
    });

    expect(result.current.message).toBe('Info message');
    expect(result.current.type).toBe('INFO');
  });

  it('should dispatch hideSnackbar action', () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('Some message');
    });
    expect(result.current.message).toBe('Some message');

    act(() => {
      result.current.hideSnackbar();
    });

    expect(result.current.message).toBeNull();
    expect(result.current.type).toBeNull();
  });
});

// src/components/__tests__/ErrorBoundary.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { getLogger } from '@/utils/logger';

jest.mock('@/utils/logger');

describe('ErrorBoundary コンポーネント', () => {
  const mockLoggerError = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getLogger as jest.Mock).mockReturnValue({
      error: mockLoggerError,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('子コンポーネントが正常な場合は children をレンダリングする', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">正常コンテンツ</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('子コンポーネントがエラーを投げた場合は fallback を表示する', () => {
    const ProblemChild = () => {
      throw new Error('テストエラー');
    };

    render(
      <ErrorBoundary fallback={<div data-testid="fallback">フォールバック</div>}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(mockLoggerError).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('fallback 未指定の場合はデフォルトメッセージを表示する', () => {
    const ProblemChild = () => {
      throw new Error('テストエラー');
    };

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(mockLoggerError).toHaveBeenCalledTimes(1);
  });
});

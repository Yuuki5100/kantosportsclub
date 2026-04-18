// src/components/__tests__/ErrorNotification.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import ErrorNotification from '../ErrorNotification';
import { useError } from '@/hooks/useError';

jest.mock('@/hooks/useError');

describe('ErrorNotification コンポーネント', () => {
  const mockClearError = jest.fn();
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    process.env = { ...ORIGINAL_ENV, NEXT_PUBLIC_ERROR_NOTIFICATION_TIMEOUT: '3000' }; // 短縮タイマーでテスト
  });

  afterEach(() => {
    jest.useRealTimers();
    process.env = ORIGINAL_ENV;
  });

  it('errorMessage がない場合は何も表示されない', () => {
    (useError as jest.Mock).mockReturnValue({
      errorMessage: '',
      clearError: mockClearError,
    });

    const { container } = render(<ErrorNotification />);
    expect(container.firstChild).toBeNull();
  });

  it('errorMessage がある場合は表示される', () => {
    (useError as jest.Mock).mockReturnValue({
      errorMessage: 'テストエラー',
      clearError: mockClearError,
    });

    render(<ErrorNotification />);
    expect(screen.getByText('テストエラー')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });

  it('ボタンクリックで clearError が呼ばれる', () => {
    (useError as jest.Mock).mockReturnValue({
      errorMessage: 'テストエラー',
      clearError: mockClearError,
    });

    render(<ErrorNotification />);

    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(mockClearError).toHaveBeenCalled();
  });

  it('一定時間後に clearError が自動で呼ばれる', () => {
    (useError as jest.Mock).mockReturnValue({
      errorMessage: 'テストエラー',
      clearError: mockClearError,
    });

    render(<ErrorNotification />);

    // タイマーを進める
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockClearError).toHaveBeenCalled();
  });
});

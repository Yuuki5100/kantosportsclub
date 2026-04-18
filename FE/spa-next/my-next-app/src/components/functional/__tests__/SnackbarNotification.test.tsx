import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SnackbarNotification from '@/components/functional/SnackbarNotification';
import { useSnackbar } from '@/hooks/useSnackbar';

jest.mock('@/hooks/useSnackbar');
const mockUseSnackbar = useSnackbar as jest.MockedFunction<typeof useSnackbar>;

describe('SnackbarNotification', () => {
  const mockHideSnackbar = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create snackbar-root element
    const snackbarRoot = document.createElement('div');
    snackbarRoot.id = 'snackbar-root';
    document.body.appendChild(snackbarRoot);

    mockUseSnackbar.mockReturnValue({
      message: '',
      type: null,
      showSnackbar: jest.fn(),
      hideSnackbar: mockHideSnackbar,
    });
  });

  afterEach(() => {
    const snackbarRoot = document.getElementById('snackbar-root');
    if (snackbarRoot) {
      document.body.removeChild(snackbarRoot);
    }
    consoleErrorSpy.mockRestore();
  });

  test('メッセージがない場合は何も表示しない', () => {
    render(<SnackbarNotification />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('SUCCESS タイプのメッセージを表示する', () => {
    mockUseSnackbar.mockReturnValue({
      message: 'Success message',
      type: 'SUCCESS',
      showSnackbar: jest.fn(),
      hideSnackbar: mockHideSnackbar,
    });

    render(<SnackbarNotification />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('ERROR タイプのメッセージを表示する', () => {
    mockUseSnackbar.mockReturnValue({
      message: 'Error message',
      type: 'ERROR',
      showSnackbar: jest.fn(),
      hideSnackbar: mockHideSnackbar,
    });

    render(<SnackbarNotification />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Snackbar ERROR]', 'Error message');
  });

  test('ALERT タイプのメッセージを表示する', () => {
    mockUseSnackbar.mockReturnValue({
      message: 'ALERT message',
      type: 'ALERT',
      showSnackbar: jest.fn(),
      hideSnackbar: mockHideSnackbar,
    });

    render(<SnackbarNotification />);
    expect(screen.getByText('ALERT message')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('CloseIconボタンが右上に配置されている', () => {
    mockUseSnackbar.mockReturnValue({
      message: 'Test message',
      type: 'SUCCESS',
      showSnackbar: jest.fn(),
      hideSnackbar: mockHideSnackbar,
    });

    render(<SnackbarNotification />);
    const closeButton = screen.getByRole('button');

    expect(closeButton).toHaveStyle({
      position: 'absolute',
      right: '5px',
      top: '8px',
    });
  });

  test('長いテキストでもCloseIconが右上に表示される', () => {
    const longMessage = 'これは非常に長いメッセージです。'.repeat(10);

    mockUseSnackbar.mockReturnValue({
      message: longMessage,
      type: 'SUCCESS',
      showSnackbar: jest.fn(),
      hideSnackbar: mockHideSnackbar,
    });

    render(<SnackbarNotification />);
    const closeButton = screen.getByRole('button');

    expect(closeButton).toHaveStyle({
      position: 'absolute',
      right: '5px',
      top: '8px',
    });
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  test('CloseIconをクリックするとhideSnackbarが呼ばれる', () => {
    mockUseSnackbar.mockReturnValue({
      message: 'Test message',
      type: 'SUCCESS',
      showSnackbar: jest.fn(),
      hideSnackbar: mockHideSnackbar,
    });

    render(<SnackbarNotification />);
    const closeButton = screen.getByRole('button');

    act(() => {
      closeButton.click();
    });

    expect(mockHideSnackbar).toHaveBeenCalledTimes(1);
  });

  test('アイコンとテキストが適切に配置されている', () => {
    mockUseSnackbar.mockReturnValue({
      message: 'Test message\nSecond line',
      type: 'SUCCESS',
      showSnackbar: jest.fn(),
      hideSnackbar: mockHideSnackbar,
    });

    render(<SnackbarNotification />);
    // data-testidでコンテナを取得
    const snackbarContainer = screen.getByTestId('snackbar-container');

    // コンテナがflex-startで配置されていることを確認
    expect(snackbarContainer).toHaveStyle({
      display: 'flex',
      alignItems: 'flex-start',
    });
  });
});

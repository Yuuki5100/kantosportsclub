import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header/Header';
import { headerLang } from '@/components/composite/Header/header.lang';
import '@testing-library/jest-dom';
import * as authSlice from '@/slices/authSlice';

// router や redux のモック
import router from 'next/router';

jest.mock('next/router', () => ({
  push: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

// authSlice をモック
jest.mock('@/slices/authSlice', () => ({
  logout: jest.fn(() => ({ type: 'LOGOUT' })),
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('デフォルトプロパティでレンダリングされる', () => {
    render(<Header language={headerLang.ja} />);

    // タイトル
    expect(screen.getByTestId('header-title')).toHaveTextContent('共通基盤テンプレート');
  });

  test('カスタムタイトルとユーザー名が表示される', () => {
    const customTitle = 'カスタムタイトル';
    const customUserName = 'カスタムユーザー';

    render(
      <Header
        title={customTitle}
        userName={customUserName}
        language={headerLang.ja}
      />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customUserName)).toBeInTheDocument();
  });

  test('ログアウトボタンをクリックすると dispatch と router.push が呼ばれる', async () => {
    render(<Header language={headerLang.ja} />);

    const logoutButton = screen.getByTestId('logout-button');

    await userEvent.click(logoutButton);

    // dispatch に logout が渡されたか確認
    expect(mockDispatch).toHaveBeenCalledWith(authSlice.logout());
    expect(router.push).toHaveBeenCalledWith({ pathname: '/login' });
  });
});

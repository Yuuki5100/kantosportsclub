jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    loginUser: () => ({
      unwrap: () => Promise.reject(new Error('ログインに失敗しました')),
    }),
    isAuthenticated: false,
  }),
}));

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: (_lang: any) => ({
    title: 'ログインページ',
    description: 'ログイン画面の説明です。',
    usernamePlaceholder: 'ユーザー名',
    passwordPlaceholder: 'パスワード',
    loginButton: 'ログイン',
    loginError: 'ログインに失敗しました',
  }),
}));

jest.mock('@/api/services/v1/authService', () => ({
  checkAuthApi: jest.fn(() => Promise.resolve({ authenticated: false })),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AllProviders } from '@/test-utils/AllProviders';
import LoginPage from '@/pages/login/index';

describe('LoginPage', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders login form and shows error on failed login', async () => {
    render(
      <AllProviders>
        <LoginPage />
      </AllProviders>
    );

    const usernameInput = document.querySelector('input[name="username"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });

    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument(); // 厳密マッチでOK
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});

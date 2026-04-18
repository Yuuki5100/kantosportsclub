import { render } from '@testing-library/react';
import AuthInitializer from '../AuthInitializer';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';

jest.mock('@/hooks/useAuth');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

describe('AuthInitializer component', () => {
  const mockRefreshAuth = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('calls refreshAuth(true) when isAuthenticated is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      refreshAuth: mockRefreshAuth,
    });

    render(<AuthInitializer />);

    expect(mockRefreshAuth).toHaveBeenCalledWith(true);
  });

  it('calls refreshAuth(true) when isAuthenticated is false', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      refreshAuth: mockRefreshAuth,
    });

    render(<AuthInitializer />);

    expect(mockRefreshAuth).toHaveBeenCalledWith(true);
  });

  it('calls refreshAuth(true) when isAuthenticated is undefined', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: undefined,
      refreshAuth: mockRefreshAuth,
    });

    render(<AuthInitializer />);

    expect(mockRefreshAuth).toHaveBeenCalledWith(true);
  });
});

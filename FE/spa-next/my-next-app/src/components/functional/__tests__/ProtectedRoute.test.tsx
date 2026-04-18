import { expect, jest, describe, it, beforeAll } from '@jest/globals';
import React, { ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react';
import type { NextRouter } from 'next/router';

// AllProviders は静的インポートで問題ないケースが多い
import { AllProviders } from '../../../test-utils/AllProviders';

// next-router-mock を next/router にマッピング
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => ({
  __esModule: true,
  ...mockRouter,
  useRouter: () => mockRouter,
}));

// router.push をモック化
import router from 'next/router';
jest.spyOn(router, 'push').mockImplementation(() => Promise.resolve(true));

// useAuth フックをモック
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    rolePermissions: {},
    loginUser: jest.fn(),
    logoutUser: jest.fn(),
    refreshAuth: jest.fn(),
  }),
}));

let ProtectedRoute: React.FC<{ children: React.ReactNode }>;

describe('ProtectedRoute', () => {
  beforeAll(async () => {
    // 動的インポート（ESM互換）
    const md = await import('../ProtectedRoute');
    ProtectedRoute = md.default;
  });

  it('redirects to login if not authenticated', async () => {
    render(
      <AllProviders>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AllProviders>
    );

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/login');
    });
  });
});

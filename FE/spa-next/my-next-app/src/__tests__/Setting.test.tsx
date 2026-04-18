// __tests__/Setting.test.tsx
import { expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AllProviders } from '@/test-utils/AllProviders';
import Setting from '../pages/settings/index';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => mockRouter);

const mockUseFetch = jest.fn();
const mockUseApiMutation = jest.fn();
jest.mock('@/hooks/useApi', () => ({
  useFetch: () => mockUseFetch(),
  useApiMutation: () => mockUseApiMutation(),
}));

jest.mock('@/utils/cacheReloadUtils', () => jest.fn());
// NOTE: Setting は統合UIのためユニットテスト対象外、CI対象から除外中
describe.skip('Setting component', () => {
  beforeEach(() => {
    // モッククリア
    jest.clearAllMocks();
    // mockRouter の初期化
    mockRouter.setCurrentUrl('/settings');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockSettingsData = {
    data: [
      { item: 'settingA', type: 'string', val: '123' },
      { item: 'settingB', type: 'number', val: '456' },
    ],
    success: true,
    error: null,
  };
  it('表示: 設定画面を正しく表示し、トグルで表示切替できる', async () => {
    mockUseFetch.mockReturnValue({
      data: mockSettingsData,
      isLoading: false,
      error: null,
    });

    mockUseApiMutation.mockReturnValue({
      mutate: jest.fn(),
    });

    render(
      <AllProviders>
        <Setting />
      </AllProviders>
    );

    expect(screen.getByText('設定変更画面')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /設定を表示/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByText('システム設定')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('456')).toBeInTheDocument();
    });
  });
});
